import type { Config } from "jest";
import nextJest from "next/jest.js";

// Load next.config and .env into the test environment.
const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  // Mirror the tsconfig `@/*` path alias so imports resolve in tests.
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverageFrom: [
    "src/lib/**/*.{ts,tsx}",
    "src/hooks/**/*.{ts,tsx}",
    "src/components/shared/**/*.{ts,tsx}",
  ],
};

// Exported this way so next/jest can load the (async) Next.js config.
export default createJestConfig(config);
