import React from "react";
import { Button } from "antd";
import { useDispatch } from "react-redux";
import { Plugin, PluginParameter } from "@fnndsc/chrisapi";
import { switchTreeMode } from "../../../store/feed/actions";
import { useSafeDispatch } from "../../../utils";

type ConfigureJoinProps = {
  selectedTsPlugin?: Plugin;
};

const ConfigureJoin = ({ selectedTsPlugin }: ConfigureJoinProps) => {
  const [tsParams, setTsParams] = React.useState<PluginParameter[]>([]);
  const [value, setValue] = React.useState("");
  const dispatch = useDispatch();
  const safeDispatch = useSafeDispatch(dispatch);

  React.useEffect(() => {
    async function fetchTsParameters() {
      if (selectedTsPlugin) {
        const parametersList = await selectedTsPlugin.getPluginParameters({
          limit: 20,
        });

        const parameters: PluginParameter[] = parametersList.getItems();
        if (parametersList) setTsParams(parameters);
      }
    }
    fetchTsParameters();
  }, [selectedTsPlugin]);

  const onChange = (event: any) => {
    setValue(event.target.value);
  };

  return (
    <div className="list-container">
      <Button
        onClick={() => {
          safeDispatch(switchTreeMode("graph"));
        }}
        type="primary"
      >
        Select Nodes from the Feed Tree
      </Button>
      <form>
        {tsParams &&
          tsParams.map((param) => {
            if (param.data.name === "filter") {
              return (
                <div key={param.data.id}>
                  <label>{param.data.name}</label>
                  <input onChange={onChange} value={value} />
                </div>
              );
            } else return null;
          })}
      </form>
    </div>
  );
};

export default ConfigureJoin;
