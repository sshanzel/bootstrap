import { describe, expect, it } from 'vitest';
import { getNextTheme } from './tokens';

describe('getNextTheme', () => {
  it('cycles through the visible theme option order', () => {
    expect(getNextTheme('light')).toBe('dark');
    expect(getNextTheme('dark')).toBe('system');
    expect(getNextTheme('system')).toBe('light');
  });
});
