import type { ThunkModuleToFunc, UseThunk } from "@chhsiao1981/use-thunk";
import { PageSection } from "@patternfly/react-core";
import { useEffect } from "react";
import type * as DoUI from "../../reducers/ui";
import type * as DoUser from "../../reducers/user";
import Wrapper from "../Wrapper";
import ComputeCatalog from "./ComputeCatalog";
import Title from "./Title";

type TDoUI = ThunkModuleToFunc<typeof DoUI>;
type TDoUser = ThunkModuleToFunc<typeof DoUser>;

type Props = {
  useUI: UseThunk<DoUI.State, TDoUI>;
  useUser: UseThunk<DoUser.State, TDoUser>;
};

export default (props: Props) => {
  const { useUI, useUser } = props;

  useEffect(() => {
    document.title = "Compute Catalog";
  }, []);

  return (
    <Wrapper useUI={useUI} useUser={useUser} titleComponent={Title}>
      <PageSection>
        <ComputeCatalog />
      </PageSection>
    </Wrapper>
  );
};
