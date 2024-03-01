import { ToggleGroup, ToggleGroupItem } from "@patternfly/react-core";
import React from "react";
import { ChNVROptions } from "../models.ts";
import { Updater } from "use-immer";

type RadiologcalConventionToggleProps = {
  options: ChNVROptions;
  setOptions: Updater<ChNVROptions>;
};

const RadiologcalConventionToggle: React.FC<RadiologcalConventionToggleProps> =
  ({ options, setOptions }) => (
    <ToggleGroup>
      <ToggleGroupItem
        text="Neurological"
        isSelected={!options.isRadiologicalConvention}
        onChange={() =>
          setOptions((draft) => {
            draft.isRadiologicalConvention = false;
          })
        }
      />
      <ToggleGroupItem
        text="Radiological"
        isSelected={options.isRadiologicalConvention}
        onChange={() =>
          setOptions((draft) => {
            draft.isRadiologicalConvention = true;
          })
        }
      />
    </ToggleGroup>
  );

export default RadiologcalConventionToggle;
