import {
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  Title,
} from "@patternfly/react-core";

import styles from "./EmptyStateLoader.module.css";

type Props = {
  title: string;
  isHide?: boolean;
};

export const EmptyStateLoader = (props: Props) => {
  const { title, isHide } = props;
  const className = isHide ? styles.hide : "";
  return (
    <EmptyState variant={EmptyStateVariant.lg} className={className}>
      <Title headingLevel="h4" size="lg" />
      <EmptyStateBody>{title}</EmptyStateBody>
    </EmptyState>
  );
};
