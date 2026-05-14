import { createContext } from 'react';
import type { ResolvedThemeName, ThemeName } from './tokens';

export interface ThemeContextValue {
  theme: ThemeName;
  resolvedTheme: ResolvedThemeName;
  setTheme: (theme: ThemeName) => void;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);
