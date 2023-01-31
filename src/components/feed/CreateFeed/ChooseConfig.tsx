import React, { useCallback, useContext, useEffect, useState } from "react";
import { Card, CardActions, CardBody, CardHeader, Drawer, CardTitle, Chip, DrawerActions, DrawerCloseButton, DrawerContent, DrawerContentBody, DrawerHead, DrawerPanelBody, DrawerPanelContent, Grid, GridItem, Tooltip } from "@patternfly/react-core";
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
const ChooseConfig = ({ handleFileUpload, user, inputChange, deleteInput, pluginName, dropdownInput, selectedComputeEnv, setComputeEnviroment, requiredInput, allRequiredFieldsNotEmpty}: chooseConfigProps) => {
  const { state, dispatch } = useContext(CreateFeedContext);
  const { selectedConfig } = state
  const { isDataSelected, localFiles } = state.data;
  const { onNext, onBack } = useContext(WizardContext)
  const [isbottomDrawerExpand, setBottomDrawerExpand] = useState<boolean>(false);
  const handleClick = useCallback((event: React.MouseEvent, selectedPluginId = "") => {
    dispatch({
      type: Types.SelectedConfig,
      payload: {
        selectedConfig: selectedPluginId == "" ? event.currentTarget.id : selectedPluginId,
      },
    })
  }, [dispatch])

  const handleKeyDown = useCallback((e: any) => {
    switch (e.code) {
      case "KeyG":
        if (selectedConfig != "fs_plugin") handleClick(e, "fs_plugin")
        break;
      case "KeyU":
        if (selectedConfig != "local_select") handleClick(e, "local_select");
        break;
      case "KeyF":
        if (selectedConfig != "swift_storage") handleClick(e, "swift_storage")
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

  }, [selectedConfig, handleClick, allRequiredFieldsNotEmpty, onBack, onNext])

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
    height: "100%"
  }

  const cardHeaderStyle: any = {
    display: "flex",
    width: "100%",
    justifyContent: 'flex-end'
  }

  const panelContent = (selectedConfig == "swift_storage") ? (

    <DrawerPanelContent>
      <DrawerHead>
        <span tabIndex={isbottomDrawerExpand ? 0 : -1}  >
        </span>
        <DrawerActions>
          <DrawerCloseButton onClick={onCloseClick} />
        </DrawerActions>
      </DrawerHead>
      <DrawerPanelBody>
        {user && user.username && (<ChrisFileSelect username={user.username} />)}
      </DrawerPanelBody>
    </DrawerPanelContent>
  ) :  (selectedConfig == "fs_plugin")? (
    <DrawerPanelContent >
      <DrawerHead>
        <span tabIndex={isbottomDrawerExpand ? 0 : -1}  >
        </span>
        <DrawerActions>
          <DrawerCloseButton onClick={onCloseClick} />
        </DrawerActions>
      </DrawerHead>
      <DrawerPanelBody>
        <Grid>
          <GridItem >
            <DataPacks />
          </GridItem>
          <GridItem >
            <GuidedConfig
              defaultValueDisplay={false}
              renderComputeEnv={true}
              inputChange={inputChange}
              deleteInput={deleteInput}
              pluginName={pluginName}
              dropdownInput={dropdownInput}
              requiredInput={requiredInput}
              selectedComputeEnv={selectedComputeEnv}
              setComputeEnviroment={setComputeEnviroment}
            />
          </GridItem>
        </Grid>
      </DrawerPanelBody>
    </DrawerPanelContent>
  ): null

  useEffect(() => {
    if (selectedConfig == "swift_storage" || selectedConfig == "fs_plugin") {
      setBottomDrawerExpand(true)
    }
  }, [selectedConfig])


  return (
    <Drawer isExpanded={isbottomDrawerExpand} position="right" >
      <DrawerContent panelContent={panelContent}>
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
