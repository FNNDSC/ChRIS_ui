import type {
  Feed,
  FileBrowserFolder,
  FileBrowserFolderFile,
  FileBrowserFolderLinkFile,
} from "@fnndsc/chrisapi";
import { Button, Tooltip } from "@patternfly/react-core";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import ChrisAPIClient from "../../../api/chrisapiclient";
import {
  clearAllPaths,
  clearSelectedPaths,
  setSelectedPaths,
  setToggleCart,
} from "../../../store/cart/cartSlice";
import type { PayloadTypes } from "../../../store/cart/types";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { FolderIcon } from "../../Icons";

export function elipses(str: string, len: number) {
  if (str.length <= len) return str;
  return `${str.slice(0, len - 3)}...`;
}

export default function useLongPress() {
  const dispatch = useAppDispatch();
  const [action, setAction] = useState<string>();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false); // Track menu state
  const state = useAppSelector((state) => state.cart);
  const timerRef = useRef<ReturnType<typeof window.setTimeout>>();
  const isLongPress = useRef<boolean>();
  const { selectedPaths } = state;

  function startPressTimer() {
    isLongPress.current = false;
    //@ts-ignore
    timerRef.current = window.setTimeout(() => {
      isLongPress.current = true;
      setAction("longpress");
    }, 600);
  }

  function clearPressTimer() {
    clearTimeout(timerRef.current);
  }

  function selectFolder(pathForCart: string, type: string, payload: any) {
    dispatch(setSelectedPaths({ path: pathForCart, type, payload }));
  }

  function deselectFolder(pathForCart: string) {
    dispatch(clearSelectedPaths(pathForCart));
  }

  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clickCount = useRef(0);

  function handleOnClick(
    e: React.MouseEvent | React.TouchEvent | React.KeyboardEvent,
    payload: PayloadTypes,
    pathForCart: string,
    type: string,
    optionalCallback?: () => void,
  ) {
    const isExist = selectedPaths.some((item) => item.path === pathForCart);

    clickCount.current += 1;
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
    }

    clickTimer.current = setTimeout(() => {
      if (clickCount.current === 1) {
        // Single click
        if (e.ctrlKey) {
          // Ctrl + Click: Toggle selection
          if (isExist) {
            deselectFolder(pathForCart);
          } else {
            selectFolder(pathForCart, type, payload);
          }
        } else if (e.type === "contextmenu") {
          e.preventDefault(); // Prevent the default context menu from appearing
          // First deselect all other items (unless holding Ctrl)
          if (!e.ctrlKey) {
            dispatch(clearAllPaths());
          }
          // Always select the item that was right-clicked
          selectFolder(pathForCart, type, payload);
          // No need to manage menu state here - the Dropdown component in ContextMenu.tsx handles it
        } else {
          if (isMenuOpen) {
            // The context menu is also closed by a right click
            // We don't want it to confuse it with select/deselect of a folder
            setIsMenuOpen(false);
          } else {
            // Normal click: Select/Deselect
            if (isExist) {
              deselectFolder(pathForCart);
            } else {
              selectFolder(pathForCart, type, payload);
            }
          }
        }
      } else if (clickCount.current === 2) {
        // Double click: Enter folder
        optionalCallback?.();
      }

      clickCount.current = 0;
    }, 300); // Adjust this delay as needed
    // Handle Ctrl + Click for selection
  }

  const handleCheckboxChange = (
    e: React.FormEvent<HTMLInputElement>,
    path: string,
    payload:
      | (FileBrowserFolder | FileBrowserFolderFile | FileBrowserFolderLinkFile)
      | null, // null is valid for deselection operations
    type: string,
  ) => {
    if (e.currentTarget.checked) {
      // For selection, we need a valid payload
      if (payload) {
        selectFolder(path, type, payload);
      }
    } else {
      // For deselection, we only need the path
      // The payload can be null in this case
      deselectFolder(path);
    }
  };

  function handleOnMouseDown() {
    startPressTimer();
  }

  function handleOnMouseUp() {
    clearPressTimer();
  }

  function handleOnTouchStart() {
    startPressTimer();
  }

  function handleOnTouchEnd() {
    if (action === "longpress") return;
    clearPressTimer();
  }

  return {
    action,
    handlers: {
      handleOnClick,
      handleOnMouseDown,
      handleOnMouseUp,
      handleOnTouchStart,
      handleOnTouchEnd,
      handleCheckboxChange,
      isMenuOpen,
    },
  };
}

export function getBackgroundRowColor(
  isSelected: boolean,
  isDarkTheme: boolean,
) {
  const backgroundColor = isDarkTheme ? "#002952" : "#E7F1FA";

  const backgroundRow = "inherit";
  const selectedBgRow = isSelected ? backgroundColor : backgroundRow;

  return selectedBgRow;
}

export function TitleNameClipped({
  name,
  value,
}: {
  name: string;
  value: number;
}) {
  const clippedName = elipses(name, value);

  return (
    <Tooltip content={name}>
      <span>{clippedName}</span>
    </Tooltip>
  );
}

export function ShowInFolder({
  path,
  isError,
}: {
  path: string;
  isError: boolean;
}) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  return (
    <Tooltip content={"Show in Folder"}>
      <Button
        isDisabled={isError}
        onClick={() => {
          navigate(`/library/${path}`);
          // Close the cart once the user wants to navigate away
          dispatch(setToggleCart());
        }}
        variant="link"
        icon={<FolderIcon />}
      />
    </Tooltip>
  );
}

export const fetchFeedForPath = async (path: string): Promise<Feed | null> => {
  const feedMatches = path.match(/feed_(\d+)/);
  const id = feedMatches ? feedMatches[1] : null;

  if (id) {
    const client = ChrisAPIClient.getClient();
    const feed: Feed = (await client.getFeed(Number(id))) as Feed;
    if (!feed) throw new Error("Failed to fetch the feed");
    return feed;
  }
  return null;
};

export const useAssociatedFeed = (folderPath: string) => {
  const feedMatches = folderPath.match(/feed_(\d+)/);

  return useQuery({
    queryKey: ["associatedFeed", folderPath],
    queryFn: async () => {
      const id = feedMatches ? feedMatches[1] : null;
      if (id) {
        const client = ChrisAPIClient.getClient();
        const feed = await client.getFeed(Number(id));
        if (!feed) throw new Error("Failed to fetch the feed");
        return feed.data.name;
      }
      return null;
    },
    enabled: Boolean(feedMatches?.length),
  });
};

export function formatBytesWithPadding(bytes: number): string {
  if (bytes === 0) return "  0.00 B ";
  const k = 1024;
  const dm = 2; // Decimal places
  const sizes = [" B ", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const formattedNumber = (bytes / k ** i).toFixed(dm).padStart(6, " ");
  return `${formattedNumber} ${sizes[i]}`;
}
