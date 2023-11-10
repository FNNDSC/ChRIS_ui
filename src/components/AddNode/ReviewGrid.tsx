import React from "react";
import { RenderFlexItem } from "../Common";
import { Plugin } from "@fnndsc/chrisapi";

interface PluginDetailsProps {
  generatedCommand: string;
  selectedPlugin?: Plugin;
  computeEnvironment: string;
}

export const PluginDetails: React.FC<PluginDetailsProps> = ({
  generatedCommand,
  selectedPlugin,
  computeEnvironment,
}: PluginDetailsProps) => {
  if (selectedPlugin && selectedPlugin.data) {
    const { version, title, name } = selectedPlugin.data;
    const pluginName = `${title ? title : `${name} v.${version}`}`;
    return (
      <>
        <RenderFlexItem
          title={<span className="review__title">Selected Plugin:</span>}
          subTitle={
            <span className="review__value">{pluginName || "N/A"}</span>
          }
        />

        <RenderFlexItem
          title={<span className="review__title">Type of Plugin:</span>}
          subTitle={
            <span className="review__value">
              {selectedPlugin && selectedPlugin.data.type.toUpperCase()}
            </span>
          }
        />

        <RenderFlexItem
          title={<span className="review__title">Plugin Configuration:</span>}
          subTitle={
            <span className="required-text">{generatedCommand || "N/A"}</span>
          }
        />

        <RenderFlexItem
          title={<span className="review__title">Compute Enviroment:</span>}
          subTitle={
            <span className="review__value">{computeEnvironment || "N/A"}</span>
          }
        />
      </>
    );
  } else {
    return <div>Something went wrong. Could you please try this again?</div>;
  }
};
