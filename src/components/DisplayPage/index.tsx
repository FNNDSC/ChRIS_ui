import React from "react";
import { PluginMeta } from "@fnndsc/chrisapi";
import {
  Pagination,
  Grid,
  TextInput,
  GridItem,
  Dropdown,
  MenuToggle,
  DropdownItem,
  DropdownList,
  Badge,
  Card,
  CardBody,
  Split,
  SplitItem,
} from "@patternfly/react-core";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { EmptyStateComponent, SpinContainer } from "../Common";
import { SearchIcon } from "../Icons";
import "./display-page.css";

export const ComputeQueryTypes = {
  ID: ["Id", "Match file id exactly with this number"],
  NAME: ["Name", "Match compute resource's name containing this string"],
  NAME_EXACT: [
    "Name_Exact",
    "Match compute resource's name containing this string",
  ],
  DESCRIPTION: [
    "Description",
    "Match compute resource's description containing this string",
  ],
  PLUGIN_ID: [
    "Plugin_id",
    "Match plugin id exactly with this string for all the compute resources associated with the plugin",
  ],
};

export const PluginQueryTypes = {
  NAME: ["Name", "Match plugin meta name containing this string"],
  ID: ["Id", "Match plugin meta id exactly with this number"],
  NAME_EXACT: ["Exact Name", "Match plugin meta name exactly this string"],
  TITLE: ["Title", "Match plugin meta title containing this string"],
  CATEGORY: ["Category", "Match plugin meta category exactly with this string"],
  TYPE: ["Type", "Match plugin meta type exactly with this string"],
  AUTHORS: ["Authors", "Match plugin meta authors containing this string"],
  MIN_CREATION_DATE: [
    "Min_Creation_Date",
    "Match plugin meta creation date greater than this date",
  ],
  Max_CREATION_DATE: [
    "Max_Creation_Date",
    "Match plugin meta creation date less than this date",
  ],
  NAME_TITLE_CATEGORY: [
    "Name_Title_Category",
    "Match plugin meta name, title or category containing this string",
  ],
  NAME_AUTHORS_CATEGORY: [
    "Name_Authors_Category ",
    "Match plugin meta name, authors or category containing this string",
  ],
};
interface PageState {
  perPage: number;
  page: number;
  search: string;
  itemCount: number;
}

interface DisplayPageInterface {
  loading: boolean;
  resources?: any[];
  pageState: PageState;
  onPerPageSelect: (_event: any, perPage: number) => void;
  handleFilterChange: (value: string) => void;
  onSetPage: (_event: any, page: number) => void;
  selectedResource: any;
  setSelectedResource: (resource: any) => void;
  title: string;
  showPipelineButton?: boolean;
  handlePluginSearch?: (search: string, searchType: string) => void;
  handlePipelineSearch?: (search: string) => void;
  handleComputeSearch?: (search: string, searchType: string) => void;
  pluginNavigate?: (item: PluginMeta) => void;
  search: string;
}

const DisplayPage = ({
  loading,
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
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const isPlugin = title === "Plugins" ? true : false;
  const isCompute = title === "Compute" ? true : false;
  const [dropdownValue, setDropdownValue] = React.useState<string>(
    isPlugin ? PluginQueryTypes.NAME[0] : ComputeQueryTypes.NAME[0],
  );

  const onToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  const onFocus = () => {
    const element = document.getElementById("toggle-basic");
    element?.focus();
  };

  const onSelect = () => {
    setIsDropdownOpen(false);
    onFocus();
  };

  const updateDropdownValue = (type: string) => {
    setDropdownValue(type);
    if (isPlugin) {
      handlePluginSearch && handlePluginSearch("", dropdownValue.toLowerCase());
    } else {
      handleComputeSearch &&
        handleComputeSearch("", dropdownValue.toLowerCase());
    }
  };
  const dropdownItems = isPlugin
    ? [
        Object.values(PluginQueryTypes).map((plugin) => {
          return (
            <DropdownItem
              key={plugin[0]}
              component="button"
              description={plugin[1]}
              onClick={() => updateDropdownValue(plugin[0])}
            >
              {plugin[0]}
            </DropdownItem>
          );
        }),
      ]
    : [
        Object.values(ComputeQueryTypes).map((compute) => {
          return (
            <DropdownItem
              key={compute[0]}
              component="button"
              description={compute[1]}
              onClick={() => updateDropdownValue(compute[0])}
            >
              {compute[0]}
            </DropdownItem>
          );
        }),
      ];

  const loadingPluginMeta =
    resources && resources.length > 0 ? (
      resources.map((resource) => {
        return (
          <GridItem key={resource.data ? resource.data.id : ""} lg={6} sm={12}>
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
                        fontSize: "0.90rem",
                      }}
                    >
                      Version: {resource.data.version}
                    </p>

                    <p
                      style={{
                        fontSize: "0.90rem",
                      }}
                    >
                      {format(
                        new Date(resource.data.modification_date),
                        "do MMMM, yyyy",
                      )}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </GridItem>
        );
      })
    ) : (
      <GridItem>
        <EmptyStateComponent />
      </GridItem>
    );

  const content = (
    <Grid hasGutter={true}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "0.8rem 0rem",
        }}
      >
        <div style={{ display: "flex", flexDirection: "row" }}>
          <Dropdown
            onSelect={onSelect}
            toggle={(toggleRef) => {
              return (
                <MenuToggle
                  ref={toggleRef}
                  id="toggle-basic"
                  onClick={onToggle}
                >
                  {dropdownValue}
                </MenuToggle>
              );
            }}
            isOpen={isDropdownOpen}
            shouldFocusToggleOnSelect
          >
            <DropdownList>{dropdownItems}</DropdownList>
          </Dropdown>
          <TextInput
            value={search}
            type="text"
            style={{ height: "100%" }}
            placeholder={dropdownValue}
            customIcon={<SearchIcon />}
            aria-label="search"
            onChange={(_event, value: string) => {
              if (isPlugin) {
                handlePluginSearch &&
                  handlePluginSearch(value, dropdownValue.toLowerCase());
              }

              if (isCompute) {
                handleComputeSearch &&
                  handleComputeSearch(value, dropdownValue.toLowerCase());
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
          {loading ? (
            <SpinContainer title="Fetching Resources" />
          ) : (
            loadingPluginMeta
          )}
        </Grid>
      </div>
    </Grid>
  );

  return <>{content}</>;
};

export default DisplayPage;
