import { PacsStudy } from "../types.ts";

type PacsStudiesDisplayProps = {
  studies: ReadonlyArray<PacsStudy>;
  onSeriesPull: (pacs_name: string, SeriesInstanceUID: string) => void;
  onStudyPull: (pacs_name: string, SeriesInstanceUID: string) => void;
};

const PacsStudiesDisplay: React.FC<PacsStudiesDisplayProps> = ({}) => {
  return <>hello, world</>;
};

export default PacsStudiesDisplay;
