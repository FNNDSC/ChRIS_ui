import type {
  FileBrowserFolder,
  FileBrowserFolderFile,
  FileBrowserFolderLinkFile,
  FileBrowserFolderList,
} from "@fnndsc/chrisapi";
import {
  Breadcrumb,
  BreadcrumbItem,
  Flex,
  FlexItem,
  Nav,
  NavItem,
  NavList,
} from "@patternfly/react-core";
import {
  HomeIcon,
  CloudIcon,
  CubeIcon,
  UsersIcon,
} from "@patternfly/react-icons";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ChrisAPIClient from "../../api/chrisapiclient";
import { useAppSelector } from "../../store/hooks";
import Wrapper from "../Wrapper";
import styles from "./gnome.module.css";
import GnomeLibraryTable from "./GnomeLibraryTable";

export async function fetchFolders(computedPath: string, pageNumber?: number) {
  const client = ChrisAPIClient.getClient();
  await client.setUrls();

  const pagination = {
    limit: pageNumber ? pageNumber * 50 : 100,
    offset: 0,
  };

  const errorMessages: string[] = [];

  try {
    const folderList: FileBrowserFolderList =
      await client.getFileBrowserFolders({
        path: computedPath,
      });

    const folders = folderList.getItems() as FileBrowserFolder[];
    let subFolders: FileBrowserFolder[] = [];
    let linkFiles: FileBrowserFolderLinkFile[] = [];
    let files: FileBrowserFolderFile[] = [];
    const initialPaginateValue = {
      totalCount: 0,
      hasNextPage: false,
    };
    let filesPagination = initialPaginateValue;
    let foldersPagination = initialPaginateValue;
    let linksPagination = initialPaginateValue;

    if (folders && folders.length > 0) {
      const folder = folders[0];

      if (folder) {
        // Prepare fetch promises for parallel execution
        const fetchPromises = [
          // Fetch children folders
          folder
            .getChildren(pagination)
            .then((children) => {
              subFolders = children.getItems() as FileBrowserFolder[];
              foldersPagination = {
                totalCount: children.totalCount,
                hasNextPage: children.hasNextPage,
              };
            })
            .catch((error) => {
              console.error("Error fetching folder children:", error);
              errorMessages.push("Failed to fetch subfolders.");
            }),

          // Fetch link files
          folder
            .getLinkFiles(pagination)
            .then((linkFilesResult) => {
              linkFiles =
                linkFilesResult.getItems() as FileBrowserFolderLinkFile[];
              linksPagination = {
                totalCount: linkFilesResult.totalCount,
                hasNextPage: linkFilesResult.hasNextPage,
              };
            })
            .catch((error) => {
              console.error("Error fetching link files:", error);
              errorMessages.push("Failed to fetch link files.");
            }),

          // Fetch folder files
          folder
            .getFiles(pagination)
            .then((folderFiles) => {
              files = folderFiles.getItems() as FileBrowserFolderFile[];
              filesPagination = {
                totalCount: folderFiles.totalCount,
                hasNextPage: folderFiles.hasNextPage,
              };
            })
            .catch((error) => {
              console.error("Error fetching files:", error);
              errorMessages.push("Failed to fetch files.");
            }),
        ];

        await Promise.all(fetchPromises);
      }
    }

    return {
      folders: subFolders,
      files,
      linkFiles,
      filesPagination,
      foldersPagination,
      linksPagination,
      folderList, // return folderList to enable creating new folders
      errorMessages, // return any error messages encountered
    };
  } catch (e) {
    errorMessages.push("Failed to load folder list.");
    return { errorMessages }; // return errors in case the request fails entirely
  }
}

const GnomeLibrary = () => {
  const [activeSidebarItem, setActiveSidebarItem] = useState<string>("home");
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);

  const { pathname } = useLocation();
  const navigate = useNavigate();
  const username = useAppSelector((state) => state.user.username);

  const decodedPath = decodeURIComponent(pathname);
  const currentPathSplit = decodedPath.split("/library/")[1];
  const computedPath = currentPathSplit || `/home/${username}`;
  const queryKey = ["library_folders", computedPath, pageNumber];

  const { data, isFetching, isError, error } = useQuery({
    queryKey: queryKey,
    queryFn: () => fetchFolders(computedPath, pageNumber),
    placeholderData: keepPreviousData,
    structuralSharing: true,
  });

  useEffect(() => {
    if (isFirstLoad && pathname === "/library") {
      navigate(`/library/home/${username}`, { replace: true });
      setIsFirstLoad(false);
    }
  }, [isFirstLoad, pathname, username, navigate]);

  const handleSidebarItemClick = (item: string) => {
    setActiveSidebarItem(item);
    if (item === "home") {
      navigate(`/library/home/${username}`);
    } else {
      navigate(`/library/${item}`);
    }
  };

  return (
    <Wrapper>
      <div className={styles.gnomeLibraryContainer}>
        <div className={styles.gnomeLibrarySidebar}>
          <Nav>
            <NavList>
              <NavItem
                key="home"
                isActive={activeSidebarItem === "home"}
                onClick={() => handleSidebarItemClick("home")}
              >
                <Flex>
                  <FlexItem>
                    <HomeIcon />
                  </FlexItem>
                  <FlexItem>Home</FlexItem>
                </Flex>
              </NavItem>
              <NavItem
                key="public"
                isActive={activeSidebarItem === "public"}
                onClick={() => handleSidebarItemClick("public")}
              >
                <Flex>
                  <FlexItem>
                    <UsersIcon />
                  </FlexItem>
                  <FlexItem>PUBLIC</FlexItem>
                </Flex>
              </NavItem>
              <NavItem
                key="shared"
                isActive={activeSidebarItem === "shared"}
                onClick={() => handleSidebarItemClick("SHARED")}
              >
                <Flex>
                  <FlexItem>
                    <CloudIcon />
                  </FlexItem>
                  <FlexItem>SHARED</FlexItem>
                </Flex>
              </NavItem>
              <NavItem
                key="services"
                isActive={activeSidebarItem === "services"}
                onClick={() => handleSidebarItemClick("SERVICES")}
              >
                <Flex>
                  <FlexItem>
                    <CubeIcon />
                  </FlexItem>
                  <FlexItem>SERVICES</FlexItem>
                </Flex>
              </NavItem>
            </NavList>
          </Nav>
        </div>

        <div className={styles.gnomeLibraryContent}>
          <div className={styles.libraryMainContent}>
            <div className={styles.breadcrumbContainer}>
              <Breadcrumb>
                <BreadcrumbItem
                  key="home"
                  to="/library/home"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/library/home/${username}`);
                  }}
                >
                  <HomeIcon />
                </BreadcrumbItem>
                {computedPath
                  .split("/")
                  .filter(Boolean)
                  .map((segment, index, array) => {
                    const path = "/" + array.slice(0, index + 1).join("/");
                    return (
                      <BreadcrumbItem
                        key={path}
                        to={`/library${path}`}
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/library${path}`);
                        }}
                        isActive={index === array.length - 1}
                      >
                        {segment}
                      </BreadcrumbItem>
                    );
                  })}
              </Breadcrumb>
            </div>

            <div className={styles.fileListContainer}>
              {data && (
                <GnomeLibraryTable
                  data={data}
                  computedPath={computedPath}
                  handleFolderClick={(folderName) => {
                    const newPath = `${computedPath}/${folderName}`;
                    navigate(`/library/${newPath}`);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

export default GnomeLibrary;
