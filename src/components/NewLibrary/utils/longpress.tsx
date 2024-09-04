import type {
  Feed,
  FileBrowserFolder,
  FileBrowserFolderFile,
  FileBrowserFolderLinkFile,
} from "@fnndsc/chrisapi";
import { Button, Tooltip } from "@patternfly/react-core";
import { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import ChrisAPIClient from "../../../api/chrisapiclient";
import {
  clearSelectedPaths,
  setSelectedPaths,
  setToggleCart,
} from "../../../store/cart/cartSlice";
import type { PayloadTypes } from "../../../store/cart/types";
import { useTypedSelector } from "../../../store/hooks";
import { FolderIcon } from "../../Icons";

export function elipses(str: string, len: number) {
  if (str.length <= len) return str;
  return `${str.slice(0, len - 3)}...`;
}

export default function useLongPress() {
  const dispatch = useDispatch();
  const [action, setAction] = useState<string>();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false); // Track menu state
  const state = useTypedSelector((state) => state.cart);
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
          if (!isExist) {
            selectFolder(pathForCart, type, payload);
          }
          // Toggle the menu state
          setIsMenuOpen((prev) => {
            if (prev) {
              deselectFolder(pathForCart);
            }
            return !prev;
          });
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
      | FileBrowserFolder
      | FileBrowserFolderFile
      | FileBrowserFolderLinkFile,
    type: string,
  ) => {
    e.stopPropagation();
    if (e.currentTarget.checked) {
      selectFolder(path, type, payload);
    } else {
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
}: { name: string; value: number }) {
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
}: { path: string; isError: boolean }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
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
