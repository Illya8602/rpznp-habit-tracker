import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { logger } from './shared/logger.js';
import { InMemoryHabitRepository } from './domain/in-memory-habit.repository.js';
import { PostgresHabitRepository } from './domain/postgres-habit.repository.js';
import { IHabitRepository } from './domain/habit.repository.js';
import { buildApp } from './app.js';

export async function start() {
  let habitRepo: IHabitRepository = new InMemoryHabitRepository();

  try {
    if (process.env.USE_POSTGRES === 'true') {
      const pgRepo = new PostgresHabitRepository();
      await pgRepo.init();
      habitRepo = pgRepo;
      logger.info('Using PostgreSQL repository');
    } else {
      logger.info('Using InMemory repository');
    }

    const fastify = buildApp(habitRepo);
    const port = Number(process.env.PORT) || 3000;
    await fastify.listen({ port, host: '0.0.0.0' });
    logger.info(`Server running at http://localhost:${port}`);
    return fastify;
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
}

const isDirectRun =
  process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  void start();
}

export function getAppInfo() {
  return {
    name: 'habit-tracker-api',
    version: '0.1.0',
    status: 'ok',
    commit: process.env.GIT_SHA || process.env.GIT_COMMIT || 'development',
  };
}
