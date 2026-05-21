export const primitiveTokens = {
  neutral: {
    0: '#fcfbf8',
    50: '#f4f1eb',
    100: '#e8e2d7',
    200: '#d9d0c1',
    300: '#beb2a0',
    400: '#958977',
    500: '#6e6458',
    600: '#564d44',
    700: '#403933',
    800: '#292522',
    900: '#171513',
  },
  teal: {
    100: '#dbefea',
    200: '#bdded6',
    300: '#95c9bf',
    400: '#67ada1',
    500: '#4a9286',
    600: '#34746a',
    700: '#295a53',
    800: '#214742',
    900: '#173532',
  },
  sand: {
    100: '#f5ead8',
    200: '#ead7b6',
    300: '#ddc08d',
    400: '#caa05d',
    500: '#aa7f3c',
    600: '#886430',
    700: '#684c27',
    800: '#533d21',
    900: '#41301a',
  },
  danger: {
    100: '#f8dfde',
    500: '#b14f48',
    700: '#823934',
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
    primary: primitiveTokens.teal[600],
    'primary-foreground': primitiveTokens.neutral[0],
    secondary: primitiveTokens.neutral[50],
    'secondary-foreground': primitiveTokens.neutral[800],
    muted: primitiveTokens.neutral[100],
    'muted-foreground': primitiveTokens.neutral[600],
    accent: primitiveTokens.sand[100],
    'accent-foreground': primitiveTokens.sand[800],
    destructive: primitiveTokens.danger[500],
    'destructive-foreground': primitiveTokens.neutral[0],
    border: primitiveTokens.neutral[200],
    input: primitiveTokens.neutral[200],
    ring: primitiveTokens.teal[400],
    'display-foreground': primitiveTokens.sand[800],
    'hero-glow': 'rgba(202, 160, 93, 0.18)',
  },
  dark: {
    background: primitiveTokens.neutral[900],
    foreground: primitiveTokens.neutral[0],
    card: primitiveTokens.neutral[800],
    'card-foreground': primitiveTokens.neutral[0],
    popover: primitiveTokens.neutral[800],
    'popover-foreground': primitiveTokens.neutral[0],
    primary: primitiveTokens.teal[400],
    'primary-foreground': primitiveTokens.neutral[900],
    secondary: primitiveTokens.neutral[700],
    'secondary-foreground': primitiveTokens.neutral[100],
    muted: primitiveTokens.neutral[700],
    'muted-foreground': primitiveTokens.neutral[300],
    accent: primitiveTokens.sand[900],
    'accent-foreground': primitiveTokens.sand[200],
    destructive: primitiveTokens.danger[700],
    'destructive-foreground': primitiveTokens.neutral[0],
    border: primitiveTokens.neutral[700],
    input: primitiveTokens.neutral[700],
    ring: primitiveTokens.teal[300],
    'display-foreground': primitiveTokens.sand[200],
    'hero-glow': 'rgba(83, 61, 33, 0.34)',
  },
};
