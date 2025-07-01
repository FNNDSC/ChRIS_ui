import { EditIcon } from "../../../Icons";
import OperationButton from "./OperationButton";

type Props = {
  handleOperations: (operationKey: string) => void;
  count: number;
};

export default (props: Props) => {
  const { handleOperations, count } = props;
  const isHide = count > 1;

  return (
    <OperationButton
      handleOperations={handleOperations}
      count={count}
      icon={<EditIcon />}
      ariaLabel="Rename"
      operationKey="rename"
      isHide={isHide}
    />
  );
};
