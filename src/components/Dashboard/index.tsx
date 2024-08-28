import React from "react";
import { Grid, GridItem, PageSection } from "@patternfly/react-core";
import WrapperConnect from "../Wrapper";
import { CatalogTile } from "@patternfly/react-catalog-view-extension";
import "./dashboard.css";

const DashboardPage = () => {
  React.useEffect(() => {
    document.title = "Overview";
  }, []);

  return (
    <WrapperConnect>
      <PageSection>
        <Grid hasGutter>
          <GridItem lg={4}>
            <CatalogTile
              id="simple-title"
              featured
              title="You've got data"
              description={
                'Visit the "Library" in the main navigation to review your data collection'
              }
            />{" "}
          </GridItem>

          <GridItem lg={4}>
            <CatalogTile
              id="simple-title"
              featured
              title="Analyses"
              description={
                'Visit "New and Existing Analyses" in the main navigation to review your data analyses'
              }
            />
          </GridItem>

          <GridItem lg={4}>
            <CatalogTile
              id="simple-title"
              featured
              title="Discover and collect new data"
              description={
                'Visit "PACS Query/Retrieve" in the main navigation to pull medical data and save it your library'
              }
            />
          </GridItem>

          <GridItem lg={4}>
            <CatalogTile
              id="simple-title"
              featured
              title="Run a Workflow"
              description={
                'Visit "Run a Quick Workflow" to choose from existing analysis templates that allow for detailed analysis'
              }
            />
          </GridItem>
        </Grid>
      </PageSection>
    </WrapperConnect>
  );
};

export default DashboardPage;
