// DicomCacheContext.tsx

import type React from "react";
import { createContext, useContext, useState } from "react";

type ImageStackType = {
  [key: string]: string | string[];
};

type DicomCacheContextType = {
  cache: { [key: string]: ImageStackType };
  setCache: React.Dispatch<
    React.SetStateAction<{ [key: string]: ImageStackType }>
  >;
};

const DicomCacheContext = createContext<DicomCacheContextType | undefined>(
  undefined,
);

export const useDicomCache = () => {
  const context = useContext(DicomCacheContext);
  if (!context) {
    throw new Error("useDicomCache must be used within a DicomCacheProvider");
  }
  return context;
};

export const DicomCacheProvider = ({
  children,
}: { children: React.ReactNode }) => {
  const [cache, setCache] = useState<{ [key: string]: ImageStackType }>({});
  return (
    <DicomCacheContext.Provider value={{ cache, setCache }}>
      {children}
    </DicomCacheContext.Provider>
  );
};
