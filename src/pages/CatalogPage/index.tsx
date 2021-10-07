import React from "react";
import Wrapper from "../../containers/Layout/PageWrapper";
import { PageSection, Title } from "@patternfly/react-core";
import PluginCatalog from "../../components/PluginCatalog";
import "./CatalogPage.scss";

const CatalogPage = () => {
  return (
    <Wrapper>
      <PageSection variant="light">
        <Title headingLevel="h1">Analysis Catalog</Title>
        <p>
          This is a list of all analysis types available on the ChRIS deployment
        </p>
      </PageSection>
      <PageSection>
        <PluginCatalog />
      </PageSection>
    </Wrapper>
  );
};

export default CatalogPage;
