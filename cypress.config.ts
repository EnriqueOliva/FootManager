import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: 'http://localhost:3000', // Set your base URL
    env: {
      apiUrl: 'http://localhost:3000' // Define your API URL
    },
    supportFile: false, // Disable default support file
    specPattern: 'cypress/e2e/**/*.spec.ts', // Specify the pattern for spec files
  },
});
