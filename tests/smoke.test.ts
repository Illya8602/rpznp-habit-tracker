import { describe, it, expect } from 'vitest';
import { getAppInfo } from '../src/index.js';

describe('Application Smoke Test', () => {
  it('should initialize and return valid app info', () => {
    const info = getAppInfo();
    expect(info.status).toBe('ok');
    expect(info.version).toBe('0.1.0');
    expect(info.commit).toBeDefined();
  });
});
