import pino from 'pino';
import { getProcessId } from './context.js';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  mixin() {
    return { processId: getProcessId() };
  },
});
