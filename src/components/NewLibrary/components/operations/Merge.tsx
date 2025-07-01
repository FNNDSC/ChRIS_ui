import OperationButton from "./OperationButton";
import { MergeIcon } from "../../../Icons";

type Props = {
  handleOperations: (operationKey: string) => void;
  count: number;
};

export default (props: Props) => {
  const { handleOperations, count } = props;

  const ariaLabel =
    count === 1 ? "Merge selected item" : "Merge selected items";

  return (
    <OperationButton
      handleOperations={handleOperations}
      count={count}
      icon={<MergeIcon />}
      ariaLabel={ariaLabel}
      operationKey="merge"
    />
  );
};
