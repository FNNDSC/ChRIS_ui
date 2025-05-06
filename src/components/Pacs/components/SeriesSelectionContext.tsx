import React from "react";
import type { PacsSeriesState } from "../types.ts";

interface SeriesSelectionContextType {
  selectedSeries: string[];
  toggleSelection: (seriesId: string, series: PacsSeriesState) => void;
  isSelected: (seriesId: string) => boolean;
  clearSelection: () => void;
  getSelectedSeriesData: () => PacsSeriesState[];
  hasSelection: boolean;
}

const SeriesSelectionContext = React.createContext<SeriesSelectionContextType>({
  selectedSeries: [],
  toggleSelection: () => {},
  isSelected: () => false,
  clearSelection: () => {},
  getSelectedSeriesData: () => [],
  hasSelection: false,
});

export const SeriesSelectionProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [selectedSeries, setSelectedSeries] = React.useState<string[]>([]);
  const [seriesData, setSeriesData] = React.useState<
    Record<string, PacsSeriesState>
  >({});

  const toggleSelection = (seriesId: string, series: PacsSeriesState) => {
    setSeriesData((prev) => ({
      ...prev,
      [seriesId]: series,
    }));

    setSelectedSeries((prev) => {
      if (prev.includes(seriesId)) {
        return prev.filter((id) => id !== seriesId);
      }
      return [...prev, seriesId];
    });
  };

  const isSelected = (seriesId: string) => selectedSeries.includes(seriesId);

  const clearSelection = () => {
    setSelectedSeries([]);
  };

  const getSelectedSeriesData = () => {
    return selectedSeries.map((id) => seriesData[id]);
  };

  return (
    <SeriesSelectionContext.Provider
      value={{
        selectedSeries,
        toggleSelection,
        isSelected,
        clearSelection,
        getSelectedSeriesData,
        hasSelection: selectedSeries.length > 0,
      }}
    >
      {children}
    </SeriesSelectionContext.Provider>
  );
};

export const useSeriesSelection = () =>
  React.useContext(SeriesSelectionContext);

export default SeriesSelectionContext;
