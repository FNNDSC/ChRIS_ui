import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";
import { EmptyStateComponent, SpinContainer } from "../Common";
import { OperationContext, OperationsProvider } from "../NewLibrary/context";
import Wrapper from "../Wrapper";
import GnomeCentralBreadcrumb from "./GnomeCentralBreadcrumb";
import GnomeLibraryTable from "./GnomeList";
import GnomeLibrarySidebar from "./GnomeSidebar";
import styles from "./gnome.module.css";
import { fetchFolders } from "./utils/hooks/useFolders";

const GnomeLibrary = () => {
  const [activeSidebarItem, setActiveSidebarItem] = useState<string>("home");
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [isPaginating, setIsPaginating] = useState(false);

  const { pathname } = useLocation();
  const navigate = useNavigate();
  const username = useAppSelector((state) => state.user.username);

  const decodedPath = decodeURIComponent(pathname);
  const currentPathSplit = decodedPath.split("/library/")[1];
  const computedPath = currentPathSplit || `/home/${username}`;

  // Reset pagination state when path changes
  useEffect(() => {
    if (computedPath) {
      setPageNumber(1);
      setIsPaginating(false);
    }
  }, [computedPath]);

  // fetch folders, files, link files
  const queryKey = ["library_folders", computedPath, pageNumber];
  const { data, isFetching } = useQuery({
    queryKey: queryKey,
    queryFn: () => fetchFolders(computedPath, pageNumber),
    placeholderData: isPaginating ? keepPreviousData : undefined,
    structuralSharing: true,
  });

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
    setIsPaginating(true);
    setPageNumber((prevState) => prevState + 1);
  }, []);

  /**
   * Handles navigation to a different path
   * Clears placeholder data to show loading state immediately
   */
  const navigateToPath = useCallback(
    (path: string) => {
      setIsPaginating(false);
      navigate(`/library/${path}`);
    },
    [navigate],
  );

  // Navigate to a folder when clicked
  const handleFolderClick = useCallback(
    (folderName: string) => {
      const newPath = `${computedPath}/${folderName}`;
      navigateToPath(newPath);
    },
    [computedPath, navigateToPath],
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

  return (
    <OperationsProvider>
      <Wrapper>
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
                      filesLoading={isFetching && pageNumber > 1}
                    />
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </Wrapper>
    </OperationsProvider>
  );
};

export default GnomeLibrary;
