import React, {  useCallback, useContext, useEffect } from "react";
import { Card, CardActions, CardBody, CardHeader, CardTitle, Chip, Grid, GridItem, Tooltip } from "@patternfly/react-core";
import { CreateFeedContext } from "./context";
import { Types } from "./types/feed";
import { FaUpload } from "react-icons/fa";
import { BiCloudUpload } from "react-icons/bi";
import { MdSettings } from "react-icons/md";
import { WizardContext } from "@patternfly/react-core/";
import { useDropzone } from "react-dropzone";
import LocalFileUpload from "./LocalFileUpload";
 
const ChooseConfig = ({ handleFileUpload }: { handleFileUpload: (files: any[]) => void }) => {
  const { state, dispatch } = useContext(CreateFeedContext);
  const { selectedConfig } = state
  const { isDataSelected, localFiles } = state.data;
  const { onNext, onBack, activeStep } = useContext(WizardContext)
  const {
    open,
    getInputProps,
     acceptedFiles
  } = useDropzone();
 
  React.useEffect(() => {
       if(activeStep.name == "Local File Upload" && localFiles.length == 0){
        open()
       }
  }, [activeStep.name, localFiles.length, open])
  React.useEffect(() => {
    if (acceptedFiles.length > 0) {
      handleFileUpload(acceptedFiles);
     }
  }, [acceptedFiles, handleFileUpload])

  const handleClick = useCallback((event: React.MouseEvent, selectedPluginId = "") => {
    dispatch({
      type: Types.SelectedConfig,
      payload: {
        selectedConfig: selectedPluginId == "" ? event.currentTarget.id : selectedPluginId,
      },
    });
    if(selectedPluginId == "" && activeStep.name == "Local File Upload"){
      open()
    }

  }, [dispatch, open, activeStep])

  const handleKeyDown = useCallback((e: any) => {

    switch (e.code) {
      case "KeyG":
        if (selectedConfig != "fs_plugin") handleClick(e, "fs_plugin")
        onNext()
        break;
      case "KeyU":
        if (selectedConfig != "local_select") handleClick(e, "local_select");
        (activeStep.name == "Local File Upload")? open(): onNext()
        break;
      case "KeyF":
        if (selectedConfig != "swift_storage") handleClick(e, "swift_storage")
        onNext()
        break;
      case "ArrowRight":
        if (selectedConfig && activeStep.name == "Local File Upload" && localFiles.length < 0) return;
        else {onNext()}
        break;
      case "ArrowLeft":
        onBack()
        break;
      default:
        break;
    }

  }, [selectedConfig, handleClick, onNext, open, onBack, activeStep.name, localFiles.length])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  const cardContainerStyle: any = {
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "center",
    textAlign: "center"
  }

  const cardHeaderStyle: any = {
    display: "flex",
    width: "100%",
    justifyContent: 'flex-end'
  }

  return (
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
        <GridItem >
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
            <CardTitle><MdSettings size="53px" /><br />Generate Data</CardTitle>
            <CardBody>Generate files from running an FS plugin from this ChRIS server</CardBody>
          </Card>
        </GridItem>
        <GridItem>
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
              <BiCloudUpload size="40px" /><br />Fetch Data from ChRIS</CardTitle>
            <CardBody>Choose existing files already registered to ChRIS</CardBody>
          </Card>
        </GridItem>
        <GridItem>
          <Card
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
            <CardTitle><FaUpload size="40px" /><br />Upload New Data</CardTitle>
            <CardBody>Upload new files from your local computer</CardBody>
          </Card>
        </GridItem>
      </Grid>
       <input {...getInputProps()}/>
      <Grid >
        {activeStep.name == "Local File Upload" && <LocalFileUpload />}
      </Grid>
    </div>
  );
};

export default ChooseConfig;
