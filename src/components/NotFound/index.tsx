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
        Go{" "}
        <a href="/" target="_PARENT">
          Home
        </a>{" "}
      </Alert>
    </WrapperConnect>
  );
};

export default NotFound;
