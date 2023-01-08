import React, { useContext } from "react";
import {
  Progress,
  ProgressVariant,
  Stack,
  StackItem,
} from "@patternfly/react-core";
import { CreateFeedContext } from "./context";
import { Types } from "./types/feed";
import { FaCogs } from "react-icons/fa";

import ReactJson from "react-json-view";

const FinishedStep = () => {
  const { state, dispatch } = useContext(CreateFeedContext);
  const { feedProgress, value, feedError } = state;
  const done = value === 100 && feedProgress === "Configuration Complete";
  const inProgress = value !== 100 && feedProgress !== "Configuration Complete";

  React.useEffect(() => {
    if (done) {
      dispatch({
        type: Types.ResetState,
      });
      dispatch({
        type: Types.ToggleWizzard,
      });
    }
  }, [value, feedProgress, done, dispatch]);

  return (
    <Stack>
      <StackItem>
        <div className="finished-step">
          <FaCogs className="finished-step__icon" />
          <p className="finished-step__header pf-c-title pf-m-lg">
            {inProgress ? (
              "Your analysis is being created. Give it a moment"
            ) : feedError ? (
              <ReactJson src={feedError}></ReactJson>
            ) : done ? (
              "You can now safely close the wizard"
            ) : null}
          </p>
        </div>
      </StackItem>

      <StackItem isFilled>
        <Progress
          aria-label="analysis Progress"
          size="md"
          className="finished-step__progessbar"
          max={100}
          value={value}
          title={feedProgress}
          variant={ProgressVariant.success}
        />
      </StackItem>
    </Stack>
  );
};

export default FinishedStep;
