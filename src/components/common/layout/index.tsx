import React, { ReactNode } from "react";
import { Flex, FlexItem } from "@patternfly/react-core";

export const RenderFlexItem = ({
  title,
  subTitle,
}: {
  title: ReactNode;
  subTitle: ReactNode;
}) => {
  return (
    <div>
      <Flex flex={{ default: "flex_1" }} style={{ marginBottom: "0.5rem" }}>
        <Flex style={{ width: "20%" }} direction={{ default: "column" }}>
          <FlexItem>{title}</FlexItem>
        </Flex>
        <Flex flex={{ default: "flex_1" }} direction={{ default: "column" }}>
          <FlexItem>{subTitle}</FlexItem>
        </Flex>
      </Flex>
    </div>
  );
};
