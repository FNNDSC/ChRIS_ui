import React, { useEffect } from "react";
import {
  Alert,
  PageSection,
  PageSectionVariants,
} from "@patternfly/react-core";
import Wrapper from "../Layout/PageWrapper";
import "./not-found.scss";

export const NotFoundPage: React.FC = () => {
  useEffect(() => {
    document.title = "Page Not Found";    
  }, []);

  return (
    <Wrapper>
         <PageSection variant={PageSectionVariants.default}>
        <Alert
          aria-label="Page Not Found"
          variant="danger"
          title="Page Not Found!"
        >
          Page Not Found! Go <a href="/" target="_PARENT">Home</a>
        </Alert>
      </PageSection>
     </Wrapper>
  );
};
