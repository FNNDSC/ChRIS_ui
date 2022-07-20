describe('Sign In user', () => {
  it('logs in as chris user', () => {
    cy.visit('http://localhost:3000/login')
    cy.get("input#pf-login-username-id").type("chris")
    cy.get("input#pf-login-password-id").type("chris1234")
    cy.get("button.pf-c-button.pf-m-primary.pf-m-block").should('have.text', 'Log In')
    .click()
    cy.url().should('include', '/')
  })
})

describe('Testing CreateAnalysis', () => {
    it('Visits the Feeds Page', () => {
      cy.visit('http://localhost:3000/feeds')
        .wait(5000)
  
    })

    it('01 Clicks on Create New Analysis', () => {
        cy.get('.create-feed-button')
          .should('have.text', "Create New Analysis")
          .click()
    })

    it('02 Types in the Feed Name', () => {
        cy.get('input#feed-name').type('Testing Study')
    
      })

    it('03 Types in the Feed Description', () => {
        cy.get('textarea#feed-description').type('This is for testing purposes')
          .wait(2000)
      })
    
    it('04 Goes to FeedType selection', () => {
        cy.get('button.pf-c-button.pf-m-primary')
          .eq(1)
          .should('have.text', "Next")
          .click()
      })

    it('05 Selects the feedtype', () => {
        cy.get('label.pf-c-radio__label')
        .eq(0)
        .should('have.text', "Generate files from running an FS plugin from this ChRIS server")
        .click()
    
      })

    it('06 Goes to Feed Creation', () => {
        cy.get('button.pf-c-button.pf-m-primary')
        .eq(1)
        .click()

      })

    it('07 Selects the Feed Synthesis plugin', () => {
        cy.get('.pf-c-data-list__check>input')
        .eq(1)
        .should('have.attr','name', 'pl-mri10yr06mo01da_normal v.1.1.4')
        .click()
        .wait(2000)
      })

   it('08 Goes to Parameter Configuration', () => {
        cy.get('button.pf-c-button.pf-m-primary')
        .eq(1)
        .should('have.text', "Next")
        .click()
      })


   it('09 Goes to Registered Pipelines', () => {
        cy.get('button.pf-c-button.pf-m-primary')
        .eq(2)
        .click()
        .should('have.text', "Review")
        .wait(2000)
        
     })

    
    it('11 Goes to Review', () => {
        cy.get('button.pf-c-button.pf-m-primary')
        .eq(2)
        .click()
        .wait(2000)
    })

    it('12 Creates a Feed', () => {
        cy.get('button.pf-c-button.pf-m-primary')
        .eq(1)
        .should('have.text', "Create Feed")
        .click()
    })

    it('13 confirms the configuration is complete', () => {
      cy.wait(2000)
      cy.get('span.pf-c-progress__measure').should('have.text', '100%')
    
    })

    it('14 Closes the Wizard', () => {
        cy.get('button.pf-c-button.pf-m-primary')
        .eq(1)
        .should('have.text', 'Close')

        .click()
    })

    it('15 Clicks on the newly created analysis', () => {
      cy.get('span.feed-list__name')
      .eq(0)
      .click()
      cy.wait(50000)
    })


})