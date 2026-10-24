import { AsyncLocalStorage } from 'node:async_hooks';

export interface RequestContext {
  processId: string;
}

export const requestContextStorage = new AsyncLocalStorage<RequestContext>();

export function getProcessId(): string {
  const store = requestContextStorage.getStore();
  return store?.processId ?? 'system-internal';
}
