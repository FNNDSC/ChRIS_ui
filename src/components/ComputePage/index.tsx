import { PageSection } from "@patternfly/react-core";
import React from "react";
import { Typography } from "../Antd";
import { InfoIcon } from "../Common";
import WrapperConnect from "../Wrapper";
import ComputeCatalog from "./ComputeCatalog";

const { Paragraph } = Typography;

const ComputePage = () => {
  React.useEffect(() => {
    document.title = "Compute Catalog";
  }, []);
  return (
    <WrapperConnect>
      <PageSection>
        <ComputeCatalog />
      </PageSection>
    </WrapperConnect>
  );
};

export default ComputePage;
