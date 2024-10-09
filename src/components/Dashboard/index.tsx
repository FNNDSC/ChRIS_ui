// src/components/DashboardPage.tsx

import { PageSection } from "@patternfly/react-core";
import { Button, Card, Col, Row } from "antd";
import type React from "react";
import BUILD_VERSION from "../../getBuildVersion";
import { useEffect } from "react";
import { InfoSection } from "../Common";
import WrapperConnect from "../Wrapper";
import FeedGraph from "./FeedGraph";
import "./dashboard.css";
import {
  covidnetDataset,
  fetalBrainReconstructionDataset,
  lldDataset,
} from "./util";

const DashboardPage: React.FC = () => {
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
    <WrapperConnect titleComponent={TitleComponent}>
      <PageSection>
        <Row gutter={[16, 16]}>
          {/* Showcase Card: Leg Length Discrepancy Workflow */}
          <Col xs={24}>
            <Card
              title="Leg Length Discrepancy Workflow"
              bordered={false}
              style={{ width: "100%" }}
            >
              <Row gutter={[16, 16]}>
                {/* Description */}
                <Col xs={24} md={12}>
                  <div className="description-section">
                    <p>
                      The Leg Length Discrepancy (LLD) analysis is one of the
                      most frequently used workflows in ChRIS. This process
                      transforms leg X-rays from DICOM files into new DICOM
                      files containing detailed measurements of the tibia and
                      femur for both legs.
                    </p>
                  </div>
                </Col>

                {/* Graph */}
                <Col xs={24} md={12}>
                  <div className="tree-section">
                    <FeedGraph graphData={lldDataset} />
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        {/* Row for the bottom two cards */}
        <Row gutter={[16, 16]}>
          {/* COVIDnet Workflow Card */}
          <Col xs={24} md={12}>
            <Card
              title="COVIDnet Workflow"
              bordered={false}
              className="uniform-card-height" /* Ensure both cards have the same height */
              style={{ width: "100%", padding: "10px" }}
            >
              <Row gutter={[16, 16]}>
                {/* Graph */}
                <Col xs={24}>
                  <div className="tree-section">
                    <FeedGraph graphData={covidnetDataset} />
                  </div>
                </Col>

                {/* Read More Button */}
                <Col xs={24}>
                  <Button
                    type="primary"
                    target="_blank"
                    href="https://github.com/FNNDSC/pl-covidnet?tab=readme-ov-file"
                  >
                    Read More
                  </Button>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Automatic Fetal Brain Reconstruction Pipeline Card */}
          <Col xs={24} md={12}>
            <Card
              title="Automatic Fetal Brain Reconstruction Pipeline"
              bordered={false}
              className="uniform-card-height" /* Ensure both cards have the same height */
              style={{ width: "100%", padding: "10px" }}
            >
              <Row gutter={[16, 16]}>
                {/* Graph */}
                <Col xs={24}>
                  <div className="tree-section">
                    <FeedGraph graphData={fetalBrainReconstructionDataset} />
                  </div>
                </Col>

                {/* Read More Button */}
                <Col xs={24}>
                  <Button
                    type="primary"
                    target="_blank"
                    href="https://github.com/FNNDSC/Fetal_Brain_MRI_Reconstruction_Pipeline"
                  >
                    Read More
                  </Button>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </PageSection>
    </WrapperConnect>
  );
};

export default DashboardPage;
