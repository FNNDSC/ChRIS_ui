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

    // Get token if username is available
    const token = user ? cookie.get(`${user}_token`) : null;

    // Case 1: No client exists yet, create a new one
    if (!ChrisAPIClient.client) {
      ChrisAPIClient.client = new Client(import.meta.env.VITE_CHRIS_UI_URL, {
        token: token || undefined,
      });
      ChrisAPIClient.lastCreatedWith = token;
      return ChrisAPIClient.client;
    }

    // Case 2: Client exists but no token is available (user logged out)
    if (!token) {
      // Reset client auth if it was previously authenticated
      if (ChrisAPIClient.lastCreatedWith) {
        ChrisAPIClient.client.auth = "";
        ChrisAPIClient.lastCreatedWith = null;
      }
      return ChrisAPIClient.client;
    }

    // Case 3: Client exists and token is different from last time
    if (token !== ChrisAPIClient.lastCreatedWith) {
      ChrisAPIClient.client.auth = token;
      ChrisAPIClient.lastCreatedWith = token;
    }

    return ChrisAPIClient.client;
  }

  /**
   * Explicitly set the client with a new token
   * Use this during login to ensure the client is properly configured
   * @param token The authentication token
   */
  static setClientWithToken(token: string): Client {
    // Always create a fresh client during explicit login
    ChrisAPIClient.client = new Client(import.meta.env.VITE_CHRIS_UI_URL, {
      token,
    });
    ChrisAPIClient.lastCreatedWith = token;
    return ChrisAPIClient.client;
  }

  /**
   * Reset the client instance (useful for testing or logout)
   */
  static resetClient(): void {
    // Instead of setting to null, create a new unauthenticated client
    ChrisAPIClient.client = new Client(import.meta.env.VITE_CHRIS_UI_URL);
    ChrisAPIClient.lastCreatedWith = null;
  }
}

export default ChrisAPIClient;
