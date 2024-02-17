import Client, {
  AllPluginInstanceList,
  Feed,
  FeedPluginInstanceList,
  FileBrowserPath,
  FileBrowserPathFileList,
  PluginInstance,
  PublicFeedList,
} from "@fnndsc/chrisapi";
import * as TE from "fp-ts/TaskEither";
import * as E from "fp-ts/Either";
import * as Console from "fp-ts/Console";
import { pipe } from "fp-ts/function";
import FpFileBrowserFile from "./fpFileBrowserFile";

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
      () => this.client.getPluginInstance(...params),
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
      options.headers.Authorization = `Token ${this.client.auth.token}`;
    }
    return pipe(
      TE.tryCatch(
        () => fetch(url, options).then((res) => res.json()),
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

  /**
   * A wrapper which calles `getFileBrowserPath` then `getFiles`,
   * and processes the returned objects to have a more sane type.
   *
   * Pretty much gives you back what CUBE would return from
   * `api/v1/filebrowser-files/.../` with HTTP header `Accept: application/json`
   *
   * Pagination is not implemented, hence the name "get **few** files under"...
   */
  public getFewFilesUnder(
    ...args: Parameters<Client["getFileBrowserPath"]>
  ): TE.TaskEither<Error, ReadonlyArray<FpFileBrowserFile>> {
    return pipe(
      this.getFileBrowserPath(...args),
      TE.flatMap(FpClient.filebrowserGetFiles),
      TE.tapIO((list) => {
        if (list.hasNextPage) {
          return Console.warn(
            `Not all elements from ${list.url} were fetched, ` +
              "and pagination not implemented.",
          );
        }
        return () => undefined;
      }),
      TE.map(saneReturnOfFileBrowserPathFileList),
    );
  }

  public getFileBrowserPath(
    ...args: Parameters<Client["getFileBrowserPath"]>
  ): TE.TaskEither<Error, FileBrowserPath> {
    return TE.tryCatch(
      () => this.client.getFileBrowserPath(...args),
      E.toError,
    );
  }

  public static filebrowserGetFiles(
    fbp: FileBrowserPath,
    ...params: Parameters<FileBrowserPath["getFiles"]>
  ): TE.TaskEither<Error, FileBrowserPathFileList> {
    return TE.tryCatch(() => fbp.getFiles(...params), E.toError);
  }
}

function saneReturnOfFileBrowserPathFileList(
  fbpfl: FileBrowserPathFileList,
): ReadonlyArray<FpFileBrowserFile> {
  return fbpfl.getItems()!.map((file) => new FpFileBrowserFile(file));
}

export { FpClient, saneReturnOfFileBrowserPathFileList, FpFileBrowserFile };
