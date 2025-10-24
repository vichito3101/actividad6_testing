const creds = { email: "santo@gmail.com", password: "12345" };

// Login sin UI
function programmaticLogin() {
  cy.request("POST", "/api/v1/seguridad/login", creds).then(({ body }) => {
    window.localStorage.setItem("token", body.token);
    if (body.refreshToken) window.localStorage.setItem("refreshToken", body.refreshToken);
  });
}

describe("Catálogo – chips y cards", () => {
  before(() => {
    cy.visit("/login.html");
    programmaticLogin();
  });

  beforeEach(() => {
    cy.visit("/productos.html");
    cy.get("#catChips", { timeout: 10000 }).should("be.visible");
    // traemos TODO del backend 1 vez por test; no dependemos de intercepts
    cy.request("GET", "/api/v1/productos").as("all");
  });

  it("muestra 'Todos los productos' y cards", () => {
    cy.contains("#catChips .chip", "Todos los productos").should("have.class", "active");
    cy.get("@all").then(({ body }) => {
      cy.get("#gridProducts .card", { timeout: 10000 }).should("have.length", body.length);
    });
  });

  it("aplica y valida cada categoría desde los chips", () => {
    // tomamos chips (menos el de 'Todos')
    cy.get("#catChips .chip").then(($chips) => {
      const chips = [...$chips].filter((el) => !el.textContent.includes("Todos los productos"));

      cy.wrap(chips).each((chipEl) => {
        cy.wrap(chipEl).invoke("text").then((raw) => {
          const label = (raw || "").replace(/\(\s*\d+\s*\)\s*$/, "").trim();

          // esperamos el conteo esperado según el backend completo
          cy.get("@all").then(({ body: all }) => {
            const esperado = all.filter(
              (p) => (p.categoria || "").toLowerCase() === label.toLowerCase()
            ).length;

            // click chip y validamos cards renderizadas
            cy.wrap(chipEl).click();
            cy.get("#gridProducts .card", { timeout: 10000 }).should("have.length", esperado);
            cy.wrap(chipEl).should("have.class", "active");
          });
        });
      });
    });
  });

  it("busca por texto y filtra en cliente", () => {
    cy.get("#searchBox").clear().type("Arroz");
    cy.get("#gridProducts .card").should("have.length.at.least", 1);
  });

  it("permite cerrar sesión", () => {
    cy.get("#btnLogout").click();
    cy.url({ timeout: 10000 }).should("include", "/login.html");
  });
});
