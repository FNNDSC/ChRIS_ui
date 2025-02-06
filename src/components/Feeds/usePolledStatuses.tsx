import { useQueries } from "@tanstack/react-query";
import React from "react";
import type { PluginInstance } from "@fnndsc/chrisapi";

export function usePollAllPluginStatuses(
  pluginInstances: PluginInstance[],
  totalCount: number,
) {
  const [statuses, setStatuses] = React.useState<{ [id: number]: string }>({});

  // Flag to indicate whether polling should start.
  const shouldStartPolling = React.useMemo(
    () => pluginInstances.length === totalCount,
    [pluginInstances.length, totalCount],
  );

  const incompletePlugins = React.useMemo(() => {
    return pluginInstances.filter((inst) => {
      // If we already have a status in `statuses`, use that, otherwise use the plugin's own status.
      const knownStatus = statuses[inst.data.id] || inst.data.status;
      return !isTerminalStatus(knownStatus);
    });
  }, [pluginInstances, statuses]);

  useQueries({
    queries: incompletePlugins.map((instance) => {
      const id = instance.data.id;
      return {
        queryKey: ["pluginInstanceStatus", id],
        queryFn: async () => {
          const details = await instance.get();
          const latestStatus = details.data.status as string;
          setStatuses((prev) => ({
            ...prev,
            [id]: latestStatus,
          }));
          return latestStatus;
        },
        // Only enable polling if we have the correct number of instances AND there's something incomplete
        enabled: shouldStartPolling && incompletePlugins.length > 0,
        refetchInterval: (result: { state?: { data?: string } }) => {
          const latestStatus = result?.state?.data;
          // If it transitions to a terminal state, stop polling
          if (isTerminalStatus(latestStatus)) return false;
          // otherwise poll every 7s
          return 7000;
        },
      };
    }),
  });

  return statuses;
}

function isTerminalStatus(status?: string) {
  return (
    status === "finishedSuccessfully" ||
    status === "finishedWithError" ||
    status === "cancelled"
  );
}
