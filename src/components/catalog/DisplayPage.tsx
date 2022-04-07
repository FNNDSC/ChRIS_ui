import React, { useEffect, useRef } from "react";
import {
  Pagination,
  Card,
  CardTitle,
  CardHeader,
  CardHeaderMain,
  CardBody,
  Grid,
  GridItem,
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
import ReactJSON from "react-json-view";
import { ImTree } from "react-icons/im";
import { GrCloudComputer } from "react-icons/gr";
import { FaCode } from "react-icons/fa";
import Tree from "./Tree";
import { PipelineList } from "@fnndsc/chrisapi";
import ChrisAPIClient from "../../api/chrisapiclient";
import { generatePipelineWithData } from "../feed/CreateFeed/utils/pipelines";


interface PageState {
  perPage: number;
  page: number;
  search: string;
  itemCount: number;
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
}: {
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
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const fileOpen = React.useRef<HTMLInputElement>(null);
  const [error, setError] = React.useState({});
  const [deleteError, setDeleteError] = React.useState("");

  const [warningMessage, setWarningMessage] = React.useState("");
  const { perPage, page, itemCount } = pageState;
  const [isExpanded, setIsExpanded] = React.useState(false);
  useEffect(() => {
    if (isExpanded) {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isExpanded]);

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

  const readFile = (file: any) => {
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
      } catch (error: any) {
        setError(error.response.data);
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
    setError("");
    setWarningMessage("");
    readFile(file);
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
        <Title headingLevel="h2"
          style={{
            minWidth:"5em",
          }}
        >
          {title}
        </Title>

        <div
          style={{
            display: "flex",
            gap:"1rem",
          }}
        >
          {showPipelineButton && (
            <div>
              <Button
                onClick={showOpenFile}
              >
                Upload a Pipeline
              </Button>

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

      {resources &&
        resources.length > 0 &&
        resources.map((resource) => {
          return (
            <GridItem sm={6} md={4} lg={4} key={resource.data.id}>
              <Card
                isSelectable
                isSelected={
                  selectedResource &&
                  selectedResource.data.id === resource.data.id
                }
                onClick={() => {
                  setSelectedResource(resource);
                  setIsExpanded(true);
                }}
                onKeyDown={(event: any) => {
                  if ([13, 32].includes(event.keyCode)) {
                    setSelectedResource(resource);
                    setIsExpanded(true);
                  }
                }}
                className="pluginList"
                key={resource.data.id}
              >
                <CardHeader>
                  <CardHeaderMain></CardHeaderMain>
                </CardHeader>
                <CardTitle>
                  {isPipeline ? (
                    <ImTree style={iconStyle} />
                  ) : isCompute ? (
                    <GrCloudComputer style={iconStyle} />
                  ) : (
                    <FaCode style={iconStyle} />
                  )}
                  {resource.data.name}
                </CardTitle>

                <CardBody>
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
                    {resource.data.description}
                  </p>
                </CardBody>
              </Card>
            </GridItem>
          );
        })}
    </Grid>
  );

  const handleUpdate = (id: number) => {
    fetch && fetch(id);
  };

  const panelContent = (
    <DrawerPanelContent>
      <DrawerHead>
        <DrawerActions>
          <DrawerCloseButton
            onClick={() => {
              setIsExpanded(false);
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
                  if (selectedResource.data.locked === true) {
                    handleUpdate(selectedResource.data.id);
                    selectedResource.delete();
                    setIsExpanded(false);
                  } else {
                    setDeleteError(
                      "Pipeline cannot be deleted as it is not locked"
                    );
                  }
                }}
              >
                Delete a Pipeline
              </Button>
            )}

            <Divider
              style={{
                paddingTop: "2em",
              }}
            />
            <p>{selectedResource.data.description}</p>
            {showPipelineButton && (
              <Tree pipelineName={selectedResource.data.name} />
            )}
          </>
        )}
      </DrawerHead>
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
      <div ref={scrollRef}>
        <Drawer isExpanded={isExpanded}>
          <DrawerContent panelContent={panelContent}>
            <DrawerContentBody>{drawerContent}</DrawerContentBody>
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
};

export default DisplayPage;
