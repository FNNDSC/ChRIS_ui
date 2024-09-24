import Client, { DownloadToken } from "@fnndsc/chrisapi";
import useWebSocket, { Options, ReadyState } from "react-use-websocket";
import { LonkHandlers, SeriesKey } from "./types.ts";
import React from "react";
import LonkSubscriber from "./LonkSubscriber.ts";

/**
 * A subset of the options which are passed through to {@link useWebSocket}.
 */
type AllowedOptions = Pick<
  Options,
  | "onOpen"
  | "onClose"
  | "onReconnectStop"
  | "shouldReconnect"
  | "reconnectInterval"
  | "reconnectAttempts"
  | "retryOnError"
>;

type UseLonkParams = LonkHandlers &
  AllowedOptions & {
    client: Client;
    onWebsocketError?: Options["onError"];
  };

type UseLonkHook = ReturnType<typeof useWebSocket> & {
  /**
   * Subscribe to a DICOM series for receive progress notifications.
   */
  subscribe: (
    pacs_name: string,
    SeriesInstanceUID: string,
  ) => Promise<SeriesKey>;
  /**
   * Unsubscribe from all notifications.
   */
  unsubscribeAll: () => Promise<undefined>;
};

/**
 * Implementation of LONK-WS consumer as a React.js hook, based on
 * {@link useWebSocket}.
 *
 * https://chrisproject.org/docs/oxidicom/lonk-ws
 */
function useLonk({
  client,
  onDone,
  onProgress,
  onError,
  onMessageError,
  onWebsocketError,
  ...options
}: UseLonkParams): UseLonkHook {
  const getLonkUrl = React.useCallback(async () => {
    const downloadToken = await client.createDownloadToken();
    return getWebsocketUrl(downloadToken);
  }, [client, getWebsocketUrl]);
  const handlers = { onDone, onProgress, onError, onMessageError };
  const [subscriber, _setSubscriber] = React.useState(
    new LonkSubscriber(handlers),
  );
  const onMessage = React.useCallback(
    (event: MessageEvent<any>) => {
      subscriber.handle(event.data);
    },
    [onProgress, onDone, onError],
  );
  const hook = useWebSocket(getLonkUrl, {
    ...options,
    onError: onWebsocketError,
    onMessage,
  });

  const subscribe = React.useCallback(
    (pacs_name: string, SeriesInstanceUID: string) =>
      subscriber.subscribe(pacs_name, SeriesInstanceUID, hook),
    [subscriber, hook],
  );

  const unsubscribeAll = React.useCallback(
    () => subscriber.unsubscribeAll(hook),
    [subscriber, hook],
  );

  return {
    ...hook,
    subscribe,
    unsubscribeAll,
  };
}

function getWebsocketUrl(downloadTokenResponse: DownloadToken): string {
  const token = downloadTokenResponse.data.token;
  return downloadTokenResponse.url
    .replace(/^http(s?):\/\//, (_match, s) => `ws${s}://`)
    .replace(/v1\/downloadtokens\/\d+\//, `v1/pacs/ws/?token=${token}`);
}

export type { UseLonkParams };
export { getWebsocketUrl };
export default useLonk;
