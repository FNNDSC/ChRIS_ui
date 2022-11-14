import { TextInput } from "@patternfly/react-core";
import React from "react";
import { SinglePipeline } from "../CreateFeed/types/pipeline";
import { MdCheck, MdEdit, MdClose } from "react-icons/md";
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
        isReadOnly={!edit}
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
        onChange={(value) => {
          setValue(value);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            handleCorrectInput();
          }
        }}
      />
      {!edit && (
        <MdEdit
          style={{
            ...iconFontSize,
            color: "#06c",
          }}
          onClick={() => {
            setEdit(true);
          }}
        />
      )}
      {edit && (
        <>
          <MdCheck
            style={{
              marginRight: "0.5rem",
              color: "#3e8635",
              ...iconFontSize,
            }}
            onClick={handleCorrectInput}
          />
          <MdClose
            onClick={() => {
              setEdit(false);
            }}
            style={{
              ...iconFontSize,
              color: "#c9190b",
            }}
          />
        </>
      )}
    </div>
  );
};
export default TitleChange;
