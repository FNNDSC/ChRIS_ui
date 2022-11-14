import React from "react";
import { unpackParametersIntoString } from "../AddNode/lib/utils";
import { isEmpty } from "lodash";
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
  let dropdownInput = {};
  let requiredInput = {};
  const { currentNode, input } = state;
  if (currentNode && input && input[currentNode]) {
    dropdownInput = input[currentNode].dropdownInput;
    requiredInput = input[currentNode].requiredInput;
  }
  let generatedCommand = "";
  const onClick = (event: any, text: any) => {
    clipboardCopyFunc(event, text);
    setCopied(true);
  };

  const actions = (
    <React.Fragment>
      <CodeBlockAction>
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

  if (!isEmpty(requiredInput)) {
    generatedCommand += unpackParametersIntoString(requiredInput);
  }
  if (!isEmpty(dropdownInput)) {
    generatedCommand += unpackParametersIntoString(dropdownInput);
  }
  return (
    <CodeBlock actions={actions}>
      <CodeBlockCode id="code-content">{generatedCommand}</CodeBlockCode>
    </CodeBlock>
  );
};
export default ClipboardCopyCommand;
