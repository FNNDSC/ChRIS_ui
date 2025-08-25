import * as E from "fp-ts/Either";
import { identity, pipe } from "fp-ts/function";
import type useWebSocket from "react-use-websocket";
import deserialize from "./de.ts";
import SeriesMap from "./seriesMap.ts";
import type {
  Lonk,
  LonkDone,
  LonkError,
  LonkHandlers,
  LonkProgress,
  LonkSubscription,
  LonkUnsubscription,
  SeriesKey,
} from "./types.ts";

/**
 * `LonkSubscriber` wraps a {@link WebSocket}, routing incoming JSON messages
 * to corresponding functions of {@link LonkHandlers}.
 */
class LonkSubscriber {
  private readonly pendingSubscriptions: SeriesMap<null | (() => SeriesKey)>;
  private readonly pendingUnsubscriptions: (() => void)[];
  private readonly handlers: LonkHandlers;

  public constructor(handlers: LonkHandlers) {
    this.handlers = handlers;
    this.pendingSubscriptions = new SeriesMap();
    this.pendingUnsubscriptions = [];
  }

  /**
   * Handle an incoming message, calling
   */
  public handle(data: any) {
    pipe(
      data,
      deserialize,
      E.flatMap((data) => this.routeMessage(data)),
      E.match(
        (e) =>
          this.handlers.onMessageError && this.handlers.onMessageError(data, e),
        identity,
      ),
    );
  }

  private routeMessage(
    data: E.Either<LonkUnsubscription, Lonk<any>>,
  ): E.Either<string, null> {
    return pipe(
      data,
      E.match(
        () => this.handleUnsubscription(),
        (lonk) => this.routeLonk(lonk),
      ),
    );
  }

  private routeLonk(data: Lonk<any>): E.Either<string, null> {
    const { onProgress, onDone, onLonkError } = this.handlers;
    const { SeriesInstanceUID, pacs_name, message } = data;
    // note: for performance reasons, this if-else chain is in
    // descending order of case frequency.
    if (isProgress(message)) {
      onProgress(pacs_name, SeriesInstanceUID, message.ndicom);
    } else if (isDone(message)) {
      onDone(pacs_name, SeriesInstanceUID);
    } else if (isSubscribed(message)) {
      this.handleSubscriptionSuccess(pacs_name, SeriesInstanceUID);
    } else if (isError(message)) {
      onLonkError(pacs_name, SeriesInstanceUID, message.error);
    } else {
      return E.left(`Unrecognized message: ${JSON.stringify(message)}`);
    }
    return E.right(null);
  }

  private handleSubscriptionSuccess(
    pacs_name: string,
    SeriesInstanceUID: string,
  ) {
    const callback = this.pendingSubscriptions.pop(
      pacs_name,
      SeriesInstanceUID,
    );
    if (callback) {
      callback();
    } else {
      throw new Error(
        "Got subscription response, but never requested subscription. " +
          `pacs_name=${pacs_name} SeriesInstanceUID=${SeriesInstanceUID}`,
      );
    }
  }

  private handleUnsubscription(): E.Either<string, null> {
    const callback = this.pendingUnsubscriptions.pop();
    if (callback) {
      callback();
      return E.right(null);
    } else {
      return E.left(
        "Got unsubscription response, but never requested unsubscription",
      );
    }
  }

  /**
   * Subscribe to notifications for a series.
   */
  public subscribe(
    pacs_name: string,
    SeriesInstanceUID: string,
    { sendJsonMessage }: ReturnType<typeof useWebSocket>,
  ): Promise<SeriesKey> {
    let callback = null;
    const promise: Promise<SeriesKey> = new Promise((resolve) => {
      callback = () => resolve({ SeriesInstanceUID, pacs_name });
    });
    this.pendingSubscriptions.set(pacs_name, SeriesInstanceUID, callback);
    sendJsonMessage({
      SeriesInstanceUID,
      pacs_name,
      action: "subscribe",
    });
    return promise;
  }

  /**
   * Unsubscribe from notifications for all series.
   *
   * https://chrisproject.org/docs/oxidicom/lonk-ws#unsubscribe
   */
  public unsubscribeAll({
    sendJsonMessage,
  }: ReturnType<typeof useWebSocket>): Promise<undefined> {
    let callback = null;
    const promise: Promise<undefined> = new Promise((resolve) => {
      callback = resolve;
    });
    callback && this.pendingUnsubscriptions.push(callback);
    sendJsonMessage({ action: "unsubscribe" });
    return promise;
  }
}

export const isSubscribed = (msg: {
  [key: string]: any;
}): msg is LonkSubscription => {
  return "subscribed" in msg && msg.subscribed === true;
};

export const isDone = (msg: { [key: string]: any }): msg is LonkDone => {
  return "done" in msg && msg.done === true;
};

export const isProgress = (msg: {
  [key: string]: any;
}): msg is LonkProgress => {
  return "ndicom" in msg && Number.isInteger(msg.ndicom);
};

export const isError = (msg: { [key: string]: any }): msg is LonkError => {
  return "error" in msg;
};

export default LonkSubscriber;
export type { LonkHandlers };
