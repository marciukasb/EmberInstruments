import { describe, it, expect } from 'vitest';
import { formatDate } from './index';

describe('formatDate', () => {
  it('formats an ISO date string to a human-readable date', () => {
    expect(formatDate('2026-05-10')).toBe('May 10, 2026');
  });

  it('returns empty string for undefined input', () => {
    expect(formatDate(undefined)).toBe('');
  });

  it('returns empty string for empty string input', () => {
    expect(formatDate('')).toBe('');
  });
});
