import React from "react";
import { useDispatch } from "react-redux";
import { Typography } from "antd";
import WrapperConnect from "../Wrapper";
import PluginCatalog from "./PluginCatalog";
import { InfoIcon } from "../Common/";
import { setSidebarActive } from "../../store/ui/actions";
import { PageSection } from "@patternfly/react-core";
import "./plugin-catalog.css";

const { Paragraph } = Typography;

const CatalogPage = () => {
  const dispatch = useDispatch();

  React.useEffect(() => {
    document.title = "Analysis Catalog";
    dispatch(
      setSidebarActive({
        activeItem: "catalog",
      }),
    );
  });

  return (
    <WrapperConnect>
      <PageSection>
        <InfoIcon
          title="Installed Plugins"
          p1={
            <Paragraph>
              <p>
                ChRIS is a platform that runs <b>Plugins</b>. A plugin is a
                single application (similar to <i>apps</i> on a mobile device).
                Examples of ChRIS <b>Plugins</b> are applications that analyze
                images (like{" "}
                <a href="https://github.com/FNNDSC/pl-fshack">pl-fshack</a> that
                runs a neuro image analysis program called{" "}
                <a href="https://surfer.nmr.mgh.harvard.edu">FreeSurfer</a>).
                Other <b>Plugins</b> perform operations like zipping files,
                converting medical images from DICOM to jpg, etc. On this page
                you can browse <b>Plugins</b> available for you to use. For more
                options, consult the{" "}
                <a href="https://next.chrisstore.co">ChRIS store</a>.
              </p>
            </Paragraph>
          }
        />
      </PageSection>
      <PageSection>
        <PluginCatalog />
      </PageSection>
    </WrapperConnect>
  );
};

export default CatalogPage;
