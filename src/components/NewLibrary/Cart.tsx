import type {
  FileBrowserFolderFile,
  FileBrowserFolder,
  Feed,
} from "@fnndsc/chrisapi";
import { Button, Grid, GridItem, Tooltip } from "@patternfly/react-core";
import { Drawer, List } from "antd";
import { useContext } from "react";
import { DotsIndicator } from "../Common";
import { CheckCircleIcon, FileIcon, FolderIcon } from "../Icons";
import {
  DownloadTypes,
  FolderDownloadTypes,
  LibraryContext,
  SelectionPayload,
} from "./context";
import {
  clearCart,
  clearDownloadFolderStaus,
  clearDownloadFileStatus,
  clearSelectFolder,
  downloadFileStatus,
  downloadFolderStatus,
} from "./context/actions";
import { downloadFile } from "./useDownloadHook";
import { elipses } from "./utils";
import { getPlugin } from "../CreateFeed/createFeedHelper";
import ChrisAPIClient from "../../api/chrisapiclient";
import { useMutation } from "@tanstack/react-query";
import { Alert } from "antd";
import { useTypedSelector } from "../../store/hooks";

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
  const username = useTypedSelector((state) => state.user.username);
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
        dispatch(
          downloadFolderStatus(
            payload as FileBrowserFolder,
            FolderDownloadTypes.started,
          ),
        );

        const path = payload.data.path;
        const client = ChrisAPIClient.getClient();

        dispatch(
          downloadFolderStatus(
            payload as FileBrowserFolder,
            FolderDownloadTypes.creatingFeed,
          ),
        );

        try {
          const dircopy = await getPlugin("pl-dircopy");

          if (!dircopy) {
            throw new Error("Failed to find pl-dircopy");
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
              throw new Error("Failed to create a Feed");
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

            if (!pipelineList) {
              throw new Error(
                "Is the zip pipeline registered with the name zip v20240311",
              );
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
                    throw new Error(
                      `Could not fetch files for this path: ${filePath}`,
                    );
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
        } catch (e) {
          // biome-ignore lint/complexity/noUselessCatch: <explanation>
          throw e;
        }
      }
    }

    dispatch(clearDownloadFileStatus);
    dispatch(clearDownloadFolderStaus);
  };

  const handleDownloadMutation = useMutation({
    mutationFn: () => handleDownload(),
  });

  const { isError, error, mutate } = handleDownloadMutation;

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
          <Button onClick={() => mutate()} size="sm" variant="primary">
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
      {isError && <Alert type="error" description={error.message} />}
    </Drawer>
  );
};

export default Cart;
