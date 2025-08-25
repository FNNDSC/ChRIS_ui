import type { ModuleToFunc } from "react-reducer-utils";
import { useReducer } from "react-reducer-utils";
import type * as DoPacs from "../../reducers/pacs";
import { InfoSection } from "../Common";
import Wrapper from "../Wrapper";
import PacsApp from "./PacsApp.tsx";

type TDoPacs = ModuleToFunc<typeof DoPacs>;

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
