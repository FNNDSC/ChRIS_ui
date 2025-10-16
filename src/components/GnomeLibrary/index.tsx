import type { ThunkModuleToFunc, UseThunk } from "@chhsiao1981/use-thunk";
import type { FileBrowserFolder } from "@fnndsc/chrisapi";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type * as DoUI from "../../reducers/ui";
import { useAppSelector } from "../../store/hooks";
import { EmptyStateComponent, InfoSection, SpinContainer } from "../Common";
import { OperationContext, OperationsProvider } from "../NewLibrary/context";
import Wrapper from "../Wrapper";
import GnomeCentralBreadcrumb from "./GnomeCentralBreadcrumb";
import GnomeLibraryTable from "./GnomeList";
import GnomeLibrarySidebar from "./GnomeSidebar";
import styles from "./gnome.module.css";
import useFolders from "./utils/hooks/useFolders";

type TDoUI = ThunkModuleToFunc<typeof DoUI>;

type Props = {
  useUI: UseThunk<DoUI.State, TDoUI>;
};

export default (props: Props) => {
  const { useUI } = props;
  const [activeSidebarItem, setActiveSidebarItem] = useState<string>("home");
  const [pageNumber, setPageNumber] = useState(1);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const { pathname } = useLocation();
  const navigate = useNavigate();
  const location = useLocation();
  const username = useAppSelector((state) => state.user.username);
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

  const handleSidebarItemClick = (item: string) => {
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
        titleComponent={
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
            handleSidebarItemClick={handleSidebarItemClick}
            origin={{
              type: OperationContext.LIBRARY,
              additionalKeys: [computedPath],
            }}
            foldersList={data?.folderList}
          />

          <div className={styles.gnomeLibraryContent}>
            <div className={styles.libraryMainContent}>
              <GnomeCentralBreadcrumb
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
