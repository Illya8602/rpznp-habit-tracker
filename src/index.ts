import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import { randomUUID } from 'node:crypto';
import { requestContextStorage } from './shared/context.js';
import { logger } from './shared/logger.js';
import { DomainError } from './domain/errors.js';
import { InMemoryHabitRepository } from './domain/in-memory-habit.repository.js';
import { PostgresHabitRepository } from './domain/postgres-habit.repository.js';
import { HabitService } from './domain/habit.service.js';
import { HabitController } from './http/habit.controller.js';
import { IHabitRepository } from './domain/habit.repository.js';

const fastify = Fastify({ disableRequestLogging: true });

fastify.addHook(
  'onRequest',
  (req: FastifyRequest, reply: FastifyReply, done: (err?: Error) => void) => {
    const processId = (req.headers['x-process-id'] as string) || randomUUID();
    requestContextStorage.run({ processId }, () => {
      done();
    });
  },
);

fastify.setErrorHandler((error: Error, req: FastifyRequest, reply: FastifyReply) => {
  if (error instanceof DomainError) {
    logger.warn({ err: error }, error.message);
    return reply.status(error.statusCode).send({
      error: error.name,
      message: error.message,
    });
  }

  logger.error({ err: error }, 'Unhandled application error');
  return reply.status(500).send({
    error: 'InternalServerError',
    message: 'An unexpected error occurred',
  });
});

let habitRepo: IHabitRepository = new InMemoryHabitRepository();

const start = async () => {
  try {
    if (process.env.USE_POSTGRES === 'true') {
      const pgRepo = new PostgresHabitRepository();
      await pgRepo.init();
      habitRepo = pgRepo;
      logger.info('Using PostgreSQL repository');
    } else {
      logger.info('Using InMemory repository');
    }

    const habitService = new HabitService(habitRepo);
    const habitController = new HabitController(habitService);

    fastify.post<{ Body: { userId: string; title: string; frequency: string } }>(
      '/habits',
      habitController.createHabit,
    );
    fastify.get<{ Querystring: { userId: string } }>('/habits', habitController.getHabits);
    fastify.post<{ Params: { id: string }; Body: { notes?: string } }>(
      '/habits/:id/logs',
      habitController.logCompletion,
    );
    fastify.get<{ Params: { id: string } }>('/habits/:id/analytics', habitController.getAnalytics);

    const port = Number(process.env.PORT) || 3000;
    await fastify.listen({ port, host: '0.0.0.0' });
    logger.info(`Server running at http://localhost:${port}`);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
};

start();

export function getAppInfo() {
  return {
    name: 'habit-tracker-api',
    version: '0.1.0',
    status: 'ok',
    commit: process.env.GIT_COMMIT || 'development',
  };
}
