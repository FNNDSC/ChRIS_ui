import React from "react";
import { Button, List, Form, Input, Checkbox } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { useDispatch } from "react-redux";
import { Plugin, PluginParameter } from "@fnndsc/chrisapi";
import { deleteTsNode } from "../../../store/tsplugins/actions";
import { useSafeDispatch } from "../../../api/common";
import { useTypedSelector } from "../../../store/hooks";
import { AiFillCloseCircle } from "react-icons/ai";
import { InputType } from "./ParentContainer";

type ConfigureJoinProps = {
  selectedTsPlugin?: Plugin;
  joinInput: InputType;
  handleValueChange: (value: string, name: string) => void;
  handleCheckboxChange: (value: boolean, name: string) => void;
};

const ConfigureJoin = ({
  selectedTsPlugin,
  handleCheckboxChange,
  handleValueChange,
  joinInput,
}: ConfigureJoinProps) => {
  const [tsParams, setTsParams] = React.useState<PluginParameter[]>([]);
  const tsNodes = useTypedSelector((state) => state.tsPlugins.tsNodes);
  const dispatch = useDispatch();
  const safeDispatch = useSafeDispatch(dispatch);

  React.useEffect(() => {
    async function fetchTsParameters() {
      if (selectedTsPlugin) {
        const parametersList = await selectedTsPlugin.getPluginParameters({
          limit: 20,
        });

        const parameters = parametersList.getItems();
        if (parameters) setTsParams(parameters as PluginParameter[]);
      }
    }
    fetchTsParameters();
  }, [selectedTsPlugin]);

  return (
    <div className="list-container">
      {tsNodes && tsNodes.length > 0 && (
        <List
          size="small"
          bordered
          dataSource={tsNodes}
          renderItem={(item) => (
            <>
              <List.Item>
                <span>{item.data.title || item.data.plugin_name}</span>
                <Button
                  onClick={() => {
                    safeDispatch(deleteTsNode(item));
                  }}
                  icon={<AiFillCloseCircle />}
                />
              </List.Item>
            </>
          )}
        />
      )}

      <Form
        style={{
          marginTop: "1em",
        }}
      >
        {tsParams &&
          tsParams.map((param) => {
            if (param.data.name !== "plugininstances") {
              if (param.data.name === "groupByInstance") {
                return (
                  <Checkbox
                    key={param.data.id}
                    checked={joinInput[param.data.name] as boolean}
                    onChange={(event: CheckboxChangeEvent) => {
                      handleCheckboxChange(
                        event.target.checked,
                        param.data.name
                      );
                    }}
                  >
                    {param.data.name}
                  </Checkbox>
                );
              } else
                return (
                  <Form.Item key={param.data.id} label={param.data.name}>
                    <Input
                      className="input"
                      value={joinInput[param.data.name] as string}
                      onChange={(
                        event: React.ChangeEvent<HTMLInputElement>
                      ) => {
                        handleValueChange(event.target.value, param.data.name);
                      }}
                    />
                  </Form.Item>
                );
            } else return null;
          })}
      </Form>
    </div>
  );
};

export default ConfigureJoin;
