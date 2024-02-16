import { DatasetFile } from "../client";
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuItemAction,
  MenuGroup,
  MenuList,
  Divider,
  LabelGroup,
  Label,
} from "@patternfly/react-core";
import { PlusIcon, PlusCircleIcon } from "@patternfly/react-icons";
import { TagSet } from "../client/models.ts";
import React from "react";

type FileCardProps = {
  files: ReadonlyArray<DatasetFile>;
  onSelect: (file: DatasetFile) => void;
};

const FileMenuList: React.FC<FileCardProps> = ({ files, onSelect }) => {
  const onMenuSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    itemId: number | string | undefined,
  ) => {
    if (typeof itemId !== "string") {
      throw new Error(`FileMenuList not a non-string itemId: ${itemId}`);
    }
  };

  const onActionClick = (
    _event: React.MouseEvent<Element, MouseEvent>,
    itemId: string,
    actionId: string,
  ) => {
    console.log(`clicked ${itemId} - ${actionId}`);
  };

  const tagSetToLabelGroup = (tags: TagSet): React.ReactNode => {
    return (
      <LabelGroup numLabels={8}>
        {Object.entries(tags).map(([key, value]) => (
          <Label isCompact>
            {key}: {value}
          </Label>
        ))}
      </LabelGroup>
    );
  };

  return (
    <Menu onSelect={onMenuSelect} onActionClick={onActionClick} isScrollable>
      <MenuContent>
        <MenuGroup label="Dataset Files" labelHeadingLevel="h2">
          <MenuList>
            {files.map((file) => {
              return (
                <MenuItem
                  key={file.path}
                  description={tagSetToLabelGroup(file.tags)}
                  itemId={file.path}
                  actions={
                    <>
                      <MenuItemAction
                        actionId="display"
                        icon={<PlusIcon />}
                        aria-label="display"
                      />
                      <MenuItemAction
                        actionId="add"
                        icon={<PlusCircleIcon />}
                        aria-label="add"
                      />
                    </>
                  }
                >
                  {file.path}
                </MenuItem>
              );
            })}
          </MenuList>
        </MenuGroup>
      </MenuContent>
    </Menu>
  );
};

export default FileMenuList;
