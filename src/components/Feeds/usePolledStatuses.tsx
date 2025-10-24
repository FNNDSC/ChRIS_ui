import type { PluginInstance } from "@fnndsc/chrisapi";
import { useQueries } from "@tanstack/react-query";
import React from "react";

export function usePollAllPluginStatuses(
  pluginInstances: PluginInstance[],
  totalCount: number,
) {
  const [statuses, setStatuses] = React.useState<{ [id: number]: string }>({});

  const shouldStartPolling = React.useMemo(
    () => pluginInstances.length === totalCount,
    [pluginInstances.length, totalCount],
  );

  const incompletePlugins = React.useMemo(() => {
    return pluginInstances.filter((inst) => {
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
        enabled: shouldStartPolling && incompletePlugins.length > 0,
        refetchInterval: (result: { state?: { data?: string } }) => {
          const latestStatus = result?.state?.data;
          if (isTerminalStatus(latestStatus)) return false;
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
