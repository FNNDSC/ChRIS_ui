import React, { Fragment, ReactElement, useCallback } from "react";
import * as dicomParser from "dicom-parser";
import {
  Label,
  Text,
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
  Button,
  Tooltip,
  Toolbar,
  ToolbarItem,
} from "@patternfly/react-core";
import { useQuery } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import FaChevronLeft from "@patternfly/react-icons/dist/esm/icons/chevron-left-icon";
import FaChevronRight from "@patternfly/react-icons/dist/esm/icons/chevron-right-icon";
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
import EllipsisVIcon from "@patternfly/react-icons/dist/esm/icons/ellipsis-v-icon";
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

function getInitialState() {
  return {
    blob: undefined,
    file: undefined,
    fileType: "",
  };
}

const FileDetailView = (props: AllProps) => {
  const [fileState, setFileState] = React.useState<IFileBlob>(getInitialState);
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
        console.log("Error", error);
      }
    };

    if (result) {
      reader.readAsArrayBuffer(result);
    }
  }, []);

  const handleEvents = (action: string) => {
    if (action === "TagInfo") {
      displayTagInfo(fileState.blob);
    }
    const currentAction = actionState[action];
    setActionState({
      [action]: !currentAction,
    });
  };
  const { selectedFile, preview } = props;
  const { fileType } = fileState;

  const fetchData = async (selectedFile: FeedFile) => {
    const fileName = selectedFile.data.fname;
    const fileType = getFileExtension(fileName);
    try {
      const blob = await selectedFile.getFileBlob();
      setFileState((fileState) => {
        return {
          ...fileState,
          blob,
          file: selectedFile,
          fileType,
        };
      });
    } catch (error: any) {
      const errorMessage = error.response || error.message;
      setError(errorMessage);
    }
  };

  const { isLoading } = useQuery({
    queryKey: ["preview"],
    queryFn: () => selectedFile && fetchData(selectedFile),
    enabled: !!selectedFile,
  });

  let viewerName = "";

  if (!fileViewerMap[fileType]) {
    viewerName = "TextDisplay";
  } else {
    viewerName = fileViewerMap[fileType];
  }

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
            {props.gallery && (
              <div
                style={{
                  width: "100%",
                  zIndex: 999,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <FaChevronLeft onClick={props.handlePrevious} />
                <FaChevronRight onClick={props.handleNext} />
              </div>
            )}

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

            <ViewerDisplay
              preview={preview}
              viewerName={viewerName}
              fileItem={fileState}
              actionState={actionState}
            />
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
  const [isOpen, setIsOpen] = React.useState(false);

  const specificActions = getViewerSpecificActions[viewerName];

  const appLauncherItems =
    specificActions && specificActions.length > 0
      ? specificActions.map((action) => {
          if (fullScreen) {
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
                    className="button-style"
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
          } else {
            return (
              <DropdownItem
                icon={action.icon}
                key={action.name}
                onClick={(ev) => {
                  ev.preventDefault();
                  handleEvents(action.name);
                }}
              >
                {action.name}
              </DropdownItem>
            );
          }
        })
      : [
          <DropdownItem key="No tools">
            No tools for this file type
          </DropdownItem>,
        ];

  return fullScreen ? (
    <Toolbar className="centered-container">{appLauncherItems}</Toolbar>
  ) : (
    <Dropdown
      toggle={(toggleRef: React.Ref<MenuToggleElement>) => {
        return (
          <MenuToggle
            style={{
              paddingLeft: "0px",
            }}
            aria-label="Kebab dropdown toggle"
            onClick={() => setIsOpen(!isOpen)}
            isExpanded={isOpen}
            variant="plain"
            ref={toggleRef}
          >
            <EllipsisVIcon />
          </MenuToggle>
        );
      }}
      style={{
        position: "absolute",
        right: "var(--pf-global--spacer--md)",
        marginRight: "-0.6rem",
        zIndex: "9999",
        marginBottom: "0.5rem",
      }}
      onOpenChange={() => setIsOpen(!isOpen)}
      onSelect={() => setIsOpen(!isOpen)}
      isOpen={isOpen}
      shouldFocusToggleOnSelect
    >
      <DropdownList>{appLauncherItems}</DropdownList>
    </Dropdown>
  );
};
