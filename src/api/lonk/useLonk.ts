import Client, { DownloadToken } from "@fnndsc/chrisapi";
import useWebSocket, { Options } from "react-use-websocket";
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
  }, [client.createDownloadToken]);
  const handlers = { onDone, onProgress, onError, onMessageError };
  const [subscriber, setSubscriber] = React.useState(
    new LonkSubscriber(handlers),
  );
  const onMessage = React.useCallback(
    (event: MessageEvent<any>) => {
      subscriber.handle(event.data);
    },
    [subscriber.handle],
  );
  const onOpen = React.useCallback(
    (event: WebSocketEventMap["open"]) => {
      // when the websocket connection (re-)opens, (re-)initialize the
      // LonkSubscriber instance so that React.useEffect which specify
      // the subscriber in their depdencency arrays get (re-)triggered.
      setSubscriber(new LonkSubscriber(handlers));
      options.onOpen?.(event);
    },
    [options.onOpen],
  );
  const hook = useWebSocket(getLonkUrl, {
    ...options,
    onOpen,
    onError: onWebsocketError,
    onMessage,
  });

  const subscribe = React.useCallback(
    (pacs_name: string, SeriesInstanceUID: string) =>
      subscriber.subscribe(pacs_name, SeriesInstanceUID, hook),
    // N.B.: hook must not be in the dependency array, because it changes
    // each time the websocket sends/receives data.
    [subscriber.subscribe],
  );

  const unsubscribeAll = React.useCallback(
    () => subscriber.unsubscribeAll(hook),
    [subscriber.unsubscribeAll],
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
