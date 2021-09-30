import React from "react";
import { Tooltip, TooltipPosition, Button } from "@patternfly/react-core";
import {
  MdPanTool,
  MdZoomIn,
  MdSearch,
  MdBrightnessMedium,
  MdInvertColors,
  MdRotateRight,
  MdInfoOutline,
  MdReplay,
  MdFullscreenExit,
  MdFullscreen,
} from "react-icons/md";
import "./DcmHeader.scss";
import { useHistory } from "react-router";

interface DicomHeaderProps {
  handleToolbarAction: (action: string) => void;
  switchFullScreen: () => void;
  isFullScreen: boolean;
}

const DcmHeader = ({
  handleToolbarAction,
  switchFullScreen,
  isFullScreen,
}: DicomHeaderProps): React.ReactElement => {
  const history = useHistory();
  return (
    <div className="dicom-header">
      <div className="dicom-logo">
        <span className="dicom-logo__text">Image Viewer</span>
        <a
          onClick={(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
            history.push("/");
            e.preventDefault();
          }}
          href="/#"
        >
          <i className="fas fa-angle-left"></i>
          Back to Dashboard
        </a>
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
              handleToolbarAction("pan");
            }}
            icon={<MdPanTool />}
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
              handleToolbarAction("zoom");
            }}
            icon={<MdZoomIn />}
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
            icon={<MdSearch />}
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
            icon={<MdBrightnessMedium />}
          />
        </Tooltip>

        <Tooltip position={TooltipPosition.bottom} content={<div>Rotate</div>}>
          <Button
            variant="link"
            onClick={() => {
              handleToolbarAction("rotate");
            }}
            icon={<MdRotateRight />}
          ></Button>
        </Tooltip>

        <Tooltip position={TooltipPosition.bottom} content={<div>Invert</div>}>
          <Button
            variant="link"
            onClick={() => {
              handleToolbarAction("invert");
            }}
            icon={<MdInvertColors />}
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
            icon={<MdInfoOutline />}
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
            icon={<MdReplay />}
          />
        </Tooltip>

        <Button
          variant="link"
          icon={isFullScreen ? <MdFullscreenExit /> : <MdFullscreen />}
          onClick={() => switchFullScreen()}
        />
      </div>
    </div>
  );
};

export default DcmHeader;
