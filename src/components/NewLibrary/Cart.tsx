import type {
  Feed,
  FileBrowserFolder,
  FileBrowserFolderFile,
} from "@fnndsc/chrisapi";
import { Button, Grid, GridItem, Text, Tooltip } from "@patternfly/react-core";
import { useMutation } from "@tanstack/react-query";
import { Alert, Drawer, List } from "antd";
import { useContext, useState } from "react";
import ChrisAPIClient from "../../api/chrisapiclient";
import { MainRouterContext } from "../../routes";
import { useTypedSelector } from "../../store/hooks";
import { DotsIndicator } from "../Common";
import { getPlugin } from "../CreateFeed/createFeedHelper";
import { CheckCircleIcon, FileIcon, FolderIcon } from "../Icons";
import {
  DownloadTypes,
  FolderDownloadTypes,
  LibraryContext,
  SelectionPayload,
} from "./context";
import {
  clearCart,
  clearSelectFolder,
  downloadFileStatus,
  downloadFolderStatus,
} from "./context/actions";
import { downloadFile } from "./useDownloadHook";
import { elipses } from "./utils";

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

const Cart = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const router = useContext(MainRouterContext);
  const username = useTypedSelector((state) => state.user.username);
  const cannotDownload = [
    "home",
    `home/${username}`,
    `home/${username}/uploads`,
    "SERVICES",
  ];
  const { state, dispatch } = useContext(LibraryContext);
  const [feedCreationError, setFeedCreatorError] = useState<{
    paths: string[];
    error_message: string;
  }>({
    paths: [],
    error_message: "",
  });

  const [downloadError, setDownloadError] = useState<{
    paths: string[];
    error_message: string;
  }>({
    paths: [],
    error_message: "",
  });

  const createFeed = () => {
    const invalidPaths: string[] = [];
    const validPaths: string[] = [];
    state.selectedPaths.forEach(({ path }) => {
      if (cannotDownload.includes(path)) {
        invalidPaths.push(path);
      } else {
        validPaths.push(path);
      }
    });

    if (invalidPaths.length > 0) {
      setFeedCreatorError({
        ...feedCreationError,
        paths: [...feedCreationError.paths, ...invalidPaths],
        error_message: "Please avoid creating feeds with folders listed here:",
      });
    }
    validPaths.length > 0 && router.actions.createFeedWithData(validPaths);
  };

  const clearFeed = () => {
    router.actions.clearFeedData();
  };

  const setDownloadErrorState = (
    payload: FileBrowserFolder,
    path: string,
    error_message: string,
  ) => {
    dispatch(
      downloadFolderStatus(
        payload as FileBrowserFolder,
        FolderDownloadTypes.cancelled,
      ),
    );
    setDownloadError({
      ...downloadError,
      paths: [...downloadError.paths, path],
      error_message,
    });
  };

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
        dispatch(
          downloadFolderStatus(
            payload as FileBrowserFolder,
            FolderDownloadTypes.started,
          ),
        );

        const path = payload.data.path;

        if (cannotDownload.includes(path)) {
          setDownloadErrorState(
            payload as FileBrowserFolder,
            path,
            `Please don't zip folders in this list: ${cannotDownload.join(
              ", ",
            )}`,
          );
          continue;
        }

        const client = ChrisAPIClient.getClient();

        dispatch(
          downloadFolderStatus(
            payload as FileBrowserFolder,
            FolderDownloadTypes.creatingFeed,
          ),
        );

        const dircopy = await getPlugin("pl-dircopy");

        if (!dircopy) {
          setDownloadErrorState(
            payload as FileBrowserFolder,
            path,
            "Failed to find dircopy",
          );
          continue;
        }

        if (dircopy) {
          const createdInstance = await client.createPluginInstance(
            dircopy.data.id,
            {
              //@ts-ignore
              dir: path,
            },
          );

          const feed = (await createdInstance.getFeed()) as Feed;

          if (!feed) {
            setDownloadErrorState(
              payload as FileBrowserFolder,
              path,
              "Failed to create a Feed",
            );
            continue;
          }

          const folderNameList = payload.data.path.split("/");
          const folderName =
            folderNameList[folderNameList.length - 1] || payload.data.id;

          await feed.put({
            name: `Library Download for ${folderName}`,
          });

          dispatch(
            downloadFolderStatus(
              payload as FileBrowserFolder,
              FolderDownloadTypes.zippingFolder,
            ),
          );

          const pipelineList = await client.getPipelines({
            name: "zip v20240311",
          });

          if (!pipelineList.data) {
            setDownloadErrorState(
              payload as FileBrowserFolder,
              path,
              "Please register the zip pipeline with the name v20240311",
            );
            continue;
          }

          const pipelines = pipelineList.getItems();

          if (pipelines && pipelines.length > 0) {
            const pipeline = pipelines[0];

            const { id } = pipeline.data;

            //@ts-ignore
            const workflow = await client.createWorkflow(id, {
              previous_plugin_inst_id: createdInstance?.data.id,
            });

            const pluginInstancesList = await workflow.getPluginInstances({
              limit: 2,
            });
            const pluginInstances = pluginInstancesList.getItems();

            if (pluginInstances && pluginInstances.length > 0) {
              const zipInstance = pluginInstances[pluginInstances.length - 1];
              const statusReq = await zipInstance.get();
              let status = statusReq.data.status;

              while (status !== "finishedSuccessfully") {
                await new Promise((resolve) => setTimeout(resolve, 5000)); // Polling every 5 seconds
                const statusReq = await zipInstance.get();
                status = statusReq.data.status;
              }

              const filePath = `home/${username}/feeds/feed_${feed.data.id}/pl-dircopy_${createdInstance.data.id}/pl-pfdorun_${zipInstance.data.id}/data`;

              if (status === "finishedSuccessfully") {
                const folderList = await client.getFileBrowserFolders({
                  path: filePath,
                });

                if (!folderList) {
                  setDownloadErrorState(
                    payload as FileBrowserFolder,
                    path,
                    `Failed to find files under this ${filePath}`,
                  );
                  continue;
                }

                const folders = folderList.getItems();

                if (folders) {
                  const folder = folders[0];
                  const files = await folder.getFiles();
                  const fileItems = files.getItems();
                  const fileToZip = fileItems[0];
                  await downloadFile(fileToZip);
                  dispatch(
                    downloadFolderStatus(
                      payload as FileBrowserFolder,
                      FolderDownloadTypes.finished,
                    ),
                  );
                }
              }
            }
          }
        }
      }
    }
  };

  const handleDownloadMutation = useMutation({
    mutationFn: () => handleDownload(),
  });

  const { mutate } = handleDownloadMutation;

  return (
    <Drawer
      width={600}
      title="Cart"
      placement="right"
      closable={true}
      onClose={onClose}
      open={open}
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
              setFeedCreatorError({
                paths: [],
                error_message: "",
              });
              setDownloadError({
                paths: [],
                error_message: "",
              });
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
                      {elipses(item.path, 30)}
                    </a>
                  </Tooltip>
                }
              />
            </List.Item>
          );
        }}
      />
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
    </Drawer>
  );
};

export default Cart;
