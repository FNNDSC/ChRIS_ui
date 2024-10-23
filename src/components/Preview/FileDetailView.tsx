import type { FileBrowserFolderFile, PACSFile } from "@fnndsc/chrisapi";
import {
  Button,
  Label,
  Text,
  Toolbar,
  ToolbarItem,
  Tooltip,
} from "@patternfly/react-core";
import ResetIcon from "@patternfly/react-icons/dist/esm/icons/history-icon";
import { useMutation } from "@tanstack/react-query";
import * as dcmjs from "dcmjs";
import React, {
  Fragment,
  useCallback,
  useEffect,
  useState,
  type ReactElement,
} from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  type IFileBlob,
  fileViewerMap,
  getFileExtension,
} from "../../api/model";
import { useAppSelector } from "../../store/hooks";
import { SpinContainer } from "../Common";
import {
  AddIcon,
  BrightnessIcon,
  InfoIcon,
  PauseIcon,
  PlayIcon,
  RotateIcon,
  RulerIcon,
  SearchIcon,
  ZoomIcon,
} from "../Icons"; // Import PlayIcon
import { TagInfoModal } from "./HelperComponent";

const ViewerDisplay = React.lazy(() => import("./displays/ViewerDisplay"));

interface AllProps {
  selectedFile?: FileBrowserFolderFile | PACSFile;
  isDicom?: boolean;
  preview: "large" | "small";
  handleNext?: () => void;
  handlePrevious?: () => void;
  gallery?: boolean;
  // These props enable pagination and fetch on scroll
  list?: IFileBlob[];
  fetchMore?: boolean;
  handlePagination?: () => void;
  filesLoading?: boolean;
}

export interface ActionState {
  [key: string]: boolean | string;
}

const FileDetailView = (props: AllProps) => {
  const [tagInfo, setTagInfo] = useState<any>();
  const [actionState, setActionState] = useState<ActionState>({
    Zoom: false,
    previouslyActive: "",
  });
  const [parsingError, setParsingError] = useState<string>("");
  const drawerState = useAppSelector((state) => state.drawers);

  const handleKeyboardEvents = useCallback(
    (event: any) => {
      switch (event.keyCode) {
        case 39: {
          event.preventDefault();
          props.handleNext?.();
          break;
        }

        case 37: {
          event.preventDefault();
          props.handlePrevious?.();
          break;
        }

        default:
          break;
      }
    },
    [props],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyboardEvents);

    return () => {
      window.removeEventListener("keydown", handleKeyboardEvents);
    };
  }, [handleKeyboardEvents]);

  const displayTagInfo = useCallback(async () => {
    try {
      const blob = await selectedFile?.getFileBlob();
      if (!blob) {
        setParsingError("Failed to retrieve the file blob");
        return;
      }

      const arrayBuffer = await blob.arrayBuffer();
      const dicomData = dcmjs.data.DicomMessage.readFile(arrayBuffer);
      const dataset = dcmjs.data.DicomMetaDictionary.naturalizeDataset(
        dicomData.dict,
      );
      // Sort the dataset keys alphabetically
      const sortedDataset = Object.keys(dataset)
        .sort()
        .reduce((sortedObj: any, key) => {
          sortedObj[key] = dataset[key];
          return sortedObj;
        }, {});

      setTagInfo(sortedDataset);
    } catch (error) {
      console.error("Error parsing DICOM file:", error);
      setParsingError("Failed to parse the file for DICOM tags");
    }
  }, []);

  const mutation = useMutation({
    mutationFn: displayTagInfo,
    onError: (error: any) => {
      setParsingError(error.message);
    },
  });

  const { selectedFile, preview, fetchMore, handlePagination, filesLoading } =
    props;
  let viewerName = "";
  const fileType = getFileExtension(selectedFile?.data.fname);
  if (fileType) {
    if (!fileViewerMap[fileType]) {
      viewerName = "CatchallDisplay";
    } else {
      viewerName = fileViewerMap[fileType];
    }
  }

  const handleEvents = (action: string, previouslyActive: string) => {
    if (action === "TagInfo" && selectedFile) {
      mutation.mutate();
    }
    const currentAction = actionState[action];
    setActionState({
      [action]: !currentAction,
      previouslyActive,
    });
  };

  const handleModalToggle = (
    actionName: string,
    value: boolean,
    previouslyActive: string,
  ) => {
    setActionState({
      [actionName]: value,
      previouslyActive,
    });
  };

  const previewType = preview === "large" ? "large-preview" : "small-preview";

  const errorComponent = (error?: string) => (
    <span>
      <Label
        icon={<InfoIcon className="pf-v5-svg" />}
        color="red"
        href="#filled"
      >
        <Text component="p">
          {error
            ? error
            : "Oh snap! Looks like there was an error. Please refresh the browser or try again."}
        </Text>
      </Label>
    </span>
  );

  const fullScreen = drawerState.preview.maximized === true;

  return (
    <Fragment>
      <React.Suspense fallback={<SpinContainer title="" />}>
        <ErrorBoundary fallback={errorComponent()}>
          <div className={previewType}>
            {previewType === "large-preview" && (
              <DicomHeader
                viewerName={viewerName}
                handleEvents={handleEvents}
                fullScreen={fullScreen}
                actionState={actionState}
              />
            )}

            {selectedFile && (
              <ViewerDisplay
                preview={preview}
                viewerName={viewerName}
                actionState={actionState}
                selectedFile={selectedFile}
                // Optional for dicom scrolling
                list={props.list}
                fetchMore={fetchMore}
                handlePagination={handlePagination}
                filesLoading={filesLoading}
              />
            )}
          </div>

          <TagInfoModal
            isDrawer={true}
            handleModalToggle={(actionState, toolState) => {
              const previouslyActive = Object.keys(actionState)[0];
              handleModalToggle(actionState, toolState, previouslyActive);
            }}
            isModalOpen={actionState.TagInfo as boolean}
            output={tagInfo}
            parsingError={parsingError}
          />
        </ErrorBoundary>
      </React.Suspense>
    </Fragment>
  );
};

export default FileDetailView;

const actions = [
  {
    name: "Zoom",
    icon: <ZoomIcon />,
  },
  {
    name: "Pan",
    icon: <SearchIcon />,
  },
  {
    name: "Magnify",
    icon: (
      // We could be using a better icon here.
      <AddIcon />
    ),
  },
  {
    name: "PlanarRotate",
    icon: <RotateIcon />,
  },
  {
    name: "WindowLevel",
    icon: <BrightnessIcon />,
  },
  {
    name: "Reset",
    icon: <ResetIcon />,
  },
  {
    name: "Length",
    icon: <RulerIcon />,
  },
  {
    name: "TagInfo",
    icon: <InfoIcon />,
  },
  {
    name: "Play",
    icon: <PlayIcon />, // Add Play icon
  },
];

const getViewerSpecificActions: {
  [key: string]: { name: string; icon: ReactElement }[];
} = {
  DcmDisplay: actions,
  NiftiDisplay: actions,
  ImageDisplay: actions,
};

export const DicomHeader = ({
  handleEvents,
  viewerName,
  fullScreen,
  actionState,
}: {
  viewerName: string;
  handleEvents: (action: string, previouslyActive: string) => void;
  fullScreen: boolean;
  actionState: ActionState;
}) => {
  const specificActions = getViewerSpecificActions[viewerName];

  const appLauncherItems =
    specificActions &&
    specificActions.length > 0 &&
    specificActions.map((action) => {
      const spacer: {
        xl?: "spacerLg";
        lg?: "spacerLg";
        md?: "spacerMd";
        sm?: "spacerSm";
      } = {
        xl: "spacerLg",
        lg: "spacerLg",
        md: "spacerMd",
        sm: "spacerSm",
      };

      // Dynamically set the icon for Play/Pause button
      let icon = action.icon;
      if (action.name === "Play") {
        icon = actionState.Play ? <PauseIcon /> : <PlayIcon />;
      }

      return (
        <ToolbarItem spacer={spacer} key={action.name}>
          <Tooltip content={<span>{action.name}</span>}>
            <Button
              className={`${
                fullScreen ? "large-button" : "small-button"
              } button-style`}
              variant={
                actionState[action.name] === true ? "primary" : "control"
              }
              size="sm"
              icon={icon}
              onClick={(ev) => {
                const previouslyActive = Object.keys(actionState)[0];
                ev.preventDefault();
                handleEvents(action.name, previouslyActive);
              }}
              aria-label={action.name}
            />
          </Tooltip>
        </ToolbarItem>
      );
    });

  return <Toolbar className="centered-container">{appLauncherItems}</Toolbar>;
};
