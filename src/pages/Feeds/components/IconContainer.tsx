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
} from "@patternfly/react-core";
import { FaTrash, FaDownload } from "react-icons/fa";
import { VscMerge } from "react-icons/vsc";
import { MdCallSplit, MdIosShare } from "react-icons/md";
import { useDispatch } from "react-redux";
import {
  downloadFeedRequest,
  deleteFeed,
  mergeFeedRequest,
  duplicateFeedRequest,
  toggleSelectAll,
} from "../../../store/feed/actions";
import { useTypedSelector } from "../../../store/hooks";
import { Feed } from "@fnndsc/chrisapi";
import { LoadingErrorAlert } from "../../../components/common/errorHandling";
import { catchError } from "../../../api/common";

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

const IconContainer = () => {
  const { bulkSelect, downloadError, allFeeds } = useTypedSelector((state) => {
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
          message: "Please select a feed for this operation",
        },
        isOpen: value,
      });
    }
  };

  const handleNameInputChange = (value: any) => {
    setModalState({
      ...modalState,
      feedName: value,
    });
  };

  const handleDelete = (bulkSelect: Feed[]) => {
    if (bulkSelect && allFeeds && allFeeds.data) {
      const feedIds = bulkSelect.map((feed: Feed) => feed.data.id);
      const feedData = allFeeds.data?.filter(
        (feed) => !feedIds.includes(feed.data.id)
      );
      bulkSelect.forEach(async (feed: Feed) => {
        try {
          await feed.delete();
        } catch (error: any) {
          const errorObject = catchError(error);
          setModalState({
            ...modalState,
            errorHandling: errorObject,
          });
        }
      });
      dispatch(deleteFeed(feedData));
    }
  };

  const handleShare = async (bulkSelect: Feed[]) => {
    bulkSelect.map(async (feed) => {
      await feed.put({
        owner: feedName,
      });
    });
  };

  const handleSubmit = () => {
    currentAction === "share" && handleShare(bulkSelect);
    currentAction === "download" &&
      dispatch(downloadFeedRequest(bulkSelect, feedName));
    currentAction === "merge" &&
      dispatch(mergeFeedRequest(bulkSelect, feedName));
    currentAction === "delete" && handleDelete(bulkSelect);
    currentAction === "duplicate" &&
      dispatch(duplicateFeedRequest(bulkSelect, feedName));
    dispatch(toggleSelectAll(false));
    if (!downloadError && Object.keys(errorHandling).length === 0) {
      handleModalToggle(false);
    }
  };

  const alert = (error: any) => {
    return <LoadingErrorAlert error={error} />;
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
                {Object.keys(downloadError).length > 0 &&
                  alert({
                    ...downloadError,
                    message:
                      "Feeds from other creators need to be shared with you first.",
                  })}
                {Object.keys(errorHandling).length > 0 && alert(errorHandling)}
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
  download: <FaDownload />,
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
