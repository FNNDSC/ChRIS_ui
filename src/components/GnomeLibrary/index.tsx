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

  const { pathname } = useLocation();
  const navigate = useNavigate();
  const username = useAppSelector((state) => state.user.username);

  const decodedPath = decodeURIComponent(pathname);
  const currentPathSplit = decodedPath.split("/library/")[1];
  const computedPath = currentPathSplit || `/home/${username}`;

  // fetch folders, files, link files
  const queryKey = ["library_folders", computedPath, pageNumber];
  const { data, isFetching } = useQuery({
    queryKey: queryKey,
    queryFn: () => fetchFolders(computedPath, pageNumber),
    structuralSharing: true,
  });

  // Determine if there's more data to fetch
  const fetchMore =
    data?.foldersPagination?.hasNextPage ||
    data?.filesPagination?.hasNextPage ||
    data?.linksPagination?.hasNextPage;

  // Handle pagination
  const handlePagination = useCallback(() => {
    setPageNumber((prevState) => prevState + 1);
  }, []);

  // Navigate to a folder when clicked
  const handleFolderClick = useCallback(
    (folderName: string) => {
      const newPath = `${computedPath}/${folderName}`;
      navigate(`/library/${newPath}`);
    },
    [computedPath, navigate],
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
      navigate(`/library/home/${username}`);
    } else {
      navigate(`/library/${item}`);
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
                username={username}
                activeSidebarItem={activeSidebarItem}
                onPathChange={(newPath) => navigate(`/library/${newPath}`)}
                origin={{
                  type: OperationContext.LIBRARY,
                  additionalKeys: [computedPath],
                }}
                computedPath={computedPath}
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
