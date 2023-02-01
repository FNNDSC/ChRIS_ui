import React, { useCallback, useContext, useEffect, useState } from "react";
import { Card, CardActions, CardBody, CardHeader, Drawer, CardTitle, Chip, DrawerActions, DrawerCloseButton, DrawerContent, DrawerContentBody, DrawerHead, DrawerPanelBody, DrawerPanelContent, Grid, GridItem, Tooltip, Button } from "@patternfly/react-core";
import { CreateFeedContext } from "./context";
import { Types } from "./types/feed";
import { FaUpload } from "react-icons/fa";
import { BiCloudUpload } from "react-icons/bi";
import { MdSettings } from "react-icons/md";
import { WizardContext } from "@patternfly/react-core/";
import LocalFileUpload from "./LocalFileUpload";
import DragAndUpload from "../../common/fileupload";
import ChrisFileSelect from "./ChrisFileSelect";
import DataPacks from "./DataPacks";
import GuidedConfig from "../AddNode/GuidedConfig";
import { chooseConfigProps } from "../AddNode/types";
import { Steps } from "antd";
const ChooseConfig = ({ handleFileUpload, user, inputChange, deleteInput, pluginName, dropdownInput, selectedComputeEnv, setComputeEnviroment, requiredInput, allRequiredFieldsNotEmpty }: chooseConfigProps) => {
  const { state, dispatch } = useContext(CreateFeedContext);
  const { selectedConfig, selectedPlugin } = state
  const { isDataSelected, localFiles } = state.data;
  const { onNext, onBack } = useContext(WizardContext)
  const [isbottomDrawerExpand, setBottomDrawerExpand] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState(0);

  const handleClick = useCallback((event: React.MouseEvent, selectedPluginId = "") => {
    const selectedPlugin = selectedPluginId == "" ? event.currentTarget.id : selectedPluginId;
    dispatch({
      type: Types.SelectedConfig,
      payload: {
        selectedConfig: selectedPlugin
      },
    })
    if (selectedPlugin == "swift_storage" || selectedPlugin == "fs_plugin") {
      setBottomDrawerExpand(true)
    }
  }, [dispatch])

  const handleKeyDown = useCallback((e: any) => {
    switch (e.code) {
      case "KeyG":
        handleClick(e, "fs_plugin")
        break;
      case "KeyU":
        handleClick(e, "local_select")
        break;
      case "KeyF":
        handleClick(e, "swift_storage")
        break;
      case "ArrowRight":
        if (allRequiredFieldsNotEmpty()) return;
        else { onNext() }
        break;
      case "ArrowLeft":
        onBack()
        break;
      default:
        break;
    }

  }, [allRequiredFieldsNotEmpty, handleClick, onBack, onNext])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])
  const onCloseClick = () => {
    setBottomDrawerExpand(false);
  };
  const cardContainerStyle: any = {
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "center",
    textAlign: "center",
    height: "100%",
    border: "0.2px solid #D3D3D3"
  }

  const cardHeaderStyle: any = {
    display: "flex",
    width: "100%",
    justifyContent: 'flex-end'
  }

  const steps = [
    {
      title: 'Choose Plugin',
      content: <DataPacks />,
    },
    {
      title: 'Configure Plugin',
      content: <GuidedConfig
        defaultValueDisplay={false}
        renderComputeEnv={true}
        inputChange={inputChange}
        deleteInput={deleteInput}
        pluginName={pluginName}
        dropdownInput={dropdownInput}
        requiredInput={requiredInput}
        selectedComputeEnv={selectedComputeEnv}
        setComputeEnviroment={setComputeEnviroment}
      />,
    },
  ];

  const items = steps.map((item) => ({ key: item.title, title: item.title }));
  const next = () => {
    setCurrentStep(currentStep + 1);
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  const panelContent = (selectedConfig == "swift_storage") ? (
    <DrawerPanelContent defaultSize="65%" >
      <DrawerHead>
        <span tabIndex={isbottomDrawerExpand ? 0 : -1}  >
        </span>
        <DrawerActions>
          <DrawerCloseButton onClick={onCloseClick} />
        </DrawerActions>
      </DrawerHead>
      <DrawerPanelBody >
        {user && user.username && (<ChrisFileSelect username={user.username} />)}
      </DrawerPanelBody>
    </DrawerPanelContent>
  ) : (selectedConfig == "fs_plugin") ? (
    <DrawerPanelContent defaultSize="65%">
      <DrawerHead>
        <span tabIndex={isbottomDrawerExpand ? 0 : -1}  >
        </span>
        <DrawerActions>
          <DrawerCloseButton onClick={onCloseClick} />
        </DrawerActions>
      </DrawerHead>
      <DrawerPanelBody>
        <Steps current={currentStep} items={items} />
        <Grid style={{ marginTop: "1rem" }}>
          {steps[currentStep].content}
        </Grid>

        {currentStep == 0 && (
          <Button onClick={() => next()} isDisabled={selectedPlugin == undefined}>
            Next
          </Button>
        )}

        {currentStep > 0 && (
          <Button style={{ marginTop: '1rem' }} onClick={() => prev()}>
            Previous
          </Button>
        )}

      </DrawerPanelBody>
    </DrawerPanelContent>
  ) : null

  return (
    <Drawer isExpanded={isbottomDrawerExpand} position="right"  >
      <DrawerContent panelContent={panelContent} >
        <DrawerContentBody>
          <div className="local-file-upload">
            <h1 className="pf-c-title pf-m-2xl">Analysis Type Selection</h1>
            <br />
            <p>
              {isDataSelected
                ? "Creating analysis from selected files."
                : "You may create the analysis in one of the following ways:"}
            </p>
            <br />
            <Grid hasGutter md={4}>
              <GridItem rowSpan={1}>
                <Card
                  id="fs_plugin"
                  isSelectableRaised
                  isDisabledRaised={isDataSelected}
                  hasSelectableInput
                  style={cardContainerStyle}
                  onClick={handleClick}
                  isSelected={selectedConfig === 'fs_plugin'}
                >
                  <CardHeader style={cardHeaderStyle}>
                    <CardActions >
                      <Tooltip content="Press the G key to select">
                        <Chip key="KeyboardShortcut" isReadOnly>G</Chip>
                      </Tooltip>
                    </CardActions>
                  </CardHeader>
                  <CardTitle><MdSettings size="40" /><br />Generate Data</CardTitle>
                  <CardBody>Generate files from running an FS plugin from this ChRIS server</CardBody>
                </Card>
              </GridItem>
              <GridItem rowSpan={1}>
                <Card
                  id="swift_storage"
                  isSelectableRaised
                  hasSelectableInput
                  isDisabledRaised={isDataSelected}
                  style={cardContainerStyle}
                  onClick={handleClick}
                  isSelected={selectedConfig === 'swift_storage'}
                >

                  <CardHeader style={cardHeaderStyle}>
                    <Tooltip content="Press the F key to select">
                      <Chip key="KeyboardShortcut" isReadOnly>F</Chip>
                    </Tooltip>
                  </CardHeader>
                  <CardTitle>
                    <BiCloudUpload size="40" /><br />Fetch Data from ChRIS</CardTitle>
                  <CardBody>Choose existing files already registered to ChRIS</CardBody>
                </Card>
              </GridItem>
              <GridItem rowSpan={1}>
                {selectedConfig != "local_select" ? <Card
                  id="local_select"
                  isSelectableRaised
                  hasSelectableInput
                  isDisabledRaised={isDataSelected}
                  style={cardContainerStyle}
                  onClick={handleClick}
                  isSelected={selectedConfig === 'local_select'}
                >
                  <CardHeader style={cardHeaderStyle}>
                    <Tooltip content="Press the U key to select">
                      <Chip key="KeyboardShortcut" isReadOnly>U</Chip>
                    </Tooltip>
                  </CardHeader>
                  <CardTitle><FaUpload size="40" /><br />Upload New Data</CardTitle>
                  <CardBody>Upload new files from your local computer</CardBody>
                </Card> :
                  <DragAndUpload handleLocalUploadFiles={handleFileUpload} />}
              </GridItem>
            </Grid>
            <Grid hasGutter span={12}>
              <GridItem>
                {localFiles.length > 0 ? <LocalFileUpload /> : null}
              </GridItem>
            </Grid>
          </div>
        </DrawerContentBody>
      </DrawerContent>
    </Drawer>
  )
}

export default ChooseConfig;
