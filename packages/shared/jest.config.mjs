import { swcTransform } from '../../jest.base.mjs';

export default {
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.spec.ts'],
  moduleFileExtensions: ['ts', 'js'],
  transform: swcTransform,
};
