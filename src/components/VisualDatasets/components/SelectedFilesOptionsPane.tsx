import { ChNVRVolume, VisualDatasetFile } from "../models.ts";
import React from "react";
import { Button, Slider, SliderOnChangeEvent, Text, TextContent, TextVariants } from "@patternfly/react-core";
import ColormapDropdown from "./ColormapDropdown.tsx";
import { Updater } from "use-immer";

type SelectedFilesOptionsPaneProps = {
  files: VisualDatasetFile[],
  setFiles: Updater<VisualDatasetFile[]>;
};

const SelectedFilesOptionsPane: React.FC<SelectedFilesOptionsPaneProps> = ({files, setFiles}) => {
  return (
    <div>{
    files.map(({ defaultSettings, currentSettings, name, author }, i) => {
      const setValue = (change: (volume: ChNVRVolume) => void) => {
        setFiles((draft) => {
          change(draft[i].currentSettings);
        });
      };

      const setOpacity = (_e: any, value: number) => {
        setValue((volume) => volume.opacity = value);
      };

      // const setColorbarvisible = (_e: React.FormEvent<HTMLInputElement>, checked: boolean) => {
      //   setValue((volume) => volume.colorbarVisible = checked);
      // };

      const setColormap = (colormap: string) => {
        setValue((volume) => volume.colormap = colormap);
      };

      const setCalMin = (_e: SliderOnChangeEvent, cal_min: number) => {
        setValue((volume) => volume.cal_min = cal_min);
      };

      // this is super ugly, and should be redone from the ground up.
      // Keeping it simple, maybe replace with description list?
      // https://www.patternfly.org/components/description-list/
      return (<div key={`${name}-options`}>
        <div style={{ height: "1em" }}></div>
        <TextContent>
          <Text component={TextVariants.h3}>{name}</Text>
        </TextContent>
        <TextContent>
          <Text component={TextVariants.small}>{author}</Text>
        </TextContent>
        <div style={{ height: "1em" }}></div>

        <Text component={TextVariants.p}>Opacity: {currentSettings.opacity}</Text>
        <Slider
          min={0.0}
          max={1.0}
          step={0.05}
          value={currentSettings.opacity}
          onChange={setOpacity}
        />
        {
          currentSettings.opacity > 0 &&
          <>
            {/*
              * TODO about cal_min, cal_max:
              * - can we use a two-ended slider component? (not sure if Patternfly provides one)
              * - min cal_min and max cal_max should not be hard-coded
              * - we have one slider for cal_min but not cal_max for now because cal_min alone adjusts contrast
              */}
            <Text component={TextVariants.p}>cal_min: {currentSettings.cal_min}</Text>
            <Slider
              min={0}
              max={
                // FIXME maximum should be cal_max
                500
              }
              step={1}
              value={currentSettings.cal_min}
              onChange={setCalMin}
            />

            {/*
              colormap toggle disabled for now.
              (why does checkbox require ID, and what would be a good ID?)
              */}
            {/*<Checkbox*/}
            {/*  label="Show colormap"*/}
            {/*  isChecked={currentSettings.colorbarVisible}*/}
            {/*  onChange={setColorbarvisible}*/}
            {/*  id={`${file.fname}-colormapvisible-checkbox`}*/}
            {/*/>*/}
            <ColormapDropdown selectedColormap={currentSettings.colormap} onSelect={setColormap} />
            {
              currentSettings.colormap === defaultSettings.colormap ||
              <Button
                variant="tertiary"
                onClick={() => setColormap(defaultSettings.colormap)}
              >
                Reset colormap to "{defaultSettings.colormap}"
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
