import {
  OverflowMenuItem,
  OverflowMenuGroup,
  OverflowMenu,
  Button,
} from "@patternfly/react-core";

const MenuBar = () => {
  return (
    <OverflowMenu breakpoint="lg">
      <OverflowMenuGroup groupType="button">
        <OverflowMenuItem>
          <Button size="sm" variant="primary">
            Upload a Folder
          </Button>
        </OverflowMenuItem>
        <OverflowMenuItem>
          <Button size="sm" variant="primary">
            Upload Files
          </Button>
        </OverflowMenuItem>

        <OverflowMenuItem>
          <Button size="sm" variant="primary">
            Create a new folder
          </Button>
        </OverflowMenuItem>
      </OverflowMenuGroup>
    </OverflowMenu>
  );
};

export default MenuBar;
