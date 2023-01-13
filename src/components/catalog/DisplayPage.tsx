import React from "react";
import { PluginMeta } from "@fnndsc/chrisapi";
import { Pagination, Grid, TextInput, GridItem } from "@patternfly/react-core";
import {
  Badge,
  Card,
  CardBody,
  Split,
  SplitItem,
} from "@patternfly/react-core";
import { Link } from "react-router-dom";
import { EmptyStateTable } from "../common/emptyTable";
import moment from "moment";
import "./DisplayPage.scss";

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
  pluginNavigate?: (item: PluginMeta) => void;
  search: string;
}

const DisplayPage = ({
  resources,
  pageState,
  onPerPageSelect,
  onSetPage,
  title,
  handleComputeSearch,
  handlePluginSearch,
  search,
}: DisplayPageInterface) => {
  const { perPage, page, itemCount } = pageState;
  const isPlugin = title === "Plugins" ? true : false;
  const isCompute = title === "Compute" ? true : false;
  const isValid = (date: any) => {
    return new Date(date).toDateString() !== "Invalid Date";
  };
  const format = (date: Date) => {
    return moment(date).fromNow();
  };

  const content = (
    <Grid hasGutter={true}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0.8rem 0rem",
        }}
      >
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

        <div
          style={{
            display: "flex",
            gap: "1rem",
          }}
        >
          <Pagination
            itemCount={itemCount}
            perPage={perPage}
            page={page}
            onSetPage={onSetPage}
            onPerPageSelect={onPerPageSelect}
          />
        </div>
      </div>

      <div className="site-card-wrapper">
        <Grid className="plugins-row" hasGutter>
          {resources && resources.length > 0 ? (
            resources.map((resource) => {
              return (
                <GridItem
                  key={resource.data ? resource.data.id : ""}
                  lg={6}
                  sm={12}
                >
                  <Card className="plugin-item-card">
                    <CardBody className="plugin-item-card-body">
                      <div>
                        <div className="row no-flex">
                          <Split>
                            <SplitItem isFilled>
                              <p
                                style={{
                                  fontSize: "0.9em",
                                  fontWeight: "bold",
                                }}
                              >
                                {resource.data.name}
                              </p>
                            </SplitItem>
                            {isPlugin && (
                              <SplitItem>
                                <Badge isRead>{resource.data.category}</Badge>
                              </SplitItem>
                            )}
                          </Split>
                          {isPlugin && (
                            <>
                              <div className="plugin-item-name">
                                <Link to={`/plugin/${resource.data.id}`}>
                                  {resource.data.title}
                                </Link>
                              </div>
                              <div className="plugin-item-author">
                                {resource.data.authors}
                              </div>
                            </>
                          )}

                          {isCompute && (
                            <h1 className="compute-item-description">
                              {resource.data.description}
                            </h1>
                          )}

                          <p
                            style={{
                              color: "gray",
                              fontWeight: "600",
                              fontSize: "small",
                            }}
                          >
                            {isValid(resource.data.modification_date)
                              ? `Updated ${format(
                                  resource.data.modification_date
                                )}`
                              : `Created ${format(
                                  resource.data.creation_date
                                )}`}
                          </p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </GridItem>
              );
            })
          ) : (
            <GridItem offset={8}>
              <EmptyStateTable
                cells={[]}
                rows={[]}
                caption=""
                title="No results found"
                description=""
              />
            </GridItem>
          )}
        </Grid>
      </div>
    </Grid>
  );

  return <>{content}</>;
};

export default DisplayPage;
