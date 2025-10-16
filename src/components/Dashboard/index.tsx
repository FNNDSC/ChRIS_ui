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
import BUILD_VERSION from "../../getBuildVersion";
import { InfoSection } from "../Common";
import Wrapper from "../Wrapper";
import FeedGraph from "./FeedGraph";
import "./dashboard.css";
import type { ThunkModuleToFunc, UseThunk } from "@chhsiao1981/use-thunk";
import type * as DoUI from "../../reducers/ui";
import {
  covidnetDataset,
  fetalBrainReconstructionDataset,
  lldDataset,
} from "./util";

type TDoUI = ThunkModuleToFunc<typeof DoUI>;

type Props = {
  useUI: UseThunk<DoUI.State, TDoUI>;
};

export default (props: Props) => {
  const { useUI } = props;

  useEffect(() => {
    document.title = "Overview";
  }, []);

  const TitleComponent = (
    <InfoSection
      title="Welcome to ChRIS"
      content={
        <>
          Retrieve, analyze, and visualize <i>any data</i> using a powerful
          cloud computing platform: ChRIS. <b>Let's get started.</b>
          <p>
            Build: <code className="build-version">{BUILD_VERSION}</code>
          </p>
        </>
      }
    />
  );

  return (
    <Wrapper titleComponent={TitleComponent} useUI={useUI}>
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
