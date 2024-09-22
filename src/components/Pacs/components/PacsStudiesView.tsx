import { PacsStudyState } from "../../../store/pacs/types.ts";
import { PACSqueryCore } from "../../../api/pfdcm";

type PacsStudiesViewProps = {
  studies: ReadonlyArray<PacsStudyState>;
  onRetrieve: (query: PACSqueryCore) => void;
};

const PacsStudiesView: React.FC<PacsStudiesViewProps> = ({ studies }) => {
  return <>{studies.map((s) => s.info.StudyDescription).join(" ")}</>;
};

export type { PacsStudiesViewProps };
export default PacsStudiesView;
