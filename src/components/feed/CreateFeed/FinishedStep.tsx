import React, { useContext } from "react";
import {
  Progress,
  ProgressMeasureLocation,
  ProgressVariant,
  Flex,
  FlexItem,
  FlexModifiers,
} from "@patternfly/react-core";
import { CreateFeedContext } from "./context";
import { Types } from "./types";

const FinishedStep: React.FC = () => {
  const { state, dispatch } = useContext(CreateFeedContext);
  const { feedProgress, feedError, value } = state;

  return (
    <Flex
      breakpointMods={[
        { modifier: FlexModifiers.column },
        { modifier: FlexModifiers["align-self-center"] },
      ]}
    >
      <FlexItem>
        <div className="pf-c-empty-state pf-m-lg">
          <i
            className="fas fa- fa-cogs pf-c-empty-state__icon"
            aria-hidden="true"
          />
          <h1 className="pf-c-title pf-m-lg">
            {value === 100 ? "Feed Created" : "Feed Creation in progress"}
          </h1>
        </div>
      </FlexItem>

      <FlexItem>
        <Progress
          max={100}
          value={value}
          measureLocation={ProgressMeasureLocation.outside}
          label={feedProgress}
          valueText={feedProgress}
          variant={feedError ? ProgressVariant.danger : ProgressVariant.success}
        />
      </FlexItem>

      <FlexItem>
        <div className="pf-c-empty-state__body">
          <button
            className={
              value === 100
                ? "pf-c-button pf-m-primary"
                : "pf-c-button pf-m-link"
            }
            onClick={() => {
              dispatch({
                type: Types.ResetState,
              });
              dispatch({
                type: Types.ToggleWizzard,
              });
            }}
          >
            {value === 100 ? "Close" : "Cancel"}
          </button>
        </div>
      </FlexItem>
    </Flex>
  );
};

export default FinishedStep;
