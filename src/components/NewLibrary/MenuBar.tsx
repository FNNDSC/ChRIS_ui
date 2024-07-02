import {
  OverflowMenuItem,
  OverflowMenuGroup,
  OverflowMenu,
  Button,
  Switch,
} from "@patternfly/react-core";

const MenuBar = ({
  checked,
  handleChange,
  handleUploadModal,
}: {
  checked: boolean;
  handleChange: () => void;
  handleUploadModal: () => void;
}) => {
  return (
    <OverflowMenu breakpoint="lg">
      <OverflowMenuGroup groupType="button">
        <OverflowMenuItem>
          <Switch
            label="Card Layout"
            labelOff="Tree Layout"
            isChecked={checked}
            onChange={handleChange}
            ouiaId="Switch Layouts"
          />
        </OverflowMenuItem>
        <OverflowMenuItem>
          <Button onClick={handleUploadModal} variant="primary" size="sm">
            Upload Data
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
