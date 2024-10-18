import Client from "@fnndsc/chrisapi";
import { Cookies } from "react-cookie";

/**
 * This is a singleton to hold an instantiated, authenticated `Client` object,
 * in order to prevent  every component that needs the client from having to be
 * passed the token, declare process.env variables, etc.
 */

// biome-ignore lint/complexity/noStaticOnlyClass: Singleton pattern
class ChrisAPIClient {
  private static client: Client;
  private static isTokenAuthorized: boolean;

  static getClient(): Client {
    const cookie = new Cookies();
    if (!ChrisAPIClient.client || !ChrisAPIClient.isTokenAuthorized) {
      const user = cookie.get("username");
      const token: string = cookie.get(`${user}_token`);
      if (token) {
        ChrisAPIClient.isTokenAuthorized = true;
      } else {
        ChrisAPIClient.isTokenAuthorized = false;
      }
      ChrisAPIClient.client = new Client(import.meta.env.VITE_CHRIS_UI_URL, {
        token,
      });
    }
    return ChrisAPIClient.client;
  }

  static setIsTokenAuthorized(value: boolean) {
    ChrisAPIClient.isTokenAuthorized = value;
  }
}

export default ChrisAPIClient;
