///<reference types="cypress" />

import users from "./sharedpackages.js";

describe("Testing Login Page", () => {
  it("Visits the ChRIS homepage", () => {
    cy.visit("http://localhost:3000/signup");
  });

  it("Creates the username", () => {
    cy.get("input#chris-username").type(`${users.username}`);
  });

  it("Creates the email", () => {
    cy.get("input#chris-email").type(`${users.email}`);
  });

  it("Creates the password", () => {
    cy.get("input#chris-password").type(`${users.password}`);
  });

  it("logs into the page and confirms user has been created", () => {
    cy.intercept("POST", "http://localhost:8000/api/v1/auth-token/")
      .as("signup")
      .get(".pf-c-button.pf-m-primary")
      .click()
      .wait(2000)
      .wait("@signup")
      .its("response.statusCode")
      .should("eq", 200);
    cy.url().should("include", "/");
  });
});

describe("Signs out user and logs in as Chris user", () => {
  it("logs out the user", () => {
    cy.get("button#pf-dropdown-toggle-id-0").click();
    cy.get("a.pf-c-dropdown__menu-item")
      .should("have.text", "Sign out")
      .click();
    cy.url().should("include", "/login");
  });

  it("logs in as chris user", () => {
    cy.get("input#pf-login-username-id").type(`${users.username}`);
    cy.get("input#pf-login-password-id").type(`${users.password}`);
    cy.get("button.pf-c-button.pf-m-primary.pf-m-block")
      .should("have.text", "Log In")
      .click();
    cy.url().should("include", "/");
  });
});
