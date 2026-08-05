// @vitest-environment jsdom

import { cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ThemeProvider } from './theme-provider';

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.className = '';
  document.documentElement.removeAttribute('style');
});

afterEach(() => {
  cleanup();
});

describe('ThemeProvider', () => {
  it('defaults to the dark theme when no theme is stored', () => {
    render(
      <ThemeProvider>
        <span>content</span>
      </ThemeProvider>,
    );

    const root = document.documentElement;
    expect(root.classList.contains('dark')).toBe(true);
    expect(root.classList.contains('light')).toBe(false);
    expect(root.style.colorScheme).toBe('dark');
    expect(root.style.getPropertyValue('--background')).toBe('#111711');
    expect(window.localStorage.getItem('bootstrap-theme')).toBe('dark');
  });

  it('honors a stored theme over the dark default', () => {
    window.localStorage.setItem('bootstrap-theme', 'light');

    render(
      <ThemeProvider>
        <span>content</span>
      </ThemeProvider>,
    );

    const root = document.documentElement;
    expect(root.classList.contains('light')).toBe(true);
    expect(root.classList.contains('dark')).toBe(false);
    expect(root.style.colorScheme).toBe('light');
    expect(root.style.getPropertyValue('--background')).toBe('#fbfcf8');
  });
});
