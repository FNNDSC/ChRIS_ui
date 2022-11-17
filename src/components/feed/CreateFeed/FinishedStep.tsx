import React, { useContext } from "react";
import {
  Progress,
  ProgressVariant,
  Button,
  Stack,
  StackItem,
} from "@patternfly/react-core";
import { CreateFeedContext } from "./context";
import { Types } from "./types/feed";
import { FaCogs } from "react-icons/fa";
import { useAsync } from "../../../api/common";
import ReactJson from "react-json-view";

const FinishedStep = () => {
  const { state, dispatch } = useContext(CreateFeedContext);
  const { feedProgress, value, feedError } = state
  const { isLoading, isError, isSuccess } = useAsync(state);

  return (
    <Stack>
      <StackItem>
        <div className="finished-step">
          <FaCogs className="finished-step__icon" />
          <p className="finished-step__header pf-c-title pf-m-lg">
            {isLoading ? (
              "Your feed is being created. Give it a moment"
            ) : isError ? (
              <ReactJson src={feedError}></ReactJson>
            ) : isSuccess ? (
              "You can now safely close the wizard"
            ) : null}
          </p>
        </div>
      </StackItem>

      <StackItem isFilled>
        <Progress
          aria-label="Feed Progress"
          size="md"
          className="finished-step__progessbar"
          max={100}
          value={value}
          title={feedProgress}
          variant={ProgressVariant.success}
        />
      </StackItem>

      <StackItem>
        <div className="finished-step__button">
          <Button
            className="finished-step__button-type"
            variant="primary"
            onClick={() => {
              dispatch({
                type: Types.ResetState,
              });
              dispatch({
                type: Types.ToggleWizzard,
              });
            }}
          >
            {isLoading
              ? "Creating Feed"
              : isError
              ? "Please try again"
              : isSuccess
              ? "Close"
              : "Close"}
          </Button>
        </div>
      </StackItem>
    </Stack>
  );
};

export default FinishedStep;
