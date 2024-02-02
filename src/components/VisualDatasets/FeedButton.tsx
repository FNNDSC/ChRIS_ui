import { Button, Tooltip } from "@patternfly/react-core";
import MdCallSplit from "@patternfly/react-icons/dist/esm/icons/code-branch-icon";
import React from "react";
import { useNavigate } from "react-router";

/**
 * Link to a feed.
 */
const FeedButton: React.FC<{feedId: number}> = ({feedId}) => {
  const navigate = useNavigate();
  return (
    <Tooltip content={<>Go to feed</>}>
      <Button
        variant="link"
        onClick={() => {
          navigate(`/feeds/${feedId}`);
        }}
      >
        <MdCallSplit />
      </Button>
    </Tooltip>

  );
};

export default FeedButton;
