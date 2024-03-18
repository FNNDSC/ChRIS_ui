import { Feed } from "@fnndsc/chrisapi";
import {
  Button,
  Checkbox,
  Form,
  FormGroup,
  Modal,
  ModalVariant,
  TextInput,
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
} from "@patternfly/react-core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert, Spin } from "antd";
import { cujs } from "chris-utility";
import React, { ReactElement } from "react";
import { useDispatch } from "react-redux";
import ChrisAPIClient from "../../api/chrisapiclient";
import { setBulkSelect } from "../../store/feed/actions";
import { useTypedSelector } from "../../store/hooks";
import {
  ArchiveIcon,
  DeleteIcon,
  DuplicateIcon,
  MergeIcon,
  ShareIcon,
} from "../Icons";

function capitalizeFirstLetter(stringLetter: string) {
  return stringLetter.charAt(0).toUpperCase() + stringLetter.slice(1);
}

interface ModalState {
  isOpen: boolean;
  feedName: string;
  currentAction: string;
  modalDescription: string;
  errorHandling: string;
  sharePublically: boolean;
}

const getInitialState = () => {
  return {
    isOpen: false,
    feedName: "",
    currentAction: "",
    modalDescription: "",
    errorHandling: "",
    sharePublically: false,
  };
};

const IconContainer = () => {
  const queryClient = useQueryClient();
  const { bulkSelect } = useTypedSelector((state) => {
    return state.feed;
  });
  const dispatch = useDispatch();
  const [modalState, setModalState] =
    React.useState<ModalState>(getInitialState);

  const { currentAction, isOpen, errorHandling, sharePublically, feedName } =
    modalState;

  const getDefaultName = (bulkSelect: Feed[], action: string) => {
    if (bulkSelect.length > 0) {
      const description =
        action === "delete"
          ? "Deleting a feed is a permanent action. Click on confirm if you're sure"
          : "Enter a name for your new feed (optional)";

      let prefix = "";
      if (action === "merge") {
        prefix = "Merge of ";
      } else if (action === "") {
        prefix = "archive-";
      } else {
        prefix = "";
      }

      let newFeedName = "";
      if (action !== "share") {
        const feedNames = bulkSelect.map((select: Feed) => select.data.name);
        // truncate name of the merged feed(limit=100)
        newFeedName = feedNames.toString().replace(/[, ]+/g, "_");
        newFeedName = prefix + newFeedName;
        newFeedName = newFeedName.substring(0, 100);
        if (action === "duplicate") {
          if (bulkSelect.length > 1) {
            newFeedName = "duplicate-";
          } else {
            newFeedName = `duplicate-${bulkSelect[0].data.name}`;
          }
        }
      }

      setModalState({
        ...modalState,
        modalDescription: description,
        feedName: newFeedName,
        currentAction: action,
        isOpen: true,
      });
    }
  };

  const handleModalToggle = (value: boolean) => {
    if (value === false) {
      const newState = getInitialState();
      setModalState({
        ...newState,
      });
    } else {
      setModalState({
        ...modalState,
        errorHandling: "Please select a feed for this operation",
        isOpen: value,
      });
    }
  };

  const handleNameInputChange = (
    _event: React.FormEvent<HTMLInputElement>,
    value: string,
  ) => {
    setModalState({
      ...modalState,
      feedName: value,
    });
  };

  function invalidateQueries() {
    queryClient.invalidateQueries({
      queryKey: ["feeds"],
    });

    queryClient.invalidateQueries({
      queryKey: ["publicFeeds"],
    });
  }

  const deleteFeedMutation = useMutation({
    mutationFn: async (bulkSelect: Feed[]) => {
      for (const feed of bulkSelect) {
        try {
          await feed.delete();
        } catch (e: any) {
          throw new Error(e.message);
        }
      }
    },
    onSuccess: () => {
      dispatch(setBulkSelect([], false));
      invalidateQueries();
      handleModalToggle(false);
    },
    onError: (error: { message: string }) => {
      handleError(error.message);
    },
  });

  const shareFeedMutation = useMutation({
    mutationFn: async (data: {
      bulkSelect: Feed[];
      sharePublically: boolean;
      feedName: string;
    }) => {
      const { bulkSelect, sharePublically, feedName } = data;
      for (const feed of bulkSelect) {
        try {
          if (sharePublically) {
            const currentState = feed.data.public;

            await feed.put({
              //@ts-ignore
              public: !currentState,
            });
          } else {
            await feed.put({
              owner: feedName,
            });
          }
        } catch (error: any) {
          throw new Error(error);
        }
      }
    },
    onSuccess: () => {
      dispatch(setBulkSelect([], false));
      invalidateQueries();
      handleModalToggle(false);
    },
    onError: (error) => {
      handleError(error.message);
    },
  });

  const handleDownloadMutation = useMutation({
    mutationFn: async (data: {
      feedList: Feed[];
      feedName: string;
      operation: string;
    }) => {
      const { feedList, feedName, operation } = data;

      const client = ChrisAPIClient.getClient();
      cujs.setClient(client);
      const feedIdList = [];
      const feedNames = [];
      for (let i = 0; i < feedList.length; i++) {
        const data = feedList[i].data;
        feedIdList.push(data.id);
        feedNames.push(data.name);
      }

      // Truncate the name of the merged feed (limit=100)
      let newFeedName = feedNames.toString().replace(/[, ]+/g, "_");
      let createdFeed: Feed | null = null;

      if (operation === "archive") {
        newFeedName = `archive-${newFeedName}`;
        newFeedName = newFeedName.substring(0, 100);
        newFeedName = feedName === "" ? newFeedName : feedName;

        try {
          createdFeed = await cujs.downloadMultipleFeeds(
            feedIdList,
            newFeedName,
          );
        } catch (e: any) {
          throw new Error(e);
          // Not throwing the error here to allow handling in the onError callback
        }
      }

      if (operation === "merge") {
        newFeedName = `merge-${newFeedName}`;
        newFeedName = newFeedName.substring(0, 100);
        newFeedName = feedName === "" ? newFeedName : feedName;

        try {
          createdFeed = await cujs.mergeMultipleFeeds(feedIdList, newFeedName);
        } catch (e: any) {
          throw new Error(e);
        }
      }

      return createdFeed; // Return null if operation is neither "download" nor "merge"
    },
    onSuccess: () => {
      // Handle success actions if needed
      invalidateQueries();
      handleModalToggle(false);
    },
    onError: (error: Error) => {
      handleError(error.message);
    },
  });
  const handleDuplicateFeedMutation = useMutation({
    mutationFn: async (data: { feedList: Feed[]; feedName: string }) => {
      const { feedList, feedName } = data;
      const client = ChrisAPIClient.getClient();
      cujs.setClient(client);
      for (let i = 0; i < feedList.length; i++) {
        const feedIdList = [];
        const data = feedList[i].data;
        const newFeedName = feedName
          ? `${feedName}-${data.name}`
          : `duplicate-${data.name}`;
        feedIdList.push(data.id);
        try {
          await cujs.mergeMultipleFeeds(feedIdList, newFeedName);
        } catch (error: any) {
          throw new Error(error);
        }
      }
    },
    onSuccess: () => {
      invalidateQueries();
      handleModalToggle(false);
    },
    onError: (error) => {
      handleError(error.message);
    },
  });

  const handleError = (errorMessage: string) => {
    setModalState({
      ...modalState,
      errorHandling: errorMessage,
    });
  };

  const handleSubmit = () => {
    currentAction === "share" &&
      shareFeedMutation.mutate({ bulkSelect, sharePublically, feedName });
    currentAction === "delete" && deleteFeedMutation.mutate(bulkSelect);
    currentAction === "archive" &&
      handleDownloadMutation.mutate({
        feedList: bulkSelect,
        feedName,
        operation: "archive",
      });
    currentAction === "merge" &&
      handleDownloadMutation.mutate({
        feedList: bulkSelect,
        feedName,
        operation: "merge",
      });
    currentAction === "duplicate" &&
      handleDuplicateFeedMutation.mutate({ feedList: bulkSelect, feedName });
  };

  const isPending =
    shareFeedMutation.isPending ||
    handleDownloadMutation.isPending ||
    handleDuplicateFeedMutation.isPending ||
    deleteFeedMutation.isPending;

  return (
    <ToggleGroup aria-label="Feed Action Bar">
      {["archive", "merge", "duplicate", "share", "delete"].map((action) => {
        return (
          <React.Fragment key={action}>
            <ToolGroupContainer
              icon={actionMap[action]}
              action={action}
              onChangeHandler={() => {
                bulkSelect.length === 0
                  ? handleModalToggle(true)
                  : getDefaultName(bulkSelect, action);
              }}
            />
          </React.Fragment>
        );
      })}

      <Modal
        aria-label="feed modal"
        className="feed_modal"
        data-keyboard="false"
        variant={ModalVariant.small}
        isOpen={isOpen}
        title={capitalizeFirstLetter(currentAction)}
        onClose={() => {
          handleModalToggle(false);
        }}
        onSubmit={handleSubmit}
        actions={[
          <Button
            key="create"
            variant={currentAction === "delete" ? "danger" : "primary"}
            form="modal-with-form-form"
            onClick={handleSubmit}
            isDisabled={bulkSelect.length === 0 || isPending}
            icon={isPending && <Spin />}
          >
            Confirm
          </Button>,
          <Button
            key="cancel"
            variant="link"
            onClick={() => {
              handleModalToggle(false);
            }}
          >
            Cancel
          </Button>,
        ]}
      >
        {!(modalState.currentAction === "delete") ? (
          <Form id="modal-with-form-form">
            <FormGroup
              label={
                currentAction === "share"
                  ? "Enter a User Name"
                  : "Enter a Feed Name"
              }
              fieldId="modal-with-form-form-name"
            >
              <TextInput
                isDisabled={modalState.sharePublically}
                aria-label="icon-container"
                type="email"
                id="modal-with-form-form-name"
                name="modal-with-form-form-name"
                placeholder={feedName}
                value={feedName}
                onChange={handleNameInputChange}
              />

              {modalState.currentAction === "share" && (
                <>
                  <Checkbox
                    isChecked={modalState.sharePublically}
                    id="checked"
                    label="This will make a private feed public and vice versa"
                    onChange={(_event, checked: boolean) => {
                      setModalState({
                        ...modalState,
                        sharePublically: checked,
                      });
                    }}
                  />
                </>
              )}

              <div style={{ marginTop: "1rem" }}>
                {errorHandling && (
                  <Alert type="error" closable description={errorHandling} />
                )}
              </div>
            </FormGroup>
          </Form>
        ) : (
          <Alert
            type="error"
            description=" Deleting a feed is a permanent action. Click on confirm if
            you're sure."
          />
        )}
      </Modal>
    </ToggleGroup>
  );
};

export default IconContainer;

const actionMap: {
  [key: string]: ReactElement;
} = {
  archive: <ArchiveIcon />,
  merge: <MergeIcon />,
  duplicate: <DuplicateIcon />,
  share: <ShareIcon />,
  delete: <DeleteIcon />,
};

const ToolGroupContainer = ({
  action,
  onChangeHandler,
  icon,
}: {
  action: string;
  onChangeHandler: () => void;
  icon: ReactElement;
}) => {
  return (
    <ToggleGroupItem
      aria-label="feed-action"
      icon={
        <Tooltip
          content={<div>{capitalizeFirstLetter(action)} selected feeds</div>}
        >
          {icon}
        </Tooltip>
      }
      onChange={onChangeHandler}
    />
  );
};
