import { Button, Tooltip } from "@patternfly/react-core";
import { CodeBranchIcon as MdCallSplit } from "../../Icons";
import React from "react";
import { useNavigate } from "react-router";
import { Feed } from "@fnndsc/chrisapi";

/**
 * Link to a feed.
 */
const FeedButton: React.FC<{ feed: Feed }> = ({ feed }) => {
  const navigate = useNavigate();
  return (
    <Tooltip content={<>Go to feed</>}>
      <Button
        variant="link"
        onClick={() => {
          // must specify feed as type=private or type=public
          // see https://github.com/FNNDSC/ChRIS_ui/issues/1072
          navigate(
            `/feeds/${feed.data.id}?type=${
              feed.data.public ? "public" : "private"
            }`,
          );
        }}
      >
        <MdCallSplit />
      </Button>
    </Tooltip>
  );
};

export default FeedButton;
