import { IHabitRepository, HabitLog } from './habit.repository.js';

export class HabitService {
  constructor(private readonly habitRepository: IHabitRepository) {}

  async completeHabit(habitId: string, date: Date, note?: string): Promise<HabitLog> {
    const habit = await this.habitRepository.findById(habitId);
    if (!habit) {
      throw new Error('HabitNotFound');
    }

    const existingLog = await this.habitRepository.findLogByDate(habitId, date);
    if (existingLog) {
      throw new Error('AlreadyCompletedError');
    }

    return this.habitRepository.saveLog({ habitId, completedAt: date, note });
  }
}
