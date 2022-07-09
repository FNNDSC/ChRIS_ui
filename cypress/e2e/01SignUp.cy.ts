///<reference types="cypress" />

const faker = require('faker');

const users = {

        username: faker.name.findName(),
        email: faker.internet.email(),
        password: faker.internet.password()
}



describe('Testing Login Page', () => {
  
     it('Visits the ChRIS homepage', () => {
        cy.visit('http://localhost:3000/signup')
     })

     it('Creates the username', () => {
         cy.get('input#chris-username').type(`${users.username}`)
         

      })

      it('Creates the email', () => {
        cy.get('input#chris-email').type(`${users.email}`)

      })

      it('Creates the password', () => {
        cy.get('input#chris-password').type(`${users.password}`)

      })

      it('logs into the page and confirms user has been created', () => {

        cy.intercept('POST', 'http://localhost:8000/api/v1/auth-token/').as('signup')
          .get('.pf-c-button.pf-m-primary').click()
          .wait(5000).screenshot()
          .wait('@signup').its('response.statusCode').should('eq', 200)

      })
    })  
  
 