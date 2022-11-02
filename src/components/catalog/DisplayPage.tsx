import React from "react";
import {
  Pagination,
  Grid,
  Drawer,
  DrawerPanelContent,
  DrawerContent,
  DrawerContentBody,
  DrawerHead,
  DrawerActions,
  DrawerCloseButton,
  Title,
  Divider,
  Button,
  Alert,
  TextInput,

  
} from "@patternfly/react-core";
import { Card, Col, Row } from "antd";
import ReactJSON from "react-json-view";
import { ImTree } from "react-icons/im";
import { GrCloudComputer } from "react-icons/gr";
import { FaCode } from "react-icons/fa";
import Tree from "./Tree";
import { PipelineList } from "@fnndsc/chrisapi";
import ChrisAPIClient from "../../api/chrisapiclient";
import { generatePipelineWithData } from "../feed/CreateFeed/utils/pipelines";
import { EmptyStateTable } from "../common/emptyTable";

interface PageState {
  perPage: number;
  page: number;
  search: string;
  itemCount: number;
}

interface DisplayPageInterface {
  resources?: any[];
  pageState: PageState;
  onPerPageSelect: (_event: any, perPage: number) => void;
  handleFilterChange: (value: string) => void;
  onSetPage: (_event: any, page: number) => void;
  selectedResource: any;
  setSelectedResource: (resource: any) => void;
  title: string;
  showPipelineButton?: boolean;
  fetch?: (id?: number) => void;
  handlePluginSearch?: (search: string) => void;
  handlePipelineSearch?: (search: string) => void;
  handleComputeSearch?: (search: string) => void;
  search: string;
}

const DisplayPage = ({
  resources,
  selectedResource,
  pageState,
  onPerPageSelect,
  onSetPage,
  setSelectedResource,
  title,
  showPipelineButton,
  fetch,
  handlePipelineSearch,
  handleComputeSearch,
  handlePluginSearch,
  search,
}: DisplayPageInterface) => {
  const fileOpen = React.useRef<HTMLInputElement>(null);
  const [error, setError] = React.useState({});
  const [deleteError, setDeleteError] = React.useState("");

  const [warningMessage, setWarningMessage] = React.useState("");
  const { perPage, page, itemCount } = pageState;
  const [isExpanded, setIsExpanded] = React.useState(false);

  const isPlugin = title === "Plugins" ? true : false;
  const isPipeline = title === "Pipelines" ? true : false;
  const isCompute = title === "Compute" ? true : false;

  const iconStyle = {
    fill: isPlugin
      ? "#0066CC"
      : isPipeline
      ? "#1F0066"
      : isCompute
      ? "red"
      : "",
    height: "1.5em",
    width: "1.25em",
    marginRight: "0.5em",
    marginTop: "0.25em",
  };

  const showOpenFile = () => {
    if (fileOpen.current) {
      fileOpen.current.click();
    }
  };

  const cleanUp = (event: any) => {
    event.target.value = null;
    if (fileOpen.current) {
      fileOpen.current.value = "";
    }
  };

  const icon = isPipeline ? (
    <ImTree style={iconStyle} />
  ) : isCompute ? (
    <GrCloudComputer style={iconStyle} />
  ) : (
    <FaCode style={iconStyle} />
  );
  const readFile = (file: any, event: any) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        if (reader.result) {
          const client = ChrisAPIClient.getClient();
          const result = JSON.parse(reader.result as string);
          result["plugin_tree"] = JSON.stringify(result["plugin_tree"]);
          const pipelineInstanceList: PipelineList = await client.getPipelines({
            name: result.name,
          });

          if (pipelineInstanceList.data) {
            setWarningMessage(
              `pipeline with the name ${result.name} already exists`
            );
          } else {
            await generatePipelineWithData(result);
            fetch && fetch();
          }
        }
        cleanUp(event);
      } catch (error) {
        //@ts-ignore
        setError(error.response.data);
        cleanUp(event);
      }
    };
    if (file && file.type === "application/json") {
      try {
        reader.readAsText(file);
      } catch (error) {
        setWarningMessage("The Pipeline upload requires a json file");
      }
    }
  };

  const handleUpload = (event: any) => {
    const file = event.target.files && event.target.files[0];
    readFile(file, event);
    setWarningMessage("");
    setError({});
  };

  const drawerContent = (
    <Grid hasGutter={true}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0.8rem 1rem",
        }}
      >
        <Title
          headingLevel="h2"
          style={{
            minWidth: "5em",
          }}
        >
          {title}
        </Title>

        <div
          style={{
            display: "flex",
            gap: "1rem",
          }}
        >
          {showPipelineButton && (
            <div>
              <Button onClick={showOpenFile}>Upload a Pipeline</Button>
              <input
                ref={fileOpen}
                style={{ display: "none" }}
                type="file"
                onChange={handleUpload}
              />
            </div>
          )}
          <TextInput
            value={search}
            type="text"
            placeholder="Search"
            iconVariant="search"
            aria-label="search"
            onChange={(value: string) => {
              if (isPlugin) {
                handlePluginSearch && handlePluginSearch(value);
              }
              if (isPipeline) {
                handlePipelineSearch && handlePipelineSearch(value);
              }
              if (isCompute) {
                handleComputeSearch && handleComputeSearch(value);
              }
            }}
          />
        </div>
      </div>
      {warningMessage && <Alert variant="danger" title={warningMessage} />}
      {Object.keys(error).length > 0 && (
        <ReactJSON
          name={false}
          displayDataTypes={false}
          src={error}
          displayObjectSize={false}
          collapsed={false}
        />
      )}
      <div className="site-card-wrapper">
        <Row gutter={16}>
          {(resources &&
            resources.length > 0 )?
            (resources.map((resource) => {
              return (
                <Col key={resource.data ? resource.data.id : ""} span={8} lg={8} sm={12} xs={24}>
                  <Card
                    hoverable
                    style={{
                      marginBottom: "1em",
                    }}
                    size="small"
                    onClick={() => {
                      setSelectedResource(resource);
                      setIsExpanded(true);
                      setDeleteError("");
                    }}
                    onKeyDown={(event: any) => {
                      if ([13, 32].includes(event.keyCode)) {
                        setSelectedResource(resource);
                        setIsExpanded(true);
                        setDeleteError("");
                      }
                    }}
                    className="pluginList"
                    title={
                      <>
                        {icon}
                        {resource.data ? resource.data.name : ""}
                      </>
                    }
                    bordered={true}
                  >
                    {isPlugin && (
                      <>
                        <p className="pluginList__version">
                          version: {resource.data.version}
                        </p>
                        <p className="pluginList__authors">
                          {resource.data.authors}
                        </p>
                      </>
                    )}
                    <p className="pluginList__description">
                      {resource.data ? resource.data.description : ""}
                    </p>
                  </Card>
                </Col>
              );
              })):(
                
                <Col offset={8}>
                  <EmptyStateTable
                  cells={[]}
                  rows={[]}
                  caption=""
                  title="No results found"
                  description=""
                  />
              </Col>
  
              )
              }
            </Row>
        
      </div>
    </Grid>
  );

  const handleUpdate = (id: number) => {
    fetch && fetch(id);
  };

  const panelContent = (
    <DrawerPanelContent defaultSize="25%" className="panelcontent">
      <DrawerHead>
        <DrawerActions>
          <DrawerCloseButton
            onClick={() => {
              setIsExpanded(false);
              setDeleteError("");
            }}
          />
        </DrawerActions>
        {selectedResource && (
          <>
            <Title headingLevel="h2">{selectedResource.data.name}</Title>
            <p className="pluginList__authors">
              {selectedResource.data.authors}
            </p>
            {isPlugin && (
              <p className="pluginList__version">
                Public Repo:{" "}
                <a
                  target="_blank"
                  rel="noreferrer"
                  href={selectedResource.data.documentation}
                >
                  {selectedResource.data.documentation}
                </a>
              </p>
            )}
            {deleteError && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                }}
              >
                <Alert variant="danger" title={deleteError} />
                <Button
                  onClick={async () => {
                    selectedResource.put({
                      locked: true,
                    });
                    setDeleteError("");
                  }}
                  variant="link"
                >
                  lock it?
                </Button>
              </div>
            )}
            {showPipelineButton && (
              <Button
                style={{
                  width: "fit-content",
                }}
                onClick={async () => {
                  try {
                    handleUpdate(selectedResource.data.id);
                    selectedResource.delete();
                    setIsExpanded(false);
                  } catch (error) {
                    console.log(error);
                  }
                }}
              >
                Delete Pipeline
              </Button>
            )}

            <Divider
              style={{
                paddingTop: "2em",
              }}
            />
            <p>{selectedResource.data.description}</p>
          </>
        )}
      </DrawerHead>
      <DrawerContentBody >
        {selectedResource && showPipelineButton && (
          <Tree pipelineName={selectedResource.data.name} />
        )}
      </DrawerContentBody>
    </DrawerPanelContent>
  );

  return (
    <>
      <Pagination
        itemCount={itemCount}
        perPage={perPage}
        page={page}
        onSetPage={onSetPage}
        onPerPageSelect={onPerPageSelect}
      />
      <div>
        <Drawer isExpanded={isExpanded} isInline>
          <DrawerContent panelContent={panelContent}>
            <DrawerContentBody>{drawerContent}</DrawerContentBody>
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
};

export default DisplayPage;
