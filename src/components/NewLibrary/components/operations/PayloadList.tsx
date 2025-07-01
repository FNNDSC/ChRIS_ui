import { ChipGroup, Chip } from "@patternfly/react-core";
import { removeSelectedPayload } from "../../../../store/cart/cartSlice";
import { getFileName } from "../../../../api/common";
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
