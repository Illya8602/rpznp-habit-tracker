import { FastifyReply, FastifyRequest } from 'fastify';
import { HabitService } from '../domain/habit.service.js';

export class HabitController {
  constructor(private readonly habitService: HabitService) {}

  createHabit = async (
    req: FastifyRequest<{ Body: { userId: string; title: string; frequency: string } }>,
    reply: FastifyReply,
  ) => {
    const habit = await this.habitService.createHabit(
      req.body.userId,
      req.body.title,
      req.body.frequency,
    );
    return reply.status(201).send(habit);
  };

  getHabits = async (
    req: FastifyRequest<{ Querystring: { userId: string } }>,
    reply: FastifyReply,
  ) => {
    const habits = await this.habitService.getHabitsByUser(req.query.userId);
    return reply.send(habits);
  };

  logCompletion = async (
    req: FastifyRequest<{ Params: { id: string }; Body: { notes?: string } }>,
    reply: FastifyReply,
  ) => {
    const log = await this.habitService.logCompletion(req.params.id, req.body?.notes);
    return reply.status(201).send(log);
  };

  getAnalytics = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const analytics = await this.habitService.getAnalytics(req.params.id);
    return reply.send(analytics);
  };
}
