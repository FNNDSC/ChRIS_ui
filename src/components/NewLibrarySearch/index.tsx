import type {
  Feed,
  FeedList,
  FileBrowserFolder,
  UserFile,
  UserFileList,
} from "@fnndsc/chrisapi";
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

const LibrarySearch = () => {
  const navigate = useNavigate();
  const query = useSearchQueryParams();
  const statusSelected = query.get("search");
  const inputValue = query.get("value");

  const handleSearch = async () => {
    const client = ChrisAPIClient.getClient();
    const parentFolders: FileBrowserFolder[] = [];

    try {
      if (statusSelected === "Feed Files") {
        try {
          const data: FeedList = await client.getFeeds({
            files_fname_icontains: (inputValue as string).trim(),
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
    </WrapperConnect>
  );
};

export default LibrarySearch;
