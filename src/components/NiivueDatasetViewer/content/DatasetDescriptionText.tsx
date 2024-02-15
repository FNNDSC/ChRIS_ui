import {
  Panel,
  PanelMain,
  PanelMainBody,
  Skeleton,
  Text,
  TextContent,
  TextVariants,
} from "@patternfly/react-core";
import FeedButton from "../components/FeedButton.tsx";
import React from "react";
import { Feed } from "@fnndsc/chrisapi";

const DatasetDescriptionText: React.FC<{
  feed: Feed | null;
  readme: string | null;
}> = ({ feed, readme }) => (
  <Panel>
    <PanelMain>
      <PanelMainBody>
        <TextContent>
          {feed === null || (
            <Text component={TextVariants.h2}>
              {feed.data.name}
              <FeedButton feedId={feed.data.id} />
            </Text>
          )}
          {readme === null || <Text component={TextVariants.p}>{readme}</Text>}
        </TextContent>
      </PanelMainBody>
    </PanelMain>
  </Panel>
);

export { DatasetDescriptionText };
