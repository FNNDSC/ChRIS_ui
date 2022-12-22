import React, { useContext } from "react";
import { Card, CardBody, CardHeader, CardTitle, Grid, GridItem } from "@patternfly/react-core";
import { CreateFeedContext } from "./context";
import { Types } from "./types/feed";
import { FaUpload } from "react-icons/fa";
import { BiCloudUpload } from "react-icons/bi";
import { MdSettings } from "react-icons/md";
import { WizardContextConsumer } from "@patternfly/react-core";


const ChooseConfig: React.FC = () => {
  const { state, dispatch } = useContext(CreateFeedContext);
  const { selectedConfig } = state
  const { isDataSelected } = state.data;


  const handleClick = (event: React.MouseEvent) => {
    dispatch({
      type: Types.SelectedConfig,
      payload: {
        selectedConfig: event.currentTarget.id,
      },
    });
  }

  const handleKeyDown = (e: any, next: () => void, prev: () => void) => {
    if (e.code == "Enter") {
       if (selectedConfig != e.currentTarget.id) handleClick(e)
    } else if (selectedConfig && e.code == "ArrowRight") {
      e.preventDefault()
      next()
    } else if (e.code == "ArrowLeft") {
      e.preventDefault()

      prev()
    }
  }
  const style: any = {
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "center",
    textAlign: "center"
  }
  return (
    <WizardContextConsumer>
      {({
        onNext,
        onBack
      }: {
        onNext: any;
        onBack: any;
      }) => (
        <div className="local-file-upload">
          <h1 className="pf-c-title pf-m-2xl">Analysis Type Selection</h1>
          <br />
          <p>
            {isDataSelected
              ? "Creating analysis from selected files."
              : "You may create the analysis in one of the following ways:"}
          </p>
          <br />
          <Grid hasGutter span={4}>
            <GridItem >
              <Card
                id="fs_plugin"
                isSelectableRaised
                isDisabledRaised={isDataSelected}
                hasSelectableInput
                style={style}
                onClick={handleClick}
                onKeyDown={(e) => handleKeyDown(e, onNext, onBack)}
                isSelected={selectedConfig === 'fs_plugin'}
              >
                <CardHeader><MdSettings size="40px" /></CardHeader>
                <CardTitle>Generate Data</CardTitle>
                <CardBody>Generate files from running an FS plugin from this ChRIS server</CardBody>
              </Card>
            </GridItem>
            <GridItem>
              <Card
                id="swift_storage"
                isSelectableRaised
                hasSelectableInput
                isDisabledRaised={isDataSelected}
                style={style}
                onKeyDown={(e) => handleKeyDown(e, onNext, onBack)}
                onClick={handleClick}
                isSelected={selectedConfig === 'swift_storage'}
              >
                <CardHeader><BiCloudUpload size="40px" /></CardHeader>
                <CardTitle>Get Data from ChRIS</CardTitle>
                <CardBody>Choose existing files already registered to ChRIS</CardBody>
              </Card>
            </GridItem>
            <GridItem>
              <Card
                id="local_select"
                isSelectableRaised
                hasSelectableInput
                isDisabledRaised={isDataSelected}
                style={style}
                onClick={handleClick}
                onKeyDown={(e) => handleKeyDown(e, onNext, onBack)}
                isSelected={selectedConfig === 'local_select'}
              >
                <CardHeader><FaUpload size="40px" /></CardHeader>
                <CardTitle>Upload New Data</CardTitle>
                <CardBody>Upload new files from your local computer</CardBody>
              </Card>
            </GridItem>

          </Grid>
        </div>)}
    </WizardContextConsumer>

  );
};

export default ChooseConfig;
