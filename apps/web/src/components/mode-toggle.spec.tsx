// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '@/theme/theme-provider';
import { ModeToggle } from './mode-toggle';

interface MatchMediaOptions {
  matches?: boolean;
}

function mockMatchMedia({ matches = false }: MatchMediaOptions = {}): void {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      addEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      matches,
      media: query,
      onchange: null,
      removeEventListener: vi.fn(),
    })),
  });
}

function renderModeToggle(): void {
  render(
    <ThemeProvider>
      <ModeToggle />
    </ThemeProvider>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.className = '';
  document.documentElement.removeAttribute('style');
  mockMatchMedia();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('ModeToggle', () => {
  it('keeps the visible theme label aligned with the selected option', async () => {
    const user = userEvent.setup();
    renderModeToggle();

    expect(screen.getByText('Theme: System')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Use light theme' }));
    expect(screen.getByText('Theme: Light')).toBeTruthy();
    expect(window.localStorage.getItem('bootstrap-theme')).toBe('light');

    await user.click(screen.getByRole('button', { name: 'Use dark theme' }));
    expect(screen.getByText('Theme: Dark')).toBeTruthy();
    expect(window.localStorage.getItem('bootstrap-theme')).toBe('dark');

    await user.click(screen.getByRole('button', { name: 'Use system theme' }));
    expect(screen.getByText('Theme: System')).toBeTruthy();
    expect(window.localStorage.getItem('bootstrap-theme')).toBe('system');
  });
});
