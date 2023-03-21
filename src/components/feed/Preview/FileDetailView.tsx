import React, { Fragment } from "react";

import {
  Label,
  Text,
  ApplicationLauncher,
  ApplicationLauncherItem,
  DropdownPosition,
  Tooltip,
} from "@patternfly/react-core";
import { ErrorBoundary } from "react-error-boundary";
import { FeedFile } from "@fnndsc/chrisapi";
import {
  MdZoomIn,
  MdOutlinePanTool,
  MdRotate90DegreesCcw,
  MdSettingsBrightness,
  MdOutlineRotate90DegreesCcw,
  MdQueuePlayNext,
  MdInfo,
  MdDraw,
} from "react-icons/md";
import { AiFillInfoCircle, AiOutlineMenuUnfold } from "react-icons/ai";
import { getFileExtension } from "../../../api/models/file-explorer.model";
import {
  IFileBlob,
  fileViewerMap,
} from "../../../api/models/file-viewer.model";
import { SpinContainer } from "../../common/loading/LoadingContent";
import { ButtonContainer } from "../../detailedView/displays/DicomViewer/utils/helpers";

const ViewerDisplay = React.lazy(() => import("./displays/ViewerDisplay"));

interface AllProps {
  selectedFile?: FeedFile;
  isDicom?: boolean;
  preview: "large" | "small";
}

export interface ActionState {
  [key: string]: boolean;
}

function getInitialState() {
  return {
    blob: undefined,
    file: undefined,
    fileType: "",
  };
}

const FileDetailView = (props: AllProps) => {
  const [fileState, setFileState] = React.useState<IFileBlob>(getInitialState);

  const [actionState, setActionState] = React.useState<ActionState>({});

  const handleEvents = (action: string) => {
    const currentAction = actionState[action];
    setActionState({
      [action]: !currentAction,
    });
  };
  const { selectedFile, preview } = props;
  const { fileType } = fileState;

  const fetchData = React.useCallback(async () => {
    if (selectedFile) {
      const fileName = selectedFile.data.fname,
        fileType = getFileExtension(fileName);
      const blob = await selectedFile.getFileBlob();
      setFileState((fileState) => {
        return {
          ...fileState,
          blob,
          file: selectedFile,
          fileType,
        };
      });
    }
  }, [selectedFile]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  let viewerName = "";

  if (!fileViewerMap[fileType]) {
    viewerName = "IframeDisplay";
  } else {
    viewerName = fileViewerMap[fileType];
  }

  return (
    <Fragment>
      <React.Suspense
        fallback={
          <SpinContainer title="Please wait as the preview is being fetched" />
        }
      >
        <ErrorBoundary
          fallback={
            <span>
              <Label icon={<AiFillInfoCircle />} color="red" href="#filled">
                <Text component="p">
                  Oh snap ! Looks like there was an error. Please refresh the
                  browser or try again.
                </Text>
              </Label>
            </span>
          }
        >
          <div className={preview === "large" ? "small-preview" : ""}>
            <DicomHeader handleEvents={handleEvents} />
            <ViewerDisplay
              preview={preview}
              viewerName={viewerName}
              fileItem={fileState}
              actionState={actionState}
            />
          </div>
        </ErrorBoundary>
      </React.Suspense>
    </Fragment>
  );
};

export default FileDetailView;

const actions = [
  {
    name: "Zoom",
    icon: <MdZoomIn />,
  },
  {
    name: "Pan",
    icon: <MdOutlinePanTool />,
  },
  {
    name: "Magnify",
    icon: <MdZoomIn />,
  },
  {
    name: "Rotate",
    icon: <MdRotate90DegreesCcw />,
  },
  {
    name: "Wwwc",
    icon: <MdSettingsBrightness />,
  },
  {
    name: "Reset View",
    icon: <MdOutlineRotate90DegreesCcw />,
  },
  {
    name: "Length",
    icon: <MdDraw />,
  },
  {
    name: "Gallery",
    icon: <MdQueuePlayNext />,
  },
  {
    name: "TagInfo",
    icon: <MdInfo />,
  },
];

export const DicomHeader = ({
  handleEvents,
}: {
  handleEvents: (action: string) => void;
}) => {
  const [isOpen, setIsOpen] = React.useState(true);
  const appLauncherItems = actions.map((action) => {
    return (
      <ApplicationLauncherItem
        component={
          <ButtonContainer
            action={action.name}
            icon={action.icon}
            handleEvents={handleEvents}
          />
        }
        key={action.name}
      />
    );
  });

  return (
    <div>
      <ApplicationLauncher
        toggleIcon={
          <Tooltip
            position="left"
            content={<span>Open Tooling For Dicoms</span>}
          >
            <AiOutlineMenuUnfold
              style={{
                width: "24px",
                height: "24px",
              }}
            />
          </Tooltip>
        }
        style={{
          position: "absolute",
          top: "1.5em",
          right: "0",
          zIndex: "9999",
          color: "black",
        }}
        onToggle={() => setIsOpen(!isOpen)}
        items={appLauncherItems}
        isOpen={isOpen}
        position={DropdownPosition.right}
      />
    </div>
  );
};
