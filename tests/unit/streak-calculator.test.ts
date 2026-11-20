import { describe, expect, it } from 'vitest';
import { calculateHabitStreak } from '../../src/domain/streak-calculator.js';

describe('calculateHabitStreak', () => {
  it('throws if weeklyGoal is zero, negative, or non-integer', () => {
    const now = new Date('2026-11-20T12:00:00.000Z');
    expect(() => calculateHabitStreak({ completions: [], now, weeklyGoal: 0 })).toThrow(
      'weeklyGoal must be a positive integer',
    );
    expect(() => calculateHabitStreak({ completions: [], now, weeklyGoal: -2 })).toThrow(
      'weeklyGoal must be a positive integer',
    );
    expect(() => calculateHabitStreak({ completions: [], now, weeklyGoal: 2.5 })).toThrow(
      'weeklyGoal must be a positive integer',
    );
  });

  it('returns zeros when completions list is empty', () => {
    const res = calculateHabitStreak({
      completions: [],
      now: new Date('2026-11-20T12:00:00.000Z'),
      weeklyGoal: 5,
    });
    expect(res).toEqual({ currentStreak: 0, completedToday: false, weeklyCompletionRatio: 0 });
  });

  it('counts consecutive days including today and deduplicates same-day entries', () => {
    const res = calculateHabitStreak({
      now: new Date('2026-11-20T21:00:00.000Z'),
      weeklyGoal: 7,
      completions: [
        { completedAt: new Date('2026-11-20T08:00:00.000Z') },
        { completedAt: new Date('2026-11-20T19:30:00.000Z') },
        { completedAt: new Date('2026-11-19T14:00:00.000Z') },
        { completedAt: new Date('2026-11-18T10:00:00.000Z') },
        { completedAt: new Date('2026-11-15T10:00:00.000Z') },
      ],
    });
    expect(res.completedToday).toBe(true);
    expect(res.currentStreak).toBe(3);
    expect(res.weeklyCompletionRatio).toBeCloseTo(4 / 7, 5);
  });

  it('handles unsorted completion timestamps accurately', () => {
    const res = calculateHabitStreak({
      now: new Date('2026-11-20T12:00:00.000Z'),
      weeklyGoal: 5,
      completions: [
        { completedAt: new Date('2026-11-18T10:00:00.000Z') },
        { completedAt: new Date('2026-11-20T10:00:00.000Z') },
        { completedAt: new Date('2026-11-19T10:00:00.000Z') },
      ],
    });
    expect(res.completedToday).toBe(true);
    expect(res.currentStreak).toBe(3);
    expect(res.weeklyCompletionRatio).toBeCloseTo(3 / 5, 5);
  });

  it('ignores future-dated completions when calculating weekly progress', () => {
    const res = calculateHabitStreak({
      now: new Date('2026-11-20T12:00:00.000Z'),
      weeklyGoal: 4,
      completions: [
        { completedAt: new Date('2026-11-21T10:00:00.000Z') },
        { completedAt: new Date('2026-11-20T10:00:00.000Z') },
      ],
    });
    expect(res.completedToday).toBe(true);
    expect(res.currentStreak).toBe(1);
    expect(res.weeklyCompletionRatio).toBeCloseTo(1 / 4, 5);
  });

  it('keeps streak alive when latest completion was yesterday and respects 7-day window boundary', () => {
    const res = calculateHabitStreak({
      now: new Date('2026-11-20T12:00:00.000Z'),
      weeklyGoal: 4,
      completions: [
        { completedAt: new Date('2026-11-19T10:00:00.000Z') },
        { completedAt: new Date('2026-11-14T10:00:00.000Z') },
        { completedAt: new Date('2026-11-13T10:00:00.000Z') },
      ],
    });
    expect(res.completedToday).toBe(false);
    expect(res.currentStreak).toBe(1);
    expect(res.weeklyCompletionRatio).toBeCloseTo(2 / 4, 5);
  });

  it('resets streak when last completion is 2+ days old and caps weekly ratio at 1', () => {
    const res = calculateHabitStreak({
      now: new Date('2026-11-20T12:00:00.000Z'),
      weeklyGoal: 2,
      completions: [
        { completedAt: new Date('2026-11-18T10:00:00.000Z') },
        { completedAt: new Date('2026-11-17T10:00:00.000Z') },
        { completedAt: new Date('2026-11-16T10:00:00.000Z') },
      ],
    });
    expect(res.completedToday).toBe(false);
    expect(res.currentStreak).toBe(0);
    expect(res.weeklyCompletionRatio).toBe(1);
  });
});
