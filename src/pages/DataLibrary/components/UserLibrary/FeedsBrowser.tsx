import React, { useCallback, useState } from 'react'
import ChrisAPIClient from '../../../../api/chrisapiclient';
import { useTypedSelector } from '../../../../store/hooks';
import DirectoryTree from '../../../../utils/browser';

const client = ChrisAPIClient.getClient();

interface FeedFilesBrowserProps {
  small?: boolean;
  showPagination?: boolean;
  pageLength?: number;
}

export const FeedsBrowser = ({ pageLength }: FeedFilesBrowserProps) => {
  document.title = "My Library";
  const username = useTypedSelector((state) => state.user.username) as string;
  const PAGE_LENGTH = pageLength || 15;

  const [feedfiles, setFeedFiles] = useState<DirectoryTree>();

  const [pages, setPages] = useState<number[]>([0]);
  const [currentPage, setCurrentPage] = useState<number>(0);

  const fetchCurrentPage = useCallback(async () => {
    // let nslashes = 4;


    try {
      const current = pages[currentPage];
      const params = { limit: 100, offset: current, fname_nslashes: `4u` };

      let items: any[] = [];
      let repeat = false;

      // Keep fetching files with an increasing offset
      // until the DirectoryTree to show currently has enough children.
      do {
        const files = await client.getFiles(params);
        items = [...items, ...(files.getItems() || [])];

        const directory = DirectoryTree.fromPathList(items)
          .child(username);

        // decide whether to repeat if there exist more files and we dont
        // have enough children to show yet.
        repeat = files.hasNextPage && directory.dir.length < PAGE_LENGTH;
        params.offset += params.limit;

        setFeedFiles(directory);
      } while (repeat);

      // Before leaving, set the end offset for next time for pagination.
      setPages([...pages, params.offset]);
      setCurrentPage(currentPage + 1);

    //   let files = await client.getFiles(params);
    //   let items = files.getItems() || [];

    //   do {
    //     returned = !!files.getItems()?.length;
    //     params = { limit: 100, offset: 0, fname_nslashes: `${++nslashes}u` };

    //     if (returned) {
    //       files = await client.getFiles(params);
    //       items = [...items, ...(files.getItems() || [])];
    //     }

    //     do {
    //       setFeedFiles(DirectoryTree.fromPathList(items).child(username));
    //       params.offset = params.offset += params.limit;

    //       if (files.hasNextPage) {
    //         files = await client.getFiles(params);
    //         items = [...items, ...(files.getItems() || [])];
    //       }
    //     } while (files.hasNextPage);
    //   } while (returned);
    } catch (error) {
      console.error(error);
    }
  }, [username]);

  const nextPage = () => {
    setFeedFiles(undefined);
    fetchCurrentPage();
  };

  const prevPage = () => {
    if (currentPage > 0) 
      setCurrentPage(currentPage - 1);

    nextPage();
  };

  return (
    <div>
      
    </div>
  )
}
