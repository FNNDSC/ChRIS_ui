import { ChNVRVolume, VolumeEntry } from "./models.ts";
import React from "react";
import { Checkbox, Slider, Text, TextContent, TextVariants } from "@patternfly/react-core";
import ColormapDropdown from "./ColormapDropdown.tsx";
import { DraftFunction } from "use-immer";

type SelectedFilesOptionsPaneProps = {
  volumes: VolumeEntry[],
  setVolumes: (updater: DraftFunction<VolumeEntry[]>) => void;
};

const SelectedFilesOptionsPane: React.FC<SelectedFilesOptionsPaneProps> = ({volumes, setVolumes}) => {
  return (
    <div>{
    volumes.map(({ name, volume }, i) => {
      const setValue = (change: (volume: ChNVRVolume) => void) => {
        setVolumes((draft) => {
          change(draft[i].volume);
        });
      };

      // TODO debounce for performance
      const setOpacity = (_e: any, value: number) => {
        setValue((volume) => volume.opacity = value);
      };

      const setColorbarvisible = (_e: React.FormEvent<HTMLInputElement>, checked: boolean) => {
        setValue((volume) => volume.colorbarVisible = checked);
      };

      const setColormap = (colormap: string) => {
        setValue((volume) => volume.colormap = colormap);
      }

      return (<div key={`${name}-options`}>
        <TextContent>
          <Text component={TextVariants.h3}>{name}</Text>
        </TextContent>
        <Text component={TextVariants.p}>Opacity: {volume.opacity}</Text>
        <Slider
          min={0.0}
          max={1.0}
          step={0.05}
          value={volume.opacity}
          onChange={setOpacity}
        />
        {
          volume.opacity > 0 &&
          <>
            <Checkbox
              label="Show colormap"
              isChecked={volume.colorbarVisible}
              onChange={setColorbarvisible}
              id={`${name}-colormapvisible-checkbox`}
            />
            <ColormapDropdown selectedColormap={volume.colormap} onSelect={setColormap} />
          </>
        }
      </div>)
    })
  }
  </div>);
};

export default SelectedFilesOptionsPane;
