import { useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useRef } from "react";
import { useDispatch } from "react-redux";
import { clearAllPaths } from "../../../store/cart/cartSlice";

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
  handleOrigin: (origin: OriginState) => void;
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
  const originRef = useRef<OriginState>();
  const dispatch = useDispatch();

  const handleOrigin = (newOrigin: OriginState) => {
    originRef.current = newOrigin;
  };

  const invalidateQueries = () => {
    // Helps to reset the page when operations are performed
    const additionalKeys = originRef.current?.additionalKeys || [];
    const type = originRef.current?.type;

    if (!type) return;

    dispatch(clearAllPaths());

    switch (type) {
      case OperationContext.LIBRARY:
        queryClient.refetchQueries({
          queryKey: ["library_folders", ...additionalKeys],
        });
        break;

      case OperationContext.FEEDS:
        queryClient.refetchQueries({
          queryKey: ["feeds", ...additionalKeys],
        });
        break;
      case OperationContext.FILEBROWSER:
        queryClient.refetchQueries({
          queryKey: ["pluginFiles", ...additionalKeys],
        });
    }
  };

  return (
    <OperationsContext.Provider value={{ invalidateQueries, handleOrigin }}>
      {children}
    </OperationsContext.Provider>
  );
};
