import React, { useEffect } from "react";
import Wrapper from "../Layout/PageWrapper";
import { Alert } from "@patternfly/react-core";
import "./not-found.scss";
import DarkTheme from "../../components/common/darkTheme";

export const NotFoundPage: React.FC = () => {
  useEffect(() => {
    document.title = "Page Not Found";
  }, []);

  return (
    <Wrapper>
      <DarkTheme>
        <Alert
          aria-label="Page Not Found"
          variant="danger"
          title="Page Not Found!"
        >
          Page Not Found! Go{" "}
          <a href="/" target="_PARENT">
            Home
          </a>
        </Alert>
      </DarkTheme>
    </Wrapper>
  );
};
