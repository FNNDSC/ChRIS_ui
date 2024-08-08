import { Button, Text, Tooltip } from "@patternfly/react-core";
import { Drawer, List, Popconfirm, Space } from "antd";
import { isEmpty } from "lodash";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { getFileName } from "../../../api/common";
import {
  cancelUpload,
  clearDownloadStatus,
  clearUploadState,
  setToggleCart,
} from "../../../store/cart/actions";
import { DownloadTypes } from "../../../store/cart/types";
import { useTypedSelector } from "../../../store/hooks";
import { DotsIndicator, EmptyStateComponent } from "../../Common";
import { CheckCircleIcon, CloseIcon, FileIcon, FolderIcon } from "../../Icons";
import { ShowInFolder, TitleNameClipped, elipses } from "../utils/longpress";
import "./Cart.css";
import ProgressRing from "./RadialProgress";

const Cart = () => {
  const dispatch = useDispatch();
  const {
    openCart,
    fileUploadStatus,
    folderUploadStatus,
    fileDownloadStatus,
    folderDownloadStatus,
  } = useTypedSelector((state) => state.cart);

  return (
    <Drawer
      width={"700px"}
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
            onClick={() => {
              // Implement clear cart logic here
            }}
          >
            Clear Cart
          </Button>
        </Space>
      }
    >
      {/** Code for File and Folder Downloads */}
      {!isEmpty(fileDownloadStatus) && (
        <List
          className="operation-cart"
          dataSource={Object.entries(fileDownloadStatus)}
          renderItem={([id, status]) => (
            <List.Item
              key={id}
              actions={[
                <Status key={`status-${id}`} currentStatus={status} />,
                <Button
                  onClick={() => {
                    dispatch(
                      clearDownloadStatus({
                        path: id,
                        type: "file",
                      }),
                    );
                  }}
                  variant="secondary"
                  size="sm"
                  key={`a-${id}`}
                >
                  Clear
                </Button>,
              ]}
            >
              <List.Item.Meta
                avatar={<FileIcon />}
                title={
                  <TitleNameClipped
                    name={getFileName(status.fileName)}
                    value={40}
                  />
                }
              />
            </List.Item>
          )}
        />
      )}

      {/** Code for Folder Downloads */}
      {!isEmpty(folderDownloadStatus) && (
        <List
          className="operation-cart"
          dataSource={Object.entries(folderDownloadStatus)}
          renderItem={([id, status]) => {
            const isInProgress = status.step === DownloadTypes.progress;
            const buttonText = isInProgress ? "Cancel" : "Clear";

            const handleAction = () => {
              dispatch(
                clearDownloadStatus({
                  path: id,
                  type: "folder",
                }),
              );
            };

            const ActionButton = (
              <Button
                variant="secondary"
                size="sm"
                key={`a-${id}`}
                onClick={isInProgress ? undefined : handleAction}
              >
                {buttonText}
              </Button>
            );

            const description = (
              <span>
                You will lose progress if you cancel.
                {status.feed && (
                  <>
                    {" "}
                    You can download it from here:{" "}
                    <Link
                      to={`feeds/${status.feed.data.id}?type=${status.feed.data.public ? "public" : "private"}`} // Adjust this route as needed
                      onClick={(e) => e.stopPropagation()} // Prevent Popconfirm from closing when clicking the link
                    >
                      {status.feed.data.name}
                    </Link>
                  </>
                )}
              </span>
            );

            return (
              <List.Item
                key={id}
                actions={[
                  <Status key={`status-${id}`} currentStatus={status} />,
                  isInProgress ? (
                    <Popconfirm
                      placement="top"
                      key={`a-${id}`}
                      title="Are you sure you want to cancel?"
                      description={description}
                      onConfirm={handleAction}
                      okText="Yes"
                      cancelText="No"
                    >
                      {ActionButton}
                    </Popconfirm>
                  ) : (
                    ActionButton
                  ),
                ]}
              >
                <List.Item.Meta
                  avatar={<FolderIcon />}
                  title={
                    <TitleNameClipped
                      name={getFileName(status.fileName)}
                      value={30}
                    />
                  }
                />
              </List.Item>
            );
          }}
        />
      )}

      {/** Code for File and Folder Uploads */}
      <List
        className="operation-cart"
        dataSource={Object.entries(fileUploadStatus)}
        renderItem={([name, status]) => (
          <List.Item
            key={name}
            actions={[
              <div key={`status-${name}`}>
                {<TitleNameClipped value={35} name={status.currentStep} />}
              </div>,
              status.progress === 100 ||
              status.currentStep === "UploadComplete" ? (
                <CheckCircleIcon
                  key={`anon-${name}-progress`}
                  color="#3E8635"
                  width="2em"
                  height="2em"
                />
              ) : status.currentStep.includes("Cancelled") ||
                status.currentStep.startsWith("Error") ? (
                <CloseIcon
                  color="red"
                  width="2em"
                  height="2em"
                  key={`anon-${name}-cancel`}
                />
              ) : (
                <ProgressRing
                  key={`anon-${name}-progress`}
                  value={status.progress}
                />
              ),
              <ShowInFolder key={`anon-${name}-show`} path={status.path} />,
              <Button
                onClick={() => {
                  if (status.currentStep === "Uploading...") {
                    dispatch(
                      cancelUpload({
                        type: status.type,
                        id: name,
                      }),
                    );
                  } else {
                    dispatch(
                      clearUploadState({
                        type: status.type,
                        id: name,
                      }),
                    );
                  }
                }}
                variant="secondary"
                size="sm"
                key={`a-${name}`}
              >
                {status.currentStep === "Uploading..." ? "Cancel" : "Clear"}
              </Button>,
            ]}
          >
            <List.Item.Meta
              avatar={<FileIcon />}
              title={<TitleNameClipped name={name} value={30} />}
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
              <div key={`anon-${name}-progress`}>{status.currentStep}</div>,
              status.done === status.total ||
              status.currentStep === "UploadComplete" ? (
                <CheckCircleIcon
                  key={`anon-${name}-progress`}
                  color="#3E8635"
                  width="2em"
                  height="2em"
                />
              ) : status.currentStep.includes("Cancelled") ||
                status.currentStep.startsWith("Error") ? (
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
              <ShowInFolder key={`anon-${name}-show`} path={status.path} />,
              <Button
                onClick={() => {
                  if (status.currentStep === "Uploading...") {
                    dispatch(
                      cancelUpload({
                        type: status.type,
                        id: name,
                      }),
                    );
                  } else {
                    dispatch(
                      clearUploadState({
                        type: status.type,
                        id: name,
                      }),
                    );
                  }
                }}
                variant="secondary"
                size="sm"
                key={`a-${name}`}
              >
                {status.currentStep === "Uploading..." ? "Cancel" : "Clear"}
              </Button>,
            ]}
          >
            <List.Item.Meta
              avatar={<FolderIcon />}
              title={<TitleNameClipped name={name} value={30} />}
            />
          </List.Item>
        )}
      />
      {isEmpty(folderUploadStatus) &&
        isEmpty(fileUploadStatus) &&
        isEmpty(fileDownloadStatus) &&
        isEmpty(folderDownloadStatus) && (
          <EmptyStateComponent title="No data..." />
        )}
    </Drawer>
  );
};

export default Cart;

export const Status = ({
  currentStatus,
}: {
  currentStatus: { step: DownloadTypes; error?: string };
}) => {
  const { step, error } = currentStatus;
  switch (step) {
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
      return (
        <Tooltip content={error}>
          <Text>{error ? elipses(error, 45) : "Uncaught error"}</Text>
        </Tooltip>
      );
    default:
      return currentStatus ? <DotsIndicator title={step} /> : null;
  }
};
