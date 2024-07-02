import {
  FileBrowserFolder,
  PACSFile,
  PACSSeries,
  UserFile,
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
import Search from "../NewLibrary/Search";
import { fetchResource } from "../../api/common";

const LibrarySearch = () => {
  const [cardLayout, setCardLayout] = useState(true);
  const [uploadFileModal, setUploadFileModal] = useState(false);
  const navigate = useNavigate();
  const query = useSearchQueryParams();
  const path = query.get("path");
  const inputValue = query.get("value");
  const filter = query.get("filter");
  const pacsPath = "/library/SERVICES";

  const handleSearch = async () => {
    const client = ChrisAPIClient.getClient();
    const parentFolders: FileBrowserFolder[] = [];
    try {
      if (path?.startsWith("/library/home") || path === "/library/home") {
        const userFilesFn = client.getUserFiles;
        const boundUserFilesFn = userFilesFn.bind(client);
        const params = {
          fname_icontains: (inputValue as string).trim(),
          limit: 10,
          offset: 0,
        };

        const { resource: uploadFiles } = await fetchResource<UserFile>(
          params,
          boundUserFilesFn,
        );
        for (const file of uploadFiles) {
          const parentFolder: FileBrowserFolder = await file.getParentFolder();
          const isDuplicate = parentFolders.some(
            (folder) => folder.data.id === parentFolder.data.id,
          );
          if (!isDuplicate) {
            parentFolders.push(parentFolder);
          }
        }
      }

      if (path?.startsWith(pacsPath) || path === pacsPath) {
        try {
          if (filter) {
            const pacsFn = client.getPACSSeriesList;
            const boundPacsFn = pacsFn.bind(client);
            const params = {
              [filter]: (inputValue as string).trim(),
              limit: 10,
              offset: 0,
            };
            const { resource: pacsFiles } = await fetchResource<PACSSeries>(
              params,
              boundPacsFn,
            );
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
            const pacsFn = client.getPACSFiles;
            const boundPacsFn = pacsFn.bind(client);
            const params = {
              fname_icontains_topdir_unique: (inputValue as string).trim(),
              limit: 10,
              offset: 0,
            };
            const { resource: pacsFiles } = await fetchResource<PACSFile>(
              params,
              boundPacsFn,
            );
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
      <Search
        handleChange={() => {
          setCardLayout(!cardLayout);
        }}
        handleUploadModal={() => {
          setUploadFileModal(!uploadFileModal);
        }}
        checked={cardLayout}
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
              <GridItem
                style={{ marginTop: "1rem" }}
                sm={1}
                lg={4}
                md={4}
                xl={4}
                xl2={4}
              >
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
