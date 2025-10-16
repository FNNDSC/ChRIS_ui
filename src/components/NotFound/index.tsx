import type { ThunkModuleToFunc, UseThunk } from "@chhsiao1981/use-thunk";
import { Alert } from "@patternfly/react-core";
import type * as DoUI from "../../reducers/ui";
import Wrapper from "../Wrapper";

type TDoUI = ThunkModuleToFunc<typeof DoUI>;

type Props = {
  useUI: UseThunk<DoUI.State, TDoUI>;
};

export default (props: Props) => {
  const { useUI } = props;
  return (
    <Wrapper useUI={useUI}>
      <Alert
        title="Page Not Found"
        variant="danger"
        aria-label="Page not found"
      >
        Go{" "}
        <a href="/" target="_PARENT">
          Home
        </a>{" "}
      </Alert>
    </Wrapper>
  );
};
