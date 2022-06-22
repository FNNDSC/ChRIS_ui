import React, { useState } from "react";
import { Feed } from "@fnndsc/chrisapi";
import { Button } from "@patternfly/react-core";
import { FaCodeBranch } from "react-icons/fa";
import InputUser from "./InputUser";
import ShareModal from "./ShareModal";
import "./sharefeed.scss";

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
      owner: username,
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
        variant="tertiary"
        onClick={handleAddClick}
        icon={<FaCodeBranch />}
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
