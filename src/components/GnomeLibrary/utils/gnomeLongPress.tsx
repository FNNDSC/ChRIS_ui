import type {
  FileBrowserFolder,
  FileBrowserFolderFile,
  FileBrowserFolderLinkFile,
} from "@fnndsc/chrisapi";
import { Tooltip } from "@patternfly/react-core";
import { useRef, useState } from "react";
import {
  clearSelectedPaths,
  setSelectedPaths,
} from "../../../store/cart/cartSlice";
import type { PayloadTypes } from "../../../store/cart/types";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";

export function elipses(str: string, len: number) {
  if (str.length <= len) return str;
  return `${str.slice(0, len - 3)}...`;
}

export default function useGnomeLongPress() {
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

    // Handle special clicks (Ctrl+Click or context menu) immediately
    if (e.ctrlKey) {
      // Ctrl + Click: Toggle selection
      if (isExist) {
        deselectFolder(pathForCart);
      } else {
        selectFolder(pathForCart, type, payload);
      }
      return;
    }

    if (e.type === "contextmenu") {
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
      return;
    }

    // For both folders and files, use the double-click detection
    clickCount.current += 1;
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
    }

    clickTimer.current = setTimeout(() => {
      if (clickCount.current === 1) {
        // Single click - just toggle selection
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
      } else if (clickCount.current === 2) {
        // Double click - execute callback (navigate or show detail view)
        if (type === "folder") {
          // Clear all selections before navigating to folder
          selectedPaths.forEach((item) => {
            dispatch(clearSelectedPaths(item.path));
          });
        }
        if (optionalCallback) {
          optionalCallback();
        }
      }

      clickCount.current = 0;
    }, 250); // Shorter timeout for better double-click detection
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
