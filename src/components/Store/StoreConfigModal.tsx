import React from "react";
import {
  Modal,
  Form,
  FormGroup,
  TextInput,
  ActionGroup,
  Button as PFButton,
  Alert,
} from "@patternfly/react-core";

interface StoreConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: { username: string; password: string }) => void;
  modalError?: string;
}

export const StoreConfigModal: React.FC<StoreConfigModalProps> = ({
  isOpen,
  onClose,
  onSave,
  modalError,
}) => {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  const handleConfigSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      username,
      password,
    });
  };

  return (
    <Modal
      variant="small"
      isOpen={isOpen}
      onClose={onClose}
      aria-label="Configure Store"
    >
      <Form isWidthLimited onSubmit={handleConfigSave}>
        {modalError && (
          <Alert
            variant="danger"
            isInline
            title={modalError}
            style={{ marginBottom: "1rem" }}
          />
        )}
        <FormGroup label="Admin Username" isRequired>
          <TextInput
            id="username"
            isRequired
            type="text"
            value={username}
            onChange={(_, val) => setUsername(val)}
          />
        </FormGroup>
        <FormGroup label="Admin Password" isRequired>
          <TextInput
            id="password"
            isRequired
            type="password"
            value={password}
            onChange={(_, val) => setPassword(val)}
          />
        </FormGroup>
        <ActionGroup>
          <PFButton
            type="submit"
            variant="primary"
            isDisabled={!username || !password}
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
