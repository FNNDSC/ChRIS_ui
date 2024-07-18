import { Button, Text, Tooltip } from "@patternfly/react-core";
import { Drawer, List, Space } from "antd";
import { useDispatch } from "react-redux";
import {
  clearSelectFolder,
  setToggleCart,
  startDownload,
} from "../../../store/cart/actionts";
import type { SelectionPayload } from "../../../store/cart/types";
import { useTypedSelector } from "../../../store/hooks";
import { DotsIndicator, EmptyStateComponent } from "../../Common";
import { CheckCircleIcon, FileIcon, FolderIcon } from "../../Icons";
import "./Cart.css";
import { isEmpty } from "lodash";

const Cart = () => {
  const dispatch = useDispatch();
  const { openCart, selectedPaths, fileUploadStatus, folderUploadStatus } =
    useTypedSelector((state) => state.cart);

  return (
    <Drawer
      width={"500px"}
      title={
        <>
          <Button
            style={{
              marginRight: "1em",
            }}
          >
            Create Feed
          </Button>
          <Button
            onClick={() => {
              dispatch(startDownload(selectedPaths));
            }}
          >
            Download
          </Button>
        </>
      }
      open={openCart}
      onClose={() => {
        dispatch(setToggleCart());
      }}
      extra={
        <Space>
          <Button
            style={{ color: "inherit" }}
            variant="danger"
            onClick={() => {
              console.log("Clicked");
            }}
          >
            Clear Cart
          </Button>
        </Space>
      }
    >
      <List
        className="operation-cart"
        dataSource={selectedPaths}
        renderItem={(item) => {
          return (
            <List.Item
              key={item.path}
              actions={[
                <Status key={`s-${item.path}`} item={item} />,
                <Button
                  onClick={() => {
                    dispatch(clearSelectFolder(item.path));
                  }}
                  variant="secondary"
                  size="sm"
                  key={`a-${item.path}`}
                >
                  Clear
                </Button>,
              ]}
            >
              <List.Item.Meta
                avatar={item.type === "folder" ? <FolderIcon /> : <FileIcon />}
                title={
                  <Tooltip content={item.path}>
                    <a href="http://" style={{ color: "inherit" }}>
                      {item.path}
                    </a>
                  </Tooltip>
                }
              />
            </List.Item>
          );
        }}
      />

      <List
        className="operation-cart"
        dataSource={Object.entries(fileUploadStatus)}
        renderItem={([name, status]) => (
          <List.Item
            key={name}
            actions={[
              <div key={`status-${name}`}>{status.progress}</div>,
              <Button
                onClick={() => {
                  status.controller.abort();
                }}
                variant="secondary"
                size="sm"
                key={`a-${name}`}
              >
                Cancel
              </Button>,
            ]}
          >
            <List.Item.Meta
              avatar={<FileIcon />}
              title={name}
              description={`Progress: ${status.progress}% - Step: ${status.currentStep}`}
            />
          </List.Item>
        )}
      />

      <List
        className="operation-cart"
        dataSource={Object.entries(folderUploadStatus)}
        renderItem={([name, status]) => (
          <List.Item
            key={name}
            actions={[
              <div key={`status-${name}`}>
                {status.done}/{status.total}
              </div>,
              <Button
                onClick={() => {
                  status.controller.abort();
                }}
                variant="secondary"
                size="sm"
                key={`a-${name}`}
              >
                Cancel
              </Button>,
            ]}
          >
            <List.Item.Meta
              avatar={<FolderIcon />}
              title={name}
              description={`Step: ${status.currentStep}`}
            />
          </List.Item>
        )}
      />

      {isEmpty(folderUploadStatus) &&
        isEmpty(fileUploadStatus) &&
        isEmpty(selectedPaths) && <EmptyStateComponent title="No data..." />}
    </Drawer>
  );
};

export default Cart;

export enum DownloadTypes {
  started = "started",
  progress = "progress",
  finished = "finished",
  cancelled = "cancelled",
}

export const Status = ({ item }: { item: SelectionPayload }) => {
  const fileDownloadStatus = useTypedSelector(
    (state) => state.cart.fileDownloadStatus,
  );
  const folderDownloadStatus = useTypedSelector(
    (state) => state.cart.folderDownloadStatus,
  );

  const { type, payload } = item;
  const { id } = payload.data;

  if (type === "file") {
    const currentStatus = fileDownloadStatus[id];

    return (
      <>
        {currentStatus === DownloadTypes.started ? (
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
    const currentStatus = folderDownloadStatus[id];

    return (
      <>
        {currentStatus === DownloadTypes.finished ? (
          <Button
            variant="plain"
            icon={<CheckCircleIcon color="#3E8635" width="2em" height="2em" />}
          />
        ) : currentStatus === DownloadTypes.cancelled ? (
          <Text>Cancelled</Text>
        ) : currentStatus ? (
          <DotsIndicator title={currentStatus} />
        ) : null}
      </>
    );
  }
};
