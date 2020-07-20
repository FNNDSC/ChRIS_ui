import React from "react";
import ShareModal from "./ShareModal";
import { Button } from "@patternfly/react-core";

import "./sharefeed.scss";
import { Feed } from "@fnndsc/chrisapi";

import { UsersIcon } from "@patternfly/react-icons";

import InputUser from "./InputUser";

interface ShareFeedState {
  showOverlay: boolean;
}

interface ShareFeedProps {
  feed?: Feed;
}

class ShareFeed extends React.Component<ShareFeedProps, ShareFeedState> {
  constructor(props: ShareFeedProps) {
    super(props);
    this.state = {
      showOverlay: false,
    };
    this.handleAddClick = this.handleAddClick.bind(this);
    this.handleModalClose = this.handleModalClose.bind(this);
    this.handleCreate = this.handleCreate.bind(this);
  }

  handleAddClick() {
    this.setState((prevState) => ({
      showOverlay: !prevState.showOverlay,
    }));
  }

  async handleCreate(username: string) {
    const { feed } = this.props;
    if (!feed) {
      return;
    }
    await feed.put({
      owner: username,
    });

    this.handleModalClose();
  }

  handleModalClose() {
    this.setState((prevState) => ({
      showOverlay: !prevState.showOverlay,
    }));
  }

  render() {
    const { showOverlay } = this.state;
    return (
      <>
        <Button
          className="share-feed-button"
          variant="primary"
          onClick={this.handleAddClick}
        >
          <UsersIcon />
          <span className="share-feed-icon-text">Share Feed</span>
        </Button>
        <ShareModal
          showOverlay={showOverlay}
          handleModalClose={this.handleModalClose}
        >
          <InputUser
            handleModalClose={this.handleModalClose}
            handleCreate={this.handleCreate}
          />
        </ShareModal>
      </>
    );
  }
}

export default ShareFeed;
