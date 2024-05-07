import type {
  Feed,
  FeedList,
  FileBrowserFolder,
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

const LibrarySearch = () => {
  const [open, setOpen] = useState(false);
  const [cardLayout, setCardLayout] = useState(true);
  const [uploadFileModal, setUploadFileModal] = useState(false);
  const navigate = useNavigate();
  const query = useSearchQueryParams();
  const statusSelected = query.get("search");
  const inputValue = query.get("value");

  const onClose = () => {
    setOpen(false);
  };

  const showOpen = () => {
    setOpen(true);
  };

  const handleSearch = async () => {
    const client = ChrisAPIClient.getClient();
    const parentFolders: FileBrowserFolder[] = [];

    try {
      if (statusSelected === "Feed Files") {
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
      if (statusSelected === "User Files") {
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
    } catch (error) {
      // biome-ignore lint/complexity/noUselessCatch: <explanation>
      throw error;
    }

    return parentFolders;
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["searchedFolders", inputValue, statusSelected],
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