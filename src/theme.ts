import { Platform } from 'react-native';

export const colors = {
  background: '#F7F8FA',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF6F2',
  ink: '#17211C',
  muted: '#65716B',
  faint: '#DCE3DF',
  primary: '#146C57',
  primaryDark: '#0D4B3D',
  mint: '#DDF4E8',
  blue: '#2563EB',
  blueSoft: '#E8F0FF',
  amber: '#B45309',
  amberSoft: '#FFF2D8',
  rose: '#C2415D',
  roseSoft: '#FFE8EE',
  violet: '#6D5BD0',
  violetSoft: '#EFECFF',
  black: '#0B1110',
  white: '#FFFFFF',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radii = {
  sm: 6,
  md: 8,
  lg: 12,
  pill: 999,
};

export const typography = {
  title: 28,
  h1: 24,
  h2: 19,
  h3: 16,
  body: 14,
  small: 12,
  micro: 11,
};

export const shadows = {
  card: Platform.select({
    web: {
      boxShadow: '0px 14px 34px rgba(18, 34, 28, 0.08)',
    } as object,
    default: {
      shadowColor: '#15231D',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 18,
      elevation: 2,
    },
  }),
};
