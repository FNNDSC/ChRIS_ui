import type { FileBrowserFolderFile } from "@fnndsc/chrisapi";
import { Button, Grid, GridItem, Tooltip } from "@patternfly/react-core";
import { Drawer, List } from "antd";
import { useContext } from "react";
import { DotsIndicator } from "../Common";
import { CheckCircleIcon, FileIcon, FolderIcon } from "../Icons";
import { DownloadTypes, LibraryContext, SelectionPayload } from "./context";
import {
  clearCart,
  clearSelectFolder,
  downloadFileStatus,
} from "./context/actions";
import { downloadFile } from "./useDownloadHook";
import { elipses } from "./utils";

export const Status = ({ item }: { item: SelectionPayload }) => {
  const { state } = useContext(LibraryContext);
  const { fileDownloadStatus } = state;
  const { type, payload } = item;

  if (type === "file") {
    const currentStatus = fileDownloadStatus[payload.data.id];
    return (
      <>
        {currentStatus === DownloadTypes.progress ? (
          <DotsIndicator title="" />
        ) : currentStatus === DownloadTypes.finished ? (
          <Button
            variant="plain"
            icon={<CheckCircleIcon color="#3E8635" width="2em" height="2em" />}
          />
        ) : null}
      </>
    );
  }
};

const Cart = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const { state, dispatch } = useContext(LibraryContext);

  const handleDownload = async () => {
    const { selectedPaths } = state;

    for (const userSelection of selectedPaths) {
      const { type, payload } = userSelection;

      if (type === "file") {
        dispatch(
          downloadFileStatus(
            payload as FileBrowserFolderFile,
            DownloadTypes.progress,
          ),
        );
        const file = await downloadFile(payload as FileBrowserFolderFile);

        if (file) {
          dispatch(
            downloadFileStatus(
              payload as FileBrowserFolderFile,
              DownloadTypes.finished,
            ),
          );
        }
      }

      if (type === "folder") {
        console.log("We got to do the zip operation here");
      }
    }
  };

  return (
    <Drawer
      width={500}
      title="Cart"
      placement="right"
      closable={true}
      onClose={onClose}
      open={open}
    >
      <Grid hasGutter={true}>
        <GridItem span={6}>
          <Button style={{ marginRight: "0.5em" }} size="sm" variant="primary">
            Create Feed
          </Button>
          <Button onClick={handleDownload} size="sm" variant="primary">
            Download
          </Button>
        </GridItem>

        <GridItem span={6}>
          <Button
            size="sm"
            onClick={() => {
              dispatch(clearCart());
            }}
            style={{
              marginRight: "0.5em",
            }}
          >
            Clear All
          </Button>
          <Button size="sm" variant="danger">
            Delete
          </Button>
        </GridItem>
      </Grid>

      <List
        style={{ marginTop: "2rem" }}
        dataSource={state.selectedPaths}
        bordered
        renderItem={(item) => {
          return (
            <List.Item
              key={item.path}
              actions={[
                <Status item={item} />,
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    dispatch(clearSelectFolder(item.path));
                  }}
                  key={`a-${item}`}
                >
                  Clear
                </Button>,
              ]}
            >
              <List.Item.Meta
                avatar={item.type === "folder" ? <FolderIcon /> : <FileIcon />}
                title={
                  <Tooltip content={item.path}>
                    <a
                      style={{
                        color: "white",
                      }}
                      href="https://ant.design/index-cn"
                    >
                      {elipses(item.path, 40)}
                    </a>
                  </Tooltip>
                }
              />
            </List.Item>
          );
        }}
      />
    </Drawer>
  );
};

export default Cart;
