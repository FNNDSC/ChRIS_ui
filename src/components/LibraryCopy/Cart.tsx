
import { useContext, useState } from "react";
import { MainRouterContext } from "../../routes";
import {
  AlertGroup,
  ChipGroup,
  Button,
  Chip,
  Progress,
} from "@patternfly/react-core";
import { Alert } from "antd";
import { LibraryContext } from "./context";
import { clearCart, clearSelectFolder } from "./context/actions";
import { useTypedSelector } from "../../store/hooks";
import ChrisAPIClient from "../../api/chrisapiclient";
import { catchError, fetchResource } from "../../api/common";
import { useQueryClient } from "@tanstack/react-query";

export default function Cart() {
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
      "Download is under construction. Please use the archive feature in the feed..."
    );
  };

  const createFeed = () => {
    const pathList = selectedPaths.map((path) => path);
    router.actions.createFeedWithData(pathList);
  };

  const clearFeed = () => {
    dispatch(clearCart());
    router.actions.clearFeedData();
  };

  const handleDelete = async () => {
    const client = ChrisAPIClient.getClient();

    await Promise.all(
      selectedPaths.map(async (path) => {
        if (path.startsWith(`${username}/uploads`)) {
          setProgress({
            ...progress,
            currentStep: `Fetching Files for the path ${path}`,
          });

          try {
            const pathList = await client.getFileBrowserPath(path);
            const fn = pathList.getFiles;
            const boundFn = fn.bind(pathList);
            const data = await fetchResource(
              { limit: 100, offset: 0 },
              boundFn
            );

            setProgress({
              ...progress,
              currentStep: `Fetching Files for the path ${path}`,
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
                  currentProgress: Math.floor((count / data.totalCount) * 100),
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
          } catch (error: any) {
            const errObj = catchError(error);
            setAlert(
              errObj.error_message || "An error occurred while deleting files"
            );
          }
        } else {
          setAlert("You do not have permissions to delete this folder");
        }
      })
    );
  };

  if (selectedPaths.length > 0) {
    return (
      <>
        <AlertGroup isToast>
          <Alert
            type="info"
            closeIcon
            onClose={() => {
              clearFeed();
            }}
            description={
              <>
                <div
                  style={{
                    marginBottom: "1em",
                    display: "flex",
                  }}
                >
                  <Button
                    style={{ marginRight: "0.5em" }}
                    onClick={createFeed}
                    variant="primary"
                  >
                    Create Analysis
                  </Button>

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
                </div>
                {selectedPaths.length > 0 && (
                  <>
                    <ChipGroup style={{ marginBottom: "1em" }} categoryName="">
                      {selectedPaths.map((path: string, index: number) => {
                        return (
                          <Chip
                            onClick={() => {
                              dispatch(clearSelectFolder(path));
                            }}
                            key={index}
                          >
                            {path}
                          </Chip>
                        );
                      })}
                    </ChipGroup>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Button variant="tertiary" onClick={clearFeed}>
                        Empty Cart
                      </Button>
                    </div>
                  </>
                )}
              </>
            }
            style={{ width: "100%", marginTop: "3em", padding: "2em" }}
          ></Alert>
          {alert && <Alert type="error" description={alert} />}
          {progress.currentProgress > 0 && (
            <Progress
              value={progress.currentProgress}
              title={progress.currentStep}
            />
          )}
        </AlertGroup>
      </>
    );
  } else {
    return null;
  }
}
