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

interface FinishedStepProp {
  createFeed: () => void;
}

const FinishedStep: React.FC<FinishedStepProp> = ({ createFeed }) => {
  const { state, dispatch } = useContext(CreateFeedContext);
  const { feedProgress, value } = state;

  

  React.useEffect(() => {
    createFeed();
    return () => {
      dispatch({
        type: Types.ResetProgress,
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Stack>
      <StackItem>
        <div className="finished-step">
          <CogsIcon className="finished-step__icon" />
          <p className="finished-step__header pf-c-title pf-m-lg">
            {
            value >= 100
              ? "You can safely close the wizard now."
              : "Creating feed"
            }
          </p>
        </div>
      </StackItem>

      <StackItem isFilled>
        <Progress
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
            variant={value >= 100 ? "primary" : "link"}
            onClick={() => {
              dispatch({
                type: Types.ResetState,
              });
              dispatch({
                type: Types.ToggleWizzard,
              });
            }}
          >
            {value >= 100 ? "Close" : "Cancel"}
          </Button>
        </div>
      </StackItem>
    </Stack>
  );
};

export default FinishedStep;

