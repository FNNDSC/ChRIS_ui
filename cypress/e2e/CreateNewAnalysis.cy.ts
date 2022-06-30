
describe('Testing SignUp Page', () => {
    it('Visits the Feeds Page', () => {
      cy.visit('http://localhost:3000/feeds')
  
    })

    it('Clicks on Create New Analysis', () => {
        cy.get('.create-feed-button')
        .click()
    })

    it('Types in the Feed Name', () => {
        cy.get('input#feed-name').type('MRI Study')
    
      })

    it('Types in the Feed Description', () => {
        cy.get('textarea#feed-description').type('This is for testing purposes')
    
      })
    
    it('Goes to FeedType selection', () => {
        cy.get('button.pf-c-button.pf-m-primary')
        .eq(1)
        .click()
      })

    it('Selects the feedtype', () => {
        cy.get('label.pf-c-radio__label')
        .eq(0)
        .click()
    
      })

    it('Goes to Feed Creation', () => {
        cy.get('button.pf-c-button.pf-m-primary')
        .eq(1)
        .click()
      })

    it('Selects the Feed Synthesis plugin', () => {
        cy.get('.pf-c-data-list__check>input')
        .eq(1)
        .click()
      })

   it('Goes to Parameter Configuration', () => {
        cy.get('button.pf-c-button.pf-m-primary')
        .eq(1)
        .click()
      })


   it('Goes to Pipelines', () => {
        cy.get('button.pf-c-button.pf-m-primary')
        .eq(2)
        .click()
     })

    it('Selects Registered Pipeline', () => {
        cy.get('.pf-c-button.pf-m-secondary')
        .eq(0)
        .click()
     }) 
    
    it('Goes to Review', () => {
        cy.get('button.pf-c-button.pf-m-primary')
        .eq(2)
        .click()
    })

    it('Creates a Feed', () => {
        cy.get('button.pf-c-button.pf-m-primary')
        .eq(1)
        .click()
    })

    it('Closes the Wizard', () => {
        cy.get('button.pf-c-button.pf-m-primary')
        .eq(1)
        .click()
    })


})