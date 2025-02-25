// hooks/useComputeResources.ts
import { useState, useEffect } from "react";
import ChrisAPIClient from "../../../api/chrisapiclient";

/**
 * Fetch compute resources from Chris API
 */
export function useComputeResources() {
  const [computeResourceList, setComputeResourceList] = useState<string[]>([]);

  useEffect(() => {
    async function fetchCompute() {
      try {
        const client = ChrisAPIClient.getClient();
        const compute = await client.getComputeResources({ limit: 100 });
        // Suppose compute.data is an array or has .items
        // Adjust below depending on the actual shape of `compute`.
        const resources = compute.data
          ? compute.data.map((item: any) => item.compute_name || item.name)
          : [];
        setComputeResourceList(resources);
      } catch (error) {
        console.error("Failed to fetch compute resources", error);
      }
    }

    fetchCompute();
  }, []);

  return computeResourceList;
}
