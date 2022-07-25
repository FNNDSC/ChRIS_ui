import { faker } from '@faker-js/faker';

const users = {

        username: faker.name.findName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        testname: faker.system.fileName()
}

export default users;