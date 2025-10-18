import type { ThunkModuleToFunc, UseThunk } from "@chhsiao1981/use-thunk";
import type * as DoUI from "../../reducers/ui";
import type * as DoUser from "../../reducers/user";
import { InfoSection } from "../Common";
import Wrapper from "../Wrapper";
import PacsApp from "./PacsApp.tsx";

type TDoUI = ThunkModuleToFunc<typeof DoUI>;
type TDoUser = ThunkModuleToFunc<typeof DoUser>;

type Props = {
  useUI: UseThunk<DoUI.State, TDoUI>;
  useUser: UseThunk<DoUser.State, TDoUser>;
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
  const { useUI, useUser } = props;
  return (
    <Wrapper useUI={useUI} useUser={useUser} titleComponent={<PacsTitle />}>
      <PacsApp />
    </Wrapper>
  );
};
