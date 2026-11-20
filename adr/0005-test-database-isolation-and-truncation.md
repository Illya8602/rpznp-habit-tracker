# ADR 0005: Test Database Isolation and State Reset Strategy

## Status

Accepted

## Context

Інтеграційні та E2E-тести повинні працювати проти реального PostgreSQL 16 (через Kysely та PgPool), не зачіпаючи dev-середовище (`habit_tracker` на порту `5435`) і гарантуючи ідемпотентність при багаторазовому запуску `make test`.

## Decision

1. Виділити окремий Docker Compose файл (`docker-compose.test.yml`, проєкт `rpznp-habit-tracker-test`, порт `5436`, БД `habit_tracker_test`) з `healthcheck` (`pg_isready`) та очікуванням готовності через `docker compose ... up -d --wait`.
2. Перед кожним інтеграційним та E2E-тестом очищати бізнес-таблиці командою `TRUNCATE TABLE habit_logs, habits RESTART IDENTITY CASCADE;` без видалення схеми чи системних таблиць, а тестовий прогін запускати з `--fileParallelism=false` для уникнення гонок між файлами тестів.

## Considered Options

1. Спільна БД із dev-середовищем (`localhost:5435`): відхилено через ризик втрати або спотворення локальних даних розробника.
2. In-memory моки замість PostgreSQL у інтеграційних тестах: відхилено, оскільки не перевіряє реальні SQL-обмеження зовнішніх ключів (`ON DELETE CASCADE`), `DATE(completed_at)` та поведінку `PgPool`.
3. Окремий тестовий контейнер PostgreSQL + `TRUNCATE` бізнес-таблиць (обрано): забезпечує повну ізоляцію, швидкий старт (менше 2 секунд) та 100% відтворюваність.

## Consequences

- Плюси: Повна ізоляція тестових даних від dev-БД; два послідовні запуски `make test` стабільно проходять без витоків стану.
- Мінуси: Потрібен запущений Docker daemon на машині розробника або в CI; інтеграційні та E2E-файли виконуються послідовно (`--fileParallelism=false`).
