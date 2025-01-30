import type React from "react";
import { useCallback, useContext, useEffect, useRef } from "react";
import { Card, CardBody, Button } from "@patternfly/react-core";
import { Types } from "../CreateFeed/types/feed";
import { CreateFeedContext } from "../CreateFeed/context";
import "./DragFileUpload.css";

/**
 * Inline styling to match other cards in ChooseConfig
 * You can move these to CSS if desired.
 */
const cardContainerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  height: "100%",
  textAlign: "center",
  border: "0.2px solid #D3D3D3",
  alignItems: "center",
  justifyContent: "center",
};

interface DragAndUploadProps {
  handleLocalUploadFiles: (files: File[]) => void;
}

const DragAndUpload: React.FC<DragAndUploadProps> = ({
  handleLocalUploadFiles,
}) => {
  const { state, dispatch } = useContext(CreateFeedContext);

  /**
   * If user unselects all local files, remove "local_select" from selectedConfig
   */
  useEffect(() => {
    if (state.data.localFiles.length === 0) {
      if (state.selectedConfig.includes("local_select")) {
        dispatch({
          type: Types.SelectedConfig,
          payload: {
            selectedConfig: state.selectedConfig.filter(
              (value: string) => value !== "local_select",
            ),
          },
        });
      }
    }
  }, [dispatch, state.data.localFiles.length, state.selectedConfig]);

  // ---- File upload ----
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUploadClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset so the same file can be chosen again
      fileInputRef.current.click();
    }
  }, []);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files) return;
      handleLocalUploadFiles(Array.from(files));
    },
    [handleLocalUploadFiles],
  );

  // ---- Folder upload ----
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleFolderUploadClick = useCallback(() => {
    if (folderInputRef.current) {
      folderInputRef.current.value = ""; // Reset so the same folder can be chosen again
      folderInputRef.current.click();
    }
  }, []);

  const handleFolderChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files) return;
      handleLocalUploadFiles(Array.from(files));
    },
    [handleLocalUploadFiles],
  );

  return (
    <Card
      id="local_select"
      isSelectable
      className="local-upload-card"
      style={cardContainerStyle}
      // If you want to toggle "isSelected" based on your own conditions, you can do:
      isSelected={state.selectedConfig.includes("local_select")}
      onClick={() => {
        // Add "local_select" to the selectedConfig if not already added:
        if (!state.selectedConfig.includes("local_select")) {
          dispatch({
            type: Types.SelectedConfig,
            payload: {
              selectedConfig: [...state.selectedConfig, "local_select"],
            },
          });
        }
      }}
    >
      <CardBody>
        <p>Select files or an entire folder from your local system.</p>

        <div className="button-group" style={{ marginTop: "1rem" }}>
          <Button
            variant="secondary"
            onClick={(e) => {
              // Stop the card's onClick from triggering
              e.stopPropagation();
              handleFileUploadClick();
            }}
            style={{ marginRight: "0.5rem" }}
          >
            Upload a File
          </Button>
          <input
            ref={fileInputRef}
            style={{ display: "none" }}
            type="file"
            multiple
            onChange={handleFileChange}
          />

          <Button
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              handleFolderUploadClick();
            }}
          >
            Upload a Folder
          </Button>
          <input
            ref={folderInputRef}
            style={{ display: "none" }}
            type="file"
            multiple
            // The attributes below allow folder selection in Chromium
            //@ts-ignore
            webkitdirectory="true"
            directory="true"
            onChange={handleFolderChange}
          />
        </div>
      </CardBody>
    </Card>
  );
};

export default DragAndUpload;
