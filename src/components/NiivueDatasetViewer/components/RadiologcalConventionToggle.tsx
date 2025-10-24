import { ToggleGroup, ToggleGroupItem } from "@patternfly/react-core";
import type React from "react";
import type { Updater } from "use-immer";
import type { ChNVROptions } from "../models.ts";

type RadiologcalConventionToggleProps = {
  options: ChNVROptions;
  setOptions: Updater<ChNVROptions>;
};

const RadiologcalConventionToggle: React.FC<
  RadiologcalConventionToggleProps
> = ({ options, setOptions }) => (
  <ToggleGroup>
    <ToggleGroupItem
      text="Neurological"
      isSelected={!options.isRadiologicalConvention}
      onChange={() =>
        setOptions((draft) => {
          draft.isRadiologicalConvention = false;
          draft.sagittalNoseLeft = false;
        })
      }
    />
    <ToggleGroupItem
      text="Radiological"
      isSelected={options.isRadiologicalConvention}
      onChange={() =>
        setOptions((draft) => {
          draft.isRadiologicalConvention = true;
          draft.sagittalNoseLeft = true;
        })
      }
    />
  </ToggleGroup>
);

export default RadiologcalConventionToggle;
