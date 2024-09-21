/**
 * LONK-WS JSON types.
 *
 * Documentation: https://chrisproject.org/docs/oxidicom/lonk-ws#messages
 *
 * Reference implementation:
 * https://github.com/FNNDSC/ChRIS_ultron_backEnd/blob/cf95993886c22530190c23807b57d525f9d51f99/chris_backend/pacsfiles/lonk.py#L45-L102
 */

/**
 * The metadata which uniquely identifies a DICOM series.
 */
type SeriesKey = {
  SeriesInstanceUID: string;
  pacs_name: string;
};

/**
 * LONK "progress" message.
 */
type LonkProgress = {
  /**
   * Number of DICOM files stored by *oxidicom* so far.
   */
  ndicom: number;
};

/**
 * LONK "error" message.
 */
type LonkError = {
  /**
   * Error message originating from *oxidicom*.
   */
  error: string;
};

/**
 * LONK "done" message.
 */
type LonkDone = {
  done: true;
};

/**
 * LONK-WS "subscription" response message.
 *
 * https://chrisproject.org/docs/oxidicom/lonk-ws#lonk-ws-subscription
 */
type LonkSubscription = {
  subscribed: true;
};

/**
 * LONK-WS "unsubscription" response message.
 *
 * https://chrisproject.org/docs/oxidicom/lonk-ws#unsubscribe
 */
type LonkUnsubscription = {
  subscribed: false;
};

/**
 * Oxidicom notification message data.
 */
type LonkMessageData = LonkDone | LonkProgress | LonkError | LonkSubscription;

/**
 * Notification from oxidicom about a DICOM series.
 */
type Lonk<T extends { [key: string]: any }> = {
  SeriesInstanceUID: string;
  pacs_name: string;
  message: T;
};

/**
 * Handler functions for the various types of LONK protocol messages.
 */
type LonkHandlers = {
  onDone: (pacs_name: string, SeriesInstanceUID: string) => void;
  onProgress: (
    pacs_name: string,
    SeriesInstanceUID: string,
    ndicom: number,
  ) => void;
  onError: (
    pacs_name: string,
    SeriesInstanceUID: string,
    error: string,
  ) => void;
};

export type {
  LonkDone,
  LonkProgress,
  LonkError,
  LonkSubscription,
  LonkUnsubscription,
  LonkMessageData,
  Lonk,
  LonkHandlers,
  SeriesKey,
};
