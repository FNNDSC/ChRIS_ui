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
    cy.get(".create-feed-button")
      .should("have.text", "Create New Analysis")
      .click();
  });

  it("02 Types in the Feed Name", () => {
    cy.get("input#feed-name").type(`${users.testname}`);
  });

  it("03 Types in the Feed Description", () => {
    cy.get("textarea#feed-description")
      .type("This is for testing purposes")
      .wait(2000);
  });

  it("04 Goes to FeedType selection", () => {
    cy.get("button.pf-c-button.pf-m-primary")
      .eq(1)
      .should("have.text", "Next")
      .click();
  });

  it("05 Selects the feedtype", () => {
    cy.get("label.pf-c-radio__label")
      .eq(0)
      .should(
        "have.text",
        "Generate files from running an FS plugin from this ChRIS server"
      )
      .click();
  });

  it("06 Goes to Feed Creation", () => {
    cy.get("button.pf-c-button.pf-m-primary")
      .eq(1)
      .should("have.text", "Next")
      .click();
  });

  it("07 Selects the Feed Synthesis plugin", () => {
    cy.get('[type="checkbox"]').first().check();
    cy.wait(2000);
  });

  it("08 Goes to Parameter Configuration", () => {
    cy.get("button.pf-c-button.pf-m-primary")
      .eq(1)
      .should("have.text", "Next")
      .click();
  });

  it("09 Goes to Registered Pipelines", () => {
    cy.get("button.pf-c-button.pf-m-primary")
      .eq(2)
      .click()
      .should("have.text", "Review")
      .wait(2000);
  });

  it("11 Goes to Review", () => {
    cy.get("button.pf-c-button.pf-m-primary").eq(2).click().wait(2000);
  });

  it("12 Creates a Feed", () => {
    cy.get("button.pf-c-button.pf-m-primary")
      .eq(1)
      .should("have.text", "Create Feed")
      .click();
  });

  it("13 confirms the configuration is complete", () => {
    cy.wait(2000);
    cy.get("span.pf-c-progress__measure").should("have.text", "100%");
  });

  it("14 Closes the Wizard", () => {
    cy.get("button.pf-c-button.pf-m-primary")
      .eq(1)
      .should("have.text", "Close")
      .click();
  });

  it("15 Asserts new analysis has been created", () => {
    cy.get("span.feed-list__name").contains("a", `${users.testname}`);
  });
});
