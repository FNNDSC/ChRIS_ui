// src/components/Store/utils/useComputeResources.ts
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { notification } from "antd";
import ChrisAPIClient from "../../../api/chrisapiclient";
import type { ComputeResource } from "@fnndsc/chrisapi";

export function useComputeResources(isLoggedIn?: boolean) {
  // 1) Use React Query to fetch the compute resources
  const { data, error, isError } = useQuery<ComputeResource[], Error>({
    queryKey: ["computeResources"],
    enabled: isLoggedIn,
    queryFn: async () => {
      const client = ChrisAPIClient.getClient();
      const compute = await client.getComputeResources({ limit: 100 });
      const resources = compute.getItems();
      return resources || [];
    },
  });

  // 2) Whenever `isError` becomes true, show a notification
  useEffect(() => {
    if (isError && error) {
      // antd notification
      notification.error({
        message: "Failed to fetch compute resources",
        description: error.message,
      });
    }
  }, [isError, error]);

  // 3) Return data or an empty array (avoid returning undefined)
  return data || [];
}
