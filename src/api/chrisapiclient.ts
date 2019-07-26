import Client from '@fnndsc/chrisapi';

declare var process: {
  env: {
    REACT_APP_CHRIS_UI_URL: string,
  }
};

const AUTH_TOKEN_KEY = 'AUTH_TOKEN';

class ChrisAPIClient {

  private static client: Client;

  static getClient() {
    if (!this.client) {
      const token: string = window.sessionStorage.getItem(AUTH_TOKEN_KEY) || '';
      this.client = new Client(process.env.REACT_APP_CHRIS_UI_URL, {
        token
      });
    }
    return this.client;
  }

}

export default ChrisAPIClient;