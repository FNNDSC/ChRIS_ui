import {
  Button,
  Divider,
  Flex,
  FlexItem,
  Tooltip,
} from "@patternfly/react-core";
import { useContext, useEffect, useRef, useState } from "react";
import { useAppSelector } from "../../store/hooks";
import { ThemeContext } from "../DarkTheme/useTheme";
import {
  useFolderOperations,
  type ModalState,
} from "../NewLibrary/utils/useOperations";
import type { OriginState } from "../NewLibrary/context";
import type { FileBrowserFolderList } from "@fnndsc/chrisapi";
import { AddModal } from "../NewLibrary/components/Operations";
import {
  CodeBranchIcon,
  DownloadIcon,
  ArchiveIcon,
  ShareIcon,
  EditIcon,
  TrashIcon,
} from "@patternfly/react-icons";
import styles from "./gnome.module.css";

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

  const { modalState, handleModalSubmitMutation, handleOperations } =
    useFolderOperations(origin, computedPath, folderList, false);

  // Check available width and adjust display mode
  useEffect(() => {
    const checkWidth = () => {
      if (actionBarRef.current) {
        // Get the gnomeLibraryContent width as our reference
        const libraryContent = document.querySelector(
          `.${styles.gnomeLibraryContent}`,
        );
        const containerWidth = libraryContent
          ? libraryContent.clientWidth
          : window.innerWidth;

        // Use icons only when container width is below 768px
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

  const handleAnonymize = () => {
    handleOperations("anonymize");
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

  // If no items are selected, return null (but after all hooks are called)
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
        className={`${styles.actionBarContainer} ${!isDarkTheme ? styles.actionBarContainerLight : ""}`}
      >
        <Flex
          alignItems={{ default: "alignItemsCenter" }}
          gap={{ default: "gapMd" }}
          justifyContent={{ default: "justifyContentCenter" }}
        >
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

              <FlexItem>
                {useIconsOnly ? (
                  <Tooltip content="Anonymize">
                    <Button
                      variant="primary"
                      aria-label="Anonymize"
                      onClick={handleAnonymize}
                    >
                      <ArchiveIcon />
                    </Button>
                  </Tooltip>
                ) : (
                  <Button
                    variant="primary"
                    icon={<ArchiveIcon />}
                    onClick={handleAnonymize}
                  >
                    Anonymize
                  </Button>
                )}
              </FlexItem>
            </Flex>
          </FlexItem>

          <Divider orientation={{ default: "vertical" }} />

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
                    <TrashIcon />
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
