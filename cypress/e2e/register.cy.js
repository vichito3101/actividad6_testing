const uid = () => `${Date.now()}${Math.floor(Math.random() * 1000)}`;

describe("Registro de usuario (UI nueva)", () => {
  beforeEach(() => {
    // capturamos cualquier POST del API (ruta flexible)
    cy.intercept("POST", "**/api/v1/**").as("apiPost");
    cy.visit("/register.html");
    cy.contains("Registro de Usuario", { timeout: 10000 }).should("be.visible");
  });

  it("muestra los campos visibles principales", () => {
    cy.get("#nombre").should("be.visible");
    cy.get("#apellido").should("be.visible");
    cy.get("#email").should("be.visible");
    cy.get("#password").should("be.visible");
    // dirección puede existir u omitirse; solo verificamos presencia
    cy.get("body").then(($b) => {
      if ($b.find("#direccion").length) cy.get("#direccion").should("be.visible");
    });
  });

  it("bloquea registro con contraseña muy corta (cliente o servidor)", () => {
    const email = `ana${uid()}@test.com`;

    cy.get("#nombre").type("Ana");
    cy.get("#apellido").type("Pérez");
    cy.get("#email").type(email);
    cy.get("#password").type("123"); // < 6

    // llena dirección si está en el DOM
    cy.get("body").then(($b) => {
      if ($b.find("#direccion").length) {
        cy.get("#direccion").clear().type("Calle Falsa 123");
      }
    });

    cy.contains("button", "Registrarse").click();

    // dar un respiro y luego inspeccionar si hubo post o no
    cy.wait(800);
    cy.get("@apiPost.all").then((calls) => {
      if ((calls || []).length === 0) {
        // validación cliente: seguimos en /register
        cy.url().should("include", "/register");
      } else {
        // validación servidor: esperamos 4xx
        const last = calls[calls.length - 1];
        expect(last.response.statusCode).to.be.within(400, 499);
        cy.url().should("include", "/register");
      }
    });

    // si #msg existe, debería mostrarse algo
    cy.get("body").then(($b) => {
      if ($b.find("#msg").length) cy.get("#msg").should("be.visible");
    });
  });

it("registra un usuario nuevo y redirige a login", () => {
  const suf = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const email = `user${suf}@test.com`;

  cy.get("#nombre").clear().type("Carlos");
  cy.get("#apellido").clear().type("Lopez");
  cy.get("#email").clear().type(email);
  cy.get("#password").clear().type("abcd1234"); // >= 6

  // Si existe 'direccion' la completamos (por si tu backend la usa)
  cy.get("body").then(($b) => {
    if ($b.find("#direccion").length) {
      cy.get("#direccion").clear().type("Av. Siempre Viva 742");
    }
  });

  cy.intercept("POST", "**/api/v1/seguridad/create").as("crearUsuario");

  cy.contains("button", "Registrarse").click();

  cy.wait("@crearUsuario", { timeout: 10000 })
    .its("response.statusCode")
    .should("be.within", 200, 299);

  cy.url({ timeout: 10000 }).should("include", "/login.html");
});

});
