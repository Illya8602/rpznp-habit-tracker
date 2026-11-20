import pg from 'pg';

const { Pool } = pg;

export const TEST_DB_URL =
  process.env.TEST_DATABASE_URL ||
  'postgres://postgres:postgres_password@localhost:5436/habit_tracker_test';

export async function truncateBusinessTables(
  connectionString: string = TEST_DB_URL,
): Promise<void> {
  const pool = new Pool({ connectionString });
  try {
    await pool.query('TRUNCATE TABLE habit_logs, habits RESTART IDENTITY CASCADE;');
  } finally {
    await pool.end();
  }
}
