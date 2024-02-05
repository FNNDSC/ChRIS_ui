import Client, { Feed, FeedPluginInstanceList, PublicFeedList } from "@fnndsc/chrisapi";
import * as TE from "fp-ts/TaskEither";
import * as E from "fp-ts/Either";

/**
 * fp-ts friendly wrapper for @fnndsc/chrisapi
 */
class FpClient {

  private readonly client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  public getPublicFeeds(...params: Parameters<Client["getPublicFeeds"]>): TE.TaskEither<Error, PublicFeedList> {
    return TE.tryCatch(
      () => this.client.getPublicFeeds(...params),
      E.toError
    );
  }

  public static getPluginInstancesOf(feed: Feed, ...params: Parameters<Feed["getPluginInstances"]>): TE.TaskEither<Error, FeedPluginInstanceList> {
    return TE.tryCatch(
      () => feed.getPluginInstances(...params),
      E.toError
    );
  }
}

export { FpClient };
