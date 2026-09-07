import { describe, expect, it } from '@jest/globals';
import { SLUG_MAX_LENGTH, isValidSlug, slugify } from './slug';

describe('slugify', () => {
  it('lowercases and hyphenates whitespace', () => {
    expect(slugify('My Cool App')).toBe('my-cool-app');
  });

  it('strips diacritics', () => {
    expect(slugify('Café Déjà')).toBe('cafe-deja');
  });

  it('collapses every non-alphanumeric run into a single hyphen', () => {
    expect(slugify('  Hello_世界!! ')).toBe('hello');
  });

  it('truncates to SLUG_MAX_LENGTH', () => {
    expect(slugify('a'.repeat(SLUG_MAX_LENGTH + 10))).toBe(
      'a'.repeat(SLUG_MAX_LENGTH),
    );
  });

  it('never leaves a trailing hyphen when truncation lands on one', () => {
    const input = `${'a'.repeat(SLUG_MAX_LENGTH - 1)} b`;
    expect(slugify(input)).toBe('a'.repeat(SLUG_MAX_LENGTH - 1));
  });
});

describe('isValidSlug', () => {
  it('accepts a canonical slug', () => {
    expect(isValidSlug('my-cool-app')).toBe(true);
  });

  it('rejects the empty string', () => {
    expect(isValidSlug('')).toBe(false);
  });

  it('rejects leading, trailing, and doubled hyphens and uppercase', () => {
    expect(isValidSlug('-x')).toBe(false);
    expect(isValidSlug('x-')).toBe(false);
    expect(isValidSlug('a--b')).toBe(false);
    expect(isValidSlug('Abc')).toBe(false);
  });
});
