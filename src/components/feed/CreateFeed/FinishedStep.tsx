
import React, { useContext } from "react";
import {
  Progress,
  ProgressVariant,
  Button,
  Stack,
  StackItem,
} from "@patternfly/react-core";
import { CreateFeedContext } from "./context";
import { Types} from "./types";
import { CogsIcon } from "@patternfly/react-icons";
import { useAsync } from "../../../utils";

interface FinishedStepProp {
  createFeed: () => void;
}

const FinishedStep: React.FC<FinishedStepProp> = ({
  createFeed,
}: FinishedStepProp) => {
  const { state, dispatch } = useContext(CreateFeedContext);
  const { feedProgress, value } = state;
  const { run, isLoading, isError, isSuccess } = useAsync(state);

  React.useEffect(() => {
    run(createFeed());
    return () => {
      dispatch({
        type: Types.ResetProgress,
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  return (
    <Stack>
      <StackItem>
        <div className="finished-step">
          <CogsIcon className="finished-step__icon" />
          <p className="finished-step__header pf-c-title pf-m-lg">
            {isLoading
              ? "Your feed is being created. Give it a moment"
              : isError
              ? "Oops ! There seems to be an error, Please try again"
              : isSuccess
              ? "You can now safely close the wizard"
              : null}
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
            className="finished-step__buton-type"
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
              : "Cancel"}
          </Button>
        </div>
      </StackItem>
    </Stack>
  );
};

export default FinishedStep;

