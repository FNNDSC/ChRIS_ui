import React from "react";
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
} from "@patternfly/react-core";
import { ImTree } from "react-icons/im";
import { GrCloudComputer } from "react-icons/gr";
import { FaCode } from "react-icons/fa";

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
}: {
  resources?: any[];
  pageState: PageState;
  onPerPageSelect: (_event: any, perPage: number) => void;
  handleFilterChange: (value: string) => void;
  onSetPage: (_event: any, page: number) => void;
  selectedResource: any;
  setSelectedResource: (resource: any) => void;
  title: string;
}) => {
  const { perPage, page, itemCount } = pageState;
  const [isExpanded, setIsExpanded] = React.useState(false);
  const iconStyle = {
    fill:
      title === "Plugins"
        ? "#0066CC"
        : title === "Pipelines"
        ? "#1F0066"
        : title === "Compute Environments "
        ? "red"
        : "",
    height: "1.25em",
    width: "1.25em",
  };
  const drawerContent = (
    <Grid hasGutter={true}>
      <Title
        style={{
          marginLeft: "1em",
          marginTop: "0.5em",
        }}
        headingLevel="h2"
      >
        {title}
      </Title>
      {resources &&
        resources.length > 0 &&
        resources.map((resource) => {
          return (
            <GridItem lg={2} md={4} sm={2} key={resource.data.id}>
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
                  <CardHeaderMain>
                    {title === "Pipelines" ? (
                      <ImTree style={iconStyle} />
                    ) : title === "Compute Environments" ? (
                      <GrCloudComputer style={iconStyle} />
                    ) : (
                      <FaCode style={iconStyle} />
                    )}
                  </CardHeaderMain>
                </CardHeader>
                <CardTitle>
                  <p className="pluginList__name">{resource.data.name}</p>
                  <p className="pluginList__authors">{resource.data.authors}</p>
                </CardTitle>

                <CardBody>
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
      <Drawer isExpanded={isExpanded}>
        <DrawerContent panelContent={panelContent}>
          <DrawerContentBody>{drawerContent}</DrawerContentBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default DisplayPage;
