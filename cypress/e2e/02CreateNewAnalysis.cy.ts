
describe('Testing CreateAnalysis', () => {
    it('Visits the Feeds Page', () => {
      cy.visit('http://localhost:3000/feeds')
        .wait(5000)
  
    })

    it('01 Clicks on Create New Analysis', () => {
        cy.get('.create-feed-button')
        .invoke('text')
        .should('match', "Create New Analysis")
        .click()
    })

    it('02 Types in the Feed Name', () => {
        cy.get('input#feed-name').type('Testing Study')
    
      })

    it('03 Types in the Feed Description', () => {
        cy.get('textarea#feed-description').type('This is for testing purposes')
          .wait(5000)
          .screenshot()

      })
    
    it('04 Goes to FeedType selection', () => {
        cy.get('button.pf-c-button.pf-m-primary')
        .eq(1)
        .click()
      })

    it('05 Selects the feedtype', () => {
        cy.get('label.pf-c-radio__label')
        .eq(0)
        .click()
    
      })

    it('06 Goes to Feed Creation', () => {
        cy.get('button.pf-c-button.pf-m-primary')
        .eq(1)
        .click()
        .screenshot()
      })

    it('07 Selects the Feed Synthesis plugin', () => {
        cy.get('.pf-c-data-list__check>input')
        .eq(1)
        .click()
        .wait(5000)
      })

   it('08 Goes to Parameter Configuration', () => {
        cy.get('button.pf-c-button.pf-m-primary')
        .eq(1)
        .click()
      })


   it('09 Goes to Registered Pipelines', () => {
        cy.get('button.pf-c-button.pf-m-primary')
        .eq(2)
        .click()
        .screenshot()
        .wait(5000)
        
     })

    
    it('11 Goes to Review', () => {
        cy.get('button.pf-c-button.pf-m-primary')
        .eq(2)
        .click()
        .wait(5000)
        .screenshot()
    })

    it('12 Creates a Feed', () => {
        cy.get('button.pf-c-button.pf-m-primary')
        .eq(1)
        .click()
    })

    it('13 confirms the configuration is complete', () => {
      cy.wait(5000)
      cy.get('span.pf-c-progress__measure').should('have.text', '100%')
      cy.screenshot()
    
    })

    it('14 Closes the Wizard', () => {
        cy.get('button.pf-c-button.pf-m-primary')
        .eq(1)
        .click()
    })

    it('15 Clicks on the newly created analysis', () => {
      cy.get('span.feed-list__name')
      .eq(0)
      .click()
      cy.wait(100000)
      cy.screenshot()
    })


})