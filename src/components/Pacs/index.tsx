import type { ThunkModuleToFunc, UseThunk } from "@chhsiao1981/use-thunk";
import type * as DoUI from "../../reducers/ui";
import { InfoSection } from "../Common";
import Wrapper from "../Wrapper";
import PacsApp from "./PacsApp.tsx";

type TDoUI = ThunkModuleToFunc<typeof DoUI>;

type Props = {
  useUI: UseThunk<DoUI.State, TDoUI>;
};

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

export default (props: Props) => {
  const { useUI } = props;
  return (
    <Wrapper useUI={useUI} titleComponent={<PacsTitle />}>
      <PacsApp />
    </Wrapper>
  );
};
