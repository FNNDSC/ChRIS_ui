import React, { useState } from "react";
import ShareModal from "./ShareModal";
import { Button } from "@patternfly/react-core";

import "./sharefeed.scss";
import { Feed } from "@fnndsc/chrisapi";

import { CodeBranchIcon } from "@patternfly/react-icons";

import InputUser from "./InputUser";

interface ShareFeedProps {
  feed?: Feed;
}

const ShareFeed: React.FC<ShareFeedProps> = ({ feed }) => {
  const [showOverlay, setShowOverlay] = useState(false);

  const handleAddClick = () => setShowOverlay((prev) => !prev);
  const handleCreate = async (username: string) => {
    if (!feed) {
      return;
    }
    await feed.put({
      owner: username
    });

    handleModalClose();
  };
  const handleModalClose = () => {
    setShowOverlay((prevState) => !prevState);
  };

  return (
    <>
      <Button
        className="share-feed-button"
        variant="primary"
        onClick={handleAddClick}
        icon={<CodeBranchIcon />}
        type="button"
      >
        Share Feed
      </Button>
      <ShareModal showOverlay={showOverlay} handleModalClose={handleModalClose}>
        <InputUser
          handleModalClose={handleModalClose}
          handleCreate={handleCreate}
        />
      </ShareModal>
    </>
  );
};

export default ShareFeed;
