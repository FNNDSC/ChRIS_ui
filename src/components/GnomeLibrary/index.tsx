import {
  getState,
  type ThunkModuleToFunc,
  type UseThunk,
} from "@chhsiao1981/use-thunk";
import type { FileBrowserFolder } from "@fnndsc/chrisapi";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type * as DoDrawer from "../../reducers/drawer";
import type * as DoFeed from "../../reducers/feed";
import type * as DoUI from "../../reducers/ui";
import * as DoUser from "../../reducers/user";
import { EmptyStateComponent, InfoSection, SpinContainer } from "../Common";
import { OperationContext, OperationsProvider } from "../NewLibrary/context";
import Wrapper from "../Wrapper";
import GnomeCentralBreadcrumb from "./GnomeCentralBreadcrumb";
import GnomeLibraryTable from "./GnomeList";
import GnomeLibrarySidebar from "./GnomeSidebar";
import styles from "./gnome.module.css";
import useFolders from "./utils/hooks/useFolders";

type TDoDrawer = ThunkModuleToFunc<typeof DoDrawer>;
type TDoUI = ThunkModuleToFunc<typeof DoUI>;
type TDoUser = ThunkModuleToFunc<typeof DoUser>;
type TDoFeed = ThunkModuleToFunc<typeof DoFeed>;

type Props = {
  useUI: UseThunk<DoUI.State, TDoUI>;
  useUser: UseThunk<DoUser.State, TDoUser>;
  useDrawer: UseThunk<DoDrawer.State, TDoDrawer>;
  useFeed: UseThunk<DoFeed.State, TDoFeed>;
};

export default (props: Props) => {
  const { useUI, useUser, useDrawer, useFeed } = props;
  const [classStateUser, _] = useUser;
  const user = getState(classStateUser) || DoUser.defaultState;
  const { username } = user;

  const [activeSidebarItem, setActiveSidebarItem] = useState<string>("home");
  const [pageNumber, setPageNumber] = useState(1);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const { pathname } = useLocation();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  // Get selectedFolder ID from navigation state if passed
  const selectedFolderId = location.state?.selectedFolderId as
    | number
    | undefined;

  // Retrieve the folder object from React Query cache if we have an ID
  const selectedFolder = selectedFolderId
    ? queryClient.getQueryData<FileBrowserFolder>(["folder", selectedFolderId])
    : undefined;

  const decodedPath = decodeURIComponent(pathname);
  const currentPathSplit = decodedPath.split("/library/")[1];
  const computedPath = currentPathSplit || `/home/${username}`;

  // Reset pagination state when path changes
  useEffect(() => {
    if (computedPath) {
      setPageNumber(1);
    }
  }, [computedPath]);

  // fetch folders, files, link files using the optimized hook
  const { data, isFetching } = useFolders(
    computedPath,
    pageNumber,
    selectedFolder,
  );

  // Determine if there's more data to fetch
  const fetchMore =
    data?.foldersPagination?.hasNextPage ||
    data?.filesPagination?.hasNextPage ||
    data?.linksPagination?.hasNextPage;

  /**
   * Handles infinite scroll pagination
   * Keeps placeholder data visible while fetching more items
   */
  const handlePagination = useCallback(() => {
    setPageNumber((prevState) => prevState + 1);
  }, []);

  /**
   * Handles navigation to a different path
   * Clears placeholder data to show loading state immediately
   */
  const navigateToPath = useCallback(
    (path: string, folder?: FileBrowserFolder) => {
      navigate(`/library/${path}`, {
        state: folder ? { selectedFolderId: folder.data.id } : {},
      });
    },
    [navigate],
  );

  // Navigate to a folder when clicked
  const handleFolderClick = useCallback(
    (folder: FileBrowserFolder) => {
      // Cache the folder object in React Query cache
      queryClient.setQueryData(["folder", folder.data.id], folder);

      // Extract folder name from path
      const folderName = folder.data.path.split("/").pop() || "";
      const newPath = `${computedPath}/${folderName}`;
      navigateToPath(newPath, folder);
    },
    [computedPath, navigateToPath, queryClient],
  );

  useEffect(() => {
    if (isFirstLoad && pathname === "/library") {
      // Navigate to the home folder on the first render
      navigate(`/library/home/${username}`, { replace: true });
      setIsFirstLoad(false);
    }
  }, [isFirstLoad, pathname, username, navigate]);

  const onSidebarItemClick = (item: string) => {
    setActiveSidebarItem(item);
    if (item === "home") {
      navigateToPath(`home/${username}`);
    } else {
      navigateToPath(item);
    }
  };

  // Calculate total resources count with memoization
  const totalResources = useMemo(() => {
    if (!data) return 0;

    return (
      (data.folders?.length || 0) +
      (data.files?.length || 0) +
      (data.linkFiles?.length || 0)
    );
  }, [data]);

  // Resource count label text - also memoized to avoid recalculation
  const resourceLabelText = useMemo(() => {
    if (isFetching) return "Calculating...";

    return `${totalResources} ${totalResources === 1 ? "resource" : "resources"} retrieved`;
  }, [isFetching, totalResources]);

  return (
    <OperationsProvider>
      <Wrapper
        useUI={useUI}
        useUser={useUser}
        useDrawer={useDrawer}
        useFeed={useFeed}
        title={
          <InfoSection
            title="Library"
            content={
              <>
                The Library provides a card-focused mechanism for browsing,
                viewing, and interacting with data in the ChRIS system.
              </>
            }
          />
        }
      >
        <div className={styles.gnomeLibraryContainer}>
          <GnomeLibrarySidebar
            activeSidebarItem={activeSidebarItem}
            computedPath={computedPath}
            handleSidebarItemClick={onSidebarItemClick}
            origin={{
              type: OperationContext.LIBRARY,
              additionalKeys: [computedPath],
            }}
            foldersList={data?.folderList}
          />

          <div className={styles.gnomeLibraryContent}>
            <div className={styles.libraryMainContent}>
              <GnomeCentralBreadcrumb
                username={username}
                path={computedPath}
                onPathChange={navigateToPath}
                origin={{
                  type: OperationContext.LIBRARY,
                  additionalKeys: [computedPath],
                }}
                foldersList={data?.folderList}
              />

              <div className={styles.fileListContainer}>
                {isFetching && !data ? (
                  <SpinContainer title="Loading library items..." />
                ) : data &&
                  data.folders.length === 0 &&
                  data.files.length === 0 &&
                  data.linkFiles.length === 0 ? (
                  <EmptyStateComponent title="This folder is empty" />
                ) : (
                  data && (
                    <GnomeLibraryTable
                      data={data}
                      computedPath={computedPath}
                      handleFolderClick={handleFolderClick}
                      fetchMore={fetchMore}
                      handlePagination={handlePagination}
                      filesLoading={isFetching}
                      useUser={useUser}
                    />
                  )
                )}
              </div>
            </div>
          </div>

          {/* Resource count label - always visible */}
          <div className={styles.resourceCountContainer}>
            <span
              className={`${styles.resourceCount} ${isFetching ? styles.calculating : ""}`}
            >
              {resourceLabelText}
            </span>
          </div>
        </div>
      </Wrapper>
    </OperationsProvider>
  );
};
