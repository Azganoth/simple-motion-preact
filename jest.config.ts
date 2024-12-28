import type { Config } from "jest";

export default {
  preset: "jest-preset-preact",
  setupFilesAfterEnv: ["<rootDir>/setupTests.ts"],
  coveragePathIgnorePatterns: ["/node_modules/", "\\.stories\\.[jt]sx?$"],
} satisfies Config;
