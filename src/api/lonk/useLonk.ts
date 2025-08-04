import { useCallback, useState } from "react";
import useWebSocket, { type Options } from "react-use-websocket";
import LonkSubscriber from "./LonkSubscriber.ts";
import type { LonkHandlers, SeriesKey } from "./types.ts";

/**
 * A subset of the options which are passed through to {@link useWebSocket}.
 */
type AllowedOptions = Options;

export type UseLonkParams = LonkHandlers &
  AllowedOptions & {
    url: string | null;
    onWebsocketError?: Options["onError"];
  };

type UseLonkHook = {
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
export default ({
  url,
  onDone,
  onProgress,
  onLonkError,
  onMessageError,
  onWebsocketError,
  ...options
}: UseLonkParams): UseLonkHook => {
  const handlers = { onDone, onProgress, onLonkError, onMessageError };
  const [subscriber, setSubscriber] = useState(
    () => new LonkSubscriber(handlers),
  );

  const onMessage = (event: MessageEvent<any>) => {
    subscriber.handle(event.data);
  };

  const onOpen = (event: WebSocketEventMap["open"]) => {
    // when the websocket connection (re-)opens, (re-)initialize the
    // LonkSubscriber instance so that React.useEffect which specify
    // the subscriber in their depdencency arrays get (re-)triggered.
    //
    // need to do subscriber to have the newly updated handlers (with pacsID).
    console.info("useLonk: onOpen: event:", event, "url:", url);
    setSubscriber(new LonkSubscriber(handlers));
    options.onOpen?.(event);
  };

  const theHook = useWebSocket(url, {
    ...options,
    onOpen,
    onError: onWebsocketError,
    onMessage,
  });

  const subscribe = useCallback(
    (pacs_name: string, SeriesInstanceUID: string) =>
      subscriber.subscribe(pacs_name, SeriesInstanceUID, theHook),
    [subscriber, theHook],
  );
  // N.B.: hook must not be in the dependency array, because it changes
  // each time the websocket sends/receives data.

  const unsubscribeAll = useCallback(
    () => subscriber.unsubscribeAll(theHook),
    [subscriber, theHook],
  );

  return {
    ...theHook,
    subscribe,
    unsubscribeAll,
  };
};
