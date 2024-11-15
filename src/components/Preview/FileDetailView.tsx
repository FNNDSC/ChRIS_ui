import type { FeedFile, PACSFile } from "@fnndsc/chrisapi";
import {
  Button,
  Label,
  Text,
  Toolbar,
  ToolbarItem,
  Tooltip,
} from "@patternfly/react-core";
import ResetIcon from "@patternfly/react-icons/dist/esm/icons/history-icon";
import { useQuery } from "@tanstack/react-query";
import { Alert } from "antd";
import * as dcmjs from "dcmjs";
import React, { Fragment, type ReactElement, useCallback } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  type IFileBlob,
  fileViewerMap,
  getFileExtension,
} from "../../api/model";
import { useTypedSelector } from "../../store/hooks";
import { SpinContainer } from "../Common";
import {
  AddIcon,
  BrightnessIcon,
  InfoIcon,
  RotateIcon,
  RulerIcon,
  SearchIcon,
  ZoomIcon,
} from "../Icons";
import { TagInfoModal } from "./HelperComponent";

const ViewerDisplay = React.lazy(() => import("./displays/ViewerDisplay"));

interface AllProps {
  selectedFile?: FeedFile | PACSFile;
  isDicom?: boolean;
  preview: "large" | "small";
  handleNext?: () => void;
  handlePrevious?: () => void;
  gallery?: boolean;
  isPublic?: boolean;
}

export interface ActionState {
  [key: string]: boolean | string;
}

/**
 * List of file extensions of files which should be loaded from the network
 * and given to the viewer component as base64 data instead of as a URI.
 */
const fileTypes = [
  "nii",
  "dcm",
  "fsm",
  "crv",
  "smoothwm",
  "pial",
  "nii.gz",
  "mgz",
];

const FileDetailView = (props: AllProps) => {
  const [tagInfo, setTagInfo] = React.useState<any>();
  const [actionState, setActionState] = React.useState<ActionState>({
    Zoom: false,
    previouslyActive: "",
  });
  const [error, setError] = React.useState("");
  const drawerState = useTypedSelector((state) => state.drawers);

  const handleKeyboardEvents = (event: any) => {
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
  };

  React.useEffect(() => {
    window.addEventListener("keydown", handleKeyboardEvents);

    return () => {
      window.removeEventListener("keydown", handleKeyboardEvents);
    };
  });

  const displayTagInfo = useCallback(async () => {
    try {
      const blob = await selectedFile?.getFileBlob();
      if (!blob) {
        throw new Error("Failed to fetch the file");
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
      throw new Error("Failed to parse the file for DICOM tags");
    }
  }, []);

  const { selectedFile, preview } = props;

  const fetchData = async (selectedFile: FeedFile | PACSFile) => {
    setError("");
    const fileName = selectedFile.data.fname;
    const fileType = getFileExtension(fileName);

    if (props.isPublic && !fileTypes.includes(fileType)) {
      return {
        blob: undefined,
        file: selectedFile,
        fileType,
        url: selectedFile?.collection.items[0].links[0].href, // Corrected semicolon to comma
      };
    }

    try {
      const blob = await selectedFile.getFileBlob();

      return {
        blob,
        file: selectedFile,
        fileType,
        url: "",
      };
    } catch (error: any) {
      setError("Failed to fetch the data for preview");
      throw error;
    }
  };

  const { data, isLoading }: { data?: IFileBlob; isLoading: boolean } =
    useQuery({
      queryKey: ["preview", selectedFile],
      queryFn: () => selectedFile && fetchData(selectedFile),
      enabled: !!selectedFile,
    });

  let viewerName = "";

  if (data?.fileType) {
    const { fileType } = data;
    if (!fileViewerMap[fileType]) {
      viewerName = "TextDisplay";
    } else {
      viewerName = fileViewerMap[fileType];
    }
  }

  const handleEvents = (action: string, previouslyActive: string) => {
    if (action === "TagInfo" && data) {
      displayTagInfo();
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
            : "Oh snap ! Looks like there was an error. Please refresh the browser or try again."}
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

            {isLoading && (
              <SpinContainer title="Please wait as the file is being fetched..." />
            )}

            {error && <Alert closable type="error" description={error} />}

            {data && (
              <ViewerDisplay
                preview={preview}
                viewerName={viewerName}
                fileItem={data}
                actionState={actionState}
              />
            )}
          </div>

          <TagInfoModal
            handleModalToggle={(actionState, toolState) => {
              const previouslyActive = Object.keys(actionState)[0];
              handleModalToggle(actionState, toolState, previouslyActive);
            }}
            isModalOpen={actionState.TagInfo as boolean}
            output={tagInfo}
            parsingError={error}
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
              icon={action.icon}
              onClick={(ev) => {
                const previouslyActive = Object.keys(actionState)[0];
                ev.preventDefault();
                handleEvents(action.name, previouslyActive);
              }}
            />
          </Tooltip>
        </ToolbarItem>
      );
    });

  return <Toolbar className="centered-container">{appLauncherItems}</Toolbar>;
};
