import { CodeBranchIcon } from "../../../Icons";
import OperationButton from "./OperationButton";

type Props = {
  handleOperations: (operationKey: string) => void;
  count: number;
};
export default (props: Props) => {
  const { handleOperations, count } = props;

  const ariaLabel =
    count === 1 ? "Create a new analysis" : "Create new analyses";

  const label = count === 1 ? "Create Analysis" : "Create Analyses";

  return (
    <OperationButton
      handleOperations={handleOperations}
      count={count}
      icon={<CodeBranchIcon />}
      ariaLabel={ariaLabel}
      operationKey="createFeed"
      label={label}
    />
  );
};
