describe("Login → Catálogo (cards)", () => {
  it("loguea y llega al catálogo", () => {
    cy.visit("/login.html");

    cy.contains("Inicia Sesión", { timeout: 10000 }).should("be.visible");

    cy.get("#email").should("be.visible").type("santo@gmail.com");
    cy.get("#password").should("be.visible").type("12345");
    cy.contains("button", "Ingresar").should("be.enabled").click();

    cy.url({ timeout: 10000 }).should("include", "/productos");
    cy.get("#catChips", { timeout: 10000 }).should("be.visible");
    cy.get("#gridProducts .card", { timeout: 10000 }).should("have.length.at.least", 1);
  });
});
