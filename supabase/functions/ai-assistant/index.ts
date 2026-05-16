import { corsHeaders, json } from '../_shared/cors.ts';
import { createUserClient } from '../_shared/supabase.ts';

type Action = 'analyze-meal' | 'parse-voice-meal' | 'generate-recipes';

type RequestBody = {
  action: Action;
  imageBase64?: string;
  mimeType?: string;
  transcript?: string;
  ingredients?: string;
  goal?: string;
};

const openAiKey = () => Deno.env.get('OPENAI_API_KEY');
const model = () => Deno.env.get('OPENAI_MODEL') ?? 'gpt-5.2';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const authorization = req.headers.get('Authorization') ?? '';
    const userClient = createUserClient(authorization);
    const {
      data: { user },
      error,
    } = await userClient.auth.getUser();

    if (error || !user) {
      return json({ error: 'Unauthorized' }, 401);
    }

    const body = (await req.json()) as RequestBody;
    const key = openAiKey();
    if (!key) {
      return json({ error: 'OPENAI_API_KEY is not configured' }, 500);
    }

    if (body.action === 'analyze-meal') {
      const result = await analyzeMeal(key, body);
      return json({ result });
    }

    if (body.action === 'parse-voice-meal') {
      const result = await parseVoiceMeal(key, body.transcript ?? '');
      return json({ result });
    }

    if (body.action === 'generate-recipes') {
      const result = await generateRecipes(key, body.ingredients ?? '', body.goal ?? 'healthy');
      return json({ result });
    }

    return json({ error: 'Unknown action' }, 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown AI error';
    return json({ error: message }, 500);
  }
});

const analyzeMeal = async (apiKey: string, body: RequestBody) => {
  const content: Record<string, string>[] = [
    {
      type: 'input_text',
      text:
        'Analyze this Indian/home-cooked meal for nutrition. Estimate conservatively, flag allergens, and require confirmation when uncertain.',
    },
  ];

  if (body.imageBase64) {
    content.push({
      type: 'input_image',
      image_url: `data:${body.mimeType ?? 'image/jpeg'};base64,${body.imageBase64}`,
    });
  }

  return callStructured(apiKey, 'meal_log', mealSchema, [
    systemMessage(),
    {
      role: 'user',
      content,
    },
  ]);
};

const parseVoiceMeal = async (apiKey: string, transcript: string) => {
  return callStructured(apiKey, 'meal_log', mealSchema, [
    systemMessage(),
    {
      role: 'user',
      content: [
        {
          type: 'input_text',
          text: `Convert this spoken meal log into confirmed-estimate nutrition JSON: ${transcript}`,
        },
      ],
    },
  ]);
};

const generateRecipes = async (apiKey: string, ingredients: string, goal: string) => {
  const response = await callStructured(apiKey, 'recipe_list', recipeListSchema, [
    systemMessage(),
    {
      role: 'user',
      content: [
        {
          type: 'input_text',
          text: `Create 1 to 3 practical Indian-friendly recipes from these ingredients: ${ingredients}. Goal: ${goal}. Include cooking steps and nutrition estimates.`,
        },
      ],
    },
  ]);

  return response.recipes;
};

const callStructured = async (
  apiKey: string,
  name: string,
  schema: Record<string, unknown>,
  input: unknown[],
) => {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model(),
      input,
      text: {
        format: {
          type: 'json_schema',
          name,
          strict: true,
          schema,
        },
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI request failed: ${text}`);
  }

  const data = await response.json();
  const outputText = extractOutputText(data);
  if (!outputText) {
    throw new Error('OpenAI response did not include output text.');
  }
  return JSON.parse(outputText);
};

const extractOutputText = (data: Record<string, unknown>) => {
  if (typeof data.output_text === 'string') {
    return data.output_text;
  }

  const output = Array.isArray(data.output) ? data.output : [];
  for (const item of output) {
    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) {
      continue;
    }
    for (const block of content) {
      const candidate = block as { type?: string; text?: string };
      if (candidate.type === 'output_text' && typeof candidate.text === 'string') {
        return candidate.text;
      }
    }
  }
  return undefined;
};

const systemMessage = () => ({
  role: 'system',
  content: [
    {
      type: 'input_text',
      text:
        'You are Track It, a cautious wellness nutrition assistant. Return only schema-valid JSON. Do not make medical claims. Nutrition is estimated and must be user-confirmed. Always include allergens and confidence.',
    },
  ],
});

const mealSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'id',
    'name',
    'type',
    'quantity',
    'source',
    'createdAt',
    'calories',
    'protein',
    'carbs',
    'fat',
    'fiber',
    'sugar',
    'sodium',
    'cost',
    'mood',
    'gutReaction',
    'allergens',
    'confidence',
    'verdict',
    'photoUri',
    'isFavorite',
    'isOutsideFood',
  ],
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    type: { type: 'string', enum: ['breakfast', 'lunch', 'dinner', 'snack'] },
    quantity: { type: 'string' },
    source: { type: 'string', enum: ['manual', 'scan', 'voice', 'saved'] },
    createdAt: { type: 'string' },
    calories: { type: 'integer' },
    protein: { type: 'integer' },
    carbs: { type: 'integer' },
    fat: { type: 'integer' },
    fiber: { type: 'integer' },
    sugar: { type: 'integer' },
    sodium: { type: 'integer' },
    cost: { type: 'integer' },
    mood: { type: 'string' },
    gutReaction: { type: 'string' },
    allergens: {
      type: 'array',
      items: { type: 'string' },
    },
    confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
    verdict: { type: 'string' },
    photoUri: { type: 'string' },
    isFavorite: { type: 'boolean' },
    isOutsideFood: { type: 'boolean' },
  },
};

const recipeSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'id',
    'title',
    'ingredients',
    'steps',
    'calories',
    'protein',
    'cookingTimeMinutes',
    'difficulty',
    'goalTag',
    'budget',
    'saved',
    'rating',
  ],
  properties: {
    id: { type: 'string' },
    title: { type: 'string' },
    ingredients: {
      type: 'array',
      items: { type: 'string' },
    },
    steps: {
      type: 'array',
      items: { type: 'string' },
    },
    calories: { type: 'integer' },
    protein: { type: 'integer' },
    cookingTimeMinutes: { type: 'integer' },
    difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
    goalTag: { type: 'string' },
    budget: { type: 'string', enum: ['low', 'medium', 'high'] },
    saved: { type: 'boolean' },
    rating: { type: 'integer' },
  },
};

const recipeListSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['recipes'],
  properties: {
    recipes: {
      type: 'array',
      items: recipeSchema,
    },
  },
};
