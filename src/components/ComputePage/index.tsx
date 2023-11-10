import React from "react";
import { Typography } from "antd";
import { PageSection } from "@patternfly/react-core";
import ComputeCatalog from "./ComputeCatalog";
import { InfoIcon } from "../Common";
import { setSidebarActive } from "../../store/ui/actions";
import { useDispatch } from "react-redux";
import WrapperConnect from "../Wrapper";

const { Paragraph } = Typography;

const ComputePage = () => {
  const dispatch = useDispatch();
  React.useEffect(() => {
    document.title = "Compute Catalog";
    dispatch(
      setSidebarActive({
        activeItem: "compute",
      })
    );
  });
  return (
    <WrapperConnect>
      <PageSection>
        <InfoIcon
          title="Compute"
          p1={
            <Paragraph>
              <p>
                This page presents the available <b>Compute</b> environments
                that are known to ChRIS. These denote computers and
                clusters/clouds that can be selected to run various{" "}
                <b>plugins</b> and <b>pipelines</b>. The special <b>host</b>{" "}
                environment is always available and is the actual server that is
                running ChRIS. It is generally not recommended to run intensive
                computation on the <b>host</b> environment. Adding new{" "}
                <b>Compute</b> to ChRIS is typically enabled by using the
                separate ChRIS admin interface.
              </p>
            </Paragraph>
          }
        />
      </PageSection>
      <PageSection>
        <ComputeCatalog />
      </PageSection>
    </WrapperConnect>
  );
};

export default ComputePage;
