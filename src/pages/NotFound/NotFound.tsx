import React, { useEffect } from "react";
import Wrapper from "../Layout/PageWrapper";
import {
  Alert,
  PageSection,
  PageSectionVariants,
} from "@patternfly/react-core";
import "./not-found.scss";

export const NotFoundPage: React.FC = () => {
  useEffect(() => {
    document.title = "Page Not Found";    
  }, []);



  return (
      <PageSection variant={PageSectionVariants.default}>
        <Alert
          aria-label="Page Not Found"
          variant="danger"
          title="Page Not Found!"
        >
          Page Not Found! Go <a href="/" target="_PARENT">Home</a>
        </Alert>
      </PageSection>
  );
};
