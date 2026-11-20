import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { randomUUID } from 'node:crypto';
import { requestContextStorage } from './shared/context.js';
import { logger } from './shared/logger.js';
import { DomainError } from './domain/errors.js';
import { IHabitRepository } from './domain/habit.repository.js';
import { HabitService } from './domain/habit.service.js';
import { HabitController } from './http/habit.controller.js';

export function buildApp(habitRepo: IHabitRepository): FastifyInstance {
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

  return fastify;
}
