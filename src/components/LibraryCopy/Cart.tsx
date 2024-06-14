import { Button, Tooltip, Progress } from "@patternfly/react-core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert, Drawer, List } from "antd";
import axios from "axios";
import { useContext, useState } from "react";
import ChrisAPIClient from "../../api/chrisapiclient";
import { catchError, fetchResource } from "../../api/common";
import { MainRouterContext } from "../../App";
import { useTypedSelector } from "../../store/hooks";
import { LibraryContext, Types } from "./context";
import { clearCart, clearSelectFolder } from "./context/actions";
import { elipses } from "./utils";
import { useLocation } from "react-router";
import { getPlugin } from "../CreateFeed/createFeedHelper";
import { Feed } from "@fnndsc/chrisapi";
import { SpinContainer } from "../Common";

export default function Cart() {
  const { pathname } = useLocation();

  const libraryActions = pathname.startsWith("/library");
  const pacsActions = pathname.startsWith("/pacs");

  const queryClient = useQueryClient();
  const username = useTypedSelector((state) => state.user.username);
  const { state, dispatch } = useContext(LibraryContext);
  const router = useContext(MainRouterContext);
  const { selectedPaths } = state;
  const [progress, setProgress] = useState({
    currentStep: "",
    currentProgress: 0,
    totalFilesToDelete: 0,
  });
  const [alert, setAlert] = useState("");

  const setAlertTitle = (text: string) => {
    setAlert(text);
    setTimeout(() => {
      setAlert("");
    }, 3000);
  };

  const handleDownload = () => {
    setAlertTitle(
      "Download is under construction. Please use the archive feature in the feed...",
    );
  };

  const createFeed = () => {
    dispatch({
      type: Types.SET_TOGGLE_CART,
    });
    const pathList = selectedPaths.map((path) => path);
    router.actions.createFeedWithData(pathList);
  };

  const clearFeed = () => {
    dispatch(clearCart());
    router.actions.clearFeedData();
    dispatch({
      type: Types.SET_TOGGLE_CART,
    });
  };

  const handleDelete = async () => {
    const client = ChrisAPIClient.getClient();

    await Promise.all(
      selectedPaths.map(async (path) => {
        if (path.startsWith(`${username}/uploads`)) {
          setProgress({
            ...progress,
            currentStep: `Fetching Files for this path ${path}`,
          });

          try {
            const pathList = await client.getFileBrowserPath(path);

            if (!pathList) {
              const request = await axios.get(
                `${
                  import.meta.env.VITE_CHRIS_UI_URL
                }uploadedfiles/search/?fname_exact=${path}&limit=1`,
                {
                  headers: {
                    Authorization: `Token ${client.auth.token}`,
                  },
                },
              );

              if (request.status === 200) {
                const file = request.data.results[0];
                if (file) {
                  const url = file.url;

                  await axios.delete(url, {
                    headers: {
                      Authorization: `Token ${client.auth.token}`,
                    },
                  });
                  dispatch(clearSelectFolder(path));
                  queryClient.invalidateQueries({
                    queryKey: ["files"],
                  });
                }
              }
            } else {
              const fn = pathList.getFiles;
              const boundFn = fn.bind(pathList);
              const data = await fetchResource(
                { limit: 100, offset: 0 },
                boundFn,
              );

              setProgress({
                ...progress,
                currentStep: `Fetching Files for this path ${path}`,
                totalFilesToDelete: data.totalCount,
              });

              if (data.resource) {
                let count = 0;
                for (const file of data.resource) {
                  //@ts-ignore
                  await file._delete();
                  count++;
                  setProgress({
                    ...progress,
                    currentProgress: Math.floor(
                      (count / data.totalCount) * 100,
                    ),
                  });
                }
              }

              dispatch(clearSelectFolder(path));
              const resetProgress = {
                currentProgress: 0,
                currentStep: "",
                totalFilesToDelete: 0,
              };

              setProgress(resetProgress);
              queryClient.invalidateQueries({
                queryKey: ["folders"],
              });
            }
          } catch (error: any) {
            const errObj = catchError(error);
            setAlertTitle(
              errObj.error_message || "An error occurred while deleting files",
            );
          }
        } else {
          setAlertTitle("You do not have permissions to delete this folder");
        }
      }),
    );
  };

  const anonymizePipeline = async (path: string) => {
    const client = ChrisAPIClient.getClient();

    try {
      const dircopy = await getPlugin("pl-dircopy");

      if (dircopy) {
        const createdInstance = await client.createPluginInstance(
          dircopy.data.id,
          {
            //@ts-ignore
            dir: path,
          },
        );

        const feed = (await createdInstance.getFeed()) as Feed;

        await feed.put({
          name: `Cart download and zip for ${elipses(
            path.replace(/\//g, "_"),
            40,
          )}`,
        });

        const pipelineList = await client.getPipelines({
          name: "zip v20240311",
        });

        if (!pipelineList.data) {
          throw new Error("Failed to fetch the pipeline...");
        }

        const pipelines = pipelineList.getItems();

        if (pipelines && pipelines.length > 0) {
          const pipeline = pipelines[0];
          const { id } = pipeline.data;
          //@ts-ignore
          await client.createWorkflow(id, {
            previous_plugin_inst_id: createdInstance.data.id, // Ensure selectedPlugin is defined
          });
        }
      }
    } catch (e) {
      // biome-ignore lint/complexity/noUselessCatch: <explanation>
      throw e;
    }
  };

  const handleMutation = useMutation({
    mutationFn: (path: string) => anonymizePipeline(path),
  });

  return (
    <>
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
        <div
          style={{
            marginBottom: "1em",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex" }}>
            <Button
              style={{ marginRight: "0.5em" }}
              onClick={createFeed}
              variant="primary"
            >
              Create Analysis
            </Button>
            {pacsActions && (
              <Button
                onClick={() => {
                  state.selectedPaths.map((path) => {
                    handleMutation.mutate(path);
                  });
                }}
              >
                Zip and Download
              </Button>
            )}
            {libraryActions && (
              <>
                <Button
                  style={{ marginRight: "0.5em" }}
                  onClick={() => {
                    handleDownload();
                  }}
                  variant="secondary"
                >
                  Download Data
                </Button>
                <Button variant="danger" onClick={handleDelete}>
                  Delete Data
                </Button>
              </>
            )}
          </div>
          <Button variant="tertiary" onClick={clearFeed}>
            Empty Cart
          </Button>
        </div>
        <List
          style={{ marginTop: "2rem" }}
          dataSource={state.selectedPaths}
          bordered
          renderItem={(item) => {
            return (
              <List.Item
                key={item}
                actions={[
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={async () => {
                      dispatch(clearSelectFolder(item));
                    }}
                    key={`a-${item}`}
                  >
                    Clear
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Tooltip content={item}>
                      <a
                        style={{
                          color: "inherit",
                        }}
                        href="https://ant.design/index-cn"
                      >
                        {elipses(item, 40)}
                      </a>
                    </Tooltip>
                  }
                />
              </List.Item>
            );
          }}
        />
        {handleMutation.isPending && <SpinContainer title="Preparing to zip" />}
        {handleMutation.isError && (
          <Alert
            type="error"
            closable
            description={handleMutation.error.message}
          />
        )}
        {handleMutation.isSuccess && (
          <Alert
            type="success"
            description="Workflow creation successful. Please navigate to the Existing Analysis table to track the progress."
          />
        )}

        {alert && <Alert type="error" description={alert} />}
        {progress.currentProgress > 0 && (
          <Progress
            value={progress.currentProgress}
            title={progress.currentStep}
          />
        )}
      </Drawer>
    </>
  );
}
