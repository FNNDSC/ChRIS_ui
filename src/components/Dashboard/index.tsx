import { CatalogTile } from "@patternfly/react-catalog-view-extension";
import { Grid, GridItem, PageSection } from "@patternfly/react-core";
import React from "react";
import BUILD_VERSION from "../../getBuildVersion";
import { InfoSection } from "../Common";
import WrapperConnect from "../Wrapper";
import "./dashboard.css";

const DashboardPage = () => {
  React.useEffect(() => {
    document.title = "Overview";
  }, []);

  const TitleComponent = (
    <InfoSection
      title="Welcome to ChRIS"
      content={
        <>
          Retrieve, analyze, and visualize <i>any data</i> using a powerful
          cloud computing platform: ChRIS. <b>Let's get started.</b>
          <p>
            Build: <code className="build-version">{BUILD_VERSION}</code>
          </p>
        </>
      }
    />
  );

  return (
    <WrapperConnect titleComponent={TitleComponent}>
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
