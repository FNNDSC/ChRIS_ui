// src/components/Store/utils/useComputeResources.ts

import type { ComputeResource } from "@fnndsc/chrisapi";
import { useQuery } from "@tanstack/react-query";
import { notification } from "antd";
import { useEffect } from "react";
import ChrisAPIClient from "../../../api/chrisapiclient";

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
