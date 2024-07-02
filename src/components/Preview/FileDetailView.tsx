import type { FileBrowserFolderFile } from "@fnndsc/chrisapi";
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
import * as dicomParser from "dicom-parser";
import React, { Fragment, ReactElement, useCallback } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { IFileBlob, fileViewerMap, getFileExtension } from "../../api/model";
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
import { dumpDataSet } from "./displays/dicomUtils/dicomDict";
import ChrisAPIClient from "../../api/chrisapiclient";

const ViewerDisplay = React.lazy(() => import("./displays/ViewerDisplay"));

interface AllProps {
  selectedFile?: FileBrowserFolderFile;
  isDicom?: boolean;
  preview: "large" | "small";
  handleNext?: () => void;
  handlePrevious?: () => void;
  gallery?: boolean;
}

export interface ActionState {
  [key: string]: boolean | string;
}

const FileDetailView = (props: AllProps) => {
  const [tagInfo, setTagInfo] = React.useState<any>();
  const [actionState, setActionState] = React.useState<ActionState>({
    Zoom: false,
    previouslyActive: "",
  });
  const [error, setError] = React.useState("");
  const drawerState = useTypedSelector((state) => state.drawers);
  const feed = useTypedSelector((state) => state.feed.currentFeed.data);

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

  const displayTagInfo = useCallback((fileUrl: string) => {
    const fetchData = async () => {
      try {
        const response = await fetch(fileUrl);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            if (reader.result) {
              const byteArray = new Uint8Array(reader.result as ArrayBuffer);
              const testOutput: any[] = [];
              const output: any[] = [];
              const dataSet = dicomParser.parseDicom(byteArray);
              dumpDataSet(dataSet, output, testOutput);
              const merged = Object.assign({}, ...testOutput);
              setTagInfo(merged);
            }
          } catch (error) {
            setError("Failed to parse the file for dicom tags");
          }
        };
        reader.readAsArrayBuffer(blob);
      } catch (error) {
        setError("Failed to fetch the file");
      }
    };

    fetchData();
  }, []);

  const { selectedFile, preview } = props;

  const fetchData = async (selectedFile: FileBrowserFolderFile) => {
    setError("");
    const fileName = selectedFile.data.fname;
    const fileType = getFileExtension(fileName);
    try {
      let url = "";
      if (feed?.data.public) {
        url = selectedFile?.collection.items[0].links[0].href;
      } else {
        // private feed
        const client = ChrisAPIClient.getClient();
        const response = await client.createDownloadToken();
        const token = response.data.token;
        url = `${selectedFile?.collection.items[0].links[0].href}?download_token=${token}`;
      }
      return {
        file: selectedFile,
        fileType,
        url: url,
      };
    } catch (error) {
      setError("Failed to fetch the data for preview");
      throw error;
    }
  };

  const { data, isLoading }: { data?: IFileBlob; isLoading: boolean } =
    useQuery({
      queryKey: ["preview", selectedFile],
      queryFn: () => selectedFile && fetchData(selectedFile),
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
      displayTagInfo(data.url);
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
