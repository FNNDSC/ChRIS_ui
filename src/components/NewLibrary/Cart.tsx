import { Button, Grid, GridItem, Text, Tooltip } from "@patternfly/react-core";
import { Alert, Drawer, List } from "antd";
import { useContext } from "react";
import { DotsIndicator } from "../Common";
import { CheckCircleIcon, FileIcon, FolderIcon } from "../Icons";
import {
  DownloadTypes,
  FolderDownloadTypes,
  LibraryContext,
  Types,
  SelectionPayload,
} from "./context";
import { elipses } from "./utils";
import useOperations from "./useOperations";
import {
  clearSelectFolder,
  clearCart,
  clearDownloadFileStatus,
  clearDownloadFolderStatus,
} from "./context/actions";

const folderStatusMap: {
  [key: string]: string;
} = {
  STARTED: "Started",
  CREATING_FEED: "Creating Feed",
  ZIPPING_FOLDER: "Preparing to Zip",
  STARTING_DOWNLOAD: "Starting Download",
  FINISHED: "Finished",
};

export const Status = ({ item }: { item: SelectionPayload }) => {
  const { state } = useContext(LibraryContext);
  const { fileDownloadStatus, folderDownloadStatus } = state;
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

  if (type === "folder") {
    const currentStatus = folderDownloadStatus[payload.data.id];

    return (
      <>
        {currentStatus === FolderDownloadTypes.finished ? (
          <Button
            variant="plain"
            icon={<CheckCircleIcon color="#3E8635" width="2em" height="2em" />}
          />
        ) : currentStatus === FolderDownloadTypes.cancelled ? (
          <Text>Cancelled</Text>
        ) : currentStatus ? (
          <DotsIndicator title={folderStatusMap[currentStatus]} />
        ) : null}
      </>
    );
  }
};

const Cart = () => {
  const { state, dispatch } = useContext(LibraryContext);
  const {
    handleDownloadMutation,
    createFeed,
    feedCreationError,
    downloadError,
    clearFeed,
    cannotDownload,
    resetErrors,
  } = useOperations();
  const { mutate } = handleDownloadMutation;

  return (
    <Drawer
      width={600}
      title="Cart"
      placement="right"
      closable={true}
      onClose={() => {
        dispatch({
          type: Types.SET_TOGGLE_CART,
        });
      }}
      open={state.openCart}
    >
      <Grid hasGutter={true}>
        <GridItem span={6}>
          <Button
            onClick={() => createFeed()}
            style={{ marginRight: "0.5em" }}
            size="sm"
            variant="primary"
          >
            Create Feed
          </Button>
          <Button onClick={() => mutate()} size="sm" variant="primary">
            Download
          </Button>
        </GridItem>

        <GridItem span={6}>
          <Button
            size="sm"
            onClick={() => {
              dispatch(clearCart());
              // Clear out errors if any
              handleDownloadMutation.reset();
              resetErrors();
            }}
            style={{
              marginRight: "0.5em",
            }}
          >
            Clear All
          </Button>
          <Button isDisabled={true} size="sm" variant="danger">
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
                    clearFeed();
                    clearDownloadFileStatus(item.payload.data.id);
                    clearDownloadFolderStatus(item.payload.data.id);
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
                        color: "inherit",
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
      <div
        style={{
          marginTop: "1rem",
        }}
      >
        {downloadError.paths.length > 0 && (
          <Alert
            type="error"
            closable
            description={downloadError.error_message}
          />
        )}
        {feedCreationError.paths.length > 0 && (
          <Alert
            type="error"
            closable
            description={`${
              feedCreationError.error_message
            } ${cannotDownload.join(", ")}`}
          />
        )}
      </div>
    </Drawer>
  );
};

export default Cart;
