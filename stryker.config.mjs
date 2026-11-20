/** @type {import("@stryker-mutator/api").PartialStrykerOptions} */
export default {
  testRunner: 'vitest',
  vitest: {
    configFile: 'vitest.unit.config.ts',
  },
  mutate: ['src/domain/streak-calculator.ts'],
  reporters: ['clear-text', 'progress'],
  coverageAnalysis: 'perTest',
  cleanTempDir: true,
};
