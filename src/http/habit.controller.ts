import { HabitService } from '../domain/habit.service.js';

export interface CreateHabitLogDTO {
  completedAt: string;
  note?: string;
}

export class HabitController {
  constructor(private readonly habitService: HabitService) {}

  async logCompletion(habitId: string, dto: CreateHabitLogDTO) {
    const date = new Date(dto.completedAt);
    return this.habitService.completeHabit(habitId, date, dto.note);
  }
}
