import { Dropdown } from "../../../Antd";
import { Button } from "@patternfly/react-core";
import { AddIcon } from "../../../Icons";

const OPERATION_ITEMS = [
  { key: "fileUpload", label: "Upload Files", disabled: false },
  { key: "folderUpload", label: "Upload Folder", disabled: false },
];

type Props = {
  handleOperations: (operationKey: string) => void;
};

export default (props: Props) => {
  const { handleOperations } = props;

  return (
    <Dropdown
      menu={{
        items: OPERATION_ITEMS,
        selectable: true,
        onClick: (info) => handleOperations(info.key),
      }}
    >
      <Button
        size="sm"
        icon={
          <AddIcon style={{ color: "inherit", height: "1em", width: "1em" }} />
        }
      >
        Upload Data
      </Button>
    </Dropdown>
  );
};
