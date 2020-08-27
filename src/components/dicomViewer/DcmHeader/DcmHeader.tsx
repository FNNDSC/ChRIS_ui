import React from "react";
import { Tooltip, TooltipPosition, Button } from "@patternfly/react-core";
import {
  SearchPlusIcon,
  SearchIcon,
  HandPaperIcon,
  AdjustIcon,
  BurnIcon,
} from "@patternfly/react-icons";
import "./DcmHeader.scss";

interface DicomHeaderProps {
  handleToolbarAction: (action: string) => void;
}

const DcmHeader: React.FC<DicomHeaderProps> = ({ handleToolbarAction }) => {
  return (
    <div className="dicom-header">
      <div className="dicom-logo">
        <span className="dicom-logo__text">File Viewer</span>
        <span>Powered by cornerstone.js</span>
      </div>
      <div className="dicom-header__body">
        Tools
        <Tooltip
          position={TooltipPosition.bottom}
          isContentLeftAligned
          content={<span>LMB + Drag</span>}
        >
          <Button
            variant="link"
            onClick={() => {
              handleToolbarAction("zoom");
            }}
          >
            <SearchPlusIcon size="md" />
          </Button>
        </Tooltip>
        <Tooltip
          position={TooltipPosition.bottom}
          isContentLeftAligned
          content={<span>Magnify</span>}
        >
          <Button
            variant="link"
            onClick={() => {
              handleToolbarAction("magnify");
            }}
          >
            <SearchIcon size="md" />
          </Button>
        </Tooltip>
        <Tooltip
          position={TooltipPosition.bottom}
          isContentLeftAligned
          content={<span>Scroll</span>}
        >
          <Button
            variant="link"
            onClick={() => {
              handleToolbarAction("pan");
            }}
          >
            <HandPaperIcon size="md" />
          </Button>
        </Tooltip>
        <Tooltip
          position={TooltipPosition.bottom}
          isContentLeftAligned
          content={<span>Adjust Brightness</span>}
        >
          <Button
            variant="link"
            onClick={() => {
              handleToolbarAction("wwwc");
            }}
          >
            <AdjustIcon size="md" />
          </Button>
        </Tooltip>
        <Tooltip position={TooltipPosition.bottom} content={<div>Invert</div>}>
          <Button
            variant="link"
            onClick={() => {
              handleToolbarAction("invert");
            }}
          >
            <BurnIcon size="md"></BurnIcon>
          </Button>
        </Tooltip>
      </div>
    </div>
  );
};

export default DcmHeader;
