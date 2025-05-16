import { Button, Divider, Flex, FlexItem } from "@patternfly/react-core";
import { useContext } from "react";
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

type Props = {
  origin: OriginState;
  computedPath?: string;
  folderList?: FileBrowserFolderList;
};

const GnomeBulkActionBar = ({ origin, computedPath, folderList }: Props) => {
  const { isDarkTheme } = useContext(ThemeContext);
  const selectedPaths = useAppSelector((s) => s.cart.selectedPaths);

  const { modalState, handleModalSubmitMutation, handleOperations } =
    useFolderOperations(origin, computedPath, folderList, false);

  if (selectedPaths.length === 0) return null;

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

  const handleTag = () => {
    handleOperations("tag");
  };

  const handleRename = () => {
    handleOperations("rename");
  };

  const handleDelete = () => {
    handleOperations("delete");
  };

  const handleClearSelection = () => {
    // dispatch(clearSelection());
  };

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
        style={{
          position: "fixed",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          background: isDarkTheme ? "#141414" : "white",
          padding: "10px 20px",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
          zIndex: 1000,
        }}
      >
        <Flex
          alignItems={{ default: "alignItemsCenter" }}
          gap={{ default: "gapMd" }}
        >
          <FlexItem>
            <span style={{ fontWeight: 600 }}>
              {selectedPaths.length} items selected
            </span>
          </FlexItem>

          <FlexItem>
            <Flex gap={{ default: "gapSm" }}>
              <FlexItem>
                <Button
                  variant="primary"
                  icon={<CodeBranchIcon />}
                  onClick={handleCreateFeed}
                >
                  Create Feed
                </Button>
              </FlexItem>

              <FlexItem>
                <Button
                  variant="primary"
                  icon={<DownloadIcon />}
                  onClick={handleDownload}
                >
                  Download
                </Button>
              </FlexItem>

              <FlexItem>
                <Button
                  variant="primary"
                  icon={<ArchiveIcon />}
                  onClick={handleAnonymize}
                >
                  Anonymize
                </Button>
              </FlexItem>
            </Flex>
          </FlexItem>

          <Divider orientation={{ default: "vertical" }} />

          <FlexItem>
            <Flex gap={{ default: "gapSm" }}>
              <FlexItem>
                <Button
                  variant="plain"
                  aria-label="Share"
                  onClick={handleShare}
                >
                  <ShareIcon />
                </Button>
              </FlexItem>

              <FlexItem>
                <Button
                  variant="plain"
                  aria-label="Rename"
                  onClick={handleRename}
                >
                  <EditIcon />
                </Button>
              </FlexItem>

              <FlexItem>
                <Button
                  variant="plain"
                  aria-label="Delete"
                  onClick={handleDelete}
                >
                  <TrashIcon />
                </Button>
              </FlexItem>
            </Flex>
          </FlexItem>

          <FlexItem>
            <Button variant="secondary" onClick={handleClearSelection}>
              Clear Selection
            </Button>
          </FlexItem>
        </Flex>
      </div>
    </>
  );
};

export default GnomeBulkActionBar;
