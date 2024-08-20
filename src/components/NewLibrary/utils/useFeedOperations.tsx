import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import ChrisAPIClient from "../../../api/chrisapiclient";
import { getFileName } from "../../../api/common";
import { createFeed } from "../../../store/cart/downloadSaga";
import type { SelectionPayload } from "../../../store/cart/types";
import { useTypedSelector } from "../../../store/hooks";

const useFeedOperations = (inValidateFolders: () => void, api: any) => {
  const selectedPaths = useTypedSelector((state) => state.cart.selectedPaths);

  const giveMePaths = useMemo(() => {
    return selectedPaths.map((payload: SelectionPayload) => payload.path);
  }, [selectedPaths]);

  const handleDuplicate = async () => {
    const paths = giveMePaths;
    try {
      const feedList = await Promise.all(
        paths.map(async (path) => {
          // cube does not accept forward slashes in the feed name
          const filePath = getFileName(path);
          const idMatch = filePath.match(/feed_(\d+)/);
          const id = idMatch ? idMatch[1] : null;
          let pathToFeed = getFileName(path);
          if (id) {
            // this is feed duplicate
            const client = ChrisAPIClient.getClient();
            const feed = await client.getFeed(Number(id));
            if (feed) {
              pathToFeed = feed.data.name;
            }
          }
          const { feed } = await createFeed([path], `Copy of ${pathToFeed}`);
          return feed;
        }),
      );
      return feedList;
    } catch (e: any) {
      const error_message = e?.response?.data?.value[0];
      if (error_message) throw new Error(error_message);
      if (e instanceof Error) throw new Error(e.message);
    }
  };

  const handleMerge = async () => {
    const paths = giveMePaths;
    try {
      const sanitizedPaths = await Promise.all(
        paths.map(async (path) => {
          const filePath = getFileName(path);
          const idMatch = filePath.match(/feed_(\d+)/);
          const id = idMatch ? idMatch[1] : null;
          let pathToFeed = getFileName(path);

          if (id) {
            // this is a feed merge
            const client = ChrisAPIClient.getClient();
            const feed = await client.getFeed(Number(id));
            if (feed) {
              pathToFeed = feed.data.name;
            }
          }

          // Return the sanitized path (with slashes replaced by underscores)
          return pathToFeed.replace(/\//g, "_");
        }),
      );

      // Join the sanitized paths with ", " and replace any slashes with underscores
      const feedName = sanitizedPaths.join(", ");

      // Create the merged feed with the final sanitized feed name
      const { feed } = await createFeed(paths, `Merge of ${feedName}`);
      return feed;
    } catch (e: any) {
      const error_message = e?.response?.data?.value[0];
      if (error_message) throw new Error(error_message);
      if (e instanceof Error) throw new Error(e.message);
    }
  };

  const handleDuplicateMutation = useMutation({
    mutationFn: () => handleDuplicate(),
    onSuccess: () => {
      api.success({
        message: "Feed copied successfully",
      });
      inValidateFolders();
    },
    onError: (e) => {
      api.error({
        message: "Error while copying",
        description: e.message,
      });
    },
  });

  const handleMergeMutation = useMutation({
    mutationFn: () => handleMerge(),
    onSuccess: () => {
      api.success({
        message: "Feed merged successfully",
      });
      inValidateFolders();
    },
    onError: (e) => {
      api.error({
        message: "Error while merging the feeds",
        description: e.message,
      });
    },
  });

  return {
    handleDuplicateMutation,
    handleMergeMutation,
  };
};

export default useFeedOperations;
