export const primitiveTokens = {
  neutral: {
    0: '#fbfcf8',
    50: '#f2f4ee',
    100: '#e3e7dd',
    200: '#cbd2c1',
    300: '#aeb8a1',
    400: '#858f78',
    500: '#656d5b',
    600: '#4e5648',
    700: '#353d34',
    800: '#202820',
    900: '#111711',
  },
  green: {
    100: '#dff4df',
    200: '#bee7bd',
    300: '#8ed38c',
    400: '#53b45b',
    500: '#2e9340',
    600: '#217433',
    700: '#1e5b2d',
    800: '#1b4827',
    900: '#173b22',
  },
  amber: {
    100: '#fff0c2',
    200: '#fedc86',
    300: '#f6bd45',
    400: '#dc9518',
    500: '#b87312',
    600: '#925610',
    700: '#6f4110',
    800: '#573413',
    900: '#482c13',
  },
  danger: {
    100: '#ffe1de',
    500: '#c23c32',
    700: '#8f2f29',
  },
} as const;

export const resolvedThemeNames = ['light', 'dark'] as const;
export const themeNames = [...resolvedThemeNames, 'system'] as const;

export type ResolvedThemeName = (typeof resolvedThemeNames)[number];
export type ThemeName = (typeof themeNames)[number];

export function isThemeName(value: string | null): value is ThemeName {
  return themeNames.some((themeName) => themeName === value);
}

export function getNextTheme(theme: ThemeName): ThemeName {
  const currentThemeIndex = themeNames.indexOf(theme);
  const nextThemeIndex = (currentThemeIndex + 1) % themeNames.length;
  return themeNames[nextThemeIndex];
}

export interface SemanticThemeTokens {
  background: string;
  foreground: string;
  card: string;
  'card-foreground': string;
  popover: string;
  'popover-foreground': string;
  primary: string;
  'primary-foreground': string;
  secondary: string;
  'secondary-foreground': string;
  muted: string;
  'muted-foreground': string;
  accent: string;
  'accent-foreground': string;
  destructive: string;
  'destructive-foreground': string;
  border: string;
  input: string;
  ring: string;
  'display-foreground': string;
  'hero-glow': string;
}

export const semanticThemeTokens: Record<
  ResolvedThemeName,
  SemanticThemeTokens
> = {
  light: {
    background: primitiveTokens.neutral[0],
    foreground: primitiveTokens.neutral[900],
    card: primitiveTokens.neutral[0],
    'card-foreground': primitiveTokens.neutral[900],
    popover: primitiveTokens.neutral[0],
    'popover-foreground': primitiveTokens.neutral[900],
    primary: primitiveTokens.green[600],
    'primary-foreground': primitiveTokens.neutral[0],
    secondary: primitiveTokens.neutral[100],
    'secondary-foreground': primitiveTokens.neutral[800],
    muted: primitiveTokens.neutral[100],
    'muted-foreground': primitiveTokens.neutral[600],
    accent: primitiveTokens.amber[100],
    'accent-foreground': primitiveTokens.amber[800],
    destructive: primitiveTokens.danger[500],
    'destructive-foreground': primitiveTokens.neutral[0],
    border: primitiveTokens.neutral[200],
    input: primitiveTokens.neutral[200],
    ring: primitiveTokens.green[400],
    'display-foreground': primitiveTokens.neutral[900],
    'hero-glow': 'rgba(33, 116, 51, 0.13)',
  },
  dark: {
    background: primitiveTokens.neutral[900],
    foreground: primitiveTokens.neutral[0],
    card: primitiveTokens.neutral[800],
    'card-foreground': primitiveTokens.neutral[0],
    popover: primitiveTokens.neutral[800],
    'popover-foreground': primitiveTokens.neutral[0],
    primary: primitiveTokens.green[400],
    'primary-foreground': primitiveTokens.neutral[900],
    secondary: primitiveTokens.neutral[700],
    'secondary-foreground': primitiveTokens.neutral[100],
    muted: primitiveTokens.neutral[700],
    'muted-foreground': primitiveTokens.neutral[300],
    accent: primitiveTokens.amber[900],
    'accent-foreground': primitiveTokens.amber[200],
    destructive: primitiveTokens.danger[700],
    'destructive-foreground': primitiveTokens.neutral[0],
    border: primitiveTokens.neutral[700],
    input: primitiveTokens.neutral[700],
    ring: primitiveTokens.green[300],
    'display-foreground': primitiveTokens.neutral[0],
    'hero-glow': 'rgba(83, 180, 91, 0.16)',
  },
};
