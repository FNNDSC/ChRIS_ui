import type { MenuProps } from "antd";
import type { useNavigate } from "react-router-dom";
import { FolderOutlined } from "@ant-design/icons";
import { AnalysisIcon } from "../../Icons";
import type { PacsSeriesState } from "../types";
import { fetchSeriesPath } from "./pacsUtils";
import { createFeed } from "../../../store/cart/downloadSaga";

// Types for context menu handlers
export interface ContextMenuHandlers {
  showFeedCreationModal: () => void;
  displayMessage: (type: "success" | "error", content: string) => void;
}

// Generate context menu items
export const getSeriesContextMenuItems = (
  series: PacsSeriesState,
  isSelected: boolean,
  selectedCount: number,
  handlers: ContextMenuHandlers,
  navigate: ReturnType<typeof useNavigate>,
): MenuProps["items"] => {
  const hasMultipleSelected = selectedCount > 1;
  const { inCube } = series;

  return [
    {
      key: "library",
      label: "Go to Library",
      icon: <FolderOutlined />,
      disabled: !inCube,
      onClick: async () => {
        try {
          const path = await fetchSeriesPath(series);
          if (path) {
            navigate(`/library/${path}`);
          } else {
            handlers.displayMessage(
              "error",
              "Could not find series path in ChRIS",
            );
          }
        } catch (error) {
          handlers.displayMessage("error", "Error navigating to library");
          console.error("Library navigation error:", error);
        }
      },
    },
    {
      key: "feed",
      label:
        isSelected && hasMultipleSelected
          ? `Create Feed (${selectedCount} series)`
          : "Create Feed",
      icon: <AnalysisIcon />,
      disabled: !inCube,
      onClick: handlers.showFeedCreationModal,
    },
  ];
};

// Function to create a feed from series
export const createSeriesFeed = async (
  seriesData: PacsSeriesState[],
  feedName: string,
  handlers: ContextMenuHandlers,
): Promise<boolean> => {
  try {
    // Fetch all paths in parallel
    const pathPromises = seriesData.map((series) => fetchSeriesPath(series));
    const paths = (await Promise.all(pathPromises)).filter(Boolean);

    if (paths.length === 0) {
      handlers.displayMessage("error", "Could not find series paths in ChRIS");
      return false;
    }

    // Create the feed
    await createFeed(paths, feedName);

    // Show appropriate success message
    const isMultipleSeries = paths.length > 1;
    handlers.displayMessage(
      "success",
      isMultipleSeries
        ? `Feed "${feedName}" created successfully with ${paths.length} series!`
        : `Feed "${feedName}" created successfully!`,
    );

    return true;
  } catch (error) {
    handlers.displayMessage("error", "Failed to create feed");
    console.error("Feed creation error:", error);
    return false;
  }
};
