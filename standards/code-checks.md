# Регламент перевірки коду

Порядок локальної верифікації:

1. `npm run format:check` — аудит форматування Prettier.
2. `npm run lint` — перевірка статичних помилок та заборона console.log.
3. `npm run typecheck` — перевірка типів у src/ та tests/.
4. `npm run build` — валідація збірки в dist/.
5. `npm run test:smoke` — виконання smoke-тестів.
