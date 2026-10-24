# ADR 0003: Dependency Management and Context Propagation via AsyncLocalStorage

## Status

Accepted

## Context

Прокидання businessProcessId / traceId та залежностей через 10–15 параметрів функцій засмічує сигнатури та порушує чистоту коду. Потрібен механізм автоматичного прокидання контексту запиту в логер на будь-якому рівні системи.

## Decision

Використати вбудований модуль Node.js AsyncLocalStorage для зберігання контексту запиту (Trace ID / Business Process ID) та інжект логера.

## Considered Options

1. Явне прокидання параметрів (ctx у кожну функцію): Збільшує boilerplate та створює жорстку зв'язаність.
2. Dependency Injection Container (Awilix / Inversify): Занадто важкий рантайм для поточного scope.
3. AsyncLocalStorage (обрано): Вбудований стандартний механізм Node.js, zero runtime overhead, ідеально для трасування.

## Consequences

- Плюси: Логер автоматично підтягує processId у будь-якій глибокій функції без зміни її аргументів.
- Мінуси: Потрібно контролювати контекст при переході між непідтримуваними асинхронними межами.
