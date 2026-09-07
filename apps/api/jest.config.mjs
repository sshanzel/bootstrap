import { swcTransform } from '../../jest.base.mjs';

export default {
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.spec.ts'],
  testPathIgnorePatterns: ['\\.integration\\.spec\\.ts$'],
  moduleFileExtensions: ['ts', 'js'],
  moduleNameMapper: {
    '^@bootstrap/shared$': '<rootDir>/../../packages/shared/src/index.ts',
  },
  transform: swcTransform,
};
