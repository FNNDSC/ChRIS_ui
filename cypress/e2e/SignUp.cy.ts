describe('Testing SignUp Page', () => {
  it('Visits the ChRIS homepage', () => {
    cy.visit('http://localhost:3000/signup')

  })

  it('Creates the username', () => {
    cy.get('input#chris-username').type('Test')

  })

  it('Creates the username', () => {
    cy.get('input#chris-email').type('Test@gmail.com')

  })

  it('Creates the password', () => {
    cy.get('input#chris-password').type('Test@test')

  })

  it('logs into the page', () => {
    cy.get('.pf-c-button.pf-m-secondary').click()
  })

  it('Types in the username', () => {
    cy.get('input#pf-login-username-id').type('Test')

  })

it('Types in the password', () => {
    cy.get('input#pf-login-password-id').type('Test@test')

  })

it('logs into the page', () => {
    cy.get('button').click()
  })

})