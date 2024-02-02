import { ChNVRVolume, VolumeEntry } from "../models.ts";
import React from "react";
import { Button, Checkbox, Slider, SliderOnChangeEvent, Text, TextContent, TextVariants } from "@patternfly/react-core";
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
      };

      const setCalMin = (_e: SliderOnChangeEvent, cal_min: number) => {
        setValue((volume) => volume.cal_min = cal_min);
      };

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
            {/*
              * TODO about cal_min, cal_max:
              * - can we use a two-ended slider component? (not sure if Patternfly provides one)
              * - min cal_min and max cal_max should not be hard-coded
              * - we have one slider for cal_min but not cal_max for now because cal_min alone adjusts contrast
              */}
            <Text component={TextVariants.p}>cal_min: {volume.cal_min}</Text>
            <Slider
              min={0}
              max={volume.cal_max}
              step={1}
              value={volume.cal_min}
              onChange={setCalMin}
            />

            <Checkbox
              label="Show colormap"
              isChecked={volume.colorbarVisible}
              onChange={setColorbarvisible}
              id={`${name}-colormapvisible-checkbox`}
            />
            <ColormapDropdown selectedColormap={volume.colormap} onSelect={setColormap} />
            {
              volume.colormap === 'gray' ||
              <Button
                variant="tertiary"
                onClick={() => setColormap("gray")}
              >
                Reset colormap to "gray"
              </Button>
            }
          </>
        }
      </div>)
    })
  }
  </div>);
};

export default SelectedFilesOptionsPane;
