import {
  Lonk,
  LonkDone,
  LonkError,
  LonkHandlers,
  LonkProgress,
  LonkSubscription,
  LonkUnsubscription,
  SeriesKey,
} from "./types.ts";
import deserialize from "./de.ts";
import { pipe } from "fp-ts/function";
import * as E from "fp-ts/Either";
import SeriesMap from "./seriesMap.ts";

/**
 * `LonkSubscriber` wraps a {@link WebSocket}, routing incoming JSON messages
 * to corresponding functions of {@link LonkHandlers}.
 */
class LonkSubscriber {
  private readonly ws: WebSocket;
  private readonly pendingSubscriptions: SeriesMap<null | (() => SeriesKey)>;
  private readonly pendingUnsubscriptions: (() => void)[];
  private handlers: LonkHandlers | null;

  public constructor(ws: WebSocket) {
    this.handlers = null;
    this.pendingSubscriptions = new SeriesMap();
    this.pendingUnsubscriptions = [];
    this.ws = ws;
    this.ws.onmessage = (msg) => {
      pipe(
        msg.data,
        deserialize,
        E.map((data) => this.routeMessage(data)),
        E.orElse((e) => {
          throw e;
        }),
      );
    };
  }

  /**
   * Configure this client with event handler functions.
   * `init` must be called exactly once.
   */
  public init(handlers: LonkHandlers): LonkSubscriber {
    if (this.handlers) {
      throw new Error("LonkSubscriber.init called more than once.");
    }
    this.handlers = handlers;
    return this;
  }

  /**
   * Subscribe to notifications for a series.
   */
  public subscribe(
    pacs_name: string,
    SeriesInstanceUID: string,
  ): Promise<SeriesKey> {
    let callback = null;
    const promise: Promise<SeriesKey> = new Promise((resolve) => {
      callback = () => resolve({ SeriesInstanceUID, pacs_name });
    });
    this.pendingSubscriptions.set(pacs_name, SeriesInstanceUID, callback);
    const data = {
      SeriesInstanceUID,
      pacs_name,
      action: "subscribe",
    };
    this.ws.send(JSON.stringify(data));
    return promise;
  }

  /**
   * Unsubscribe from notifications for all series.
   *
   * https://chrisproject.org/docs/oxidicom/lonk-ws#unsubscribe
   */
  public unsubscribeAll(): Promise<undefined> {
    let callback = null;
    const promise: Promise<undefined> = new Promise((resolve) => {
      callback = resolve;
    });
    callback && this.pendingUnsubscriptions.push(callback);
    this.ws.send(JSON.stringify({ action: "unsubscribe" }));
    return promise;
  }

  private routeMessage(data: E.Either<LonkUnsubscription, Lonk<any>>) {
    pipe(
      data,
      E.bimap(
        () => this.handleUnsubscription(),
        (lonk) => this.routeLonk(lonk),
      ),
    );
  }

  private routeLonk(data: Lonk<any>) {
    if (this.handlers === null) {
      throw new Error("LonkSubscriber.init has not been called yet.");
    }
    const { onProgress, onDone, onError } = this.handlers;
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
      onError(pacs_name, SeriesInstanceUID, message.error);
    } else {
      throw new Error(`Unrecognized message: ${JSON.stringify(message)}`);
    }
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

  private handleUnsubscription() {
    const callback = this.pendingUnsubscriptions.pop();
    if (callback) {
      callback();
    } else {
      throw new Error(
        "Got unsubscription response, but never requested unsubscription",
      );
    }
  }

  /**
   * Close the WebSocket.
   */
  public close() {
    this.ws.close();
  }

  /**
   * Set the WebSocket's `close` event listener.
   *
   * https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/close_event
   */
  public set onclose(onclose: WebSocket["onclose"]) {
    this.ws.onclose = onclose;
  }
}

function isSubscribed(msg: { [key: string]: any }): msg is LonkSubscription {
  return "subscribed" in msg && msg.subscribed === true;
}

function isDone(msg: { [key: string]: any }): msg is LonkDone {
  return "done" in msg && msg.done === true;
}

function isProgress(msg: { [key: string]: any }): msg is LonkProgress {
  return "ndicom" in msg && Number.isInteger(msg.ndicom);
}

function isError(msg: { [key: string]: any }): msg is LonkError {
  return "error" in msg;
}

export default LonkSubscriber;
export type { LonkHandlers };
