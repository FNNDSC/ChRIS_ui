import React from "react";
import { Tooltip, TooltipPosition, Button } from "@patternfly/react-core";
import {
  SearchPlusIcon,
  SearchIcon,
  HandPaperIcon,
  AdjustIcon,
  BurnIcon,
  RedoIcon,
  BarsIcon,
  EditIcon,
  InfoCircleIcon,
} from "@patternfly/react-icons";

import "./DcmHeader.scss";

interface DicomHeaderProps {
  handleToolbarAction: (action: string) => void;
}

const DcmHeader = ({
  handleToolbarAction,
}: DicomHeaderProps): React.ReactElement => {
  return (
    <div className="dicom-header">
      <div className="dicom-logo">
        <span className="dicom-logo__text">Image Viewer</span>
       
      </div>
    <div className="dicom-header__center-tools">
        <span className="dicom-header__tools-text">Tools</span>
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
            icon={<SearchPlusIcon size="md" />}
          />
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
            icon={<SearchIcon size="md" />}
          />
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
            icon={<HandPaperIcon size="md" />}
          />
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
            icon={<AdjustIcon size="md" />}
          />
        </Tooltip>

        <Tooltip position={TooltipPosition.bottom} content={<div>Rotate</div>}>
          <Button
            variant="link"
            onClick={() => {
              handleToolbarAction("rotate");
            }}
          >
            <RedoIcon size="md" />
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
            icon={<BarsIcon size="md" />}
          ></Button>
        </Tooltip>

        <Tooltip position={TooltipPosition.bottom} content={<div>Invert</div>}>
          <Button
            variant="link"
            onClick={() => {
              handleToolbarAction("invert");
            }}
            icon={<BurnIcon size="md" />}
          />
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
            icon={<InfoCircleIcon size="md" />}
          />
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
            icon={<EditIcon size="md" />}
          />
        </Tooltip>
      </div>

    </div>
  );
};

export default DcmHeader;
