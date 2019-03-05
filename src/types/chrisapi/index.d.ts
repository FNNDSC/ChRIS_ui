declare module "@fnndsc/chrisapi";
// declare module "@fnndsc/chrisapi" {
//   /**
//    * Constructor
//    *
//    * @param {string} url - url of the ChRIS service
//    * @param {Object} auth - authentication object
//    * @param {string} auth.token - authentication token
//    */
//   export class Client {
//     constructor(url: string, auth: IAuth);
//     /**
//    * Fetch a list of currently authenticated user's feeds from the REST API.
//    *
//    * @param {Object} [params=null] - page parameters
//    * @param {number} [params.limit] - page limit
//    * @param {number} [params.offset] - page offset
//    * @param {number} [timeout=30000] - request timeout
//    * @return {Object} - JS Promise, resolves to a ``FeedList`` object
//    */
//     getFeeds: (params: IParams, timeout?: number) => void;
//       /**
//    * Create a new user account.
//    *
//    * @param {string} usersUrl - url of the user accounts service
//    * @param {string} username - username
//    * @param {string} password - password
//    * @param {string} email - user email
//    * @param {number} [timeout=30000] - request timeout
//    * @return {Object} - JS Promise, resolves to a ``User`` object
//    */
//     createUser: ( usersUrl: string, username: string, password: string, email: string, timeout?: number) => void; // Promise<IUser>
//   }

//   export class User {
//     constructor(url: string, auth: IAuth);
//     /**
//    * Make a PUT request to modify this user item resource through the REST API.
//    *
//    * @param {Object} data - request JSON data object
//    * @param {string} data.password - user password
//    * @param {string} data.email - user email
//    * @param {number} [timeout=30000] - request timeout
//    * @return {Object} - JS Promise, resolves to ``this`` object
//    */
//     put: (data: IUserParams, timeout?: number) => void; // Promise<Item>
//   }

//   // Interfaces
//   export interface IAuth { token: string; }
//   export interface IParams { limit: number; offset: number; }
//   export interface IUserParams {password: string; email: string; }
// }
