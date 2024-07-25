import { Button, Text, Tooltip } from "@patternfly/react-core";
import { Drawer, List, Space } from "antd";
import { useDispatch } from "react-redux";
import {
  clearSelectFolder,
  clearDownloadStatus,
  setToggleCart,
  startAnonymize,
} from "../../../store/cart/actions";
import type { SelectionPayload } from "../../../store/cart/types";
import { useTypedSelector } from "../../../store/hooks";
import { DotsIndicator, EmptyStateComponent } from "../../Common";
import {
  CheckCircleIcon,
  CloseIcon,
  DownloadIcon,
  FileIcon,
  FolderIcon,
} from "../../Icons";
import "./Cart.css";
import { isEmpty } from "lodash";
import ProgressRing from "./RadialProgress";
import { DownloadTypes } from "../../../store/cart/types";

const Cart = () => {
  const dispatch = useDispatch();
  const {
    openCart,
    selectedPaths,
    fileUploadStatus,
    folderUploadStatus,
    fileDownloadStatus,
    folderDownloadStatus,
  } = useTypedSelector((state) => state.cart);

  return (
    <Drawer
      width={"600px"}
      title={<>Notification Panel</>}
      open={openCart}
      onClose={() => {
        dispatch(setToggleCart());
      }}
      extra={
        <Space>
          <Button
            style={{ color: "inherit" }}
            variant="danger"
            onClick={() => {}}
          >
            Clear Cart
          </Button>
        </Space>
      }
    >
      {(!isEmpty(fileDownloadStatus) || !isEmpty(folderDownloadStatus)) && (
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
                      dispatch(clearDownloadStatus(item.path));
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
                  avatar={
                    item.type === "folder" ? <FolderIcon /> : <FileIcon />
                  }
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
      )}
      <List
        className="operation-cart"
        dataSource={Object.entries(fileUploadStatus)}
        renderItem={([name, status]) => (
          <List.Item
            key={name}
            actions={[
              status.currentStep === "Upload Complete" ||
              status.progress === 100 ? (
                <Tooltip key={`anon-${name}`} content="Anonymize and Download">
                  <Button
                    onClick={() => {
                      dispatch(
                        startAnonymize({
                          fileUpload: fileUploadStatus,
                          folderUpload: {},
                        }),
                      );
                    }}
                    variant="link"
                    icon={<DownloadIcon />}
                  />
                </Tooltip>
              ) : null,
              <div key={`status-${name}`}>{status.currentStep}</div>,
              status.progress === 100 ||
              status.currentStep === "UploadComplete" ? (
                <CheckCircleIcon
                  key={`anon-${name}-progress`}
                  color="#3E8635"
                  width="2em"
                  height="2em"
                />
              ) : (
                <ProgressRing
                  key={`anon-${name}-progress`}
                  value={status.progress}
                />
              ),
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
            <List.Item.Meta avatar={<FileIcon />} title={name} />
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
              status.currentStep === "Upload Complete" ||
              status.done === status.total ? (
                <Tooltip key={`anon-${name}`} content="Anonymize and Download">
                  <Button
                    onClick={() => {
                      dispatch(
                        startAnonymize({
                          fileUpload: {},
                          folderUpload: folderUploadStatus,
                        }),
                      );
                    }}
                    variant="link"
                    icon={<DownloadIcon />}
                  />
                </Tooltip>
              ) : null,
              <div key={`anon-${name}-progress`}>{status.currentStep}</div>,
              status.done === status.total ||
              status.currentStep === "UploadComplete" ? (
                <CheckCircleIcon
                  key={`anon-${name}-progress`}
                  color="#3E8635"
                  width="2em"
                  height="2em"
                />
              ) : status.currentStep.includes("Cancelled") ? (
                <CloseIcon
                  color="red"
                  width="2em"
                  height="2em"
                  key={`anon-${name}-cancel`}
                />
              ) : (
                <div key={`anon-${name}-progress`}>
                  {status.done}/{status.total}
                </div>
              ),
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
            <List.Item.Meta avatar={<FolderIcon />} title={name} />
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

export const Status = ({ item }: { item: SelectionPayload }) => {
  const fileDownloadStatus = useTypedSelector(
    (state) => state.cart.fileDownloadStatus,
  );
  const folderDownloadStatus = useTypedSelector(
    (state) => state.cart.folderDownloadStatus,
  );

  const { type, payload } = item;
  const { id } = payload.data;

  const getStatusIcon = (currentStatus: DownloadTypes | undefined) => {
    switch (currentStatus) {
      case DownloadTypes.started:
        return <DotsIndicator title="" />;
      case DownloadTypes.finished:
        return (
          <Button
            variant="plain"
            icon={<CheckCircleIcon color="#3E8635" width="2em" height="2em" />}
          />
        );
      case DownloadTypes.cancelled:
        return <Text>Cancelled</Text>;
      default:
        return currentStatus ? <DotsIndicator title={currentStatus} /> : null;
    }
  };

  if (type === "file") {
    return getStatusIcon(fileDownloadStatus[id]);
  }

  if (type === "folder") {
    return getStatusIcon(folderDownloadStatus[id]);
  }

  return null;
};
