import type {
  FileBrowserFolder,
  FileBrowserFolderFile,
  FileBrowserFolderLinkFile,
} from "@fnndsc/chrisapi";
import { Tooltip } from "@patternfly/react-core";
import { useRef, useState } from "react";
import {
  clearAllPaths,
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

      // Clear existing selections unless Ctrl is pressed (for multi-select)
      if (!e.ctrlKey) {
        dispatch(clearAllPaths());
      }

      // Always select the item that was right-clicked
      selectFolder(pathForCart, type, payload);
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
        if (isExist) {
          deselectFolder(pathForCart);
        } else {
          selectFolder(pathForCart, type, payload);
        }
      } else if (clickCount.current === 2) {
        // Double click - execute callback (navigate or show detail view)
        if (optionalCallback) {
          optionalCallback();
        }
      }
      clickCount.current = 0;
    }, 200);
  }

  function handleOnMouseDown() {
    startPressTimer();
  }

  function handleOnTouchStart() {
    startPressTimer();
  }

  function handleOnTouchEnd() {
    clearPressTimer();
  }

  function handleCheckboxChange(
    pathForCart: string,
    type: string,
    payload: any,
  ) {
    const isExist = selectedPaths.some((item) => item.path === pathForCart);
    if (isExist) {
      deselectFolder(pathForCart);
    } else {
      selectFolder(pathForCart, type, payload);
    }
  }

  return {
    action,
    handlers: {
      handleOnClick,
      handleOnMouseDown,
      handleOnTouchStart,
      handleOnTouchEnd,
      handleCheckboxChange,
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
