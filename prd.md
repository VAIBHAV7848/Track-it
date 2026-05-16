📄 Product Requirements Document

Personal AI Health & Nutrition Mobile App


---

1. Product Overview

Product Type

Mobile health, nutrition, cooking, fasting, and lifestyle tracking app.

Platform

Mobile only

Android first

Built for personal daily use first

Google Login using Firebase Auth

Google Fit integration for activity and health data


Core Idea

This app is a personal AI-powered health companion that helps you track what you eat, understand nutrition, cook better meals, manage fasting, track hydration, and connect food habits with body signals like mood, energy, digestion, sleep, skin, hair, and fitness goals.

The app should reduce manual tracking as much as possible through:

Meal scanning

Voice food logging

Barcode scanning

Personal saved meals

AI recipe suggestions

Google Fit sync

Smart reminders

Weekly insights



---

2. Personal Goal of the App

The main goal is not to build a public startup product immediately.

The main goal is:

> To build a personal mobile app that helps me eat better, track nutrition, cook smarter, stay consistent with fasting and hydration, and understand how food affects my body.



This app should work like a personal AI nutrition assistant.

It should answer questions like:

What did I eat today?

How many calories and protein did I consume?

Is this meal good for my goal?

What can I cook with the ingredients I have?

Am I drinking enough water?

Did I break my fasting streak?

Which foods make me feel tired or bloated?

Am I hitting my protein goal?

What should I improve this week?



---

3. Product Philosophy

The app should be:

Simple

Fast to use every day. No complicated forms.

Personal

Learns my meals, preferences, goals, routine, and food habits.

Practical

Useful for real Indian food, home-cooked meals, college/work lifestyle, gym goals, fasting, and budget tracking.

AI-Assisted, Not AI-Blind

AI should help, but the user should always confirm food quantity and nutrition estimates.

Privacy-First

Food, health, weight, mood, and body-related data are personal. The app should store data securely and give full control to delete/export it.


---

4. Problem Statement

Most health apps are too manual, too generic, or too fitness-focused.

Common problems:

1. Calorie tracking apps require too much manual typing.


2. Recipe apps do not understand personal nutrition goals.


3. Fitness apps track steps and workouts but do not deeply understand food.


4. Fasting apps track fasting separately from meals and hydration.


5. Indian meals are hard to log accurately.


6. Home-cooked food is repeated often but still needs to be logged manually every time.


7. Users do not easily understand the connection between food, mood, energy, gut health, sleep, skin, and hair.



This app solves that by combining meal logging, AI nutrition, cooking help, fasting, hydration, Google Fit sync, and personal insights in one mobile app.


---

5. Target User

Primary User

Me / individual personal user

Profile

Wants to improve health and nutrition.

May have goals like cutting, bulking, maintaining, or general fitness.

Eats Indian/home-cooked food often.

May cook sometimes and needs recipe help.

Wants less manual tracking.

Wants smart reminders.

Wants to understand personal food patterns.



---

6. Main Use Cases

Use Case 1: Scan Meal

User opens camera, scans food, confirms portion, and logs nutrition.

Use Case 2: Voice Log Meal

User says what they ate, app converts it into a meal log.

Use Case 3: Cook From Ingredients

User says, “I have eggs and bread,” and the app suggests recipes.

Use Case 4: Track Fasting

User starts and ends fasting timer, logs mood and hunger.

Use Case 5: Track Water

User logs water intake and receives hydration reminders.

Use Case 6: Sync Google Fit

App reads steps, workouts, calories burned, heart rate, sleep, and active minutes.

Use Case 7: Weekly Health Summary

Every Sunday, app summarizes food, calories, protein, water, fasting, mood, gut, and activity.

Use Case 8: Grocery Scanner

User scans packaged food before buying and app tells whether it fits their goal.


---

7. Core Modules


---

7.1 Authentication Module

Feature

Google Login through Firebase Auth.

Requirements

One-tap Google sign-in.

Store user account in Firebase.

Auto-login after first sign-in.

Logout option.

Delete account option.


User Data Collected

Name

Email

Profile photo

Age

Gender

Height

Weight

Goal

Diet preference

Allergies

Activity level

Food preferences



---

7.2 Onboarding Module

Purpose

Set up the user profile and health goals.

Screens

Screen 1: Welcome

Shows what the app does.

Example:

> “Your personal AI nutrition, cooking, fasting, and health tracker.”



Screen 2: Personal Details

Fields:

Age

Gender

Height

Current weight

Target weight, optional


Screen 3: Goal Selection

Options:

Bulk

Cut

Maintain

Lose fat

Gain muscle

Improve digestion

Improve energy

Improve skin and hair

General healthy lifestyle


Screen 4: Diet Preference

Options:

Vegetarian

Non-vegetarian

Eggetarian

Vegan

Jain

Custom


Screen 5: Allergies

Options:

Milk

Peanut

Soy

Gluten

Egg

Seafood

Tree nuts

None

Custom


Screen 6: Google Fit Permission

Ask permission to access:

Steps

Calories burned

Heart rate

Sleep

Workouts

Active minutes


Screen 7: Reminder Preference

User selects:

Meal reminders

Water reminders

Fasting reminders

Protein reminders

Weekly summary



---

8. Feature Requirements


---

8.1 Meal Scanner

Description

User scans food using the camera. The app identifies food items, estimates portion size, calculates nutrition, and asks user to confirm before saving.

Main Flow

1. User taps Scan Meal.


2. Camera opens.


3. User takes food photo.


4. App asks for optional extra photos.


5. AI detects food.


6. App estimates quantity.


7. Nutrition breakdown is generated.


8. User confirms or edits portion.


9. Meal is saved to daily log and meal journal.



Accuracy Features

Reference Object for Scale

User can place a known object near food:

Spoon

Coin

Credit/debit card

Standard plate


Multi-Angle Scanning

User can take:

Top view

Side view

Close-up


Portion Confirmation

Before saving, the app asks:

> “Is this portion correct?”



User can edit:

Quantity

Serving size

Food item name

Cooking method

Oil/ghee used

Number of pieces


Personal Food Database

For repeated home-cooked meals:

Examples:

My dal rice

Mom’s poha

Hostel chicken curry

My protein shake

My egg bhurji


Once saved, the user can log it again quickly.

Nutrition Breakdown

Meal scan should show:

Calories

Protein

Carbs

Fat

Fiber

Sugar

Sodium

Vitamins

Allergens

Confidence score

Goal-based verdict


Example Output

> Meal: Rice, dal, curd
Calories: 620 kcal
Protein: 22g
Carbs: 92g
Fat: 14g
Verdict: Good meal, but protein is slightly low for your muscle goal.




---

8.2 Manual Meal Logging

Description

User can manually log meals when scanning is not possible.

Fields

Meal name

Meal type: breakfast/lunch/dinner/snack

Quantity

Calories

Protein

Carbs

Fat

Photo, optional

Cost, optional

Mood after meal, optional

Gut reaction, optional


Fast Add Options

Repeat yesterday’s meal

Add from saved meals

Add common Indian foods

Add from favourites



---

8.3 Voice Input

Description

User can speak instead of typing.

Voice Use Cases

Meal Logging

User says:

> “I ate two chapatis, dal, rice, and curd.”



App creates a meal log.

Cooking Assistant

User says:

> “I have eggs and bread. What can I make?”



App suggests recipes.

Hands-Free Cooking

User can say:

Next step

Repeat step

Set timer

How much salt?

What can I replace paneer with?


Requirements

Convert speech to text.

Detect user intent.

Generate structured response.

Ask confirmation before saving logs.


Intent Types

Meal log

Recipe request

Cooking command

Water log

Fasting command

Weight log



---

8.4 Cook Assistant

Description

AI cooking assistant that suggests recipes based on available ingredients, goal, time, taste, and nutrition needs.

User Inputs

Ingredients available

Cooking time

Goal

Diet preference

Leftovers

Budget

Number of servings

Spice preference


Example Prompts

> “I have eggs and bread.”
“Suggest high-protein dinner.”
“Make something in 15 minutes.”
“I have leftover rice.”
“I want low-carb dinner.”
“Make a cheap protein meal.”



Features

Recipe Suggestions

Each recipe should include:

Recipe name

Ingredients

Quantity

Cooking time

Steps

Nutrition estimate

Protein amount

Calories

Difficulty

Goal suitability


Goal-Based Filtering

Filters:

High protein

Low carb

Low calorie

Bulking

Cutting

Vegetarian

Budget meal

Quick meal

Gut-friendly


Leftover Mode

User enters leftovers and app suggests reuse recipes.

Example:

> Leftover rice → egg fried rice, lemon rice, curd rice, rice cutlet.



Quantity-Aware Recipe

User selects:

1 person

2 people

Family serving

Custom serving


App adjusts ingredient quantities.

Favourite Recipes

User can save favourite recipes.

Rating System

User can rate recipes.

App learns:

Taste preference

Spice level

Cooking style

Preferred ingredients

Disliked ingredients


Grocery List Generator

From selected recipe, app creates grocery list.


---

8.5 Fasting Tracker

Description

Tracks intermittent fasting windows.

Features

Start fast

End fast

Fasting timer

Fasting history

Streak tracker

Fasting plan selection

Mood during fast

Energy during fast

Hunger level

Notes


Fasting Plans

12:12

14:10

16:8

18:6

20:4

Custom


Fast Log Fields

Start time

End time

Duration

Mood

Hunger level

Energy level

Notes


Insights

Examples:

> “You complete 14-hour fasts more consistently than 16-hour fasts.”
“You usually feel low energy when breaking your fast with high-carb meals.”




---

8.6 Nutrition Goals

Description

The app calculates and tracks daily nutrition targets.

Goal Types

Bulk

Cut

Maintain

Fat loss

Muscle gain

General health


Daily Targets

Calories

Protein

Carbs

Fat

Fiber

Sugar limit

Sodium limit

Water


Dashboard Display

Shows:

Calories consumed

Calories remaining

Protein consumed

Protein remaining

Water consumed

Water remaining

Meals logged

Fasting status

Steps from Google Fit


Meal Verdicts

Examples:

Fits your goal ✅

High protein meal 💪

Too much fat for today ⚠️

Low protein meal

High sodium

Good post-workout meal

Heavy carb meal

Add vegetables next meal



---

8.7 Hydration Intelligence

Description

Tracks water intake and adjusts daily water target based on body data and activity.

Inputs

Body weight

Steps

Workout data

Active minutes

Weather, later version

Sweat-heavy activity

Electrolyte intake


Features

Add water manually

Quick buttons: 250ml, 500ml, 1L

Hydration reminders

Activity-based water adjustment

Electrolyte tracker


Example Notification

> “You walked 8,000 steps today. Drink 500ml extra water.”




---

8.8 Google Fit Sync

Description

The app syncs health and activity data from Google Fit.

Data Synced

Steps

Calories burned

Heart rate

Sleep data

Workouts

Active minutes


Usage

App uses this data to adjust:

Daily calorie target

Protein recommendation

Hydration target

Recovery suggestions

Weekly summary


Example Insight

> “You had a workout today. Try to complete 30g more protein before sleep.”




---

8.9 Weight Tracking

Description

Allows user to track body weight progress.

Features

Daily weight log

Weekly average

Monthly trend

Progress graph

Target weight

Weight change insights


Example Insight

> “Your weekly average weight dropped by 0.5 kg.”




---

8.10 Sleep Tracking

Description

Uses Google Fit sleep data or manual entry.

Features

Sleep duration

Sleep quality

Food-sleep relation

Late meal detection


Example Insight

> “You slept less on days when dinner was logged after 10 PM.”




---

8.11 Mood & Energy Tracking

Description

User can record mood and energy after meals.

Mood Options

Happy

Tired

Focused

Sleepy

Bloated

Energetic

Lazy

Irritated

Neutral


Energy Levels

Low

Medium

High


Purpose

Detect relationship between food and how the user feels.

Example Insight

> “You often feel sleepy after high-carb lunches.”




---

8.12 Gut Health Log

Description

Tracks digestion-related symptoms.

Fields

Bloating

Acidity

Constipation

Loose motion

Gas

Stomach pain

Digestion quality

Notes


Example Insight

> “Bloating appears more often after milk-based meals.”




---

8.13 Supplement Tracker

Description

Tracks supplement usage.

Supported Supplements

Protein powder

Creatine

Multivitamin

Vitamin D

Omega-3

Zinc

Biotin

Iron

Magnesium


Features

Supplement schedule

Daily reminder

Taken/missed status

Streak

Dosage field



---

8.14 Skin & Hair Nutrient Tracking

Description

Tracks nutrients related to skin and hair health.

Nutrients

Zinc

Biotin

Vitamin E

Protein

Iron

Omega-3

Vitamin C

Vitamin D


Important Rule

The app should not claim to treat hair fall, acne, or medical conditions.

It should only say:

> “Your intake of nutrients commonly linked with skin and hair health appears low this week.”




---

8.15 Food Budget Tracker

Description

Tracks how much money is spent on food.

Features

Add cost per meal

Daily food spend

Weekly food spend

Monthly food spend

Outside food tracking

Home food vs outside food comparison

Budget-friendly recipe suggestions


Example Insight

> “You spent ₹850 on outside food this week.”




---

8.16 Meal Journal

Description

Every logged meal is saved as a photo diary.

Features

Monthly meal photo view

Calendar view

Search meals

Filter meals

Nutrition overlay

Repeat meal option


Filters

Breakfast

Lunch

Dinner

Snack

High protein

High calorie

Outside food

Home food

Favourite meals



---

8.17 Smart Grocery Scanner

Description

User scans packaged food at a store before buying.

Features

Barcode scan

Nutrition label scan

Ingredient analysis

Allergen warning

Goal fit verdict

Healthier alternative suggestion


Example Verdict

> “This item is high in sugar and low in protein. Not ideal for your cutting goal.”




---

9. Notifications

Notification Categories

Meal Reminders

Breakfast reminder

Lunch reminder

Dinner reminder

Missed meal reminder


Example:

> “You haven’t logged lunch yet.”



Hydration Reminders

Every 1–2 hours

Activity-based reminders


Example:

> “Drink 250ml water now.”



Fasting Alerts

Fast started

Fast ending soon

Fast completed

Streak reminder


Protein Reminder

Example:

> “20g protein remaining today.”



Streak Protection

Example:

> “Log one meal to keep your 7-day streak.”



Cook Assistant Reminder

Example:

> “Your saved ingredients can make a quick high-protein dinner.”



Weekly Summary

Every Sunday morning.

Includes:

Calories average

Protein average

Water intake

Fasting consistency

Weight trend

Best day

Weakest day

Suggested improvement



---

10. Smart Insights

Weekly Summary

The app generates a weekly report.

Report Includes

Average daily calories

Average daily protein

Water consistency

Fasting streak

Weight trend

Most eaten foods

Outside food frequency

Mood patterns

Gut health patterns

Sleep-food relationship

Budget summary

One focus goal for next week


Example Weekly Summary

> “This week you averaged 2,150 calories and 92g protein per day. Your protein was strong on workout days but low on Sunday and Monday. You also felt sleepy after two high-carb lunches. Next week, focus on adding 20g protein to lunch.”




---

11. Gamification

Features

Streaks

Track streaks for:

Meal logging

Protein target

Water target

Fasting completion

Weight logging

Home-cooked meals


Badges

Examples:

7-day protein streak

Hydration hero

Fasting beginner

Meal logger pro

Home cooking streak

Budget control badge


Weekly Health Score

Score based on:

Meal logging consistency

Protein goal

Hydration goal

Fasting consistency

Sleep

Steps

Mood/gut stability


Important:

The health score should motivate the user, not shame them.


---

12. Main Screens

Required Screens

1. Splash Screen


2. Google Login Screen


3. Onboarding


4. Home Dashboard


5. Meal Scanner


6. Scan Result


7. Meal Confirm/Edit


8. Daily Nutrition Log


9. Voice Input


10. Cook Assistant Chat


11. Recipe Detail


12. Saved Recipes


13. Grocery List


14. Fasting Tracker


15. Hydration Tracker


16. Weight Tracker


17. Meal Journal


18. Google Fit Sync Screen


19. Smart Insights


20. Weekly Summary


21. Supplement Tracker


22. Budget Tracker


23. Grocery Scanner


24. Profile


25. Settings


26. Notification Preferences


27. Privacy & Data Controls




---

13. Home Dashboard Requirements

Dashboard Should Show

Greeting

Today’s calories

Protein remaining

Water progress

Current fasting status

Steps from Google Fit

Meal log shortcut

Scan meal button

Voice log button

Cook assistant button

Today’s smart suggestion

Streak status


Example Dashboard

> Good evening, Vaibhav.
You have 650 calories and 35g protein remaining today.
You walked 6,800 steps. Drink 400ml extra water.
Your fasting window starts at 9:30 PM.




---

14. AI System Requirements

AI Meal Analysis Should Return

Detected food items

Estimated quantity

Calories

Protein

Carbs

Fat

Fiber

Sugar

Sodium

Vitamins

Allergens

Confidence score

Suggested correction question

Goal-based verdict


AI Recipe Generator Should Consider

Ingredients

Goal

Diet preference

Allergies

Time limit

Budget

Servings

Previous ratings

Available nutrition target remaining


AI Insights Should Detect

Low protein pattern

High calorie pattern

Low water pattern

Late dinner pattern

Food-mood pattern

Gut trigger pattern

Fasting success/failure pattern

Budget pattern

Outside food pattern



---

15. Tech Stack

Purpose	Tool

Mobile App	Flutter or React Native
Authentication	Firebase Auth
Database	Firebase Firestore
File Storage	Firebase Storage
Notifications	Firebase Cloud Messaging
Activity Sync	Google Fit API / Android Health Connect
AI Brain	ChatGPT API
Meal Image Analysis	Vision AI model
Barcode Scanner	ML Kit Barcode Scanner
Voice Input	Google Speech-to-Text / Native Speech Recognition
Analytics	Firebase Analytics
Crash Reports	Firebase Crashlytics


Recommended Choice

For Android-first personal app:

> Flutter + Firebase + Google Fit/Health Connect + ChatGPT API



Reason:

Flutter is strong for Android mobile UI.

Firebase makes auth, database, storage, and notifications easier.

Google ecosystem integration is smoother.

Good for building personal MVP quickly.



---

16. Data Model

users

{
  "userId": "string",
  "name": "string",
  "email": "string",
  "photoUrl": "string",
  "age": 21,
  "gender": "male",
  "heightCm": 175,
  "weightKg": 70,
  "goal": "cut",
  "dietPreference": "non-vegetarian",
  "allergies": ["milk"],
  "activityLevel": "moderate",
  "createdAt": "timestamp"
}

meals

{
  "mealId": "string",
  "userId": "string",
  "mealName": "Dal Rice",
  "mealType": "lunch",
  "photoUrl": "string",
  "calories": 620,
  "protein": 22,
  "carbs": 92,
  "fat": 14,
  "fiber": 8,
  "sugar": 5,
  "sodium": 800,
  "allergens": ["milk"],
  "verdict": "Good meal but protein is low",
  "confidence": "medium",
  "createdAt": "timestamp"
}

savedMeals

{
  "savedMealId": "string",
  "userId": "string",
  "name": "My Protein Shake",
  "defaultServing": "1 glass",
  "calories": 350,
  "protein": 32,
  "carbs": 28,
  "fat": 8,
  "createdAt": "timestamp"
}

recipes

{
  "recipeId": "string",
  "userId": "string",
  "title": "Egg Bread Toast",
  "ingredients": ["egg", "bread", "onion"],
  "steps": ["step 1", "step 2"],
  "calories": 420,
  "protein": 24,
  "cookingTimeMinutes": 15,
  "goalTag": "high-protein",
  "rating": 5,
  "saved": true
}

fastingLogs

{
  "fastId": "string",
  "userId": "string",
  "startTime": "timestamp",
  "endTime": "timestamp",
  "durationHours": 16,
  "mood": "focused",
  "energy": "medium",
  "hungerLevel": 3,
  "notes": "Felt good today"
}

hydrationLogs

{
  "logId": "string",
  "userId": "string",
  "amountMl": 500,
  "createdAt": "timestamp"
}

weightLogs

{
  "logId": "string",
  "userId": "string",
  "weightKg": 70.5,
  "date": "2026-05-16"
}

moodLogs

{
  "logId": "string",
  "userId": "string",
  "linkedMealId": "string",
  "mood": "sleepy",
  "energy": "low",
  "notes": "Felt tired after lunch",
  "createdAt": "timestamp"
}

supplementLogs

{
  "logId": "string",
  "userId": "string",
  "supplementName": "Creatine",
  "dosage": "5g",
  "taken": true,
  "createdAt": "timestamp"
}

budgetLogs

{
  "logId": "string",
  "userId": "string",
  "mealId": "string",
  "amount": 80,
  "category": "outside food",
  "createdAt": "timestamp"
}


---

17. Privacy and Safety Requirements

Privacy Controls

User must be able to:

Delete account

Delete meal photos

Delete meal history

Delete weight logs

Delete mood logs

Disconnect Google Fit

Export data

Disable AI analysis

Disable photo saving

Manage notification permissions


Medical Disclaimer

The app must clearly say:

> This app provides general wellness and nutrition guidance. It is not a replacement for medical advice.



Nutrition Disclaimer

> Nutrition values are estimates and may vary based on ingredients, quantity, and cooking method.



Allergy Disclaimer

> Allergen detection may not be fully accurate. Always verify ingredients manually.



AI Confidence Rule

Every AI meal scan must show:

High confidence

Medium confidence

Low confidence


Low-confidence results should require manual confirmation.


---

18. MVP Scope

The full idea is big. For personal use, build it in phases.

MVP Version 1 — Must Build First

Core Features

1. Google Login


2. Onboarding


3. Goal setup


4. Manual meal logging


5. Basic meal scanner


6. Meal confirmation screen


7. Daily calorie/protein dashboard


8. Voice meal logging


9. Cook assistant


10. Fasting tracker


11. Hydration tracker


12. Meal journal


13. Basic reminders


14. Google Fit steps sync


15. Weekly summary



This is enough for the first useful personal version.


---

19. Version Roadmap

Version 1: Personal MVP

Goal:

> Make daily food tracking easier.



Features:

Google login

Profile setup

Meal logging

Basic meal scanner

Voice logging

Nutrition dashboard

Fasting tracker

Hydration tracker

Cook assistant

Meal journal



---

Version 2: Personal Intelligence

Goal:

> Make the app start understanding habits.



Features:

Google Fit full sync

Smart hydration

Personal food database

Weekly insights

Recipe ratings

Saved recipes

Grocery list generator

Mood after meals

Gut health log



---

Version 3: Advanced Personal Health Layer

Goal:

> Connect food with body, budget, and lifestyle.



Features:

Barcode scanner

Grocery scanner

Supplement tracker

Skin/hair nutrient tracker

Budget tracker

Ayurvedic food suggestions

Smart notification timing

Advanced gamification



---

20. Features to Avoid in First Build

Do not build these first:

Full barcode database

Skin/hair analytics

Ayurvedic engine

Advanced gut health intelligence

Advanced grocery scanner

Complex gamification

Paid subscription system

Social/community features


These will slow the project down.


---

21. Success Metrics for Personal Use

Since this is for you, success is not downloads or revenue.

Personal Success Metrics

You log at least 2 meals per day.

You know daily calories and protein.

You use the cook assistant at least 3 times per week.

You drink closer to your water target.

You complete fasting windows consistently.

You understand which meals affect mood, energy, and digestion.

You reduce outside food spending.

You build a useful personal food database.



---

22. Final Product Definition

This app should become:

> A personal AI nutrition and cooking companion that helps me scan meals, log food by voice, track fasting and hydration, sync activity from Google Fit, suggest recipes, and generate weekly insights about my food, fitness, mood, digestion, and health goals.




---

23. Final Recommended Build Order

Build in this exact order:

Phase 1: Foundation

1. Firebase setup


2. Google Login


3. User profile


4. Onboarding


5. Firestore data structure



Phase 2: Basic Tracking

6. Manual meal logging


7. Daily nutrition dashboard


8. Hydration tracker


9. Fasting tracker


10. Weight log



Phase 3: AI Core

11. AI meal scanner


12. Meal confirmation/edit screen


13. Voice meal logging


14. Cook assistant


15. Saved recipes



Phase 4: Personal Intelligence

16. Google Fit sync


17. Weekly summary


18. Mood after meals


19. Gut health log


20. Personal food database



Phase 5: Advanced Features

21. Barcode scanner


22. Grocery scanner


23. Supplement tracker


24. Budget tracker


25. Skin/hair nutrient tracker


26. Ayurvedic suggestions




---

24. One-Line PRD Summary

A mobile-only Android-first personal AI health app that combines meal scanning, voice food logging, AI cooking assistance, fasting, hydration, Google Fit sync, nutrition goals, meal journal, and smart weekly insights to help the user eat better and understand their body.