import pg from 'pg';
import { Kysely, PostgresDialect } from 'kysely';
import { Habit, HabitLog, IHabitRepository } from './habit.repository.js';
import { logger } from '../shared/logger.js';
import { randomUUID } from 'node:crypto';

const { Pool } = pg;

interface DatabaseSchema {
  habits: {
    id: string;
    user_id: string;
    title: string;
    frequency: string;
    created_at: Date;
  };
  habit_logs: {
    id: string;
    habit_id: string;
    completed_at: Date;
    notes: string | null;
  };
}

export class PostgresHabitRepository implements IHabitRepository {
  private db: Kysely<DatabaseSchema>;
  private pool: pg.Pool;

  constructor(connectionString?: string) {
    this.pool = new Pool({
      connectionString:
        connectionString ||
        process.env.DATABASE_URL ||
        'postgres://postgres:postgres_password@localhost:5435/habit_tracker',
    });

    this.db = new Kysely<DatabaseSchema>({
      dialect: new PostgresDialect({
        pool: this.pool,
      }),
    });
  }

  async init(): Promise<void> {
    const res = await this.pool.query('SELECT NOW()');
    logger.info({ dbTime: res.rows[0].now }, 'PostgreSQL connection established successfully');

    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS habits (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL,
        title VARCHAR(255) NOT NULL,
        frequency VARCHAR(50) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS habit_logs (
        id UUID PRIMARY KEY,
        habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
        completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        notes TEXT
      );
    `);
  }

  async createHabit(data: Omit<Habit, 'id' | 'createdAt'>): Promise<Habit> {
    const id = randomUUID();
    const createdAt = new Date();

    await this.db
      .insertInto('habits')
      .values({
        id,
        user_id: data.userId,
        title: data.title,
        frequency: data.frequency,
        created_at: createdAt,
      })
      .execute();

    return { id, createdAt, ...data };
  }

  async findHabitById(id: string): Promise<Habit | null> {
    const row = await this.db
      .selectFrom('habits')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    if (!row) return null;

    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      frequency: row.frequency,
      createdAt: new Date(row.created_at),
    };
  }

  async getHabitsByUser(userId: string): Promise<Habit[]> {
    const rows = await this.db
      .selectFrom('habits')
      .selectAll()
      .where('user_id', '=', userId)
      .execute();

    return rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      title: r.title,
      frequency: r.frequency,
      createdAt: new Date(r.created_at),
    }));
  }

  async addLog(data: Omit<HabitLog, 'id'>): Promise<HabitLog> {
    const id = randomUUID();

    await this.db
      .insertInto('habit_logs')
      .values({
        id,
        habit_id: data.habitId,
        completed_at: data.completedAt,
        notes: data.notes || null,
      })
      .execute();

    return { id, ...data };
  }

  async findLogToday(habitId: string): Promise<HabitLog | null> {
    const today = new Date().toISOString().split('T')[0];

    const res = await this.pool.query(
      `SELECT * FROM habit_logs 
       WHERE habit_id = $1 AND DATE(completed_at) = $2 LIMIT 1`,
      [habitId, today],
    );

    if (res.rows.length === 0) return null;

    const row = res.rows[0];
    return {
      id: row.id,
      habitId: row.habit_id,
      completedAt: new Date(row.completed_at),
      notes: row.notes,
    };
  }

  async getLogsForHabit(habitId: string): Promise<HabitLog[]> {
    const rows = await this.db
      .selectFrom('habit_logs')
      .selectAll()
      .where('habit_id', '=', habitId)
      .execute();

    return rows.map((r) => ({
      id: r.id,
      habitId: r.habit_id,
      completedAt: new Date(r.completed_at),
      notes: r.notes || undefined,
    }));
  }

  async close(): Promise<void> {
    await this.db.destroy();
  }
}
