import { ShareIcon } from "../../../Icons";
import OperationButton from "./OperationButton";

type Props = {
  handleOperations: (operationKey: string) => void;
  count: number;
};

export default (props: Props) => {
  const { handleOperations, count } = props;

  const ariaLabel =
    count === 1 ? "Share selected item" : "Share selected items";

  return (
    <OperationButton
      handleOperations={handleOperations}
      count={count}
      icon={<ShareIcon />}
      ariaLabel={ariaLabel}
      operationKey="share"
    />
  );
};
