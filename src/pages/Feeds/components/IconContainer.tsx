import React from "react";
import {
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
  Modal,
  ModalVariant,
  Form,
  FormGroup,
  TextInput,
  Alert,
  Button,
} from "@patternfly/react-core";
import { FaTrash, FaDownload } from "react-icons/fa";
import { VscMerge } from "react-icons/vsc";
import { MdCallSplit } from "react-icons/md";
import { useDispatch } from "react-redux";
import { Feed } from "@fnndsc/chrisapi";
import {
  downloadFeedRequest,
  deleteFeed,
  mergeFeedRequest,
  duplicateFeedRequest,
  toggleSelectAll,
} from "../../../store/feed/actions";
import { useTypedSelector } from "../../../store/hooks";

function capitalizeFirstLetter(stringLetter: string) {
  return stringLetter.charAt(0).toUpperCase() + stringLetter.slice(1);
}

const IconContainer = () => {
  const { bulkSelect, downloadError, allFeeds } = useTypedSelector((state) => state.feed);
  const dispatch = useDispatch();
  const [isModalOpen, setModalOpen] = React.useState(false);
  const [nameValue, setNameValue] = React.useState("");
  const [dialogTitleValue, setTitleValue] = React.useState("");
  const [dialogDescriptionValue, setDescriptionValue] = React.useState("");
  const [labelValue, setLabelValue] = React.useState("");
  const [defaultName, setDefaultName] = React.useState("");
  const [deleteError, setDeleteError] = React.useState("");
  const [actionValue, setActionValue] = React.useState("");
  const nameInputRef = React.useRef(null);

  const getDefaultName = (bulkSelect: any, action: string) => {
    setLabelValue("Feed Name");
    const value =
      action === "delete"
        ? "Deleting a feed is a permanent action. Click on confirm if you're sure"
        : "Enter a name for your new feed (optional)";
    setDescriptionValue(value);

    let prefix = "";
    if (action == "merge") {
      prefix = "Merge of ";
    } else if (action == "download") {
      prefix = "archive-";
    } else {
      prefix = "";
    }
    const feedNames = [];
    for (let i = 0; i < bulkSelect.length; i++) {
      feedNames.push(bulkSelect[i].data.name);
    }
    // truncate name of the merged feed(limit=100)
    let newFeedName = feedNames.toString().replace(/[, ]+/g, "_");
    newFeedName = prefix + newFeedName;
    newFeedName = newFeedName.substring(0, 100);
    if (action == "duplicate") {
      if (bulkSelect.length > 1) {
        newFeedName = "duplicate-";
        setLabelValue("Feed Prefix");
        setDescriptionValue("Enter a feed prefix (optional)");
      } else {
        newFeedName = `duplicate-${  bulkSelect[0].data.name}`;
      }
    }
    return newFeedName;
  };

  const handleModalToggle = (action: string) => {
    setModalOpen(!isModalOpen);
    setActionValue(action);
    const name = getDefaultName(bulkSelect, action);
    setDefaultName(name);
    setNameValue(name);
    const titleValue = capitalizeFirstLetter(action);
    setTitleValue(`${titleValue} feed`);
  };

  const handleNameInputChange = (value: any) => {
    setNameValue(value);
  };

  const handleSubmit = () => {
    handleChange(actionValue, nameValue);
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
        } catch (error) {
          // @ts-ignore
          setDeleteError(error.response);
        }
      });
      dispatch(deleteFeed(feedData));
    }
  };

  React.useEffect(() => {
    if (isModalOpen && nameInputRef && nameInputRef.current) {
      (nameInputRef.current as HTMLInputElement).focus();
    }
  }, [isModalOpen]);

  const handleChange = (type: string, name: any) => {
    type === "download" && dispatch(downloadFeedRequest(bulkSelect, name));
    type === "merge" && dispatch(mergeFeedRequest(bulkSelect, name));
    type === "delete" && handleDelete(bulkSelect);
    type === "duplicate" && dispatch(duplicateFeedRequest(bulkSelect, name));
    dispatch(toggleSelectAll(false));
  };

  const alert = (error: string, addition: string) => <Alert isInline variant="danger" title={error + addition} />;
  return (
    <ToggleGroup aria-label="Feed Action Bar">
      <ToggleGroupItem
        aria-label="feed-action"
        icon={
          <Tooltip content={<div>Download selected feeds</div>}>
            <FaDownload />
          </Tooltip>
        }
        onChange={() => {
          handleModalToggle("download");
        }}
      />
      <ToggleGroupItem
        aria-label="feed-action"
        icon={
          <Tooltip content={<div>Merge selected feeds</div>}>
            <VscMerge
              style={{
                height: "1.25em",
                width: "1.25em",
              }}
            />
          </Tooltip>
        }
        onChange={() => {
          handleModalToggle("merge");
        }}
      />
      <ToggleGroupItem
        aria-label="feed-action"
        icon={
          <Tooltip content={<div>Duplicate selected feeds</div>}>
            <MdCallSplit />
          </Tooltip>
        }
        onChange={() => {
          handleModalToggle("duplicate");
        }}
      />
      <ToggleGroupItem
        aria-label="feed-action"
        icon={
          <Tooltip content={<div>Delete selected feeds</div>}>
            <FaTrash />
          </Tooltip>
        }
        onChange={() => handleModalToggle("delete")}
      />

      <Modal
        data-keyboard="false"
        variant={ModalVariant.small}
        title={dialogTitleValue}
        description={dialogDescriptionValue}
        isOpen={isModalOpen}
        onClose={() => {
          handleModalToggle("");
        }}
        onSubmit={handleSubmit}
        actions={[
          <Button
            key="create"
            variant="primary"
            form="modal-with-form-form"
            onClick={handleSubmit}
          >
            Confirm
          </Button>,
          <Button
            key="cancel"
            variant="link"
            onClick={() => {
              handleModalToggle("");
            }}
          >
            Cancel
          </Button>,
        ]}
      >
        {!(actionValue === "delete") && (
          <Form id="modal-with-form-form">
            <FormGroup label={labelValue} fieldId="modal-with-form-form-name">
              <TextInput
                aria-label="icon-container"
                type="email"
                id="modal-with-form-form-name"
                name="modal-with-form-form-name"
                placeholder={defaultName}
                value={nameValue}
                onChange={handleNameInputChange}
                ref={nameInputRef}
              />
              {downloadError &&
                alert(
                  downloadError,
                  " Feeds from other creators need to be shared with you first."
                )}
              {deleteError && alert(deleteError, "")}
            </FormGroup>
          </Form>
        )}
      </Modal>
    </ToggleGroup>
  );
};

export default IconContainer;
