import React from "react";
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateHeader,
  EmptyStateIcon,
  Text,
  TextContent,
  TextVariants,
} from "@patternfly/react-core";
import { ExclamationCircleIcon } from "../../Icons";

const ErrorScreen: React.FC<React.PropsWithChildren<{}>> = ({ children }) => (
  <EmptyState>
    <EmptyStateHeader
      titleText="PACS Connection Error"
      headingLevel="h4"
      icon={<EmptyStateIcon icon={ExclamationCircleIcon} />}
    />
    <EmptyStateBody>
      <TextContent>
        <Text component={TextVariants.pre}>{children}</Text>
        <Text component={TextVariants.p}>
          The <em>ChRIS</em> PACS Q/R application is currently unavailable.
          Please contact your <em>ChRIS</em> admin by clicking{" "}
          <a href={import.meta.env.VITE_SUPPORT_URL}>here</a>.
        </Text>
      </TextContent>
    </EmptyStateBody>
  </EmptyState>
);

export default ErrorScreen;
