# Специфікація: Habit Tracker API (v0.1)

## 1. Мета та сценарії використання

Система призначена для ведення щоденних звичок, фіксації прогресу та обчислення серій виконання (streaks).
Ключові сценарії:

- Створення звички з розкладом (щодня / дні тижня).
- Фіксація виконання звички за поточну або обрану дату.
- Отримання аналітики виконання та поточної серії.

## 2. Модульна декомпозиція та межі (Component Boundaries)

Архітектура дотримується принципу інверсії залежностей:

1. **HTTP Layer (Router & Controller)**: Приймає запит, валідує payload через DTO, делегує обробку доменному сервісу.
2. **Domain Service (Habit Service)**: Обчислює бізнес-правила (перевірка повторного виконання, серії).
3. **Repository Interface (IHabitRepository)**: Ізольований контракт сховища даних.

[ Client / Web UI ]
| HTTP / REST
v
+----------------------------------------------+
| Fastify HTTP Router |
| - Schema Verification (JSON Schema / DTO) |
| - Route Handlers |
+----------------------+-----------------------+
| Domain DTO
v
+----------------------------------------------+
| Habit Domain Service |
| - Business Rules & Streak Calculation |
+----------------------+-----------------------+
| Interface Contract
v
+----------------------------------------------+
| IHabitRepository (Data Access Contract) |
| - [In-Memory (Lab 2) -> PostgreSQL (Lab 4)] |
+----------------------------------------------+

## 3. Модель даних та зв'язки (ER)

- **User**: `id (UUID)`, `email (string)`, `created_at (timestamp)`
- **Habit**: `id (UUID)`, `user_id (UUID -> User.id)`, `title (string)`, `frequency (daily | weekly)`, `created_at (timestamp)`
- **HabitLog**: `id (UUID)`, `habit_id (UUID -> Habit.id)`, `completed_at (date)`, `note (string?)`

Зв'язки:

- `User` 1:N `Habit`
- `Habit` 1:N `HabitLog` (унікальний композитний ключ: `[habit_id, completed_at]`).

## 4. Критерії прийняття (Acceptance Criteria)

- Проєкт безпомилково компілюється через `npm run build`.
- Статичний аналіз (`eslint .`) не пропускає `console.log`.
- Існує виділений інтерфейс `IHabitRepository` без прив'язки до реалізації БД.
- Smoke-тест автоматично перевіряє точку входу та версіонування.

## 5. Аудит реальних залежностей

1. **Вибір Vitest замість node:test**: Обрано Vitest через зручніший тестовий ранер і нативну підтримку TypeScript без додаткових компіляторів.
2. **Видалення зайвих devDependencies**: Очищено невикористовувані пакети `pino-pretty` та `tsx` для зменшення сукупного розміру вузла node_modules.
3. **Логування Pino**: Використано нативний Pino замість важких обгорток Winston для максимальної швидкості виводу у stdout.
