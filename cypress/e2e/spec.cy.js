///<reference types="cypress" />
import 'cypress-each'

const faker = require('faker');

const users = Cypress._.range(0,1).map((_,k) => {
    faker.seed(404)

    return {
        name: faker.name.findName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        id: k,
    }
})
console.table(users)

it.each(users)(
    (user, k) => `${user.email}`,
    (user) => {}
)
