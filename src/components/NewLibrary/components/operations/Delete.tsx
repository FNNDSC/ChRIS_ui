import { DeleteIcon } from "../../../Icons";
import OperationButton from "./OperationButton";

type Props = {
  handleOperations: (operationKey: string) => void;
  count: number;
};

export default (props: Props) => {
  const { handleOperations, count } = props;

  const ariaLabel =
    count === 1 ? "Delete selected item" : "Delete selected items";

  return (
    <OperationButton
      handleOperations={handleOperations}
      count={count}
      icon={<DeleteIcon />}
      ariaLabel={ariaLabel}
      operationKey="delete"
    />
  );
};
