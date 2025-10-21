import { Skeleton } from "@patternfly/react-core";
import { Th, Tr } from "@patternfly/react-table";

export default () => (
  <>
    {Array.from({ length: 5 }).map((_, index) => (
      <Tr key={`skeleton-row-${index}`}>
        <Th>
          <Skeleton width="20px" />
        </Th>
        <Th>
          <Skeleton width="100px" />
        </Th>
        <Th>
          <Skeleton width="80px" />
        </Th>
        <Th>
          <Skeleton width="80px" />
        </Th>
        <Th>
          <Skeleton width="60px" />
        </Th>
      </Tr>
    ))}
  </>
);
