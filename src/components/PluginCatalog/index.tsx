import { PageSection } from "@patternfly/react-core";
import React from "react";
import Wrapper from "../Wrapper";
import PluginCatalog from "./PluginCatalog";
import "./plugin-catalog.css";
import type { ThunkModuleToFunc, UseThunk } from "@chhsiao1981/use-thunk";
import type * as DoUI from "../../reducers/ui";
import { InfoSection } from "../Common";

type TDoUI = ThunkModuleToFunc<typeof DoUI>;

type Props = {
  useUI: UseThunk<DoUI.State, TDoUI>;
};

export default (props: Props) => {
  const { useUI } = props;
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
    <Wrapper useUI={useUI} titleComponent={TitleComponent}>
      <PageSection>
        <PluginCatalog />
      </PageSection>
    </Wrapper>
  );
};
