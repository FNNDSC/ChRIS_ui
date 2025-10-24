import { PageSection } from "@patternfly/react-core";
import React from "react";
import Wrapper from "../Wrapper";
import PluginCatalog from "./PluginCatalog";
import "./plugin-catalog.css";
import type { ThunkModuleToFunc, UseThunk } from "@chhsiao1981/use-thunk";
import type * as DoDrawer from "../../reducers/drawer";
import type * as DoFeed from "../../reducers/feed";
import type * as DoUI from "../../reducers/ui";
import type * as DoUser from "../../reducers/user";
import Title from "./Title";

type TDoUI = ThunkModuleToFunc<typeof DoUI>;
type TDoUser = ThunkModuleToFunc<typeof DoUser>;
type TDoDrawer = ThunkModuleToFunc<typeof DoDrawer>;
type TDoFeed = ThunkModuleToFunc<typeof DoFeed>;

type Props = {
  useUI: UseThunk<DoUI.State, TDoUI>;
  useUser: UseThunk<DoUser.State, TDoUser>;
  useDrawer: UseThunk<DoDrawer.State, TDoDrawer>;
  useFeed: UseThunk<DoFeed.State, TDoFeed>;
};

export default (props: Props) => {
  const { useUI, useUser, useDrawer, useFeed } = props;

  React.useEffect(() => {
    document.title = "Analysis Catalog";
  }, []);

  return (
    <Wrapper
      useUI={useUI}
      useDrawer={useDrawer}
      useUser={useUser}
      useFeed={useFeed}
      title={<Title />}
    >
      <PageSection>
        <PluginCatalog />
      </PageSection>
    </Wrapper>
  );
};
