export interface Habit {
  id: string;
  userId: string;
  title: string;
  frequency: string;
  createdAt: Date;
}

export interface HabitLog {
  id: string;
  habitId: string;
  completedAt: Date;
  notes?: string;
}

export interface IHabitRepository {
  createHabit(data: Omit<Habit, 'id' | 'createdAt'>): Promise<Habit>;
  findHabitById(id: string): Promise<Habit | null>;
  getHabitsByUser(userId: string): Promise<Habit[]>;
  addLog(data: Omit<HabitLog, 'id'>): Promise<HabitLog>;
  findLogToday(habitId: string): Promise<HabitLog | null>;
  getLogsForHabit(habitId: string): Promise<HabitLog[]>;
}
