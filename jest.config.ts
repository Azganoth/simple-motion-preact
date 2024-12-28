import type { Config } from "jest";

export default {
  preset: "jest-preset-preact",
  setupFilesAfterEnv: ["<rootDir>/setupTests.ts"],
} satisfies Config;
