import React, { ReactNode } from "react";
import { Button, Modal, ModalVariant, Tooltip } from "@patternfly/react-core";
import { FeedFile } from "@fnndsc/chrisapi";
import ReactJson from "react-json-view";
import { SpinContainer } from "../../../../../common/loading/LoadingContent";
import { IconType } from "react-icons/lib";

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
  icon,
}: {
  action: string;
  handleEvents: (action: string) => void;
  icon: ReactNode;
}) => {
  return (
    <Tooltip position="right" content={action}>
      <Button
        style={{ marginRight: "1rem" }}
        variant="link"
        onClick={() => handleEvents(action)}
        icon={icon}
      />
    </Tooltip>
  );
};

export const TagInfoModal = ({
  isModalOpen,
  handleModalToggle,
  output,
}: {
  isModalOpen: boolean;
  handleModalToggle: (event: string, value: boolean) => void;
  output: any[];
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
      {Object.keys(output).length > 0 ? (
        <ReactJson
          enableClipboard={true}
          theme="google"
          displayDataTypes={false}
          displayObjectSize={false}
          src={output}
        />
      ) : (
        <SpinContainer title="Fetching Dicom Tags" />
      )}
    </Modal>
  );
};
