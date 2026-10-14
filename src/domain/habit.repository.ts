export interface Habit {
  id: string;
  userId: string;
  title: string;
  frequency: 'daily' | 'weekly';
  createdAt: Date;
}

export interface HabitLog {
  id: string;
  habitId: string;
  completedAt: Date;
  note?: string;
}

export interface IHabitRepository {
  findById(id: string): Promise<Habit | null>;
  saveLog(log: Omit<HabitLog, 'id'>): Promise<HabitLog>;
  findLogByDate(habitId: string, date: Date): Promise<HabitLog | null>;
}
