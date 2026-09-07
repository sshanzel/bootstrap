import { describe, expect, it } from '@jest/globals';
import { normalizeErrorForLog, normalizeErrorMessage } from './normalize-error';

describe('normalizeErrorMessage', () => {
  it('returns the message of an Error', () => {
    expect(normalizeErrorMessage(new Error('boom'))).toBe('boom');
  });

  it('returns a string as-is', () => {
    expect(normalizeErrorMessage('nope')).toBe('nope');
  });

  it('reads message from a cross-realm error-shaped object', () => {
    expect(normalizeErrorMessage({ message: 'cross-realm' })).toBe(
      'cross-realm',
    );
  });

  it('falls back for values with no usable message', () => {
    expect(normalizeErrorMessage(42)).toBe('Unknown error');
    expect(normalizeErrorMessage(null)).toBe('Unknown error');
    expect(normalizeErrorMessage({ code: 'X' })).toBe('Unknown error');
  });
});

describe('normalizeErrorForLog', () => {
  it('returns the stack for an Error', () => {
    const error = new Error('boom');
    expect(normalizeErrorForLog(error)).toBe(error.stack);
  });

  it('returns a string as-is', () => {
    expect(normalizeErrorForLog('raw')).toBe('raw');
  });

  it('serializes a plain object', () => {
    expect(normalizeErrorForLog({ a: 1 })).toBe('{"a":1}');
  });

  it('falls back to String for non-serializable values', () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    expect(normalizeErrorForLog(circular)).toBe('[object Object]');
  });
});
