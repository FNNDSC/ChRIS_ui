import Client, {
  Feed,
  FeedPluginInstanceList,
  FileBrowserPath,
  FileBrowserPathFileList,
  PublicFeedList,
} from "@fnndsc/chrisapi";
import * as TE from "fp-ts/TaskEither";
import * as E from "fp-ts/Either";
import * as Console from "fp-ts/Console";
import { pipe } from "fp-ts/function";
import FpFileBrowserFile from "./fpFileBrowserFile.ts";

/**
 * fp-ts friendly wrapper for @fnndsc/chrisapi
 */
class FpClient {
  private readonly client: Client;

  constructor(client: Client) {
    this.client = client;
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

export { FpClient, saneReturnOfFileBrowserPathFileList };
