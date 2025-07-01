import { DownloadIcon } from "../../../Icons";
import OperationButton from "./OperationButton";

type Props = {
  handleOperations: (operationKey: string) => void;
  count: number;
};

export default (props: Props) => {
  const { handleOperations, count } = props;

  const ariaLabel =
    count === 1 ? "Download selected item" : "Download selected items";

  return (
    <OperationButton
      handleOperations={handleOperations}
      count={count}
      icon={<DownloadIcon />}
      ariaLabel={ariaLabel}
      operationKey="download"
    />
  );
};
