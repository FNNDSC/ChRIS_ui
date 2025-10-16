import type { ThunkModuleToFunc, UseThunk } from "@chhsiao1981/use-thunk";
import { PageSection } from "@patternfly/react-core";
import React from "react";
import type * as DoUI from "../../reducers/ui";
import { InfoSection } from "../Common";
import Wrapper from "../Wrapper";
import ComputeCatalog from "./ComputeCatalog";

type TDoUI = ThunkModuleToFunc<typeof DoUI>;

type Props = {
  useUI: UseThunk<DoUI.State, TDoUI>;
};

const TitleComponent = (
  <InfoSection
    title="Compute"
    content={
      <>
        This page presents the available <b>Compute</b> environments that are
        known to ChRIS. These denote computers and clusters/clouds that can be
        selected to run various <b>plugins</b> and <b>pipelines</b>. The special{" "}
        <b>host</b> environment is always available and is the actual server
        that is running ChRIS. It is generally not recommended to run intensive
        computation on the <b>host</b> environment. Adding new <b>Compute</b> to
        ChRIS is typically enabled by using the separate ChRIS admin interface.
      </>
    }
  />
);

export default (props: Props) => {
  const { useUI } = props;
  React.useEffect(() => {
    document.title = "Compute Catalog";
  }, []);
  return (
    <Wrapper useUI={useUI} titleComponent={TitleComponent}>
      <PageSection>
        <ComputeCatalog />
      </PageSection>
    </Wrapper>
  );
};
