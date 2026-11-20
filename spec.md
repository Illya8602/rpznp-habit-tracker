# Specification — Habit Tracker API (Task 2)

## 1. Domain Entities & ER Model

- User: id (UUIDv7), email (string), createdAt (datetime)
- Habit: id (UUIDv7), userId (UUIDv7), title (string), frequency (daily/weekly), createdAt (datetime)
- HabitLog: id (UUIDv7), habitId (UUIDv7), completedAt (datetime), notes (string)

User (1:N) -> Habit (1:N) -> HabitLog

## 2. API Scenarios & Behavior

1. POST /habits — Створення нової звички (201 Created)
2. GET /habits — Отримання списку звичок користувача (200 OK)
3. POST /habits/:id/logs — Відмітка виконання звички з перевіркою повторів за день (201 Created / 409 Conflict)
4. GET /habits/:id/analytics — Розрахунок поточного streak (послідовних днів) та загальної статистики (200 OK)

## 3. Database Schema & SQL Queries

CREATE TABLE users (
id UUID PRIMARY KEY,
email VARCHAR(255) UNIQUE NOT NULL,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE habits (
id UUID PRIMARY KEY,
user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
title VARCHAR(255) NOT NULL,
frequency VARCHAR(50) NOT NULL,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE habit_logs (
id UUID PRIMARY KEY,
habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
notes TEXT
);

-- Query to fetch habit analytics without N+1
SELECT h.id, h.title, COUNT(l.id) as total_logs, MAX(l.completed_at) as last_completed
FROM habits h
LEFT JOIN habit_logs l ON h.id = l.habit_id
WHERE h.id = $1
GROUP BY h.id, h.title;

## 4. Acceptance Criteria

- Усі 4 API сценарії працюють спершу через In-Memory сховище, потім через PostgreSQL.
- Кожен лог запиту містить processId без його передачі через параметри функцій (використовується AsyncLocalStorage).
- Виникнення помилки обробляється єдиним глобальним setErrorHandler.

## Task 3 — Testing & Mutation Testing Specification

### 1. Unit Testing Target & Coverage

- Target module: src/domain/streak-calculator.ts (pure streak and weekly progress calculation).
- Pure logic: no DB, network, filesystem, or Date.now() / new Date() inside pure functions; now: Date is passed explicitly.
- Target: 100% branch coverage and mutation testing with @stryker-mutator/core.

### 2. Integration & E2E Testing

- Integration (tests/integration): tests PostgresHabitRepository and HabitService against real PostgreSQL initialized via repo.init(), truncating habit_logs, habits between tests.
- E2E (tests/e2e): tests HTTP routes (POST /habits, GET /habits, POST /habits/:id/logs, GET /habits/:id/analytics, plus 404 / 409) via Fastify inject() backed by real PostgreSQL.

### 3. Acceptance Criteria

- Isolated test PostgreSQL on port 5436 (habit_tracker_test).
- Single command make test starts test DB, waits for readiness, and runs unit + integration + e2e tests.
- Running make test twice consecutively passes without failures or state leakage.
- Single command make mutation runs Stryker scoped strictly to src/domain/streak-calculator.ts.
