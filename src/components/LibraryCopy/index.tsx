import { useContext, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertGroup,
  Button,
  ChipGroup,
  Chip,
  TextInput,
  Dropdown,
  DropdownList,
  DropdownItem,
  MenuToggle,
} from "@patternfly/react-core";
import { debounce } from "lodash";
import { Alert } from "antd";
import { useLocation, useNavigate } from "react-router";
import ChrisAPIClient from "../../api/chrisapiclient";
import WrapperConnect from "../Wrapper";
import Browser from "./Browser";
import { SpinContainer } from "../Common";
import BreadcrumbContainer from "./BreadcrumbContainer";
import { LibraryContext, LibraryProvider } from "./context/";
import { clearCart, clearSelectFolder } from "./context/actions";
import { MainRouterContext } from "../../routes";
import { fetchResource } from "../../api/common";
import Client from "@fnndsc/chrisapi";

export const fetchFilesUnderThisPath = async (path?: string) => {
  if (!path) return;

  const client = ChrisAPIClient.getClient();
  const pathList = await client.getFileBrowserPath(path);
  const pagination = {
    limit: 100,
    offset: 0,
    totalCount: 0,
  };
  if (pathList) {
    const fileList = await pathList.getFiles({
      limit: pagination.limit,
      offset: pagination.offset,
    });

    if (fileList) {
      const files = fileList.getItems() as any[];
      return files;
    }
  }

  return [];
};

export const fetchFoldersUnderThisPath = async (path?: string) => {
  if (!path) return;
  const client = ChrisAPIClient.getClient();
  const uploads = await client.getFileBrowserPaths({
    path,
  });

  const parsedUpload =
    uploads.data && uploads.data[0].subfolders
      ? JSON.parse(uploads.data[0].subfolders)
      : [];

  return parsedUpload;
};

const useGetFolders = (computedPath: string) => {
  const folderData = useQuery({
    queryKey: ["folders", computedPath],
    queryFn: () => fetchFoldersUnderThisPath(computedPath),
    enabled: !!computedPath,
  });

  return folderData;
};

const useGetFiles = (computedPath: string) => {
  const fileData = useQuery({
    queryKey: ["files", computedPath],
    queryFn: () => fetchFilesUnderThisPath(computedPath),
    enabled: !!computedPath,
  });

  return fileData;
};

export const LibraryCopyPage = () => {
  return (
    <WrapperConnect>
      <>
        <LibraryProvider>
          <Cart />
          <LocalSearch />

          <NormalBrowser />
        </LibraryProvider>
      </>
    </WrapperConnect>
  );
};

function NormalBrowser() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const currentPathSplit = pathname.split("/librarycopy")[1];
  const computedPath = currentPathSplit || "/";
  const fileData = useGetFiles(computedPath);
  const folderData = useGetFolders(computedPath);

  const { data: files, isLoading: isFileLoading } = fileData;
  const { data: folders, isLoading: isFolderLoading } = folderData;

  const handleFolderClick = debounce((folder: string) => {
    const url = `${pathname}/${folder}`;
    navigate(url);
  }, 500);

  const handleBreadcrumb = (path: string) => {
    navigate(`/librarycopy${path}`);
  };

  return (
    <>
      <BreadcrumbContainer
        path={computedPath}
        handleFolderClick={handleBreadcrumb}
      />
      <Browser
        handleFolderClick={handleFolderClick}
        files={files}
        folders={folders}
        path={computedPath}
      />
      {(isFileLoading || isFolderLoading) && (
        <SpinContainer title="Fetching the Resources for this path" />
      )}
    </>
  );
}

export default LibraryCopyPage;

function Cart() {
  const { state, dispatch } = useContext(LibraryContext);
  const router = useContext(MainRouterContext);
  const { selectedPaths } = state;

  const handleDownload = () => {
    console.log("Handle Download");
  };

  const createFeed = () => {
    const pathList = selectedPaths.map((path) => path);

    router.actions.createFeedWithData(pathList);
  };

  const clearFeed = () => {
    dispatch(clearCart());
  };

  const handleDelete = () => {
    console.log("Handle Delete");
  };

  if (selectedPaths.length > 0) {
    return (
      <AlertGroup
        style={{
          zIndex: "999",
        }}
        isToast
      >
        <Alert
          type="info"
          description={
            <>
              <div
                style={{
                  marginBottom: "1em",
                  display: "flex",
                }}
              >
                <Button
                  style={{ marginRight: "0.5em" }}
                  onClick={createFeed}
                  variant="primary"
                >
                  Create Analysis
                </Button>

                <Button
                  style={{ marginRight: "0.5em" }}
                  onClick={() => {
                    handleDownload();
                  }}
                  variant="secondary"
                >
                  Download Data
                </Button>
                <Button variant="danger" onClick={handleDelete}>
                  Delete Data
                </Button>
              </div>
              {selectedPaths.length > 0 && (
                <>
                  <ChipGroup style={{ marginBottom: "1em" }} categoryName="">
                    {selectedPaths.map((path: string, index: number) => {
                      return (
                        <Chip
                          onClick={() => {
                            dispatch(clearSelectFolder(path));
                            console.log("Path Selected");
                          }}
                          key={index}
                        >
                          {path}
                        </Chip>
                      );
                    })}
                  </ChipGroup>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Button variant="tertiary" onClick={clearFeed}>
                      Empty Cart
                    </Button>
                  </div>
                </>
              )}
            </>
          }
          style={{ width: "100%", marginTop: "3em", padding: "2em" }}
        ></Alert>
      </AlertGroup>
    );
  } else {
    return null;
  }
}

const items = ["feeds", "pacs"];

function LocalSearch() {
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [searchSpace, setSearchSpace] = useState(items[0]);

  const handleSearch = async () => {
    if (value) {
      navigate(`/librarysearch/?search=${value}&space=${searchSpace}`);
    }
  };

  return (
    <div
      style={{
        margin: "1rem",
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}
    >
      <Dropdown
        toggle={(toggleRef: any) => {
          return (
            <MenuToggle
              ref={toggleRef}
              onClick={() => {
                setIsOpen(!isOpen);
              }}
            >
              {searchSpace}
            </MenuToggle>
          );
        }}
        aria-label="Choose a space to search"
        isOpen={isOpen}
      >
        <DropdownList>
          {items.map((item) => {
            return (
              <DropdownItem key={item} onClick={() => setSearchSpace(item)}>
                {item}
              </DropdownItem>
            );
          })}
        </DropdownList>
      </Dropdown>
      <TextInput
        aria-label="Search over uploaded Space"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSearch();
          }
        }}
        onChange={(_e, value) => setValue(value)}
        value={value}
        placeholder="Choose a space to search under"
      />
    </div>
  );
}
