import { TextInput } from "@patternfly/react-core";
import React from "react";
import { SinglePipeline } from "../CreateFeed/types/pipeline";
import Check from "@patternfly/react-icons/dist/esm/icons/check-icon";
import Edit from "@patternfly/react-icons/dist/esm/icons/edit-icon";
import Close from "@patternfly/react-icons/dist/esm/icons/close-icon";
import { PluginPiping } from "@fnndsc/chrisapi";

const TitleChange = ({
  currentPipelineId,
  state,
  handleSetCurrentNodeTitle,
  selectedPlugin,
}: {
  currentPipelineId: number;
  state: SinglePipeline;
  handleSetCurrentNodeTitle: (
    currentPipelineId: number,
    currentNode: number,
    title: string
  ) => void;
  selectedPlugin?: PluginPiping;
}) => {
  const iconFontSize = {
    fontSize: "1.25rem",
  };
  const [edit, setEdit] = React.useState(false);
  const [value, setValue] = React.useState("");
  const { title, currentNode } = state;
  const handleCorrectInput = () => {
    setEdit(false);
    if (currentNode)
      handleSetCurrentNodeTitle(currentPipelineId, currentNode, value);
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
      }}
    >
      <TextInput
        aria-label="Configure Title"
        style={{
          margin: "1rem 0.5rem 0 0",
          width: "30%",
        }}
        type="text"
        placeholder={edit ? "Add a title to the node" : ""}
        value={
          edit
            ? value
            : title && currentNode && title[currentNode]
            ? `${title[currentNode]} (id:${currentNode})`
            : `${
                selectedPlugin?.data
                  ? selectedPlugin?.data.title
                  : selectedPlugin?.data.plugin_name
              } (id:${currentNode})`
        }
        onChange={(_event, value) => {
          setValue(value);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            handleCorrectInput();
          }
        }}
      />
      {!edit && (
        <Edit
          style={{
            ...iconFontSize,
          }}
          onClick={() => {
            setEdit(true);
          }}
        />
      )}
      {edit && (
        <>
          <Check
            style={{
              marginRight: "0.5rem",
              ...iconFontSize,
            }}
            onClick={handleCorrectInput}
          />
          <Close
            onClick={() => {
              setEdit(false);
            }}
            style={{
              ...iconFontSize,
            }}
          />
        </>
      )}
    </div>
  );
};
export default TitleChange;
