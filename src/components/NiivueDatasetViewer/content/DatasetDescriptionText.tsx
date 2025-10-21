import type { Feed } from "@fnndsc/chrisapi";
import {
  Panel,
  PanelMain,
  PanelMainBody,
  Text,
  TextContent,
  TextVariants,
} from "@patternfly/react-core";
import type React from "react";
import FeedButton from "../components/FeedButton";

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
              <FeedButton feed={feed} />
            </Text>
          )}
          {readme === null || <Text component={TextVariants.p}>{readme}</Text>}
        </TextContent>
      </PanelMainBody>
    </PanelMain>
  </Panel>
);

export { DatasetDescriptionText };
