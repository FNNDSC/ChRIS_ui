import { ComputeResource } from "@fnndsc/chrisapi";
import { ExpandableSection } from "@patternfly/react-core";
import { useQuery } from "@tanstack/react-query";
import { Alert } from "antd";
import { useState } from "react";
import ChrisAPIClient from "../../api/chrisapiclient";
import { fetchResource } from "../../api/common";
import { EmptyStateComponent, SpinContainer } from "../Common";
import ListCompute from "./ListCompute";

function GeneralCompute() {
  const [isExpanded, setIsExpanded] = useState(false);
  const fetchCompute = async () => {
    const client = ChrisAPIClient.getClient();
    const fn = client.getComputeResources;
    const boundFn = fn.bind(client);
    try {
      const data: {
        resource: ComputeResource[];
        totalCount: number;
      } = await fetchResource<ComputeResource>(
        { limit: 100, offset: 0 },
        boundFn,
      );
      return data;
    } catch (e) {
      throw new Error(
        "Count not fetch the compute resources registered to this ChRIS instance",
      );
    }
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["computeResource"],
    queryFn: () => fetchCompute(),
  });

  const onToggle = (_event: React.MouseEvent, isExpanded: boolean) => {
    setIsExpanded(isExpanded);
  };

  return (
    <div>
      {isError && <Alert type="error" description={error.message} />}

      {isLoading ? (
        <SpinContainer title="Loading compute resources..." />
      ) : data?.resource && data?.resource.length > 0 ? (
        <ExpandableSection
          isExpanded={isExpanded}
          onToggle={onToggle}
          toggleText={
            isExpanded
              ? "Hide All Compute"
              : "Show all the compute registered to ChRIS"
          }
        >
          <ListCompute computeResources={data.resource} />
        </ExpandableSection>
      ) : (
        <EmptyStateComponent />
      )}
    </div>
  );
}

export default GeneralCompute;
