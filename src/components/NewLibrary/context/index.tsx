import { useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useState } from "react";

export enum OperationContext {
  LIBRARY = "library",
  FEEDS = "feeds",
  FILEBROWSER = "fileBrowser",
}

export interface OriginState {
  type: OperationContext;
  additionalKeys: string[];
}

interface OperationsContextType {
  invalidateQueries: () => void;
  setOrigin: React.Dispatch<React.SetStateAction<OriginState | undefined>>;
}

const OperationsContext = createContext<OperationsContextType | undefined>(
  undefined,
);

export const useOperationsContext = () => {
  const context = useContext(OperationsContext);
  if (!context) {
    throw new Error(
      "useOperationsContext must be used within an OperationsProvider",
    );
  }
  return context;
};

export const OperationsProvider: React.FC<
  React.PropsWithChildren<{
    children: React.ReactElement;
  }>
> = ({ children }) => {
  const queryClient = useQueryClient();
  const [origin, setOrigin] = useState<OriginState>();

  const invalidateQueries = () => {
    switch (origin?.type) {
      case OperationContext.LIBRARY:
        queryClient.refetchQueries({
          queryKey: ["library_folders", ...origin.additionalKeys],
        });
        break;
      case OperationContext.FEEDS:
        console.log("additionalKeys", origin.additionalKeys);
        queryClient.refetchQueries({
          queryKey: ["feeds", ...origin.additionalKeys],
        });
        break;
      case OperationContext.FILEBROWSER:
        queryClient.refetchQueries({
          queryKey: ["pluginFiles", ...origin.additionalKeys],
        });
    }
  };

  return (
    <OperationsContext.Provider value={{ invalidateQueries, setOrigin }}>
      {children}
    </OperationsContext.Provider>
  );
};
