// src/components/DashboardPage.tsx

// PatternFly imports
import {
  Button,
  Card,
  CardBody,
  CardTitle,
  Grid,
  GridItem,
  PageSection,
} from "@patternfly/react-core";
import { useEffect } from "react";
import Wrapper from "../Wrapper";
import FeedGraph from "./FeedGraph";
import "./dashboard.css";
import {
  getState,
  type ThunkModuleToFunc,
  type UseThunk,
} from "@chhsiao1981/use-thunk";
import { useNavigate } from "react-router";
import type * as DoDrawer from "../../reducers/drawer";
import type * as DoFeed from "../../reducers/feed";
import type * as DoUI from "../../reducers/ui";
import * as DoUser from "../../reducers/user";
import Title from "./Title";
import {
  covidnetDataset,
  fetalBrainReconstructionDataset,
  lldDataset,
} from "./util";

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
  const [classStateUser, _] = useUser;
  const user = getState(classStateUser) || DoUser.defaultState;
  const { isLoggedIn } = user;

  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/data");
      return;
    }

    document.title = "Overview";
  }, [isLoggedIn]);

  return (
    <Wrapper
      title={Title}
      useUI={useUI}
      useUser={useUser}
      useDrawer={useDrawer}
      useFeed={useFeed}
    >
      <PageSection>
        <Grid hasGutter>
          <GridItem span={12}>
            <Card isFlat style={{ width: "100%" }}>
              <CardTitle>Leg Length Discrepancy Workflow</CardTitle>
              <CardBody>
                <Grid hasGutter>
                  <GridItem span={12} md={6}>
                    <div className="description-section">
                      <p>
                        The Leg Length Discrepancy (LLD) analysis is one of the
                        most frequently used workflows in ChRIS. This process
                        transforms leg X-rays from DICOM files into new DICOM
                        files containing detailed measurements of the tibia and
                        femur for both legs.
                      </p>
                    </div>
                  </GridItem>

                  <GridItem span={12} md={6}>
                    <div className="tree-section">
                      {/* Replace with your actual graph component/data */}
                      <FeedGraph graphData={lldDataset} />
                    </div>
                  </GridItem>
                </Grid>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>

        <br />

        {/* Two cards side-by-side */}
        <Grid hasGutter>
          {/* COVIDnet Workflow */}
          <GridItem span={12} md={6}>
            <Card
              isFlat
              className="uniform-card-height"
              style={{ width: "100%", padding: "10px" }}
            >
              <CardTitle>COVIDnet Workflow</CardTitle>
              <CardBody>
                <div className="tree-section">
                  <FeedGraph graphData={covidnetDataset} />
                </div>
                <br />
                <Button
                  variant="primary"
                  component="a"
                  href="https://github.com/FNNDSC/pl-covidnet?tab=readme-ov-file"
                  target="_blank"
                >
                  Read More
                </Button>
              </CardBody>
            </Card>
          </GridItem>

          {/* Automatic Fetal Brain Reconstruction Workflow */}
          <GridItem span={12} md={6}>
            <Card
              isFlat
              className="uniform-card-height"
              style={{ width: "100%", padding: "10px" }}
            >
              <CardTitle>
                Automatic Fetal Brain Reconstruction Workflow
              </CardTitle>
              <CardBody>
                <div className="tree-section">
                  <FeedGraph graphData={fetalBrainReconstructionDataset} />
                </div>
                <br />
                <Button
                  variant="primary"
                  component="a"
                  href="https://github.com/FNNDSC/Fetal_Brain_MRI_Reconstruction_Pipeline"
                  target="_blank"
                >
                  Read More
                </Button>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </PageSection>
    </Wrapper>
  );
};
