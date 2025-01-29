import React from "react";
import { useDispatch } from "react-redux";
import BUILD_VERSION from "../../getBuildVersion";
import { setSidebarActive } from "../../store/ui/actions";
import { InfoIcon } from "../Common";
import WrapperConnect from "../Wrapper";
import FeedGraph from "./FeedGraph";
import {
  covidnetDataset,
  fetalBrainReconstructionDataset,
  lldDataset,
} from "./util";

// PatternFly imports
import {
  PageSection,
  Card,
  CardTitle,
  CardBody,
  Grid,
  GridItem,
  Button,
  Title,
} from "@patternfly/react-core";

import "./dashboard.css";

interface DashboardProps {
  children?: React.ReactNode;
}

const DashboardPage = (props: DashboardProps) => {
  const dispatch = useDispatch();
  const { children } = props;

  React.useEffect(() => {
    document.title = "Overview";
    dispatch(
      setSidebarActive({
        activeItem: "overview",
      }),
    );
  }, [dispatch]);

  return (
    <WrapperConnect>
      {/* Top section with intro text */}
      <PageSection hasShadowBottom>
        <InfoIcon
          title="Welcome to ChRIS"
          p1={
            <>
              <p>
                Retrieve, analyze, and visualize <i>any data</i> using a
                powerful cloud computing platform: ChRIS.
                <b> Let&apos;s get started.</b>
              </p>
              <p>
                Build: <code className="build-version">{BUILD_VERSION}</code>
              </p>
            </>
          }
        />
        {children}
      </PageSection>

      {/* Main content section */}
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
    </WrapperConnect>
  );
};

export default DashboardPage;
