import React, { ReactNode } from "react";
import { PageSection } from "@patternfly/react-core";

const DarkTheme = ({ children }: { children: ReactNode }) => {
  return <PageSection variant="darker">{children}</PageSection>;
};

export default DarkTheme;
