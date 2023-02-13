import React, { useCallback, useContext, useEffect, useState } from "react";
import { Card, CardActions, CardBody, CardHeader, Drawer, CardTitle, Chip, DrawerActions, DrawerCloseButton, DrawerContent, DrawerContentBody, DrawerHead, DrawerPanelBody, DrawerPanelContent, Grid, GridItem, Tooltip, Button } from "@patternfly/react-core";
import { CreateFeedContext } from "./context";
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
import { FileList } from "./helperComponents";
import { Types } from "./types/feed";

const ChooseConfig = ({ handleFileUpload, user, inputChange, deleteInput, pluginName, dropdownInput, selectedComputeEnv, setComputeEnviroment, requiredInput, allRequiredFieldsNotEmpty }: chooseConfigProps) => {
  const { state, dispatch } = useContext(CreateFeedContext);
  const { selectedConfig, selectedPlugin } = state
  const { isDataSelected, localFiles, chrisFiles } = state.data;
  const { onNext, onBack } = useContext(WizardContext)
  const [isRightDrawerExpand, setRightDrawerExpand] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCard, setSelectedCard] = useState("");
  const [showDragAndDrop, setShowDragAndDrop] = useState(false)
  const handleClick = useCallback((event: React.MouseEvent, selectedPluginId = "") => {
    const selectedCard = selectedPluginId == "" ? event.currentTarget.id : selectedPluginId;
    setSelectedCard(selectedCard)
    if (selectedCard == "swift_storage" || selectedCard == "fs_plugin") {
      setRightDrawerExpand(true)
    }else if(selectedCard == "local_select"){
      setShowDragAndDrop(true)
    }
  }, [])

  const handleKeyDown = useCallback((e: any) => {
    if (e.target.closest('INPUT.required-params__textInput')) return;
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
        if (allRequiredFieldsNotEmpty) return;
        else { onNext() }
        break;
      case "ArrowLeft":
        onBack()
        break;
      default:
        break;
    }

  }, [allRequiredFieldsNotEmpty, handleClick, onBack, onNext])

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

  const reset = () => {
    dispatch({
      type: Types.SelectPlugin,
      payload: {
        undefined
      },
    });
    dispatch({
      type: Types.SelectedConfig,
      payload:{
       selectedConfig: state.selectedConfig.filter((value) => value !== "fs_plugin")
      }
     })
  }

  const navigationButtonStyle = {
    display: "flex", width:"100%", justifyContent:"flex-end", gap:"2px", marginTop:"10px"
  }

  const panelContent = (selectedCard == "swift_storage") ? (
    <DrawerPanelContent defaultSize="65%" >
      <DrawerHead>
        <span tabIndex={isRightDrawerExpand ? 0 : -1}  >
        </span>
        <DrawerActions>
          <DrawerCloseButton onClick={onCloseClick} />
        </DrawerActions>
      </DrawerHead>
      <DrawerPanelBody >
        {user && user.username && (<ChrisFileSelect username={user.username} />)}
        <Grid style={navigationButtonStyle}>
        <Button onClick={() => onCloseClick()} isDisabled={chrisFiles.length <= 0}>
            Done
        </Button>
        </Grid>
      </DrawerPanelBody>
    </DrawerPanelContent>
  ) : (selectedCard == "fs_plugin") ? (
    <DrawerPanelContent defaultSize="65%">
      <DrawerHead>
        <span tabIndex={isRightDrawerExpand ? 0 : -1}  >
        </span>
        <DrawerActions>
          <DrawerCloseButton onClick={onCloseClick} />
        </DrawerActions>
      </DrawerHead>
      <DrawerPanelBody>

        <Steps current={currentStep} items={items} />
        <Grid style={{ marginTop: "1rem" }} >
          {steps[currentStep].content}
        </Grid>
        <Grid  style={navigationButtonStyle}>
          {currentStep == 0 && (
          <Button onClick={() => reset()} isDisabled={selectedPlugin == undefined}>
            Reset
          </Button>
          )}
          {currentStep == 0 && (
          <Button onClick={() => next()} isDisabled={selectedPlugin == undefined}>
            Next
          </Button>
          )}
          {currentStep > 0 && (
          <Button onClick={() => prev()}>
            Previous
          </Button>
         )}
          {currentStep > 0 && (
          <Button onClick={() => onCloseClick()} isDisabled={!allRequiredFieldsNotEmpty}>
            Done
          </Button>
         )}
         </Grid>
      </DrawerPanelBody>
    </DrawerPanelContent>
  ) : null

  const fileList =
    chrisFiles.length > 0
      ? chrisFiles.map((file: string, index: number) => (
        <React.Fragment key={index}>
          <FileList file={file} index={index} />
        </React.Fragment>
      ))
      : null

   useEffect(() => {
    const drawerPanel = document.querySelectorAll<HTMLElement>('.pf-c-drawer__panel')[0];
    const footer = document.querySelectorAll<HTMLElement>('.pf-c-wizard__footer')[0]
        if(isRightDrawerExpand && drawerPanel && footer){
          drawerPanel.style.zIndex = "1000";
          footer.style.zIndex = "-1"
        }else if(drawerPanel && footer){
          drawerPanel.style.zIndex = "";
          footer.style.zIndex = ""
        }
   }, [isRightDrawerExpand])

   useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])


   return (
    <Drawer isExpanded={isRightDrawerExpand} position="right"  >
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
                  isSelected={selectedConfig.includes('fs_plugin')}
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
                  isSelected={selectedConfig.includes('swift_storage')}
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
                {!showDragAndDrop ? <Card
                  id="local_select"
                  isSelectableRaised
                  hasSelectableInput
                  isDisabledRaised={isDataSelected}
                  style={cardContainerStyle}
                  onClick={handleClick}
                  isSelected={selectedConfig.includes('local_select')}
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
              <GridItem xl2={4} md={4} xl={4} sm={12}>
                {selectedPlugin &&
                <>
                <h1>Selected Plugin:</h1>
                 <p>{selectedPlugin.data.title}</p>
                </>
                }
              </GridItem>
              <GridItem xl2={4} md={4} xl={4} sm={12}>
                {chrisFiles.length > 0 &&
                  <>
                    <h1>Files to add to new analysis:</h1>
                    <div className="file-list">
                      {fileList}
                    </div>
                  </>
                }
              </GridItem>
              <GridItem xl2={4} md={4} xl={4} sm={12}>
                {localFiles.length > 0 ? <LocalFileUpload setShowDragAndDrop={setShowDragAndDrop} /> : null}
              </GridItem>
            </Grid>
          </div>
        </DrawerContentBody>
      </DrawerContent>
    </Drawer>
  )
}

export default ChooseConfig;
