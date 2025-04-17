// src/components/Store/utils/useComputeResources.ts
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { notification } from "antd";
import ChrisAPIClient from "../../../api/chrisapiclient";
import type { ComputeResource } from "@fnndsc/chrisapi";

export function useComputeResources(isLoggedIn?: boolean) {
  const {
    isLoading: isLoadingCompute,
    data,
    error,
    isError,
  } = useQuery<ComputeResource[], Error>({
    queryKey: ["computeResources"],
    enabled: isLoggedIn,
    queryFn: async () => {
      const client = ChrisAPIClient.getClient();
      const compute = await client.getComputeResources({ limit: 100 });
      const resources = compute.getItems();
      return resources || [];
    },
  });

  useEffect(() => {
    if (isError && error) {
      // antd notification
      notification.error({
        message: "Failed to fetch compute resources",
        description: error.message,
      });
    }
  }, [isError, error]);

  return {
    data,
    isLoadingCompute,
  };
}
