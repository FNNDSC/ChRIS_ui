import { IPacsState } from "../../../store/pacs/types.ts";
import { PACSqueryCore } from "../../../api/pfdcm";

type PacsStudiesViewProps = {
  data: IPacsState;
  onRetrieve: (query: PACSqueryCore) => void;
};

const PacsStudiesView: React.FC<PacsStudiesViewProps> = ({}) => {
  return <>hello, world</>;
};

export type { PacsStudiesViewProps };
export default PacsStudiesView;
