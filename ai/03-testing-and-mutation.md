# AI Prompt Log — Task 3: Unit, Integration, E2E and Mutation Testing

## Phase 1: Specification & Pure Domain Extraction

- **Prompt:** "Онови spec.md для Завдання 3 та винеси чисту логіку підрахунку серії (streak) і тижневого прогресу в src/domain/streak-calculator.ts з явним параметром now: Date без викликів new Date() чи I/O."
- **Feedback & Revisions:** Додано явну валідацію цілого додатного weeklyGoal та нормалізацію дат у UTC.

## Phase 2: Three-Level Test Suite & Docker Isolation

- **Prompt:** "Налаштуй окремий docker-compose.test.yml (порт 5436), хелпер TRUNCATE бізнес-таблиць та 3 рівні тестів у Vitest: unit (100% branch coverage), integration (PostgresHabitRepository + HabitService) та E2E (Fastify inject + PostgreSQL)."
- **Feedback & Revisions:** Виділено buildApp у src/app.ts для тестування через inject() без конфлікту портів; задано окреме ім'я Docker Compose проєкту та --fileParallelism=false для уникнення конфліктів мережі й стану БД.

## Phase 3: Mutation Testing & Gap Fixes

- **Prompt:** "Налаштуй Stryker на src/domain/streak-calculator.ts, проаналізуй усіх вижилих мутантів та закрий реальні прогалини в тестах і коді."
- **Feedback & Revisions:** Після першого прогону Stryker (48/55 убито, 7 вижило) виявлено дві реальні прогалини: відсутність тесту на невідсортовані записи та баг урахування майбутніх дат (completedAt > now) у currentStreak. Після виправлення коду та додавання тестів досягнуто 53/56 убитих мутантів (94.64%), а решта 3 є строго еквівалентними.
