# AI Prompt Log — Task 2: Working Application Prototype & Database Integration

## Phase 1: Prototype & Context Specification

- **Prompt:** "Згенеруй специфікацію та реалізацію прототипу Habit Tracker API з 4 HTTP ендпоінтами (POST /habits, GET /habits, POST /habits/:id/logs, GET /habits/:id/analytics). Налаштуй AsyncLocalStorage для автоматичного прокидання businessProcessId у Pino логер та глобальний Fastify error handler."
- **Feedback & Revisions:** Перевірено відсутність try/catch у контролерах та строге розділення шарів (HTTP -> Domain Service -> Repository).
