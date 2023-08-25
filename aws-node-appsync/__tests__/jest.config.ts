import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from '../tsconfig.json';
import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: process.cwd() }),
  globalSetup: `${process.cwd()}/__tests__/global.setup.ts`,
  reporters: [
    'default',
    [
      `${process.cwd()}/node_modules/jest-html-reporter`,
      {
        pageTitle: 'Test Report',
        outputPath: '__tests__/test-report.html',
      },
    ],
  ],
  globals: {},
  preset: 'ts-jest',
  setupFilesAfterEnv: [`${process.cwd()}/__tests__/jest.setup.ts`],
  testMatch: [`${process.cwd()}/__tests__/src/**/*.+(ts|tsx|js)`, `${process.cwd()}/**/?(*.)+(spec|test).+(ts|tsx|js)`],
  testPathIgnorePatterns: [],
  testRunner: 'jest-circus/runner',
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  watchPathIgnorePatterns: ['<rootDir>/.serverless/', '<rootDir>/dist/', '<rootDir>/node_modules/', '<rootDir>/src/'],
  rootDir: '../',
  collectCoverage: false, // 常にカバレッジを取得する場合はtrueにする
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/**/*.test.ts', '!src/**/*.spec.ts', '!src/types/**/*.ts'],
  coverageDirectory: '__tests__/coverage',
};

export default config;
