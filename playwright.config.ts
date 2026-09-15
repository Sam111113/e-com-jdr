import { defineConfig, devices } from "@playwright/test";

// Port et Chromium : voir AGENTS.md section 8 et docs/PLAN.md
// (« Développement et tests »). Le port par défaut correspond à celui
// réservé à la session de travail sur T1.3 ; changez `PORT` si besoin.
const port = process.env.PORT ?? "3100";
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          executablePath: process.env.CHROMIUM_PATH,
        },
      },
    },
  ],
});
