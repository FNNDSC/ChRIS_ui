import { Button, Text, Tooltip } from "@patternfly/react-core";
import { isEmpty } from "lodash";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { getFileName } from "../../../api/common";
import {
  cancelUpload,
  clearDownloadStatus,
  clearUploadState,
  setToggleCart,
} from "../../../store/cart/cartSlice";
import {
  DownloadTypes,
  type FileUpload,
  type FileUploadObject,
  type FolderUpload,
  type FolderUploadObject,
} from "../../../store/cart/types";
import type { AppDispatch } from "../../../store/configureStore";
import { useTypedSelector } from "../../../store/hooks";
import { Drawer, List, Popconfirm, Space } from "../../Antd";
import { DotsIndicator, EmptyStateComponent } from "../../Common";
import { CheckCircleIcon, CloseIcon, FileIcon, FolderIcon } from "../../Icons";
import { ShowInFolder, TitleNameClipped, elipses } from "../utils/longpress";
import "./Cart.css";
import { clearCart } from "../../../store/cart/cartSlice";
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
              // This version of cart only clears out finished operations
              dispatch(clearCart());
            }}
          >
            Clear Notifications
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
                    name={
                      status.fileName ? getFileName(status.fileName) : "N/A"
                    }
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
                      name={
                        status.fileName ? getFileName(status.fileName) : "N/A"
                      }
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

      <UploadList
        uploadStatus={fileUploadStatus}
        type="file"
        dispatch={dispatch}
      />
      <UploadList
        uploadStatus={folderUploadStatus}
        type="folder"
        dispatch={dispatch}
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

/************************************************ */
/*  Utility Components for the cart                */
/*********************************************** */
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

type UploadStatusProp = FileUpload | FolderUpload;
interface UploadListProps {
  uploadStatus: UploadStatusProp;
  type: "file" | "folder";
  dispatch: AppDispatch;
}
const UploadList: React.FC<UploadListProps> = ({
  uploadStatus,
  type,
  dispatch,
}) => (
  <List
    className="operation-cart"
    dataSource={Object.entries(uploadStatus)}
    renderItem={([name, status]) => (
      <UploadStatus
        status={status}
        type={type}
        name={name}
        dispatch={dispatch}
      />
    )}
  />
);

interface UploadStatusProps {
  status: FileUploadObject | FolderUploadObject;
  type: "file" | "folder";
  name: string;
  dispatch: AppDispatch;
}
const UploadStatus: React.FC<UploadStatusProps> = ({
  status,
  type,
  name,
  dispatch,
}) => {
  const isError =
    status.currentStep.includes("Cancelled") ||
    status.currentStep.startsWith("Error");
  const isComplete =
    type === "file"
      ? (status as FileUploadObject).progress === 100 &&
        status.currentStep === "Upload Complete"
      : (status as FolderUploadObject).done ===
          (status as FolderUploadObject).total &&
        status.currentStep === "Upload Complete";

  const handleAction = () => {
    if (status.currentStep === "Uploading...") {
      dispatch(cancelUpload({ type, id: name }));
    } else {
      dispatch(clearUploadState({ type, id: name }));
    }
  };

  return (
    <List.Item
      key={name}
      actions={[
        <div key={`status-${name}`}>
          <TitleNameClipped value={35} name={status.currentStep} />
        </div>,
        isComplete ? (
          <CheckCircleIcon
            key={`anon-${name}-progress`}
            color="#3E8635"
            width="2em"
            height="2em"
          />
        ) : isError ? (
          <CloseIcon
            color="red"
            width="2em"
            height="2em"
            key={`anon-${name}-cancel`}
          />
        ) : type === "file" ? (
          <ProgressRing
            key={`anon-${name}-progress`}
            value={(status as FileUploadObject).progress}
          />
        ) : (
          <div key={`anon-${name}-progress`}>
            {(status as FolderUploadObject).done}/
            {(status as FolderUploadObject).total}
          </div>
        ),
        <ShowInFolder
          isError={isError}
          key={`anon-${name}-show`}
          path={status.path}
        />,
        <Button
          onClick={handleAction}
          variant="secondary"
          size="sm"
          key={`a-${name}`}
        >
          {status.currentStep === "Uploading..." ? "Cancel" : "Clear"}
        </Button>,
      ]}
    >
      <List.Item.Meta
        avatar={type === "file" ? <FileIcon /> : <FolderIcon />}
        title={<TitleNameClipped name={name} value={30} />}
      />
    </List.Item>
  );
};
