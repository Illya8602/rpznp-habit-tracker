import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { ConflictError, NotFoundError } from '../../src/domain/errors.js';
import { HabitService } from '../../src/domain/habit.service.js';
import { PostgresHabitRepository } from '../../src/domain/postgres-habit.repository.js';
import { TEST_DB_URL, truncateBusinessTables } from '../helpers/db-reset.js';

describe('PostgresHabitRepository & HabitService integration', () => {
  const repo = new PostgresHabitRepository(TEST_DB_URL);
  const service = new HabitService(repo);

  beforeAll(async () => {
    await repo.init();
  });

  beforeEach(async () => {
    await truncateBusinessTables(TEST_DB_URL);
  });

  afterAll(async () => {
    await repo.close();
  });

  it('creates habits and filters them by userId in PostgreSQL', async () => {
    const userA = randomUUID();
    const userB = randomUUID();

    const createdA = await service.createHabit(userA, 'Morning run', 'daily');
    await service.createHabit(userB, 'Read book', 'weekly');

    const userAHabits = await service.getHabitsByUser(userA);
    expect(userAHabits).toHaveLength(1);
    expect(userAHabits[0]?.id).toBe(createdA.id);
    expect(userAHabits[0]?.title).toBe('Morning run');
  });

  it('logs completion once per day, rejects duplicate log with ConflictError, and computes analytics', async () => {
    const userId = randomUUID();
    const habit = await service.createHabit(userId, 'Drink water', 'daily');

    const log = await service.logCompletion(habit.id, '2 liters done');
    expect(log.habitId).toBe(habit.id);
    expect(log.notes).toBe('2 liters done');

    await expect(service.logCompletion(habit.id)).rejects.toBeInstanceOf(ConflictError);

    const analytics = await service.getAnalytics(habit.id);
    expect(analytics.totalCompletions).toBe(1);
    expect(analytics.lastCompletedAt).toBeInstanceOf(Date);
    expect(analytics.currentStreak).toBe(1);
    expect(analytics.completedToday).toBe(true);
    expect(analytics.weeklyCompletionRatio).toBeCloseTo(1 / 7, 5);
  });

  it('throws NotFoundError when logging or fetching analytics for missing habit', async () => {
    const missingId = randomUUID();
    await expect(service.logCompletion(missingId)).rejects.toBeInstanceOf(NotFoundError);
    await expect(service.getAnalytics(missingId)).rejects.toBeInstanceOf(NotFoundError);
  });
});
