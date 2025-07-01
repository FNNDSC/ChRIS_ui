import { DuplicateIcon } from "../../../Icons";
import OperationButton from "./OperationButton";

type Props = {
  handleOperations: (operationKey: string) => void;
  count: number;
};

export default (props: Props) => {
  const { handleOperations, count } = props;

  const ariaLabel = count === 1 ? "Copy selected item" : "Copy selected items";

  return (
    <OperationButton
      handleOperations={handleOperations}
      count={count}
      icon={<DuplicateIcon />}
      ariaLabel={ariaLabel}
      operationKey="duplicate"
    />
  );
};
