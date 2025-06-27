/**
 * @file useStoreAuthentication.ts
 * @author ChRIS UI Team
 * @description Custom hook for managing authentication in the Store component
 */

import { useState, useCallback } from "react";
import { useCookies } from "react-cookie";
import { useAppSelector } from "../../../store/hooks";
import ChrisAPIClient from "../../../api/chrisapiclient";
import type { Plugin } from "@fnndsc/chrisapi";
import type { StorePlugin } from "./useFetchPlugins";
import type { ComputeResource } from "@fnndsc/chrisapi";

// Constants
const COOKIE_NAME = "storeCreds";
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // seconds (30 days)

/**
 * @interface PendingOperation
 * @description Configuration for a pending plugin operation requiring authentication
 */
export interface PendingOperation {
  /** Plugin to be installed or modified */
  plugin: StorePlugin | Plugin;
  /** Compute resources to associate with the plugin */
  resources: ComputeResource[];
  /** Whether this is a modification operation (true) or installation (false) */
  isModify: boolean;
}

/**
 * @interface AuthenticationState
 * @description State returned by the useStoreAuthentication hook
 */
interface AuthenticationState {
  /** Whether the authentication modal is open */
  modalOpen: boolean;
  /** Error message from authentication attempts */
  modalError: string | undefined;
  /** Pending operation that requires authentication */
  pending: PendingOperation | null;
  /** Function to get authentication header or prompt for credentials */
  getAuthHeaderOrPrompt: (
    plugin: StorePlugin | Plugin,
    resources: ComputeResource[],
    isModify: boolean,
  ) => string | null;
  /** Function to handle modal confirmation with username/password */
  handleModalConfirm: (username: string, password: string) => Promise<void>;
  /** Function to reset stored credentials */
  resetCredentials: () => void;
  /** Function to close the authentication modal */
  closeModal: () => void;
}

/**
 * Custom hook for managing authentication in the Store component
 *
 * @param {Function} onPluginOperation - Callback executed after successful authentication
 * @returns {AuthenticationState} Authentication state and functions
 */
export const useStoreAuthentication = (
  onPluginOperation: (
    plugin: StorePlugin | Plugin,
    resources: ComputeResource[],
    isModify: boolean,
    authHeader: string,
  ) => Promise<void>,
): AuthenticationState => {
  // Get user authentication state from Redux
  const { isStaff } = useAppSelector((state) => state.user);

  // Cookie management for storing credentials
  const [cookies, setCookie, removeCookie] = useCookies([COOKIE_NAME]);

  // Local state for authentication modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalError, setModalError] = useState<string | undefined>();
  const [pending, setPending] = useState<PendingOperation | null>(null);

  /**
   * Gets authentication header or prompts for credentials if needed
   *
   * This function attempts to retrieve authentication in this order:
   * 1. For staff users, use the ChRIS API token
   * 2. For non-staff users, check for stored cookie credentials
   * 3. If no credentials are available, trigger the authentication modal
   *
   * @param {StorePlugin|Plugin} plugin - The plugin requiring authentication
   * @param {ComputeResource[]} resources - Compute resources to associate with the plugin
   * @param {boolean} isModify - Whether this is a modification operation
   * @returns {string|null} Auth header string or null if prompting for credentials
   */
  const getAuthHeaderOrPrompt = useCallback(
    (
      plugin: StorePlugin | Plugin,
      resources: ComputeResource[],
      isModify: boolean,
    ): string | null => {
      if (isStaff) {
        const token = ChrisAPIClient.getClient().auth.token;
        return `Token ${token}`;
      }
      const cookie = cookies[COOKIE_NAME];
      if (cookie) {
        return `Basic ${cookie}`;
      }
      setPending({ plugin, resources, isModify });
      setModalError(undefined);
      setModalOpen(true);
      return null;
    },
    [cookies, isStaff],
  );

  /**
   * Handle authentication modal confirmation with username/password
   *
   * This function:
   * 1. Creates a Basic Authentication token from username and password
   * 2. Stores credentials in a cookie for future requests
   * 3. Processes the pending plugin operation via the callback
   * 4. Handles errors by displaying appropriate error messages
   * 5. Resets modal state after completion
   *
   * @param {string} username - Store admin username
   * @param {string} password - Store admin password
   * @returns {Promise<void>}
   */
  const handleModalConfirm = useCallback(
    async (username: string, password: string) => {
      if (!pending) return;
      const creds = btoa(`${username}:${password}`);
      const hdr = `Basic ${creds}`;
      setModalError(undefined);

      try {
        await onPluginOperation(
          pending.plugin,
          pending.resources,
          pending.isModify,
          hdr,
        );

        // Store credentials in cookie for future use
        setCookie(COOKIE_NAME, creds, {
          path: "/",
          maxAge: COOKIE_MAX_AGE,
        });

        // Reset modal state
        setPending(null);
        setModalOpen(false);
      } catch (err: any) {
        console.error(err);
        setModalError(err?.message || "Failed to authenticate.");
      }
    },
    [pending, onPluginOperation, setCookie],
  );

  /**
   * Reset stored authentication credentials
   *
   * Removes the authentication cookie and resets any error state
   * in the modal dialog.
   */
  const resetCredentials = useCallback(() => {
    removeCookie(COOKIE_NAME, { path: "/" });
    setModalError(undefined);
    setPending(null);
  }, [removeCookie]);

  /**
   * Close the authentication modal
   */
  const closeModal = useCallback(() => {
    setModalOpen(false);
    setPending(null);
  }, []);

  return {
    modalOpen,
    modalError,
    pending,
    getAuthHeaderOrPrompt,
    handleModalConfirm,
    resetCredentials,
    closeModal,
  };
};
