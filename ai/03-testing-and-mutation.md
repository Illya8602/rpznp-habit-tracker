# AI Prompt Log — Task 3: Unit, Integration, E2E and Mutation Testing

## Phase 1: Specification & Pure Domain Extraction

- **Verbatim Prompt:** "Онови spec.md для Завдання 3: зафіксуй вимоги до unit-, інтеграційних та E2E-тестів, ізоляції тестової БД через TRUNCATE та мутаційного тестування. Винеси чисту логіку підрахунку серії (streak) і тижневого прогресу в src/domain/streak-calculator.ts з явним параметром now: Date без викликів new Date() чи I/O."
- **Clarifications & Revisions:** Зафіксовано нормалізацію дат у UTC, дедуплікацію кількох відміток за один день та валідацію цілого додатного weeklyGoal.

## Phase 2: Three-Level Test Suite & Docker Isolation

- **Verbatim Prompt:** "Налаштуй окремий docker-compose.test.yml (порт 5436, БД habit_tracker_test), хелпер TRUNCATE бізнес-таблиць tests/helpers/db-reset.ts та 3 рівні тестів у Vitest: unit (100% branch coverage для streak-calculator), integration (PostgresHabitRepository + HabitService) та E2E (Fastify inject + PostgreSQL). Додай цілі test і mutation у Makefile."
- **Clarifications & Revisions:** Винесено buildApp у src/app.ts для тестування HTTP через inject() без конфлікту портів; задано окреме ім'я Compose-проєкту (rpznp-habit-tracker-test) та --fileParallelism=false для уникнення гонок при TRUNCATE.

## Phase 3: Mutation Testing & Gap Fixes

- **Verbatim Prompt:** "Налаштуй Stryker на src/domain/streak-calculator.ts, запусти make mutation, проаналізуй усіх вижилих мутантів, виправ реальні прогалини в тестах і коді та класифікуй еквівалентних мутантів."
- **Clarifications & Revisions:** Перший прогін Stryker дав 48/55 убитих мутантів (87.27%, 7 вижило). Виявлено та закрито дві реальні прогалини: відсутність тесту на невідсортований масив дат (убило 3 мутанти на .sort) та баг урахування майбутніх дат (completedAt > now) у currentStreak. Повторний прогін дав 53/56 убитих мутантів (94.64%), решта 3 є строго еквівалентними.

## Phase 4: Integration with HabitService & Entrypoint Guard

- **Verbatim Prompt:** "Перевір відповідність попередньому рев'ю: підключи calculateHabitStreak у HabitService.getAnalytics замість невпорядкованого lastCompletedAt, захисти src/index.ts від запуску сервера на порту 3000 при імпорті у smoke.test.ts і зафіксуй SHA комітів до -> після у DEFENSE.md."
- **Clarifications & Revisions:** Додано перевірку isDirectRun у src/index.ts, підключено calculateHabitStreak та обчислення максимальної дати lastCompletedAt у HabitService.getAnalytics, розширено перевірки в інтеграційному та E2E-тестах.
