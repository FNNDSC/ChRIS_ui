import { PageSection } from "@patternfly/react-core";
import React from "react";
import WrapperConnect from "../Wrapper";
import PluginCatalog from "./PluginCatalog";
import "./plugin-catalog.css";
import { InfoSection } from "../Common";

const CatalogPage = () => {
  React.useEffect(() => {
    document.title = "Analysis Catalog";
  }, []);

  const TitleComponent = (
    <InfoSection
      title="Installed Plugins"
      content={
        <>
          ChRIS is a platform that runs <b>Plugins</b>. A plugin is a single
          application (similar to <i>apps</i> on a mobile device). Examples of
          ChRIS <b>Plugins</b> are applications that analyze images (like{" "}
          <a href="https://github.com/FNNDSC/pl-fshack">pl-fshack</a> that runs
          a neuro image analysis program called{" "}
          <a href="https://surfer.nmr.mgh.harvard.edu">FreeSurfer</a>). Other{" "}
          <b>Plugins</b> perform operations like zipping files, converting
          medical images from DICOM to jpg, etc. On this page you can browse{" "}
          <b>Plugins</b> available for you to use. For more options, consult the{" "}
          <a href="https://next.chrisstore.co">ChRIS store</a>.
        </>
      }
    />
  );

  return (
    <WrapperConnect titleComponent={TitleComponent}>
      <PageSection>
        <PluginCatalog />
      </PageSection>
    </WrapperConnect>
  );
};

export default CatalogPage;
