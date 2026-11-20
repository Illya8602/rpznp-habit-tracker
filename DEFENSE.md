# Defense — Task 3: Testing & Mutation Testing (`rpznp-habit-tracker`)

## 1. Що я просив у AI

Зафіксувати специфікацію тестування у `spec.md`, винести детерміновану логіку підрахунку стріку в `src/domain/streak-calculator.ts` (без прихованого `new Date()` та I/O), побудувати 3 рівні тестів у Vitest проти ізольованого PostgreSQL у Docker (`docker-compose.test.yml`, `TRUNCATE`) і провести мутаційний аналіз через Stryker (`ai/03-testing-and-mutation.md`).

## 2. Топ-3 розбіжності (spec ↔ вихід AI / початкова реалізація)

1. **Підрахунок стріку та майбутні дати не були підключені в `HabitService` (`src/domain/streak-calculator.ts`, `src/domain/habit.service.ts`):** у коміті `0fac1f8` `getAnalytics` рахував лише `totalCompletions` і брав `lastCompletedAt` з невпорядкованої вибірки без розрахунку `streak`, а перша версія `streak-calculator.ts` помилково зараховувала майбутні дати (`completedAt > now`) до серії. Виправлено фільтрацією майбутніх дат у `259949a` та підключенням `calculateHabitStreak` і максимуму `lastCompletedAt` у `HabitService.getAnalytics` в коміті `2a6ee37` (`ai/03-testing-and-mutation.md`, Phase 1, 3, 4).
2. **Прогалина тестування невідсортованих записів (`tests/unit/streak-calculator.test.ts`):** початкові unit-тести передавали вже відсортовані дати, через що 3 мутанти на `.sort((a, b) => b - a)` виживали в Stryker (87.27%). Додано тест із невідсортованим входом, що підняло мутаційний бал до 94.64% у коміті `259949a` (`ai/03-testing-and-mutation.md`, Phase 3).
3. **Запуск сервера при імпорті `src/index.ts` у `smoke.test.ts` та гонки тестової БД (`src/index.ts`, `docker-compose.test.yml`, `Makefile`):** у коміті `0fac1f8` імпорт `src/index.ts` під час `smoke.test.ts` відкривав порт `3000`. У комітах `259949a` → `2a6ee37` виділено `buildApp()` у `src/app.ts`, додано перевірку `isDirectRun` у `src/index.ts`, окремий Docker Compose проєкт на порту `5436` і `--fileParallelism=false` (`ai/03-testing-and-mutation.md`, Phase 2, 4).

## 3. Ключове рішення

Ізоляція тестового PostgreSQL у окремому контейнері (`port 5436`, `habit_tracker_test`) із детермінованим очищенням бізнес-таблиць через `TRUNCATE TABLE habit_logs, habits RESTART IDENTITY CASCADE` перед кожним тестом зафіксована в `adr/0005-test-database-isolation-and-truncation.md`.

## 4. Перевірка

- **Команди:** `make check`, подвійний послідовний прогін `make test && make test` (4 файли, 13 тестів — 100% pass без витоків стану) та `make mutation`.
- **Мутаційний аналіз (`src/domain/streak-calculator.ts`):** 56 мутантів, **53 убито (94.64%)**, **3 вижило** — усі 3 класифіковані як **еквівалентні**:
  - `if (uniqueDayIndices.length > 0)` → `>= 0` та `true` (ряд. 41): при порожньому масиві `latestDay === undefined`, і `todayIndex - undefined <= 1` (`NaN <= 1`) завжди `false`.
  - `for (let i = 1; i < uniqueDayIndices.length; ...)` → `i <= uniqueDayIndices.length` (ряд. 45): на межі `uniqueDayIndices[i] === undefined`, `NaN === 1` дає `false` і цикл миттєво переривається.
