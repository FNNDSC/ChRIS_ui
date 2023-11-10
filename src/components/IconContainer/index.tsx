import React, { ReactElement } from "react";
import {
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
  Modal,
  ModalVariant,
  Form,
  FormGroup,
  TextInput,
  Button,
  Alert,
} from "@patternfly/react-core";
import { cujs } from "chris-utility";
import FaTrash from "@patternfly/react-icons/dist/esm/icons/trash-icon";
import FaFileArchive from "@patternfly/react-icons/dist/esm/icons/file-archive-icon";
import VscMerge from "@patternfly/react-icons/dist/esm/icons/code-branch-icon";
import MdIosShare from "@patternfly/react-icons/dist/esm/icons/share-icon";
import MdCallSplit from "@patternfly/react-icons/dist/esm/icons/code-branch-icon";
import { useDispatch } from "react-redux";
import { setBulkSelect } from "../../store/feed/actions";
import { useTypedSelector } from "../../store/hooks";
import { Feed } from "@fnndsc/chrisapi";

import ChrisAPIClient from "../../api/chrisapiclient";
import { useQueryClient } from "@tanstack/react-query";

function capitalizeFirstLetter(stringLetter: string) {
  return stringLetter.charAt(0).toUpperCase() + stringLetter.slice(1);
}

interface ModalState {
  isOpen: boolean;
  feedName: string;
  currentAction: string;
  modalDescription: string;
  errorHandling: Record<string, unknown>;
}

const getInitialState = () => {
  return {
    isOpen: false,
    feedName: "",
    currentAction: "",
    modalDescription: "",
    errorHandling: {},
  };
};

const IconContainer = ({ allFeeds }: { allFeeds: Feed[] }) => {
  const queryClient = useQueryClient();
  const { bulkSelect } = useTypedSelector((state) => {
    return state.feed;
  });
  const dispatch = useDispatch();
  const [modalState, setModalState] =
    React.useState<ModalState>(getInitialState);

  const { currentAction, isOpen, errorHandling, feedName } = modalState;

  const getDefaultName = (bulkSelect: Feed[], action: string) => {
    if (bulkSelect.length > 0) {
      const description =
        action === "delete"
          ? "Deleting a feed is a permanent action. Click on confirm if you're sure"
          : "Enter a name for your new feed (optional)";

      let prefix = "";
      if (action == "merge") {
        prefix = "Merge of ";
      } else if (action == "download") {
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
        if (action == "duplicate") {
          if (bulkSelect.length > 1) {
            newFeedName = "duplicate-";
          } else {
            newFeedName = "duplicate-" + bulkSelect[0].data.name;
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
        errorHandling: {
          value: ["Please select a feed for this operation"],
        },
        isOpen: value,
      });
    }
  };

  const handleNameInputChange = (
    _event: React.FormEvent<HTMLInputElement>,
    value: string
  ) => {
    setModalState({
      ...modalState,
      feedName: value,
    });
  };

  const handleDelete = (bulkSelect: Feed[]) => {
    if (bulkSelect && allFeeds) {
      bulkSelect.forEach(async (feed: Feed) => {
        try {
          await feed.delete();
        } catch (error: any) {
          const errorMessage = error.response
            ? error.response.data
            : error.message;
          handleError(errorMessage);
        }
      });

      dispatch(setBulkSelect([], false));
      handleModalToggle(false);
      queryClient.invalidateQueries({
        queryKey: ["feeds"],
      });
    }
  };

  const handleShare = async (bulkSelect: Feed[]) => {
    bulkSelect.map(async (feed) => {
      await feed.put({
        owner: feedName,
      });
    });
  };

  const handleError = (errorMessage: any) => {
    setModalState({
      ...modalState,
      errorHandling: errorMessage,
    });
  };

  const handleDownloadFeed = async (
    feedList: Feed[],
    feedName: string,
    operation: string
  ) => {
    const client = ChrisAPIClient.getClient();
    cujs.setClient(client);
    const feedIdList = [];
    const feedNames = [];
    for (let i = 0; i < feedList.length; i++) {
      const data = feedList[i].data;
      feedIdList.push(data.id);
      feedNames.push(data.name);
    }

    try {
      // truncate name of the merged feed(limit=100)
      let newFeedName = feedNames.toString().replace(/[, ]+/g, "_");
      let createdFeed;

      if (operation === "download") {
        newFeedName = `archive-${newFeedName}`;
        newFeedName = newFeedName.substring(0, 100);

        newFeedName = feedName == "" ? newFeedName : feedName;
        createdFeed = await cujs.downloadMultipleFeeds(feedIdList, newFeedName);
      }

      if (operation === "merge") {
        newFeedName = `merge-${newFeedName}`;
        newFeedName = newFeedName.substring(0, 100);
        newFeedName = feedName == "" ? newFeedName : feedName;
        createdFeed = await cujs.mergeMultipleFeeds(feedIdList, newFeedName);
      }

      if (createdFeed) {
        queryClient.invalidateQueries({
          queryKey: ["feeds"],
        });
      }
    } catch (error: any) {
      const errorMessage = error.response ? error.response.data : error.message;
      handleError(errorMessage);
    }
  };

  const handleDuplicateFeed = async (feedList: Feed[], feedName: string) => {
    const client = ChrisAPIClient.getClient();
    cujs.setClient(client);

    for (let i = 0; i < feedList.length; i++) {
      const feedIdList = [];
      const data = feedList[i].data;
      const newFeedName = feedName
        ? feedName + "-" + data.name
        : "duplicate-" + data.name;
      feedIdList.push(data.id);
      try {
        const createdFeed: Feed = await cujs.mergeMultipleFeeds(
          feedIdList,
          newFeedName
        );
        if (createdFeed) {
          queryClient.invalidateQueries({
            queryKey: ["feeds"],
          });
        }
      } catch (error: any) {
        const errorMessage = error.response
          ? error.response.data
          : error.message;
        handleError(errorMessage);
      }
    }
  };

  const handleSubmit = () => {
    currentAction === "share" && handleShare(bulkSelect);
    currentAction === "download" &&
      handleDownloadFeed(bulkSelect, feedName, "download");
    currentAction === "merge" &&
      handleDownloadFeed(bulkSelect, feedName, "merge");
    currentAction === "delete" && handleDelete(bulkSelect);
    currentAction === "duplicate" && handleDuplicateFeed(bulkSelect, feedName);
  };

  const alert = (_error: any) => {
    return <Alert variant="danger" title={_error} />;
  };

  return (
    <ToggleGroup aria-label="Feed Action Bar">
      {["download", "merge", "duplicate", "share", "delete"].map((action) => {
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
            variant="primary"
            form="modal-with-form-form"
            onClick={handleSubmit}
            isDisabled={bulkSelect.length === 0}
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
                aria-label="icon-container"
                type="email"
                id="modal-with-form-form-name"
                name="modal-with-form-form-name"
                placeholder={feedName}
                value={feedName}
                onChange={handleNameInputChange}
              />
              <div style={{ marginTop: "1rem" }}>
                {Object.keys(errorHandling).length > 0 &&
                  //@ts-ignore
                  errorHandling.value.map((error) => {
                    return alert(error);
                  })}
              </div>
            </FormGroup>
          </Form>
        ) : (
          <p>
            Deleting a feed is a permanent action. Click on confirm if
            you&apos;re sure.
          </p>
        )}
      </Modal>
    </ToggleGroup>
  );
};

export default IconContainer;

const actionMap: {
  [key: string]: ReactElement;
} = {
  download: <FaFileArchive />,
  merge: <VscMerge />,
  duplicate: <MdCallSplit />,
  share: <MdIosShare />,
  delete: <FaTrash />,
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
