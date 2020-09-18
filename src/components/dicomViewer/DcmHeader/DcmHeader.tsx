import React from "react";
import { Tooltip, TooltipPosition, Button } from "@patternfly/react-core";
import {
  SearchPlusIcon,
  SearchIcon,
  HandPaperIcon,
  AdjustIcon,
  BurnIcon,
  UndoIcon,
  DownloadIcon,
  BarsIcon,
  FileAltIcon,
  RedoIcon,
} from "@patternfly/react-icons";

import "./DcmHeader.scss";

interface DicomHeaderProps {
  handleToolbarAction: (action: string) => void;
}

const DcmHeader: React.FC<DicomHeaderProps> = ({ handleToolbarAction }) => {
  return (
    <div className="dicom-header">
      <div className="dicom-logo">
        <span className="dicom-logo__text">Image Viewer</span>
        <span className="dicom-logo__subtext">Powered by cornerstone.js</span>
      </div>

      <div className="dicom-header__body-tools">
        <span
          style={{
            marginRight: "0.3rem",
            color: "white",
          }}
        >
          Tools
        </span>

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
          content={<span>LMB + Drag</span>}
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
        <Tooltip position={TooltipPosition.bottom} content={<div>Rotate</div>}>
          <Button
            variant="link"
            onClick={() => {
              handleToolbarAction("rotate");
            }}
          >
            <UndoIcon size="md"></UndoIcon>
          </Button>
        </Tooltip>
        <Tooltip
          position={TooltipPosition.bottom}
          content={<div>Stack Scroll</div>}
        >
          <Button
            variant="link"
            onClick={() => {
              handleToolbarAction("stackScroll");
            }}
          >
            <BarsIcon size="md"></BarsIcon>
          </Button>
        </Tooltip>
        <Tooltip
          position={TooltipPosition.bottom}
          content={<div>Dicom Tag Information</div>}
        >
          <Button
            variant="link"
            onClick={() => {
              handleToolbarAction("dicomHeader");
            }}
          >
            <FileAltIcon size="md" />
          </Button>
        </Tooltip>
        <Tooltip
          position={TooltipPosition.bottom}
          content={<div>Reset State</div>}
        >
          <Button
            variant="link"
            onClick={() => {
              handleToolbarAction("reset");
            }}
          >
            <RedoIcon size="md" />
          </Button>
        </Tooltip>
        <Button variant="link">
          <DownloadIcon size="md" />
        </Button>
      </div>
    </div>
  );
};

export default DcmHeader;
