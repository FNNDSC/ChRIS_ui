import React from "react";
import WrapperConnect from "../Wrapper";
import PluginCatalog from "./PluginCatalog";
import { PageSection } from "@patternfly/react-core";
import "./plugin-catalog.css";

const CatalogPage = () => {
  React.useEffect(() => {
    document.title = "Analysis Catalog";
  }, []);

  return (
    <WrapperConnect>
      <PageSection>
        <PluginCatalog />
      </PageSection>
    </WrapperConnect>
  );
};

export default CatalogPage;
