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

// next/jest replaces `transformIgnorePatterns` with its own default (which
// ignores all of node_modules). `next-intl` (and its `use-intl` core) ship ESM,
// so we resolve next/jest's config first, then re-allow those two packages to be
// transformed by SWC.
export default async (): Promise<Config> => {
  const resolved = await createJestConfig(config)();
  return {
    ...resolved,
    transformIgnorePatterns: [
      "/node_modules/(?!(?:next-intl|use-intl|@formatjs|intl-messageformat)/)",
      "^.+\\.module\\.(css|sass|scss)$",
    ],
  };
};
