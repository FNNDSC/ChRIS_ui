import { Alert } from "@patternfly/react-core";
import WrapperConnect from "../Wrapper";

const NotFound = () => {
  return (
    <WrapperConnect>
      <Alert
        title="Page Not Found"
        variant="danger"
        aria-label="Page not found"
      >
        Page Not Found ! Go{" "}
        <a href="/" target="_PARENT">
          Home
        </a>{" "}
        P
      </Alert>
    </WrapperConnect>
  );
};

export default NotFound;
