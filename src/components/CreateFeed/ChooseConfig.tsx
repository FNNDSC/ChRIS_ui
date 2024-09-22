import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Chip,
  Drawer,
  DrawerActions,
  DrawerContent,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Tooltip,
  useWizardContext,
} from "@patternfly/react-core";
import { Alert, Steps, notification } from "../Antd";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { useAppSelector } from "../../store/hooks";
import GuidedConfig from "../AddNode/GuidedConfig";
import { AddNodeContext } from "../AddNode/context";
import {
  Types as AddNodeTypes,
  type chooseConfigProps,
} from "../AddNode/types";
import DragAndUpload from "../DragFileUpload";
import { SettingsIcon, DeleteIcon as TrashIcon, UploadIcon } from "../Icons";
import ChrisFileSelect from "./ChrisFileSelect";
import DataPacks from "./DataPacks";
import { FileList } from "./HelperComponent";
import LocalFileUpload from "./LocalFileUpload";
import { CreateFeedContext } from "./context";
import { Types } from "./types/feed";

const ChooseConfig = ({
  handleFileUpload,
  user,
  showAlert,
}: chooseConfigProps) => {
  const { state, dispatch } = useContext(CreateFeedContext);
  const { dispatch: nodeDispatch } = useContext(AddNodeContext);
  const { state: addNodeState } = useContext(AddNodeContext);
  const { selectedConfig } = state;
  const { pluginMeta, requiredInput } = addNodeState;
  const { isDataSelected, localFiles, chrisFiles } = state.data;
  const { goToNextStep: onNext, goToPrevStep: onBack } = useWizardContext();
  const [isRightDrawerExpand, setRightDrawerExpand] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState(0);
  const params = useAppSelector((state) => state.plugin.parameters);
  const [selectedCard, setSelectedCard] = useState("");
  const [showDragAndDrop, setShowDragAndDrop] = useState(false);

  const handleClick = useCallback(
    (event: React.MouseEvent, selectedPluginId = "") => {
      const selectedCard =
        selectedPluginId === "" ? event.currentTarget.id : selectedPluginId;
      setSelectedCard(selectedCard);
      if (selectedCard === "swift_storage" || selectedCard === "fs_plugin") {
        setRightDrawerExpand(true);
      } else if (selectedCard === "local_select") {
        setShowDragAndDrop(true);
      }
    },
    [],
  );

  const handleKeyDown = useCallback(
    (e: any) => {
      if (e.target.closest("INPUT")) return;
      switch (e.code) {
        case "KeyG":
          handleClick(e, "fs_plugin");
          break;
        case "KeyU":
          handleClick(e, "local_select");
          break;
        case "KeyF":
          handleClick(e, "swift_storage");
          break;
        case "ArrowRight":
          if (
            selectedConfig.includes("fs_plugin") &&
            params?.required.length !== Object.keys(requiredInput).length
          ) {
            return;
          }

          onNext();
          break;
        case "ArrowLeft":
          onBack();
          break;
        default:
          break;
      }
    },
    [
      handleClick,
      onBack,
      onNext,
      params?.required.length,
      requiredInput,
      selectedConfig,
    ],
  );

  const onCloseClick = () => {
    setRightDrawerExpand(false);
  };
  const cardContainerStyle: any = {
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "center",
    textAlign: "center",
    height: "100%",
    border: "0.2px solid #D3D3D3",
  };

  const cardHeaderStyle: any = {
    display: "flex",
    width: "100%",
    justifyContent: "flex-end",
  };

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };
  const steps = [
    {
      title: "Choose Plugin",
      content: <DataPacks next={nextStep} />,
    },
    {
      title: "Configure Plugin",
      content: <GuidedConfig />,
    },
  ];

  const items = steps.map((item) => ({ key: item.title, title: item.title }));
  useEffect(() => {
    if (chrisFiles.length === 0 && selectedConfig.includes("swift_storage")) {
      dispatch({
        type: Types.SelectedConfig,
        payload: {
          selectedConfig: state.selectedConfig.filter(
            (value: string) => value !== "swift_storage",
          ),
        },
      });
    }
  }, [chrisFiles, dispatch, selectedConfig, state.selectedConfig]);

  useEffect(() => {
    if (pluginMeta === undefined && selectedConfig.includes("fs_plugin")) {
      dispatch({
        type: Types.SelectedConfig,
        payload: {
          selectedConfig: state.selectedConfig.filter(
            (value: any) => value !== "fs_plugin",
          ),
        },
      });
    }
  }, [dispatch, pluginMeta, selectedConfig, state.selectedConfig]);

  const resetPlugin = () => {
    notification.info({
      message: "Plugin unselected",
      description: `${pluginMeta?.data.name} unselected`,
      duration: 1,
    });
    nodeDispatch({
      type: AddNodeTypes.SetPluginMeta,
      payload: {
        pluginMeta: undefined,
      },
    });
    nodeDispatch({
      type: AddNodeTypes.DropdownInput,
      payload: {
        input: {},
        editorValue: true,
      },
    });
    nodeDispatch({
      type: AddNodeTypes.RequiredInput,
      payload: {
        input: {},
        editorValue: true,
      },
    });
    setSelectedCard("");
  };

  const resetChRisFiles = () => {
    dispatch({
      type: Types.ResetChrisFile,
    });
    dispatch({
      type: Types.SelectedConfig,
      payload: {
        selectedConfig: state.selectedConfig.filter(
          (value: any) => value !== "swift_storage",
        ),
      },
    });
    setSelectedCard("");
  };

  const navigationButtonStyle = {
    display: "flex",
    width: "100%",
    justifyContent: "flex-end",
    gap: "2px",
    marginTop: "10px",
  };

  const panelContent =
    selectedCard === "swift_storage" ? (
      <DrawerPanelContent
        widths={{ default: "width_50" }}
        className="drawer_panelContent"
      >
        <DrawerHead
          style={{
            padding: "1em",
          }}
        >
          <span tabIndex={isRightDrawerExpand ? 0 : -1} />
          <DrawerActions>
            <Button
              onClick={resetChRisFiles}
              variant="secondary"
              isDisabled={chrisFiles.length === 0}
              style={{
                marginRight: "0.5em",
              }}
            >
              Clear
            </Button>
            <Button onClick={onCloseClick}>Done</Button>
          </DrawerActions>
        </DrawerHead>
        <DrawerPanelBody
          style={{
            padding: "1em",
          }}
        >
          {user?.username && <ChrisFileSelect username={user.username} />}
          <Grid style={navigationButtonStyle} />
        </DrawerPanelBody>
      </DrawerPanelContent>
    ) : selectedCard === "fs_plugin" ? (
      <DrawerPanelContent
        widths={{ default: "width_50" }}
        className="drawer_panelContent"
      >
        <DrawerHead
          style={{
            padding: "1em",
          }}
        >
          <span tabIndex={isRightDrawerExpand ? 0 : -1} />
          <DrawerActions>
            <Button
              onClick={resetPlugin}
              variant="secondary"
              isDisabled={pluginMeta === undefined}
              style={{
                marginRight: "0.5em",
              }}
            >
              Clear
            </Button>
            <Button
              className="done"
              onClick={onCloseClick}
              isDisabled={
                params?.required.length !== Object.keys(requiredInput).length
              }
            >
              Done
            </Button>
          </DrawerActions>
        </DrawerHead>
        <DrawerPanelBody
          style={{
            padding: "1em",
          }}
        >
          <Steps current={currentStep} items={items} />
          <Grid style={{ marginTop: "1rem" }}>
            {steps[currentStep].content}
          </Grid>
          <Grid style={navigationButtonStyle}>
            {currentStep === 0 && (
              <Button
                size="sm"
                onClick={() => nextStep()}
                isDisabled={pluginMeta === undefined}
              >
                Next Page
              </Button>
            )}
            {currentStep > 0 && (
              <Button size="sm" onClick={() => prevStep()}>
                Previous Page
              </Button>
            )}
          </Grid>
        </DrawerPanelBody>
      </DrawerPanelContent>
    ) : null;

  const fileList =
    chrisFiles.length > 0
      ? chrisFiles.map((file: string, index: number) => (
          <React.Fragment key={index}>
            <FileList file={file} index={index} />
          </React.Fragment>
        ))
      : null;

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    if (localFiles.length === 0) {
      setShowDragAndDrop(false);
    }
  }, [localFiles.length]);

  return (
    <Drawer
      style={{
        height: "100vh",
      }}
      isExpanded={isRightDrawerExpand}
      position="right"
    >
      <DrawerContent panelContent={panelContent}>
        <Flex
          className="pf-v5-c-wizard__main-body"
          direction={{ default: "column" }}
          height="100%"
          style={{ padding: "0" }}
        >
          <div className="local-file-upload">
            <h1>Analysis Type Selection</h1>
            <br />
            <p>
              {isDataSelected
                ? "Creating analysis from selected files."
                : "You may create the analysis in one of the following ways:"}
            </p>
            <br />
            <Grid hasGutter md={4}>
              <GridItem>
                <Grid>
                  <GridItem style={{ height: "230px" }}>
                    <Card
                      id="fs_plugin"
                      isSelectable={isDataSelected}
                      style={cardContainerStyle}
                      onClick={handleClick}
                      isSelected={selectedConfig.includes("fs_plugin")}
                    >
                      <CardHeader
                        style={cardHeaderStyle}
                        actions={{
                          actions: (
                            <Tooltip content="Press the G key to select">
                              <Chip key="KeyboardShortcut" isReadOnly>
                                G
                              </Chip>
                            </Tooltip>
                          ),
                        }}
                      />
                      <CardTitle>
                        <SettingsIcon />
                        <br />
                        Generate Data
                      </CardTitle>
                      <CardBody>
                        Generate files from running an FS plugin from this ChRIS
                        server
                      </CardBody>
                    </Card>
                  </GridItem>
                  <GridItem>
                    {pluginMeta && (
                      <>
                        <h1 style={{ marginTop: "1rem" }}>Selected Plugin:</h1>

                        <Flex className="file-preview">
                          <Flex
                            direction={{ default: "column" }}
                            flex={{ default: "flex_1" }}
                          >
                            <p className="file-name">{pluginMeta.data.title}</p>
                          </Flex>

                          <Flex direction={{ default: "column" }}>
                            <FlexItem>
                              <span className="file-icon">
                                <TrashIcon onClick={resetPlugin} />
                              </span>
                            </FlexItem>
                          </Flex>
                        </Flex>
                      </>
                    )}
                  </GridItem>
                </Grid>
              </GridItem>
              <GridItem>
                <Grid>
                  <GridItem style={{ height: "230px" }}>
                    <Card
                      id="swift_storage"
                      isSelectable={isDataSelected}
                      style={cardContainerStyle}
                      onClick={handleClick}
                      isSelected={selectedConfig.includes("swift_storage")}
                    >
                      <CardHeader style={cardHeaderStyle}>
                        <Tooltip content="Press the F key to select">
                          <Chip key="KeyboardShortcut" isReadOnly>
                            F
                          </Chip>
                        </Tooltip>
                      </CardHeader>
                      <CardTitle>
                        <UploadIcon />
                        <br />
                        Fetch Data from ChRIS
                      </CardTitle>
                      <CardBody>
                        Choose existing files already registered to ChRIS
                      </CardBody>
                    </Card>
                  </GridItem>
                  <GridItem rowSpan={6}>
                    {chrisFiles.length > 0 && (
                      <>
                        <h1 style={{ marginTop: "1rem" }}>
                          Files to add to new analysis:
                        </h1>
                        <div className="file-list">{fileList}</div>
                      </>
                    )}
                  </GridItem>
                </Grid>
              </GridItem>
              <GridItem>
                <Grid>
                  <GridItem style={{ height: "230px" }}>
                    {!showDragAndDrop ? (
                      <Card
                        id="local_select"
                        isSelectable={isDataSelected}
                        style={cardContainerStyle}
                        onClick={handleClick}
                        isSelected={selectedConfig.includes("local_select")}
                      >
                        <CardHeader style={cardHeaderStyle}>
                          <Tooltip content="Press the U key to select">
                            <Chip key="KeyboardShortcut" isReadOnly>
                              U
                            </Chip>
                          </Tooltip>
                        </CardHeader>
                        <CardTitle>
                          <UploadIcon />
                          <br />
                          Upload New Data
                        </CardTitle>
                        <CardBody>
                          Upload new files from your local computer
                        </CardBody>
                      </Card>
                    ) : (
                      <DragAndUpload
                        handleLocalUploadFiles={handleFileUpload}
                      />
                    )}
                  </GridItem>
                  <GridItem>
                    {localFiles.length > 0 ? <LocalFileUpload /> : null}
                  </GridItem>
                </Grid>
              </GridItem>
            </Grid>
            {showAlert && (
              <Alert
                style={{
                  marginTop: "1rem",
                }}
                type="info"
                closable
                description="Please select a data source to create a feed"
              />
            )}
          </div>
        </Flex>
      </DrawerContent>
    </Drawer>
  );
};

export default ChooseConfig;
