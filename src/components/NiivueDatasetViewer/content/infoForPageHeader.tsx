import { InfoIcon } from "../../Common";
import { Typography } from "antd";
import React from "react";

const InfoForPageHeader: React.FC = () => (
  <InfoIcon
    title="Visual Datasets"
    p1={
      <Typography>
        <p>
          Datasets found in public feeds can be visualized here using{" "}
          <a
            href="https://github.com/niivue/niivue"
            target="_blank"
            rel="noreferrer nofollow"
          >
            Niivue
          </a>
          .
        </p>
        <p>
          For how to add data here, see the documentation:
          <a
            href="https://chrisproject.org/docs/visual_dataset"
            target="_blank"
            rel="noreferrer nofollow"
          >
            https://chrisproject.org/docs/visual_dataset
          </a>
          .
        </p>
      </Typography>
    }
  />
);

export { InfoForPageHeader };
