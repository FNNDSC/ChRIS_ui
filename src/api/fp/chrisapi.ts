import Client, {
  AllPluginInstanceList,
  DownloadToken,
  Feed,
  FeedPluginInstanceList,
  PluginInstance,
  PublicFeedList,
} from "@fnndsc/chrisapi";
import * as TE from "fp-ts/TaskEither";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import LonkClient, { LonkHandlers } from "../lonk";

/**
 * fp-ts friendly wrapper for @fnndsc/chrisapi
 */
class FpClient {
  private readonly client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  public getPluginInstance(
    ...params: Parameters<Client["getPluginInstance"]>
  ): TE.TaskEither<Error, PluginInstance> {
    return TE.tryCatch(
      () => this.client.getPluginInstance(...params).then(notNull),
      E.toError,
    );
  }

  /**
   * Alternative to {@link Client.getPluginInstance } that works for
   * plugin instances which are part of public feeds.
   *
   * Upstream bug: https://github.com/FNNDSC/fnndsc/issues/103
   */
  public getPublicInstanceDirectly(
    id: number,
  ): TE.TaskEither<Error, PluginInstance> {
    const url = `${this.client.url}plugins/instances/${id}/`;
    const options = {
      headers: {
        Accept: "application/vnd.collection+json",
      },
    };
    if (this.client.auth.token) {
      // @ts-ignore
      options.headers.Authorization = `Token ${this.client.auth.token}`;
    }
    return pipe(
      TE.tryCatch(
        () =>
          fetch(url, options).then((res) => {
            if (res.ok) {
              return res.json();
            }
            throw new Error(
              `Response from ${url} was ${res.status} - ${res.statusText}`,
            );
          }),
        E.toError,
      ),
      TE.map((data) => {
        const list = new AllPluginInstanceList(
          this.client.url,
          this.client.auth,
        );
        list.collection = data.collection;
        return list.getItem(id);
      }),
    );
  }

  public static getFeedOf(
    pluginInstance: PluginInstance,
    ...params: Parameters<PluginInstance["getFeed"]>
  ): TE.TaskEither<Error, Feed> {
    return pipe(
      TE.tryCatch(() => pluginInstance.getFeed(...params), E.toError),
      // getFeed's return type is null, but it probably shouldn't be.
      // https://github.com/FNNDSC/fnndsc/issues/102
      TE.flatMapNullable(
        (feed) => feed,
        (_) =>
          new Error(
            `feed of plugin instance ${pluginInstance.data.id} is null`,
          ),
      ),
    );
  }

  public static getPreviousPluginInstance(
    pluginInstance: PluginInstance,
    ...params: Parameters<PluginInstance["getPreviousPluginInstance"]>
  ): TE.TaskEither<Error, PluginInstance | null> {
    return TE.tryCatch(
      () => pluginInstance.getPreviousPluginInstance(...params),
      E.toError,
    );
  }

  public getPublicFeeds(
    ...params: Parameters<Client["getPublicFeeds"]>
  ): TE.TaskEither<Error, PublicFeedList> {
    return TE.tryCatch(() => this.client.getPublicFeeds(...params), E.toError);
  }

  public static getPluginInstancesOf(
    feed: Feed,
    ...params: Parameters<Feed["getPluginInstances"]>
  ): TE.TaskEither<Error, FeedPluginInstanceList> {
    return TE.tryCatch(() => feed.getPluginInstances(...params), E.toError);
  }

  public createDownloadToken(
    ...params: Parameters<Client["createDownloadToken"]>
  ): TE.TaskEither<Error, DownloadToken> {
    return TE.tryCatch(
      () => this.client.createDownloadToken(...params).then(notNull),
      E.toError,
    );
  }

  /**
   * Connect a WebSocket to the LONK-WS endpoint.
   *
   * https://chrisproject.org/docs/oxidicom/lonk-ws
   */
  public connectPacsNotifications({
    onDone,
    onProgress,
    onError,
    timeout,
  }: LonkHandlers & { timeout?: number }): TE.TaskEither<Error, LonkClient> {
    return pipe(
      this.createDownloadToken(timeout),
      TE.flatMap((downloadToken) => {
        const url = getWebsocketUrl(downloadToken);
        let callback: ((c: E.Either<Error, LonkClient>) => void) | null = null;
        let promise: Promise<E.Either<Error, LonkClient>> = new Promise(
          (resolve) => (callback = resolve),
        );
        const ws = new WebSocket(url);
        ws.onopen = () =>
          callback &&
          callback(
            E.right(new LonkClient({ ws, onDone, onProgress, onError })),
          );
        ws.onerror = (_ev) =>
          callback &&
          callback(
            E.left(
              new Error(
                `There was an error connecting to the WebSocket at ${url}`,
              ),
            ),
          );
        ws.onclose = () =>
          callback &&
          callback(E.left(new Error(`CUBE unexpectedly closed the WebSocket`)));
        return () => promise;
      }),
    );
  }
}

function getWebsocketUrl(downloadTokenResponse: DownloadToken): string {
  const token = downloadTokenResponse.data.token;
  return downloadTokenResponse.url
    .replace(/^http(s?):\/\//, (_match, s) => `ws${s}://`)
    .replace(/v1\/downloadtokens\/\d+\//, `v1/pacs/ws/?token=${token}`);
}

function notNull<T>(x: T | null): T {
  if (x === null) {
    throw Error();
  }
  return x;
}

export default FpClient;
export { FpClient, getWebsocketUrl };
