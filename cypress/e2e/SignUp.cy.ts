describe('Testing Login Page', () => {
    it('Visits the ChRIS homepage', () => {
      cy.visit('http://localhost:3000/signup')
  
    })

     it('Creates the username', () => {
    cy.get('input#chris-username').type('Test')

  })

  it('Creates the email', () => {
    cy.get('input#chris-email').type('Test@gmail.com')

  })

  it('Creates the password', () => {
    cy.get('input#chris-password').type('Test@test')

  })

  it('logs into the page and confirms user has been created', () => {

    cy.intercept('POST', 'http://localhost:8000/api/v1/auth-token/').as('signup')

    cy.get('.pf-c-button.pf-m-primary').click()

    cy.wait('@signup').should('have.property', 'Status Code')

  })
})  
  
 