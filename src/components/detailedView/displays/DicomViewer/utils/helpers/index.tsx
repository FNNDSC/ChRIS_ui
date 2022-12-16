import React from "react";
import { Button, Modal, ModalVariant } from "@patternfly/react-core";
import { FeedFile } from "@fnndsc/chrisapi";

export const GalleryButtonContainer = ({
  handleClick,
  text,
}: {
  text: string;
  handleClick: () => void;
}) => {
  return (
    <Button
      style={{ marginRight: "1rem" }}
      variant="primary"
      onClick={handleClick}
    >
      {text}
    </Button>
  );
};

export const ButtonContainer = ({
  action,
  handleEvents,
}: {
  action: string;
  handleEvents: (action: string) => void;
}) => {
  return (
    <Button
      style={{ marginRight: "1rem" }}
      variant="secondary"
      onClick={() => handleEvents(action)}
    >
      {action}
    </Button>
  );
};

export const TagInfoModal = ({
  isModalOpen,
  handleModalToggle,
  output,
  file,
}: {
  isModalOpen: boolean;
  handleModalToggle: (event: string, value: boolean) => void;
  output: string;
  file?: FeedFile;
}) => {
  return (
    <Modal
      onEscapePress={() => {
        handleModalToggle("TagInfo", !isModalOpen);
      }}
      variant={ModalVariant.large}
      title="Dicom Tag"
      isOpen={isModalOpen}
      onClose={() => handleModalToggle("TagInfo", !isModalOpen)}
    >
      File Name: {`${file && file.data.fname}`}
      <div id="output" dangerouslySetInnerHTML={{ __html: output }}></div>
    </Modal>
  );
};
