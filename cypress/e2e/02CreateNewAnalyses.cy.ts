///<reference types="cypress" />
import users from "./sharedpackages.js";

describe("Sign In user", () => {});

describe("Testing CreateAnalysis", () => {
  it("Visits the ChRIS homepage", () => {
    cy.visit("http://localhost:3000/signup");
  });

  it("Creates the user", () => {
    cy.get("input#chris-username").type(`${users.username}`);

    cy.get("input#chris-email").type(`${users.email}`);

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
    cy.visit("http://localhost:3000/feeds");
  });

  it("01 Clicks on Create New Analysis", () => {
    cy.get(".create-analysis-button")
      .should("have.text", "Create New Analysis")
      .click();
  });

  it("02 Types in the Analysis Name", () => {
    cy.get("input#analysis-name").type(`${users.testname}`);
  });

  it("03 Types in the Analysis Description", () => {
    cy.get("textarea#analysis-description")
      .type("This is for testing purposes")
      .wait(2000);
  });

  it("04 Goes to Analysis Data selection", () => {
    cy.get("button.pf-c-button.pf-m-primary")
      .eq(1)
      .should("have.text", "Next")
      .click();
  });

  it("05 Selects the Analysis Data", () => {
    cy.get("div.pf-c-card__body")
      .eq(0)
      .should(
        "have.text",
        "Generate files from running an FS plugin from this ChRIS server"
      )
      .click();
  });

  it("06 Goes to Analysis Creation", () => {
    cy.get("button.pf-c-button.pf-m-primary")
      .eq(1)
      .should("have.text", "Next")
      .click();
  });

  it("07 Selects the Analysis Synthesis plugin", () => {
    cy.get("input#pl-dircopy").check();
    cy.get("button.pf-c-button.pf-m-primary")
      .eq(1)
      .should("have.text", "Next")
      .click();
    cy.wait(2000);
  });

  it("08 Goes to Parameter Configuration", () => {
    cy.get("input#dir").type(`${users.username}/uploads`);
    cy.get('[data-test-id="create-analysis"]').click();
  });

  it("09 Goes to Registered Pipelines", () => {
    cy.get('[data-test-id="create-analysis"]').click();
  });

  it("11 Goes to Review", () => {
    cy.get("button.pf-c-button.pf-m-primary").eq(1).click().wait(2000);
  });

  it("12 Asserts new analysis has been created", () => {
    cy.get("span.feed-list__name").contains("a", `${users.testname}`);
  });
});
