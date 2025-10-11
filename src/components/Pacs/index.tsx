import { InfoSection } from "../Common";
import Wrapper from "../Wrapper";
import PacsApp from "./PacsApp.tsx";

const PacsTitle = () => (
  <InfoSection
    title="Query and Retrieve PACS"
    content={
      <>
        Search for data from the hospital PACS and pull DICOM into{" "}
        <em>ChRIS</em>.
      </>
    }
  />
);

export default () => {
  return (
    <Wrapper titleComponent={<PacsTitle />}>
      <PacsApp />
    </Wrapper>
  );
};
