import { Habit, HabitLog, IHabitRepository } from './habit.repository.js';
import { randomUUID } from 'node:crypto';

export class InMemoryHabitRepository implements IHabitRepository {
  private habits: Habit[] = [];
  private logs: HabitLog[] = [];

  async createHabit(data: Omit<Habit, 'id' | 'createdAt'>): Promise<Habit> {
    const habit: Habit = {
      id: randomUUID(),
      ...data,
      createdAt: new Date(),
    };
    this.habits.push(habit);
    return habit;
  }

  async findHabitById(id: string): Promise<Habit | null> {
    return this.habits.find((h) => h.id === id) || null;
  }

  async getHabitsByUser(userId: string): Promise<Habit[]> {
    return this.habits.filter((h) => h.userId === userId);
  }

  async addLog(data: Omit<HabitLog, 'id'>): Promise<HabitLog> {
    const log: HabitLog = {
      id: randomUUID(),
      ...data,
    };
    this.logs.push(log);
    return log;
  }

  async findLogToday(habitId: string): Promise<HabitLog | null> {
    const today = new Date().toISOString().split('T')[0];
    return (
      this.logs.find(
        (l) => l.habitId === habitId && l.completedAt.toISOString().split('T')[0] === today,
      ) || null
    );
  }

  async getLogsForHabit(habitId: string): Promise<HabitLog[]> {
    return this.logs.filter((l) => l.habitId === habitId);
  }
}
