import {
  useEffect,
  useLayoutEffect,
  useState,
  type PropsWithChildren,
} from 'react';
import {
  semanticThemeTokens,
  type ResolvedThemeName,
  type ThemeName,
} from './tokens';
import { ThemeContext } from './theme-context';

const THEME_STORAGE_KEY = 'bootstrap-theme';

function readStoredTheme(): ThemeName | null {
  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return storedTheme === 'light' ||
    storedTheme === 'dark' ||
    storedTheme === 'system'
    ? storedTheme
    : null;
}

function resolveTheme(theme: ThemeName): ResolvedThemeName {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  return theme;
}

function detectInitialTheme(): ThemeName {
  if (typeof window === 'undefined') {
    return 'system';
  }

  return readStoredTheme() ?? 'system';
}

function applyResolvedTheme(theme: ResolvedThemeName): void {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
  root.style.colorScheme = theme;

  const tokenMap = semanticThemeTokens[theme];
  for (const [tokenName, tokenValue] of Object.entries(tokenMap)) {
    root.style.setProperty(`--${tokenName}`, tokenValue);
  }
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setTheme] = useState<ThemeName>(detectInitialTheme);
  const resolvedTheme =
    typeof window === 'undefined' ? 'light' : resolveTheme(theme);

  useLayoutEffect(() => {
    applyResolvedTheme(resolveTheme(theme));
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    if (theme !== 'system') {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      applyResolvedTheme(resolveTheme('system'));
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => {
      const currentResolvedTheme = resolveTheme(currentTheme);
      return currentResolvedTheme === 'dark' ? 'light' : 'dark';
    });
  };

  return (
    <ThemeContext.Provider
      value={{ theme, resolvedTheme, setTheme, toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
