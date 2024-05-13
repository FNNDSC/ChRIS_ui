import {
  Feed,
  FeedList,
  FileBrowserFolder,
  PACSFile,
  PACSFileList,
  PACSSeries,
  PACSSeriesList,
  UserFile,
  UserFileList,
} from "@fnndsc/chrisapi";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Grid, GridItem } from "@patternfly/react-core";
import { Alert } from "antd";
import { useNavigate } from "react-router";
import ChrisAPIClient from "../../api/chrisapiclient";
import { EmptyStateComponent, SpinContainer } from "../Common";
import { useSearchQueryParams } from "../Feeds/usePaginate";
import BreadcrumbContainer from "../NewLibrary/Breadcrumb";
import { SubFolderCard } from "../NewLibrary/Browser";
import WrapperConnect from "../Wrapper";
import Cart from "../NewLibrary/Cart";
import Search from "../NewLibrary/Search";
import { LibraryProvider } from "../NewLibrary/context";
import { useTypedSelector } from "../../store/hooks";

const LibrarySearch = () => {
  const username = useTypedSelector((state) => state.user.username);
  const [open, setOpen] = useState(false);
  const [cardLayout, setCardLayout] = useState(true);
  const [uploadFileModal, setUploadFileModal] = useState(false);
  const navigate = useNavigate();
  const query = useSearchQueryParams();
  const path = query.get("path");
  const inputValue = query.get("value");
  const filter = query.get("filter");

  const onClose = () => {
    setOpen(false);
  };

  const showOpen = () => {
    setOpen(true);
  };

  const pacsPath = "/library/SERVICES/";
  const feedsPath = `/library/home/${username}/feeds`;
  const userFilesPath = `/library/home/${username}/uploads`;

  const handleSearch = async () => {
    const client = ChrisAPIClient.getClient();
    const parentFolders: FileBrowserFolder[] = [];

    try {
      if (path?.startsWith(feedsPath) || path === feedsPath) {
        try {
          const data: FeedList = await client.getFeeds({
            files_fname_icontains: (inputValue as string).trim(),
            limit: 1000000,
          });

          const feedItems = data.getItems() as Feed[];
          for (const feed of feedItems) {
            const parentFolder: FileBrowserFolder = await feed.getFolder();
            const isDuplicate = parentFolders.some(
              (folder) => folder.data.id === parentFolder.data.id,
            );
            if (!isDuplicate) {
              parentFolders.push(parentFolder);
            }
          }
        } catch (error) {
          throw new Error("Failed to fetch Feed Files...");
        }
      }
      if (path?.startsWith(userFilesPath) || path === userFilesPath) {
        try {
          const data: UserFileList = await client.getUserFiles({
            fname_icontains: (inputValue as string).trim(),
            limit: 1000000,
          });

          const uploadFiles = data.getItems() as UserFile[];

          for (const file of uploadFiles) {
            const parentFolder: FileBrowserFolder =
              await file.getParentFolder();
            const isDuplicate = parentFolders.some(
              (folder) => folder.data.id === parentFolder.data.id,
            );
            if (!isDuplicate) {
              parentFolders.push(parentFolder);
            }
          }
        } catch (error) {
          throw new Error("Failed to fetch User Files...");
        }
      }

      if (path?.startsWith(pacsPath) || path === pacsPath) {
        try {
          if (filter) {
            const data: PACSSeriesList = await client.getPACSSeriesList({
              [filter]: (inputValue as string).trim(),
            });
            const pacsFiles = data.getItems() as PACSSeries[];

            for (const file of pacsFiles) {
              const parentFolder: FileBrowserFolder = await file.getFolder();
              const isDuplicate = parentFolders.some(
                (folder) => folder.data.id === parentFolder.data.id,
              );
              if (!isDuplicate) {
                parentFolders.push(parentFolder);
              }
            }
          } else {
            const data: PACSFileList = await client.getPACSFiles({
              fname_icontains_topdir_unique: (inputValue as string).trim(),
              limit: 1000000,
            });

            const pacsFiles = data.getItems() as PACSFile[];

            for (const file of pacsFiles) {
              const parentFolder: FileBrowserFolder =
                await file.getParentFolder();
              const isDuplicate = parentFolders.some(
                (folder) => folder.data.id === parentFolder.data.id,
              );
              if (!isDuplicate) {
                parentFolders.push(parentFolder);
              }
            }
          }
        } catch (error) {
          throw new Error("Failed to fetch PACS Files...");
        }
      }
    } catch (error) {
      // biome-ignore lint/complexity/noUselessCatch: <explanation>
      throw error;
    }

    return parentFolders;
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["searchedFolders", inputValue, path],
    queryFn: () => handleSearch(),
  });

  const handleFolderClick = (path: string) => {
    navigate(`/library/${path}`);
  };

  return (
    <WrapperConnect>
      <LibraryProvider>
        {open && <Cart open={open} onClose={onClose} />}
        <Search
          handleChange={() => {
            setCardLayout(!cardLayout);
          }}
          handleUploadModal={() => {
            setUploadFileModal(!uploadFileModal);
          }}
          checked={cardLayout}
          showOpen={showOpen}
        />
        {isError && <Alert type="error" description={error.message} />}
        {isLoading ? (
          <SpinContainer title="Fetching Search Results..." />
        ) : data && data.length > 0 ? (
          data.map((folder) => {
            return (
              <Grid
                style={{
                  marginTop: "1rem",
                  marginLeft: "1rem",
                }}
                key={folder.data.id}
              >
                <BreadcrumbContainer
                  path={folder.data.path}
                  handleFolderClick={handleFolderClick}
                />
                <GridItem sm={1} lg={4} md={4} xl={4} xl2={4}>
                  <SubFolderCard
                    val={folder}
                    computedPath={folder.data.path}
                    handleFolderClick={() => {
                      handleFolderClick(`${folder.data.path}`);
                    }}
                  />
                </GridItem>
              </Grid>
            );
          })
        ) : (
          <EmptyStateComponent
            title={`No search terms available for ${inputValue}`}
          />
        )}
      </LibraryProvider>
    </WrapperConnect>
  );
};

export default LibrarySearch;
