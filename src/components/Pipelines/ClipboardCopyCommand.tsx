import React from "react";
import {
  CodeBlock,
  CodeBlockCode,
  ClipboardCopyButton,
  CodeBlockAction,
  clipboardCopyFunc,
} from "@patternfly/react-core";
import { SinglePipeline } from "../CreateFeed/types/pipeline";

const ClipboardCopyCommand = ({ state }: { state: SinglePipeline }) => {
  const [copied, setCopied] = React.useState(false);

  const { currentNode, parameterList } = state;

  const params = parameterList && currentNode && parameterList[currentNode];
  const pluginPiping =
    state.pluginPipings &&
    state.pluginPipings.filter((piping) => {
      if (currentNode && piping.data.id === currentNode) {
        return piping;
      }
    });

  let generatedCommand = "";

  if (params && params.length > 0) {
    for (const input in params) {
      //@ts-ignore
      const name = params[input].name;
      //@ts-ignore
      const defaultValue =
        params[input].default === false || params[input].default === true
          ? ""
          : params[input].default.length === 0
          ? "' '"
          : params[input].default;
      generatedCommand += ` --${name} ${defaultValue}`;
    }
  }

  const onClick = (event: any, text: any) => {
    clipboardCopyFunc(event, text);
    setCopied(true);
  };

  const actions = (
    <React.Fragment>
      <CodeBlockAction>
        <span style={{ margin: "0.5em" }}>
          {pluginPiping && pluginPiping.length > 0
            ? `${pluginPiping[0].data.plugin_name}:${pluginPiping[0].data.plugin_version}`
            : "N/A"}
        </span>
        <ClipboardCopyButton
          id="basic-copy-button"
          textId="code-content"
          aria-label="Copy to clipboard"
          onClick={(e) => onClick(e, generatedCommand)}
          exitDelay={600}
          maxWidth="110px"
          variant="plain"
        >
          {copied ? "Successfully copied to clipboard" : "Copy to clipboard"}
        </ClipboardCopyButton>
      </CodeBlockAction>
    </React.Fragment>
  );

  return (
    <CodeBlock actions={actions}>
      <CodeBlockCode id="code-content">{generatedCommand}</CodeBlockCode>
    </CodeBlock>
  );
};
export default ClipboardCopyCommand;
