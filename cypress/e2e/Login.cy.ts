describe('Testing Login Page', () => {
  it('Visits the ChRIS homepage', () => {
    cy.visit('http://localhost:3000/login')

  })

  it('Types in the username', () => {
    cy.get('input#pf-login-username-id').type('Test')

  })

  it('Types in the password', () => {
      cy.get('input#pf-login-password-id').type('Test@test')

    })

  it('logs into the page and confirms user is logged in', () => {
      cy.intercept('POST', 'http://localhost:8000/api/v1/auth-token/').as('signup')
      cy.get('button').click()

      
      cy.wait('@signup').its('response.statusCode').should('eq', 200)
    })


})