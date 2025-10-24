// jest.config.js (ESM)
export default {
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  moduleFileExtensions: ["js", "mjs", "cjs"],
  collectCoverageFrom: [
    "**/*.js",
    "!**/node_modules/**",
    "!app.js" // no cuentes el bootstrap del server
  ],
  // evita que jest intente transformar ESM
  transform: {}
};
