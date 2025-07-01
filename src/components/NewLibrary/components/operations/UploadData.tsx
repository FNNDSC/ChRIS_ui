import { Dropdown } from "../../../Antd";
import { Button } from "@patternfly/react-core";
import { AddIcon } from "../../../Icons";
import { MouseEventHandler } from "react";

const OPERATION_ITEMS = [
  { key: "fileUpload", label: "Upload Files", disabled: false },
  { key: "folderUpload", label: "Upload Folder", disabled: false },
];

type Props = {
  handleOperations: (operationKey: string) => void;
  isSidebar?: boolean;

  buttonColor?: string;
};

export default (props: Props) => {
  const { handleOperations, isSidebar: propsIsSidebar, buttonColor } = props;
  const isSidebar = propsIsSidebar || false;
  const buttonVariant = isSidebar ? "plain" : "primary";

  const style = {};
  if (isSidebar) {
    // @ts-expect-error
    style.color = buttonColor;
    // @ts-expect-error
    style.paddingTop = "8px";
    // @ts-expect-error
    style.paddingLeft = "24px";
    // @ts-expect-error
    style.paddingBottom = "8px";
    // @ts-expect-error
    style.paddingRight = "24px";
  }
  const buttonSize = isSidebar ? undefined : "sm";

  return (
    <Dropdown
      menu={{
        items: OPERATION_ITEMS,
        selectable: true,
        onClick: (info) => handleOperations(info.key),
      }}
    >
      <Button
        size={buttonSize}
        variant={buttonVariant}
        icon={
          <AddIcon style={{ color: "inherit", height: "1em", width: "1em" }} />
        }
        style={style}
      >
        Upload Data
      </Button>
    </Dropdown>
  );
};
