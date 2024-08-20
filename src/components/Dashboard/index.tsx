import React from "react";
import BUILD_VERSION from "../../getBuildVersion";
import { Grid, GridItem, PageSection } from "@patternfly/react-core";
import { Typography } from "../Antd";
import WrapperConnect from "../Wrapper";
import { CatalogTile } from "@patternfly/react-catalog-view-extension";
import { InfoIcon } from "../Common";
import "./dashboard.css";

const { Paragraph } = Typography;

interface DashboardProps {
  children?: React.ReactNode;
}

const DashboardPage = (props: DashboardProps) => {
  const { children } = props;

  React.useEffect(() => {
    document.title = "Overview";
  }, []);

  return (
    <WrapperConnect>
      <PageSection hasShadowBottom>
        <InfoIcon
          title="Welcome to ChRIS"
          p1={
            <Paragraph>
              <p>
                Retrieve, analyze, and visualize <i>any data </i> using a
                powerful cloud computing platform: ChRIS.
                <b> Let&apos;s get started.</b>
              </p>
              <p>
                Build: <code className="build-version">{BUILD_VERSION}</code>
              </p>
            </Paragraph>
          }
        />

        {children}
      </PageSection>

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
