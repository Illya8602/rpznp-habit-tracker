# Регламент перевірки коду

Порядок локальної верифікації:

1. `npm run format:check` — аудит форматування.
2. `npm run lint` — перевірка статичних помилок.
3. `npm run typecheck` — повна перевірка типів.
4. `npm run test:smoke` — виконання smoke-тестів.
5. `npm run build` — валідація збірки в dist/.
