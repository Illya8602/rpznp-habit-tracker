# DEFENSE — Завдання 1: Фундамент і структура застосунку

## Що я реалізував

Підготував базову структуру проєкту Habit Tracker API, заклав інженерні стандарти та налаштував трирівневу архітектуру (HTTP controller, domain service, repository interface). Налаштував автоматичний контроль якості через Husky, lint-staged і commitlint.

## Аудит розбіжностей та їх виправлення за Git-історією

- **Очищення dev-залежностей та додавання build у pipeline (SHA: 8795588)**: Видалив невикористовувані пакети pino-pretty та tsx, включив tests/ у tsconfig.json і додав крок npm run build у pre-commit та Makefile.
- **Формування каркаса шарів архітектури (SHA: 3ba068f)**: Додав файли src/domain/habit.repository.ts, src/domain/habit.service.ts та src/http/habit.controller.ts із DTO та інтерфейсом IHabitRepository.
- **AI collaboration log (SHA: 8f233fa)**: Додав папку ai/prompts.md з описом ітерацій роботи з AI.
- **Синхронізація специфікації та ADR**: Оновив spec.md (додав критерії прийняття, обгортання ASCII-схеми в блок коду, аудит реальних залежностей), оновив adr/0001 та додав adr/0002 щодо вибору Vitest.

## Ключові рішення (ADR)

- **ADR-0001**: Вибір Fastify замість Express через швидшу валідацію схем і модульність.
- **ADR-0002**: Вибір Vitest для швидкого прогону smoke-тестів у TS-середовищі.

## Відтворювана перевірка

Команда: `make check` -> результат: `All engineering checks passed successfully.`
Команда: `make run` -> вивід: `{"level":30,...,"info":{"version":"0.1.0","commit":"dev-local","status":"ok"},"msg":"Application initialized"}`

## Здача

(а) GitHub PR: https://github.com/Illya8602/rpznp-habit-tracker/pull/1
(б) Заповнений DEFENSE вище.
