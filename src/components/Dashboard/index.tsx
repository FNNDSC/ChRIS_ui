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
          <p></p>
        </>
      }
    />
  );

  return (
    <WrapperConnect titleComponent={TitleComponent}>
      <PageSection></PageSection>
    </WrapperConnect>
  );
};

export default DashboardPage;
