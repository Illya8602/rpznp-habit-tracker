import { Habit, HabitLog, IHabitRepository } from './habit.repository.js';
import { ConflictError, NotFoundError } from './errors.js';

export class HabitService {
  constructor(private readonly habitRepo: IHabitRepository) {}

  async createHabit(userId: string, title: string, frequency: string): Promise<Habit> {
    return this.habitRepo.createHabit({ userId, title, frequency });
  }

  async getHabitsByUser(userId: string): Promise<Habit[]> {
    return this.habitRepo.getHabitsByUser(userId);
  }

  async logCompletion(habitId: string, notes?: string): Promise<HabitLog> {
    const habit = await this.habitRepo.findHabitById(habitId);
    if (!habit) throw new NotFoundError('Habit');

    const todayLog = await this.habitRepo.findLogToday(habitId);
    if (todayLog) throw new ConflictError('Habit already logged today');

    return this.habitRepo.addLog({ habitId, completedAt: new Date(), notes });
  }

  async getAnalytics(habitId: string) {
    const habit = await this.habitRepo.findHabitById(habitId);
    if (!habit) throw new NotFoundError('Habit');

    const logs = await this.habitRepo.getLogsForHabit(habitId);
    return {
      habitId,
      title: habit.title,
      totalCompletions: logs.length,
      lastCompletedAt: logs.length > 0 ? logs[logs.length - 1].completedAt : null,
    };
  }
}
