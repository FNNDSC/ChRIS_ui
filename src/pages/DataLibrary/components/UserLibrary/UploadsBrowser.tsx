import React, { useCallback, useState } from "react";
import { EmptyState, EmptyStateIcon, Spinner } from "@patternfly/react-core";

import ChrisAPIClient from "../../../../api/chrisapiclient";
import { useTypedSelector } from "../../../../store/hooks";
import DirectoryTree from "../../../../utils/browser";
import Browser from "./Browser";

interface UploadsBrowserProps {
  small?: boolean;
  showPagination?: boolean;
  pageLength?: number;
}

const client = ChrisAPIClient.getClient();

export const UploadsBrowser: React.FC<UploadsBrowserProps> = ({
  pageLength,
}: UploadsBrowserProps) => {
  document.title = "Uploads | My Library";
  const username = useTypedSelector((state) => state.user.username) as string;
  const PAGE_LENGTH = pageLength || 15;

  const [uploaded, setUploaded] = useState<DirectoryTree>();

  const [pages, setPages] = useState<number[]>([0]);
  const [currentPage, setCurrentPage] = useState<number>(0);

  const fetchCurrentPage = useCallback(async () => {
    const current = pages[currentPage];
    const params = { limit: 100, offset: current, fname_nslashes: "3u" };

    try {
      let items: any[] = [];
      let repeat = false;

      // Keep fetching files with an increasing offset
      // until the DirectoryTree to show currently has enough children.
      do {
        const uploads = await client.getUploadedFiles(params);
        items = [...items, ...(uploads.getItems() || [])];

        const directory = DirectoryTree.fromPathList(items)
          .child(username)
          .child("uploads");

        // decide whether to repeat if there exist more files and we dont
        // have enough children to show yet.
        repeat = uploads.hasNextPage && directory.dir.length < PAGE_LENGTH;
        params.offset += params.limit;

        setUploaded(directory);
      } while (repeat);

      // Before leaving, set the end offset for next time for pagination.
      setPages([...pages, params.offset]);
      setCurrentPage(currentPage + 1);
    } catch (error) {
      console.error(error);
    }
  }, [PAGE_LENGTH, currentPage, pages, username]);

  const handleDelete = () => {
    console.log("Handle Delete", handleDelete);
    // fetchCurrentPage();
  };

  const nextPage = () => {
    setUploaded(undefined);
    fetchCurrentPage();
  };

  const prevPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);

    nextPage();
  };

  if (!uploaded)
    return (
      <article>
        <EmptyState>
          <EmptyStateIcon variant="container" component={Spinner} />
        </EmptyState>
      </article>
    );

  const fetchUploadedDir = async (fname: string) => {
    const files = await client.getUploadedFiles({ limit: 10e6, fname });
    return DirectoryTree.fileList(files.getItems() || [], fname);
  };

  return (
    <section>
      {/* Pagination Controls */}
      <Browser
        withHeader
        name="uploads"
        path="/library/uploads"
        tree={uploaded}
        fetchFiles={fetchUploadedDir}
        handleDelete={handleDelete}
      />
    </section>
  );
};
