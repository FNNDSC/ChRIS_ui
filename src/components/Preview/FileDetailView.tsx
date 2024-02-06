import React, { Fragment, ReactElement, useCallback } from "react";
import * as dicomParser from "dicom-parser";
import {
  Label,
  Text,
  Button,
  Tooltip,
  Toolbar,
  ToolbarItem,
} from "@patternfly/react-core";
import { useQuery } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";

import ZoomIcon from "@patternfly/react-icons/dist/esm/icons/search-plus-icon";
import PanIcon from "@patternfly/react-icons/dist/esm/icons/search-icon";
import RotateIcon from "@patternfly/react-icons/dist/esm/icons/sync-alt-icon";
import ResetIcon from "@patternfly/react-icons/dist/esm/icons/history-icon";
import InfoIcon from "@patternfly/react-icons/dist/esm/icons/info-circle-icon";
import {
  PencilIcon,
  LightBulbIcon,
  MagnifyingGlassCircleIcon,
} from "@heroicons/react/24/solid";

import { useTypedSelector } from "../../store/hooks";
import type { FeedFile } from "@fnndsc/chrisapi";
import { getFileExtension } from "../../api/model";
import { IFileBlob, fileViewerMap } from "../../api/model";
import { SpinContainer } from "../Common";
import { TagInfoModal } from "./HelperComponent";
import { dumpDataSet } from "./utils";

const ViewerDisplay = React.lazy(() => import("./displays/ViewerDisplay"));

interface AllProps {
  selectedFile?: FeedFile;
  isDicom?: boolean;
  preview: "large" | "small";
  handleNext?: () => void;
  handlePrevious?: () => void;
  gallery?: boolean;
}

export interface ActionState {
  [key: string]: boolean;
}

const FileDetailView = (props: AllProps) => {
  const [tagInfo, setTagInfo] = React.useState<any>();
  const [actionState, setActionState] = React.useState<ActionState>({});
  const [error, setError] = React.useState(false);
  const drawerState = useTypedSelector((state) => state.drawers);

  const handleKeyboardEvents = (event: any) => {
    switch (event.keyCode) {
      case 39: {
        event.preventDefault();
        props.handleNext && props.handleNext();
        break;
      }

      case 37: {
        event.preventDefault();
        props.handlePrevious && props.handlePrevious();
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

  const displayTagInfo = useCallback((result: any) => {
    const reader = new FileReader();

    reader.onloadend = async () => {
      try {
        if (reader.result) {
          //@ts-ignore
          const byteArray = new Uint8Array(reader.result);
          //@ts-ignore
          const testOutput: any[] = [];
          const output: any[] = [];
          const dataSet = dicomParser.parseDicom(byteArray);
          dumpDataSet(dataSet, output, testOutput);
          const merged = Object.assign({}, ...testOutput);
          setTagInfo(merged);
        }
      } catch (error) {
        return {
          blob: undefined,
          file: undefined,
          fileType: "",
        };
      }
    };

    if (result) {
      reader.readAsArrayBuffer(result);
    }
  }, []);

  const { selectedFile, preview } = props;

  const fetchData = async (selectedFile: FeedFile) => {
    const fileName = selectedFile.data.fname;
    const fileType = getFileExtension(fileName);

    try {
      const blob = await selectedFile.getFileBlob();
      return {
        blob,
        file: selectedFile,
        fileType,
      };
    } catch (error: any) {
      const errorMessage = error.response || error.message;
      setError(errorMessage);
      return {};
    }
  };

  const { data, isLoading }: { data?: IFileBlob; isLoading: boolean } =
    useQuery({
      queryKey: ["preview", selectedFile],
      queryFn: () => selectedFile && fetchData(selectedFile),
      enabled: !!selectedFile,
    });

  let viewerName = "";

  if (data && data.fileType) {
    const { fileType } = data;
    if (!fileViewerMap[fileType]) {
      viewerName = "TextDisplay";
    } else {
      viewerName = fileViewerMap[fileType];
    }
  }

  const handleEvents = (action: string) => {
    if (action === "TagInfo" && data) {
      displayTagInfo(data.blob);
    }
    const currentAction = actionState[action];
    setActionState({
      [action]: !currentAction,
    });
  };

  const handleModalToggle = (actionName: string, value: boolean) => {
    setActionState({
      ...actionState,
      [actionName]: value,
    });
  };

  const previewType = preview === "large" ? "large-preview" : "small-preview";

  const errorComponent = (error?: any) => (
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

  const fullScreen = drawerState["preview"].maximized === true;

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

            {error && <span style={{ color: "red" }}>{error}</span>}

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
            handleModalToggle={handleModalToggle}
            isModalOpen={actionState["TagInfo"]}
            output={tagInfo}
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
    icon: <PanIcon />,
  },
  {
    name: "Magnify",
    icon: (
      <MagnifyingGlassCircleIcon
        height="1em"
        width="1em"
        className="pf-v5-svg"
      />
    ),
  },
  {
    name: "Rotate",
    icon: <RotateIcon />,
  },
  {
    name: "Wwwc",
    icon: <LightBulbIcon className="pf-v5-svg" />,
  },
  {
    name: "Reset View",
    icon: <ResetIcon />,
  },
  {
    name: "Length",
    icon: <PencilIcon className="pf-v5-svg" />,
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
  handleEvents: (action: string) => void;
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
                ev.preventDefault();
                handleEvents(action.name);
              }}
            />
          </Tooltip>
        </ToolbarItem>
      );
    });

  return <Toolbar className="centered-container">{appLauncherItems}</Toolbar>;
};
