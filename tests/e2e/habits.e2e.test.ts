import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { buildApp } from '../../src/app.js';
import { PostgresHabitRepository } from '../../src/domain/postgres-habit.repository.js';
import { TEST_DB_URL, truncateBusinessTables } from '../helpers/db-reset.js';

describe('Habits HTTP API E2E', () => {
  const repo = new PostgresHabitRepository(TEST_DB_URL);
  const app = buildApp(repo);

  beforeAll(async () => {
    await repo.init();
    await app.ready();
  });

  beforeEach(async () => {
    await truncateBusinessTables(TEST_DB_URL);
  });

  afterAll(async () => {
    await app.close();
    await repo.close();
  });

  it('executes full habit lifecycle over HTTP and persists data in PostgreSQL', async () => {
    const userId = randomUUID();

    const createRes = await app.inject({
      method: 'POST',
      url: '/habits',
      payload: { userId, title: 'Learn German', frequency: 'daily' },
    });
    expect(createRes.statusCode).toBe(201);
    const created = createRes.json() as { id: string; title: string };
    expect(created.title).toBe('Learn German');

    const storedHabit = await repo.findHabitById(created.id);
    expect(storedHabit?.title).toBe('Learn German');

    const listRes = await app.inject({
      method: 'GET',
      url: `/habits?userId=${userId}`,
    });
    expect(listRes.statusCode).toBe(200);
    expect(listRes.json()).toHaveLength(1);

    const logRes = await app.inject({
      method: 'POST',
      url: `/habits/${created.id}/logs`,
      payload: { notes: '20 flashcards' },
    });
    expect(logRes.statusCode).toBe(201);

    const dupRes = await app.inject({
      method: 'POST',
      url: `/habits/${created.id}/logs`,
    });
    expect(dupRes.statusCode).toBe(409);

    const analyticsRes = await app.inject({
      method: 'GET',
      url: `/habits/${created.id}/analytics`,
    });
    expect(analyticsRes.statusCode).toBe(200);
    const analytics = analyticsRes.json() as { totalCompletions: number };
    expect(analytics.totalCompletions).toBe(1);
  });

  it('returns 404 when logging completion for non-existent habit', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/habits/${randomUUID()}/logs`,
    });
    expect(res.statusCode).toBe(404);
  });
});
