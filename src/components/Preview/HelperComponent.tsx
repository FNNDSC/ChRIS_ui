import type { FileBrowserFolderFile } from "@fnndsc/chrisapi";
import { Button, Modal, ModalVariant, Tooltip } from "@patternfly/react-core";
import type { ReactNode } from "react";
import ReactJson from "@microlink/react-json-view";
import { Alert, Drawer } from "../Antd";
import { SpinContainer } from "../Common";

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
  parsingError,
  output,
  isDrawer = false,
}: {
  isModalOpen: boolean;
  handleModalToggle: (event: string, value: boolean) => void;
  parsingError: string;
  output?: any[];
  file?: FileBrowserFolderFile;
  isDrawer?: boolean;
}) => {
  const content = (
    <>
      {parsingError ? (
        <Alert closable type="error" description={parsingError} />
      ) : output && Object.keys(output).length > 0 ? (
        <ReactJson
          collapsed={false}
          shouldCollapse={false}
          enableClipboard={true}
          theme="google"
          displayDataTypes={false}
          displayObjectSize={false}
          src={output}
        />
      ) : (
        <SpinContainer title="Fetching Dicom Tags" />
      )}
    </>
  );

  if (isDrawer) {
    return (
      <Drawer
        title="Dicom Tag"
        placement="right"
        onClose={() => handleModalToggle("TagInfo", !isModalOpen)}
        open={isModalOpen}
        width={720}
      >
        {content}
      </Drawer>
    );
  }

  return (
    <Modal
      aria-label="tag info"
      onEscapePress={() => {
        handleModalToggle("TagInfo", !isModalOpen);
      }}
      variant={ModalVariant.large}
      title="Dicom Tag"
      isOpen={isModalOpen}
      onClose={() => handleModalToggle("TagInfo", !isModalOpen)}
    >
      {content}
    </Modal>
  );
};
