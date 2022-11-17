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
  TextInput,
} from "@patternfly/react-core";
import { Card, Col, Row } from "antd";
import { GrCloudComputer } from "react-icons/gr";
import { FaCode } from "react-icons/fa";
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
  handleComputeSearch,
  handlePluginSearch,
  search,
}: DisplayPageInterface) => {
  const { perPage, page, itemCount } = pageState;
  const [isExpanded, setIsExpanded] = React.useState(false);

  const isPlugin = title === "Plugins" ? true : false;
  const isCompute = title === "Compute" ? true : false;

  const iconStyle = {
    fill: isPlugin ? "#0066CC" : isCompute ? "red" : "",
    height: "1.5em",
    width: "1.25em",
    marginRight: "0.5em",
    marginTop: "0.25em",
  };

  const icon = isCompute ? (
    <GrCloudComputer style={iconStyle} />
  ) : (
    <FaCode style={iconStyle} />
  );

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

              if (isCompute) {
                handleComputeSearch && handleComputeSearch(value);
              }
            }}
          />
        </div>
      </div>

      <div className="site-card-wrapper">
        <Row gutter={16}>
          {resources && resources.length > 0 ? (
            resources.map((resource) => {
              return (
                <Col
                  key={resource.data ? resource.data.id : ""}
                  span={8}
                  lg={8}
                  sm={12}
                  xs={24}
                >
                  <Card
                    hoverable
                    style={{
                      marginBottom: "1em",
                    }}
                    size="small"
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
            })
          ) : (
            <Col offset={8}>
              <EmptyStateTable
                cells={[]}
                rows={[]}
                caption=""
                title="No results found"
                description=""
              />
            </Col>
          )}
        </Row>
      </div>
    </Grid>
  );

  const panelContent = (
    <DrawerPanelContent defaultSize="25%" className="panelcontent">
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

            <Divider
              style={{
                paddingTop: "2em",
              }}
            />
            <p>{selectedResource.data.description}</p>
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
