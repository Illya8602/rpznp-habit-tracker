import { Habit, HabitLog, IHabitRepository } from './habit.repository.js';
import { ConflictError, NotFoundError } from './errors.js';
import { calculateHabitStreak } from './streak-calculator.js';

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

  async getAnalytics(habitId: string, now: Date = new Date()) {
    const habit = await this.habitRepo.findHabitById(habitId);
    if (!habit) throw new NotFoundError('Habit');

    const logs = await this.habitRepo.getLogsForHabit(habitId);
    const weeklyGoal = habit.frequency === 'daily' ? 7 : 1;
    const streakStats = calculateHabitStreak({
      completions: logs,
      now,
      weeklyGoal,
    });

    const lastCompletedAt =
      logs.length > 0
        ? logs.reduce(
            (latest, log) => (log.completedAt > latest ? log.completedAt : latest),
            logs[0].completedAt,
          )
        : null;

    return {
      habitId,
      title: habit.title,
      totalCompletions: logs.length,
      lastCompletedAt,
      ...streakStats,
    };
  }
}
