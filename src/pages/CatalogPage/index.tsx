import React from "react";
import { useDispatch } from "react-redux";
import Wrapper from "../../containers/Layout/PageWrapper";
import { PageSection, Title } from "@patternfly/react-core";
import PluginCatalog from "../../components/catalog/PluginCatalog";
import PipelineCatalog from "../../components/catalog/PipelineCatalog";
import ComputeCatalog from "../../components/catalog/ComputeCatalog";
import "./CatalogPage.scss";
import { setSidebarActive } from "../../store/ui/actions";

const CatalogPage = () => {
  const dispatch = useDispatch();
  React.useEffect(() => {
    dispatch(
      setSidebarActive({
        activeItem: "catalog",
      })
    );
  });
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
      <PageSection>
        <PipelineCatalog />
      </PageSection>
      <PageSection>
        <ComputeCatalog />
      </PageSection>
    </Wrapper>
  );
};

export default CatalogPage;
