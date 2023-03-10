import {
  ApplicationLauncher,
  ApplicationLauncherItem,
  DropdownPosition,
  Tooltip,
} from "@patternfly/react-core";
import * as React from "react";
import { IFileBlob } from "../../../../api/models/file-viewer.model";
import { ButtonContainer } from "../../../detailedView/displays/DicomViewer/utils/helpers";
import {
  MdZoomIn,
  MdOutlinePanTool,
  MdRotate90DegreesCcw,
  MdSettingsBrightness,
  MdOutlineRotate90DegreesCcw,
  MdQueuePlayNext,
  MdInfo,
  MdDraw,
} from "react-icons/md";
import {
  CatchallDisplay,
  JsonDisplay,
  IframeDisplay,
  ImageDisplay,
  DcmDisplay,
  PdfDisplay,
  NiftiDisplay,
  XtkDisplay,
} from "./index";

const components = {
  JsonDisplay,
  IframeDisplay,
  ImageDisplay,
  DcmDisplay,
  CatchallDisplay,
  PdfDisplay,
  NiftiDisplay,
  XtkDisplay,
};

interface ViewerDisplayProps {
  viewerName: string;
  fileItem: IFileBlob;
  preview?: string;
}

const ViewerDisplay: React.FC<ViewerDisplayProps> = (
  props: ViewerDisplayProps
) => {
  const [actionState, setActionState] = React.useState<{
    [key: string]: boolean;
  }>({});

  const handleEvents = (action: string) => {
    const currentAction = actionState[action];
    setActionState({
      [action]: !currentAction,
    });
  };

  const Component = (components as any)[props.viewerName || "CatchallDisplay"];
  return (
    <>
      <DicomHeader handleEvents={handleEvents} />
      <Component actionState={actionState} {...props} />
    </>
  );
};

export default ViewerDisplay;

const actions = [
  {
    name: "Zoom",
    icon: <MdZoomIn />,
  },
  {
    name: "Pan",
    icon: <MdOutlinePanTool />,
  },
  {
    name: "Magnify",
    icon: <MdZoomIn />,
  },
  {
    name: "Rotate",
    icon: <MdRotate90DegreesCcw />,
  },
  {
    name: "Wwwc",
    icon: <MdSettingsBrightness />,
  },
  {
    name: "Reset View",
    icon: <MdOutlineRotate90DegreesCcw />,
  },
  {
    name: "Length",
    icon: <MdDraw />,
  },
  {
    name: "Gallery",
    icon: <MdQueuePlayNext />,
  },
  {
    name: "TagInfo",
    icon: <MdInfo />,
  },
];

export const DicomHeader = ({
  handleEvents,
}: {
  handleEvents: (action: string) => void;
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const appLauncherItems = actions.map((action) => {
    return (
      <ApplicationLauncherItem
        component={
          <ButtonContainer
            action={action.name}
            icon={action.icon}
            handleEvents={handleEvents}
          />
        }
        key={action.name}
      />
    );
  });

  return (
    <div>
      <ApplicationLauncher
        style={{
          position: "absolute",
          top: "1.5em",
          zIndex: "9999",
          color: "black",
        }}
        onToggle={() => setIsOpen(!isOpen)}
        items={appLauncherItems}
        isOpen={isOpen}
        position={DropdownPosition.right}
      />
    </div>
  );
};
