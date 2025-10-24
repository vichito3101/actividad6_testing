// cypress/support/e2e.js
// ignora errores no controlados de la app para que no rompan las pruebas
Cypress.on('uncaught:exception', () => false);
