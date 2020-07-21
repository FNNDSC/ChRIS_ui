import React, { useContext, useMemo } from "react";
import {
  Progress,
  ProgressMeasureLocation,
  ProgressVariant,
  Button,
  Stack,
  StackItem,
} from "@patternfly/react-core";
import { CreateFeedContext } from "./context";
import { Types, EventNode, LocalFile } from "./types";
import { CogsIcon } from "@patternfly/react-icons";

interface FinishedStepProp {
  createFeed: () => void;
}

const FinishedStep: React.FC<FinishedStepProp> = ({ createFeed }) => {
  const { state, dispatch } = useContext(CreateFeedContext);
  const { feedProgress, feedError, value, selectedPlugin } = state;
  const { chrisFiles, localFiles } = state.data;

  React.useEffect(() => {
    createFeed();
    return () => {
      dispatch({
        type: Types.ResetProgress,
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const numberOfFiles = useMemo(() => {
    return generateNumOfFiles(chrisFiles, localFiles);
  }, [chrisFiles, localFiles]);

  return (
    <Stack>
      <StackItem>
        <div className="finished-step">
          <CogsIcon className="finished-step__icon" />

          <p className="finished-step__header pf-c-title pf-m-lg">
            {value === 100
              ? "Feed Created"
              : `Creating feed with ${
                  numberOfFiles === undefined
                    ? selectedPlugin?.data.name
                    : numberOfFiles > 1
                    ? `${numberOfFiles} files`
                    : "1 file"
                }`}
          </p>
        </div>
      </StackItem>

      <StackItem></StackItem>

      <StackItem isFilled>
        <Progress
          size="md"
          className="finished-step__progessbar"
          max={100}
          value={value}
          measureLocation={ProgressMeasureLocation.outside}
          label={feedProgress}
          valueText={feedProgress}
          variant={feedError ? ProgressVariant.danger : ProgressVariant.success}
        />
      </StackItem>

      <StackItem>
        <div className="finished-step__button">
          <Button
            className="finished-step__buton-type"
            variant={value === 100 ? "primary" : "link"}
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
          </Button>
        </div>
      </StackItem>
    </Stack>
  );
};

export default FinishedStep;

const generateNumOfFiles = (
  chrisFiles: EventNode[],
  localFiles: LocalFile[]
) => {
  let fileLength;
  if (chrisFiles.length > 0) {
    fileLength = chrisFiles.reduce((acc, file) => {
      if (file.children && file.children?.length > 0) {
        return (acc += file.children.length);
      } else return (acc += 1);
    }, 0);
  }
  if (localFiles.length > 0) {
    fileLength = localFiles.length;
  }
  return fileLength;
};
