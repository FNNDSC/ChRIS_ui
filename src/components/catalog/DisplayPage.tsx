import React from "react";
import { PluginMeta } from "@fnndsc/chrisapi";
import { Pagination, Grid, TextInput, GridItem, Dropdown, DropdownToggle, DropdownItem } from "@patternfly/react-core";
import {
  Badge,
  Card,
  CardBody,
  Split,
  SplitItem,
} from "@patternfly/react-core";
import { Link } from "react-router-dom";
import { EmptyStateTable } from "../common/emptyTable";
import Moment from "react-moment";
import { SpinContainer } from "../common/loading/LoadingContent";
import "./DisplayPage.scss";
export enum ComputeQueryTypes{
  ID="Id",
  NAME="Name",
  NAME_EXACT="Name_Exact",
  DESCRIPTION="Description",
  PLUGIN_ID="Plugin_id"
}

export enum PluginQueryTypes {
  NAME="Name",
  ID="Id",
  NAME_EXACT="Name_Exact",
  TITLE= "Title",
  CATEGORY = "Category",
  TYPE = "Type",
  AUTHORS = "Authors",
  MIN_CREATION_DATE = "Min_Creation_Date",
  Max_CREATION_DATE = "Max_Creation_Date",
  NAME_TITLE_CATEGORY= "Name_Title_Category",
  NAME_AUTHORS_CATEGORY="Name_Authors_Category"
}
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
  handlePluginSearch?: (search: string, searchType:string) => void;
  handlePipelineSearch?: (search: string) => void;
  handleComputeSearch?: (search: string, searchType:string) => void;
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
  const [dropdownValue, setDropdownValue] = React.useState<string>(isPlugin? PluginQueryTypes.NAME_TITLE_CATEGORY: ComputeQueryTypes.NAME )


  const isValid = (date: any) => {
    return new Date(date).toDateString() !== "Invalid Date";
  };

  const onToggle = (isDropdownOpen: boolean) => {
    setIsDropdownOpen(isDropdownOpen);
  };
  const onFocus = () => {
    const element = document.getElementById('toggle-basic');
    element?.focus();
  };

  const onSelect = () => {
    setIsDropdownOpen(false);
    onFocus();
  };

  const updateDropdownValue =(type:string)=>{
    setDropdownValue(type)
    if(isPlugin){
      handlePluginSearch && handlePluginSearch("", dropdownValue.toLowerCase())
    }else{
      handleComputeSearch && handleComputeSearch("", dropdownValue.toLowerCase())
    }
   }
  const dropdownItems = isPlugin?[
    Object.values(PluginQueryTypes).map((Plugin) => {
      return<DropdownItem key={Plugin} component="button" onClick={() => updateDropdownValue(Plugin)}>
      {Plugin}
     </DropdownItem>
    })
  ]: [
    Object.values(ComputeQueryTypes).map((Compute) => {
      return<DropdownItem key={Compute} component="button" onClick={() => updateDropdownValue(Compute)}>
      {Compute}
     </DropdownItem>
    })
  ]

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
                        color: "gray",
                        fontSize: "1rem",
                      }}
                    >
                      Version: {resource.data.version}
                    </p>

                    <p
                      style={{
                        color: "gray",
                        fontWeight: "600",
                        fontSize: "small",
                      }}
                    >
                      {isValid(resource.data.modification_date) ? (
                        <Moment
                          fromNow
                          date={resource.data.modification_date}
                        />
                      ) : (
                        <Moment fromNow date={resource.data.creation_date} />
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
        <EmptyStateTable
          cells={[]}
          rows={[]}
          caption=""
          title="No results found"
          description=""
        />
      </GridItem>
    );

  const content = (
    <Grid hasGutter={true}>
      <div
        style={
          { display: "flex", justifyContent: "space-between", padding: "0.8rem 0rem" }}
      >
         <div style={{ display: "flex", flexDirection: "row" }}>
          <Dropdown
            onSelect={onSelect}
            toggle={
              <DropdownToggle id="toggle-basic" onToggle={onToggle}>
                <div style={{ textAlign: "left", padding: "0 0.5em" }}>
                  <div style={{ fontSize: "smaller", color: "gray" }}>
                    {isPlugin? "Search Plugin By": "Search Compute By"}
                  </div>
                  <div style={{ fontWeight: 600 }}>
                    {(dropdownValue)}
                  </div>
                </div>
              </DropdownToggle>
            }
            isOpen={isDropdownOpen}
            dropdownItems={dropdownItems}
          />
          <TextInput
            value={search}
            type="text"
            style={{height:"100%"}}
            placeholder={(dropdownValue)}
            iconVariant="search"
            aria-label="search"
            onChange={(value: string) => {
              if (isPlugin) {
                handlePluginSearch && handlePluginSearch(value, dropdownValue.toLowerCase());
              }

              if (isCompute) {
                handleComputeSearch && handleComputeSearch(value, dropdownValue.toLowerCase());
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
