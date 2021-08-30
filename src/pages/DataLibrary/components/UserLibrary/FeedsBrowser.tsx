import React, { useCallback, useState } from 'react'
import ChrisAPIClient from '../../../../api/chrisapiclient';
import { useTypedSelector } from '../../../../store/hooks';
import DirectoryTree from '../../../../utils/browser';

const client = ChrisAPIClient.getClient();

export const FeedsBrowser = () => {
  document.title = "My Library";
  const username = useTypedSelector((state) => state.user.username) as string;

  const [feedfiles, setFeedFiles] = useState<DirectoryTree>();
  const [offset, setOffset] = useState(0);
  const LIMIT = 100;

  const fetchFiles = useCallback(async () => {
    let nslashes = 4;
    let returned = false;
    let params = { limit: 100, offset: 0, fname_nslashes: `4u` };

    try {
      let files = await client.getFiles(params);
      let items = files.getItems() || [];

      do {
        returned = !!files.getItems()?.length;
        params = { limit: 100, offset: 0, fname_nslashes: `${++nslashes}u` };

        if (returned) {
          files = await client.getFiles(params);
          items = [...items, ...(files.getItems() || [])];
        }

        do {
          setFeedFiles(DirectoryTree.fromPathList(items).child(username));
          params.offset = params.offset += params.limit;

          if (files.hasNextPage) {
            files = await client.getFiles(params);
            items = [...items, ...(files.getItems() || [])];
          }
        } while (files.hasNextPage);
      } while (returned);
    } catch (error) {
      console.error(error);
    }
  }, [username]);

  return (
    <div>
      
    </div>
  )
}
