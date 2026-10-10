import { logger } from './shared/logger.js';

export const APP_VERSION = '0.1.0';
export const GIT_SHA = process.env['GIT_SHA'] ?? 'dev-local';

export function getAppInfo() {
  return {
    version: APP_VERSION,
    commit: GIT_SHA,
    status: 'ok',
  };
}

logger.info({ info: getAppInfo() }, 'Application initialized');
