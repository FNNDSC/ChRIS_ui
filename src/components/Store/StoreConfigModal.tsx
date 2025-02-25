// StoreConfigModal.tsx
import React from "react";
import {
  Modal,
  Form,
  FormGroup,
  TextInput,
  ActionGroup,
  Button as PFButton,
  Select as PFSelect,
  SelectOption,
  MenuToggle,
  type MenuToggleElement,
} from "@patternfly/react-core";

interface StoreConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: {
    username: string;
    password: string;
    computeResource: string;
  }) => void;
  computeResourceOptions: string[];
}

export const StoreConfigModal: React.FC<StoreConfigModalProps> = ({
  isOpen,
  onClose,
  onSave,
  computeResourceOptions,
}) => {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [computeResource, setComputeResource] = React.useState("");
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const handleConfigSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ username, password, computeResource });
    onClose();
  };

  return (
    <Modal
      variant="small"
      isOpen={isOpen}
      onClose={onClose}
      aria-label="Configure Store"
    >
      <Form isWidthLimited onSubmit={handleConfigSave}>
        {/* Admin Username */}
        <FormGroup label="Admin Username" isRequired>
          <TextInput
            id="username"
            isRequired
            type="text"
            value={username}
            onChange={(_, val) => setUsername(val)}
          />
        </FormGroup>

        {/* Admin Password */}
        <FormGroup label="Admin Password" isRequired>
          <TextInput
            id="password"
            isRequired
            type="password"
            value={password}
            onChange={(_, val) => setPassword(val)}
          />
        </FormGroup>

        {/* Compute Resource */}
        <FormGroup label="Compute Resource" isRequired>
          {computeResourceOptions.length > 0 ? (
            <PFSelect
              id="compute_resource"
              selected={computeResource}
              isOpen={dropdownOpen}
              onOpenChange={(isOpen) => setDropdownOpen(isOpen)}
              onSelect={(_, value) => {
                setComputeResource(value as string);
                setDropdownOpen(false);
              }}
              toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                <MenuToggle
                  ref={toggleRef}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  isExpanded={dropdownOpen}
                  style={{ width: "200px" }}
                >
                  {computeResource || "Select a Compute Resource"}
                </MenuToggle>
              )}
            >
              {computeResourceOptions.map((resource) => (
                <SelectOption key={resource} value={resource}>
                  {resource}
                </SelectOption>
              ))}
            </PFSelect>
          ) : (
            <TextInput
              id="compute_resource"
              isRequired
              type="text"
              value={computeResource}
              onChange={(_, val) => setComputeResource(val)}
            />
          )}
        </FormGroup>

        {/* Submit / Cancel buttons */}
        <ActionGroup>
          <PFButton
            type="submit"
            variant="primary"
            isDisabled={!username || !password || !computeResource}
          >
            Save
          </PFButton>
          <PFButton onClick={onClose} variant="link">
            Cancel
          </PFButton>
        </ActionGroup>
      </Form>
    </Modal>
  );
};
