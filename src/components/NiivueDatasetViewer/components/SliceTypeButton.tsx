import React from "react";
import { Button } from "@patternfly/react-core";
import { SLICE_TYPE } from "@niivue/niivue";

const SLICE_NAMES: { [key: string]: [SLICE_TYPE, boolean] } = {
  Axial: [SLICE_TYPE.AXIAL, false],
  Coronal: [SLICE_TYPE.CORONAL, false],
  Sagittal: [SLICE_TYPE.SAGITTAL, false],
  "3D render": [SLICE_TYPE.RENDER, false],
  "A+C+S": [SLICE_TYPE.MULTIPLANAR, false],
  "A+C+S+3D": [SLICE_TYPE.MULTIPLANAR, true],
};

type SliceTypeDropdownProps = {
  selectedSliceType: [SLICE_TYPE, boolean];
  onSelect: (sliceType: SLICE_TYPE, multiplanarForceRender: boolean) => void;
};

/**
 * A button for flipping through axial/coronal/sagittal/triplanar views.
 */
const SliceTypeButton: React.FC<SliceTypeDropdownProps> = ({
  selectedSliceType,
  onSelect,
}) => {
  const selected = Object.entries(SLICE_NAMES).find(
    ([_name, [sliceType, multiplanarForceRender]]) =>
      sliceType === selectedSliceType[0] &&
      multiplanarForceRender === selectedSliceType[1],
  );
  const selectedName = selected ? selected[0] : "unknown";

  const nextSliceType = () => {
    const i = Object.keys(SLICE_NAMES).indexOf(selectedName);
    const nextIndex = i + 1 >= Object.keys(SLICE_NAMES).length ? 0 : i + 1;
    onSelect(...Object.values(SLICE_NAMES)[nextIndex]);
  };

  return (
    <div style={{ width: "8em" }}>
      <Button isBlock variant="tertiary" onClick={nextSliceType}>
        {selectedName}
      </Button>
    </div>
  );
};

export default SliceTypeButton;
