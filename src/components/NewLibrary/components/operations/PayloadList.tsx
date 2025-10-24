import { Chip, ChipGroup } from "@patternfly/react-core";
import { getFileName } from "../../../../api/common";
import { removeSelectedPayload } from "../../../../store/cart/cartSlice";
import type { SelectionPayload } from "../../../../store/cart/types";
import type { AppDispatch } from "../../../../store/configureStore";

type Props = {
  selectedPaths: SelectionPayload[];
  dispatch: AppDispatch;
};

export default (props: Props) => {
  const { selectedPaths, dispatch } = props;

  return (
    <ChipGroup>
      {selectedPaths.map((selection) => (
        <Chip
          key={selection.path}
          onClick={() => dispatch(removeSelectedPayload(selection))}
        >
          {getFileName(selection.path)}
        </Chip>
      ))}
    </ChipGroup>
  );
};
