import Client from "@fnndsc/chrisapi";
import { Cookies } from "react-cookie";

/**
 * This is a singleton to hold an instantiated, authenticated Client object,
 * in order to prevent  every component that needs the client from having to be
 * passed the token, declare process.env variables, etc.
 */

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
class ChrisAPIClient {
  private static client: Client | null = null;
  private static lastCreatedWith: string | null = null; // Track what token was used

  /**
   * Get the ChRIS API client singleton instance
   * Optimized to avoid unnecessary recreation
   */
  static getClient(): Client {
    const cookie = new Cookies();
    const user = cookie.get("username");
    const token: string = cookie.get(`${user}_token`);

    // Return existing client if it exists and was created with the same token
    if (
      ChrisAPIClient.client &&
      ((token && token === ChrisAPIClient.lastCreatedWith) ||
        (!token && !ChrisAPIClient.lastCreatedWith))
    ) {
      return ChrisAPIClient.client;
    }

    // Create new client with current token
    ChrisAPIClient.client = new Client(import.meta.env.VITE_CHRIS_UI_URL, {
      token,
    });

    // Remember what token was used to create this client
    ChrisAPIClient.lastCreatedWith = token;

    return ChrisAPIClient.client;
  }

  /**
   * Reset the client instance (useful for testing or logout)
   */
  static resetClient(): void {
    ChrisAPIClient.client = null;
    ChrisAPIClient.lastCreatedWith = null;
  }
}

export default ChrisAPIClient;
