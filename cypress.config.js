// cypress.config.js
// @ts-check
import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:4001",
    specPattern: "cypress/e2e/**/*.cy.js",
    supportFile: "cypress/support/e2e.js",
    chromeWebSecurity: false,
    viewportWidth: 1280,
    viewportHeight: 800,
    setupNodeEvents(on, config) {
      return config;
    },
  },
  reporter: "spec",
  retries: { runMode: 1, openMode: 0 },
  video: true,
});
