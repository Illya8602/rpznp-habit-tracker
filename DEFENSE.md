# Defense — Task 3: Testing & Mutation Testing (`rpznp-habit-tracker`)

## 1. Що я просив у AI

Зафіксувати специфікацію тестування в `spec.md`, винести чисту логіку розрахунку стріку в `src/domain/streak-calculator.ts` (без прихованого `new Date()` та I/O), реалізувати unit-, інтеграційні та E2E-тести на Vitest проти ізольованого PostgreSQL у Docker і провести мутаційний аналіз через Stryker (`ai/03-testing-and-mutation.md`).

## 2. Топ-3 розбіжності (spec ↔ вихід AI / початкова реалізація)

1. **Врахування майбутніх дат у серії (`src/domain/streak-calculator.ts`):** початкова версія фільтрувала майбутні записи (`dayIdx <= todayIndex`) лише для тижневого прогресу, але додавала завтрашню дату до `currentStreak` (`todayIndex - latestDay <= 1` давало `-1 <= 1`). Виправлено фільтрацією `dayIdx <= todayIndex` до сортування (`ai/03-testing-and-mutation.md`, `spec.md`).
2. **Прогалина тестування невідсортованих записів (`tests/unit/streak-calculator.test.ts`):** початкові unit-тести передавали вже відсортований масив дат, через що 3 мутанти на `.sort((a, b) => b - a)` виживали. Додано тест із хаотичним порядком дат, що вбило всі 3 мутанти.
3. **Конфлікт мережі Docker Compose та паралелізм тестів БД (`docker-compose.test.yml`, `Makefile`):** спільне ім'я Compose-проєкту викликало помилку мережі, а паралельний запуск `integration` і `e2e` файлів створював гонку на `TRUNCATE`. Вирішено окремим `name: rpznp-habit-tracker-test` і прапорцем `--fileParallelism=false`.

## 3. Ключове рішення

Ізоляція тестового PostgreSQL у окремому контейнері (`port 5436`, `habit_tracker_test`) з детермінованим очищенням бізнес-таблиць через `TRUNCATE TABLE habit_logs, habits RESTART IDENTITY CASCADE` перед кожним тестом зафіксована в `adr/0005-test-database-isolation-and-truncation.md`.

## 4. Перевірка

- **Команди:** `make check`, подвійний послідовний прогін `make test && make test` (4 файли, 11 тестів — 100% pass без витоків стану) та `make mutation`.
- **Мутаційний аналіз (`src/domain/streak-calculator.ts`):** 56 мутантів, **53 убито (94.64%)**, **3 вижило** — усі 3 класифіковані як **еквівалентні**:
  - `if (uniqueDayIndices.length > 0)` → `>= 0` та `true` (ряд. 41): при порожньому масиві `latestDay === undefined`, і `todayIndex - undefined <= 1` (`NaN <= 1`) завжди `false`.
  - `for (let i = 1; i < uniqueDayIndices.length; ...)` → `i <= uniqueDayIndices.length` (ряд. 45): на межі `uniqueDayIndices[i] === undefined`, `NaN === 1` дає `false` і цикл миттєво переривається.
