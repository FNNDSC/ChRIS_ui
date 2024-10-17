import type { Pipeline } from "@fnndsc/chrisapi";
import {
  ClipboardCopyButton,
  CodeBlock,
  CodeBlockAction,
  CodeBlockCode,
  clipboardCopyFunc,
} from "@patternfly/react-core";
import { useQuery } from "@tanstack/react-query";
import { Alert, Form } from "../Antd";
import { useContext, useState } from "react";
import { EmptyStateComponent, SpinContainer } from "../Common";
import { PipelineContext } from "./context";

type OwnProps = {
  currentPipeline: Pipeline;
};

const CodeBlockComponent = ({ currentPipeline }: OwnProps) => {
  const { state } = useContext(PipelineContext);
  const [copied, setCopied] = useState(false);
  const { id } = currentPipeline.data;
  const parameterList = state.selectedPipeline?.[id]?.parameters;
  const activeNode = state.currentlyActiveNode?.[id];
  const pluginPipings = state.selectedPipeline?.[id]?.pluginPipings;

  const fetchResources = async () => {
    if (pluginPipings && activeNode && parameterList) {
      try {
        const pluginPiping = pluginPipings.find(
          (piping) => piping.data.id === activeNode,
        );

        if (!pluginPiping) {
          throw new Error("Plugin piping not found for the active node");
        }

        const selectedPlugin = await pluginPiping.getPlugin();

        const params = await selectedPlugin.getPluginParameters({
          limit: 1000,
        });

        const paramDict: {
          [key: string]: any;
        } = {};
        const filteredParameters = parameterList?.data.filter(
          (param) => param.plugin_piping_id === pluginPiping.data.id,
        );

        for (const param of filteredParameters) {
          const name: string = param.param_name;
          paramDict[name] = param;
        }

        const paramItems = params.getItems();

        if (paramItems) {
          const newParamDict = paramItems.reduce((acc, param) => {
            if (paramDict[param.data.name]) {
              const defaultParam = paramDict[param.data.name];
              acc.push({
                name: param.data.name,
                default: defaultParam.value,
              });
            }
            return acc;
          }, []);

          let generatedCommand = "";

          if (newParamDict.length > 0) {
            for (const input in newParamDict) {
              //@ts-ignore
              const name = newParamDict[input].name;
              //@ts-ignore
              const defaultValue =
                newParamDict[input].default === false ||
                newParamDict[input].default === true
                  ? ""
                  : newParamDict[input].default.length === 0
                    ? "' '"
                    : newParamDict[input].default;
              generatedCommand += ` --${name} ${defaultValue}`;
            }
          }

          return {
            generatedCommand,
            pluginPiping,
          };
        }
      } catch (error) {
        throw new Error(
          "Failed to fetch command line parameters for this node",
        );
      }
    }
    return {
      generatedCommand: "",
      pluginPiping: undefined,
    };
  };

  const { isLoading, data, isError, error } = useQuery({
    queryKey: ["pipelineParams", id, activeNode],
    queryFn: fetchResources,
  });

  const onClick = (event: any, text: string) => {
    clipboardCopyFunc(event, text);
    setCopied(true);
  };

  const actions = (
    <CodeBlockAction>
      <span style={{ margin: "0.5em" }}>
        {data?.pluginPiping
          ? `${data.pluginPiping.data.plugin_name}:${data.pluginPiping.data.plugin_version}`
          : "N/A"}
      </span>
      {data && (
        <ClipboardCopyButton
          id="basic-copy-button"
          textId="code-content"
          aria-label="Copy to clipboard"
          onClick={(e) => onClick(e, data.generatedCommand)}
          exitDelay={600}
          maxWidth="110px"
          variant="plain"
        >
          {copied ? "Successfully copied to clipboard" : "Copy to clipboard"}
        </ClipboardCopyButton>
      )}
    </CodeBlockAction>
  );

  return (
    <>
      {isError && <Alert type="error" description={error.message} />}
      {isLoading ? (
        <SpinContainer title="Fetching command line parameters..." />
      ) : data ? (
        <Form.Item label="Command Line Parameters for the selected node">
          <CodeBlock actions={actions}>
            <CodeBlockCode id="code-content">
              {data.generatedCommand}
            </CodeBlockCode>
          </CodeBlock>
        </Form.Item>
      ) : (
        <EmptyStateComponent />
      )}
    </>
  );
};

export default CodeBlockComponent;
