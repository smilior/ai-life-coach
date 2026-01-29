import { defineConfig } from "@playwright/test";

const baseURL = process.env.BASE_URL || "http://localhost:3002";
const isRemote = baseURL.startsWith("https://");

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "setup",
      testMatch: /global-setup\.ts/,
    },
    {
      name: "e2e",
      dependencies: ["setup"],
      use: {
        storageState: "./tests/e2e/.auth/user.json",
      },
    },
  ],
  ...(isRemote
    ? {}
    : {
        webServer: {
          command: "npm run dev",
          url: baseURL,
          reuseExistingServer: true,
          timeout: 30000,
        },
      }),
});
