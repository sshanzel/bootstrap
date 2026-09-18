import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const styles = readFileSync(new URL('./styles.css', import.meta.url), 'utf8');
const baseLayer = styles.slice(styles.indexOf('@layer base {'));

describe('global styles', () => {
  it('reserves root scrollbar space to avoid content layout shift', () => {
    expect(styles).toMatch(/html\s*\{[^}]*scrollbar-gutter:\s*stable;/);
  });

  it('paints the page background on the scroll container, so the reserved gutter is never a bare strip', () => {
    expect(styles).toMatch(/html\s*\{[^}]*background-image:/);
    expect(styles).toMatch(/body\s*\{[^}]*background-color:\s*transparent;/);
  });

  it('neutralizes the scroll-lock margin that would double the reserved gutter', () => {
    expect(styles).toMatch(
      /body\[data-scroll-locked\]\[data-scroll-locked\]\s*\{[^}]*margin-right:\s*0\s*!important;/,
    );
  });

  it('gives every clickable element the pointer in the base layer, where a utility can still override it', () => {
    expect(baseLayer).toMatch(
      /button:not\(:disabled\),\s*\[role='button'\]:not\(\[aria-disabled='true'\]\),\s*select:not\(:disabled\),\s*summary,\s*label\[for\]\s*\{\s*cursor:\s*pointer;/,
    );
    expect(baseLayer).toMatch(
      /button:disabled,\s*select:disabled\s*\{\s*cursor:\s*not-allowed;/,
    );
    expect(styles.indexOf('cursor: pointer')).toBeGreaterThan(
      styles.indexOf('@layer base {'),
    );
  });
});
