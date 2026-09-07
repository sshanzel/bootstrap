import { swcTransform } from '../../jest.base.mjs';

export default {
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.integration.spec.ts'],
  moduleFileExtensions: ['ts', 'js'],
  moduleNameMapper: {
    '^@bootstrap/shared$': '<rootDir>/../../packages/shared/src/index.ts',
  },
  globalSetup: '<rootDir>/src/test/integration/db-global-setup.ts',
  globalTeardown: '<rootDir>/src/test/integration/db-global-teardown.ts',
  setupFilesAfterEnv: [
    '<rootDir>/src/test/integration/jest.integration.setup.ts',
  ],
  // Per-worker template-cloned databases make this suite safe to run in
  // parallel (CI on a dedicated runner can raise --maxWorkers). Locally the
  // default is serial: booting several full Nest apps against a Dockerized
  // Postgres oversubscribes the host.
  maxWorkers: 1,
  testTimeout: 30000,
  transform: swcTransform,
};
