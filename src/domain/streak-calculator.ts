export interface CompletionTimestamp {
  completedAt: Date;
}

export interface StreakCalculationInput {
  completions: readonly CompletionTimestamp[];
  now: Date;
  weeklyGoal: number;
}

export interface StreakCalculationOutput {
  currentStreak: number;
  completedToday: boolean;
  weeklyCompletionRatio: number;
}

const MS_PER_DAY = 86_400_000;

function toUtcDayIndex(date: Date): number {
  const utcMidnight = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return Math.floor(utcMidnight / MS_PER_DAY);
}

export function calculateHabitStreak(input: StreakCalculationInput): StreakCalculationOutput {
  if (!Number.isInteger(input.weeklyGoal) || input.weeklyGoal <= 0) {
    throw new Error('weeklyGoal must be a positive integer');
  }

  const todayIndex = toUtcDayIndex(input.now);
  const uniqueDayIndices = Array.from(
    new Set(
      input.completions
        .map((item) => toUtcDayIndex(item.completedAt))
        .filter((dayIdx) => dayIdx <= todayIndex),
    ),
  ).sort((a, b) => b - a);

  const completedToday = uniqueDayIndices.includes(todayIndex);

  let currentStreak = 0;
  if (uniqueDayIndices.length > 0) {
    const latestDay = uniqueDayIndices[0];
    if (todayIndex - latestDay <= 1) {
      currentStreak = 1;
      for (let i = 1; i < uniqueDayIndices.length; i += 1) {
        if (uniqueDayIndices[i - 1] - uniqueDayIndices[i] === 1) {
          currentStreak += 1;
        } else {
          break;
        }
      }
    }
  }

  const windowStartIndex = todayIndex - 6;
  const completionsInLast7Days = uniqueDayIndices.filter(
    (dayIdx) => dayIdx >= windowStartIndex,
  ).length;

  const weeklyCompletionRatio = Math.min(1, completionsInLast7Days / input.weeklyGoal);

  return {
    currentStreak,
    completedToday,
    weeklyCompletionRatio,
  };
}
