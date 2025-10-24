import {
  ActionGroup,
  Alert,
  Form,
  FormGroup,
  Modal,
  Button as PFButton,
  TextInput,
} from "@patternfly/react-core";
import React from "react";

interface StoreConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (username: string, password: string) => Promise<void>;
  modalError?: string;
}

export const StoreConfigModal: React.FC<StoreConfigModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  modalError,
}) => {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(username.trim(), password.trim());
  };

  return (
    <Modal
      variant="small"
      isOpen={isOpen}
      onClose={onClose}
      aria-label="Configure Store"
    >
      <Form isWidthLimited onSubmit={handleConfirm}>
        {modalError && (
          <Alert
            variant="danger"
            isInline
            title={modalError}
            style={{ marginBottom: "1rem" }}
          />
        )}
        <FormGroup label="Admin Username" isRequired fieldId="store-username">
          <TextInput
            id="store-username"
            isRequired
            type="text"
            value={username}
            onChange={(_, val) => setUsername(val)}
          />
        </FormGroup>
        <FormGroup label="Admin Password" isRequired fieldId="store-password">
          <TextInput
            id="store-password"
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
            isDisabled={!username.trim() || !password.trim()}
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
