import Client from "@fnndsc/chrisapi";

declare let process: {
  env: {
    REACT_APP_CHRIS_UI_URL: string;
  };
};

const AUTH_TOKEN_KEY = "CHRIS_TOKEN";

/**
 * This is a singleton to hold an instantiated, authenticated `Client` object,
 * in order to prevent  every component that needs the client from having to be
 * passed the token, declare process.env variables, etc.
 */

class ChrisAPIClient {

  private static client: Client;
  private static isTokenAuthorized: boolean;

  static getClient(): Client {
    if (!this.client || !this.isTokenAuthorized) {
      const token: string = window.sessionStorage.getItem(AUTH_TOKEN_KEY) || '';
      if (token) {
        this.isTokenAuthorized = true;
      } else {
        this.isTokenAuthorized = false;
      }
      this.client = new Client(process.env.REACT_APP_CHRIS_UI_URL, {
        token
      });
    }
    return this.client;
  }

  static setIsTokenAuthorized(value: boolean) {
    this.isTokenAuthorized = value;
  }

}
export default ChrisAPIClient;
