import {
  Badge,
  Button,
  Divider,
  Flex,
  FlexItem,
  Popover,
  Tooltip,
} from "@patternfly/react-core";
import { useContext, useEffect, useRef, useState } from "react";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { ThemeContext } from "../DarkTheme/useTheme";
import {
  useFolderOperations,
  type ModalState,
} from "../NewLibrary/utils/useOperations";
import type { OriginState } from "../NewLibrary/context";
import type { FileBrowserFolderList } from "@fnndsc/chrisapi";
import { AddModal } from "../NewLibrary/components/Operations";
import { TimesIcon, FileIcon, FolderIcon } from "@patternfly/react-icons";
import {
  CodeBranchIcon,
  DownloadIcon,
  ShareIcon,
  EditIcon,
  DeleteIcon,
  ExternalLinkSquareAltIcon,
} from "../Icons";
import styles from "./gnome.module.css";
import { clearAllPaths, clearSelectedPaths } from "../../store/cart/cartSlice";

type Props = {
  origin: OriginState;
  computedPath?: string;
  folderList?: FileBrowserFolderList;
};

const GnomeBulkActionBar = ({ origin, computedPath, folderList }: Props) => {
  const { isDarkTheme } = useContext(ThemeContext);
  const selectedPaths = useAppSelector((s) => s.cart.selectedPaths);
  const [useIconsOnly, setUseIconsOnly] = useState(false);
  const actionBarRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const [isSelectionPopoverOpen, setIsSelectionPopoverOpen] = useState(false);

  const { modalState, handleModalSubmitMutation, handleOperations } =
    useFolderOperations(origin, computedPath, folderList, false);

  useEffect(() => {
    const checkWidth = () => {
      if (actionBarRef.current) {
        const libraryContent = document.querySelector(
          `.${styles.gnomeLibraryContent}`,
        );
        const containerWidth = libraryContent
          ? libraryContent.clientWidth
          : window.innerWidth;

        setUseIconsOnly(containerWidth < 768);
      }
    };

    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  const handleCreateFeed = () => {
    handleOperations("createFeed");
  };

  const handleDownload = () => {
    handleOperations("download");
  };

  const handleShare = () => {
    handleOperations("share");
  };

  const handleRename = () => {
    handleOperations("rename");
  };

  const handleDelete = () => {
    handleOperations("delete");
  };

  const handleClearAllSelections = () => {
    dispatch(clearAllPaths());
  };

  const handleClearPath = (path: string) => {
    // Check if this is the last item before clearing
    const isLastItem = selectedPaths.length === 1;

    // Dispatch the action to clear this path
    dispatch(clearSelectedPaths(path));

    // If it was the last item, also close the popover
    if (isLastItem) {
      setIsSelectionPopoverOpen(false);
    }
  };

  const getFileNameFromPath = (path: string) => {
    return path.split("/").pop() || path;
  };

  // If no items are selected, don’t render the action bar
  if (selectedPaths.length === 0) return null;

  return (
    <>
      <AddModal
        modalState={modalState as ModalState}
        onClose={() => {
          handleModalSubmitMutation.reset();
          modalState.isOpen = false;
        }}
        onSubmit={(input, extra) =>
          handleModalSubmitMutation.mutate({
            inputValue: input,
            additionalValues: extra,
          })
        }
        indicators={{
          isPending: handleModalSubmitMutation.isPending,
          isError: handleModalSubmitMutation.isError,
          error: handleModalSubmitMutation.error,
          clearErrors: () => handleModalSubmitMutation.reset(),
        }}
      />

      <div
        ref={actionBarRef}
        className={`${styles.actionBarContainer} ${
          !isDarkTheme ? styles.actionBarContainerLight : ""
        }`}
      >
        <Flex
          alignItems={{ default: "alignItemsCenter" }}
          gap={{ default: "gapMd" }}
          justifyContent={{ default: "justifyContentCenter" }}
        >
          {/* Selection Counter + “Clear All” */}
          <FlexItem>
            <div className={styles.selectionCounter}>
              <Popover
                position="bottom"
                triggerAction="click"
                appendTo={document.body}
                isVisible={isSelectionPopoverOpen}
                shouldClose={(_, hide) => {
                  setIsSelectionPopoverOpen(false);
                  hide?.();
                }}
                hasAutoWidth
                minWidth="150px"
                maxWidth="300px"
                zIndex={9999}
                hideOnOutsideClick
                hasNoPadding
                flipBehavior={["bottom", "top"]}
                distance={25}
                className={styles.selectionPopover}
                bodyContent={
                  <div className={styles.selectionList}>
                    {selectedPaths.map(({ path, type }) => (
                      <div key={path} className={styles.selectionItem}>
                        <span className={styles.selectionItemType}>
                          {type === "folder" ? (
                            <FolderIcon />
                          ) : type === "link" ? (
                            <ExternalLinkSquareAltIcon />
                          ) : (
                            <FileIcon />
                          )}
                        </span>
                        <span className={styles.selectionItemName} title={path}>
                          {getFileNameFromPath(path)}
                        </span>
                        <Button
                          variant="plain"
                          onClick={() => handleClearPath(path)}
                          aria-label="Remove"
                        >
                          <TimesIcon />
                        </Button>
                      </div>
                    ))}
                  </div>
                }
              >
                <div
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent event bubbling
                    // Toggle popover only when badge is explicitly clicked
                    setIsSelectionPopoverOpen(!isSelectionPopoverOpen);
                  }}
                  onKeyDown={(e) => {
                    // Handle keyboard accessibility
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setIsSelectionPopoverOpen(!isSelectionPopoverOpen);
                    }
                  }}
                  className={styles.selectionCountClickable}
                >
                  <Badge isRead>{selectedPaths.length}</Badge> selected
                </div>
              </Popover>
              <Button
                variant="plain"
                icon={<TimesIcon />}
                onClick={handleClearAllSelections}
                className={styles.clearSelectionButton}
                aria-label="Clear all selections"
              />
            </div>
          </FlexItem>

          <Divider orientation={{ default: "vertical" }} />

          {/* Bulk Actions: Create Feed / Download */}
          <FlexItem>
            <Flex gap={{ default: "gapSm" }}>
              <FlexItem>
                {useIconsOnly ? (
                  <Tooltip content="Create Feed">
                    <Button
                      variant="primary"
                      aria-label="Create Feed"
                      onClick={handleCreateFeed}
                    >
                      <CodeBranchIcon />
                    </Button>
                  </Tooltip>
                ) : (
                  <Button
                    variant="primary"
                    icon={<CodeBranchIcon />}
                    onClick={handleCreateFeed}
                  >
                    Create Feed
                  </Button>
                )}
              </FlexItem>

              <FlexItem>
                {useIconsOnly ? (
                  <Tooltip content="Download">
                    <Button
                      variant="primary"
                      aria-label="Download"
                      onClick={handleDownload}
                    >
                      <DownloadIcon />
                    </Button>
                  </Tooltip>
                ) : (
                  <Button
                    variant="primary"
                    icon={<DownloadIcon />}
                    onClick={handleDownload}
                  >
                    Download
                  </Button>
                )}
              </FlexItem>
            </Flex>
          </FlexItem>

          <Divider orientation={{ default: "vertical" }} />

          {/* Secondary Actions: Share / Rename / Delete */}
          <FlexItem>
            <Flex gap={{ default: "gapSm" }}>
              <FlexItem>
                <Tooltip content="Share">
                  <Button
                    variant="plain"
                    aria-label="Share"
                    onClick={handleShare}
                  >
                    <ShareIcon />
                  </Button>
                </Tooltip>
              </FlexItem>

              <FlexItem>
                <Tooltip content="Rename">
                  <Button
                    variant="plain"
                    aria-label="Rename"
                    onClick={handleRename}
                  >
                    <EditIcon />
                  </Button>
                </Tooltip>
              </FlexItem>

              <FlexItem>
                <Tooltip content="Delete">
                  <Button
                    variant="plain"
                    aria-label="Delete"
                    onClick={handleDelete}
                  >
                    <DeleteIcon />
                  </Button>
                </Tooltip>
              </FlexItem>
            </Flex>
          </FlexItem>
        </Flex>
      </div>
    </>
  );
};

export default GnomeBulkActionBar;
