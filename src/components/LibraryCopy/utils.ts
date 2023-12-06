import { useState, useRef, useContext } from "react";
import { LibraryContext } from "./context";
import { setSelectFolder, clearSelectFolder } from "./context/actions";

export function elipses(str: string, len: number) {
  if (str.length <= len) return str;
  return str.slice(0, len - 3) + "...";
}

export default function useLongPress() {
  const [action, setAction] = useState<string>();
  const { state, dispatch } = useContext(LibraryContext);
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

  function handleOnClick(
    e: any,
    path: string,
    pathForCart: string,
    cbFolder?: (path: string) => void,
  ) {
    const isExist = selectedPaths.findIndex((item) => item === path);

    if (isLongPress.current) {
      if (isExist === -1) {
        dispatch(setSelectFolder(pathForCart));
      } else {
        dispatch(clearSelectFolder(pathForCart));
      }
      return;
    }

    if (e.ctrlKey || e.shiftKey || e.metaKey) {
      if (isExist === -1) {
        dispatch(setSelectFolder(pathForCart));
      } else {
        dispatch(clearSelectFolder(pathForCart));
      }
      return;
    }

    if (!(e.ctrlKey || e.shiftKey || e.detail === 2) && e.detail === 1) {
      cbFolder && cbFolder(path);
    }
  }

  function handleOnMouseDown() {
    startPressTimer();
  }

  function handleOnMouseUp() {
    //@ts-ignore
    clearTimeout(timerRef.current);
  }

  function handleOnTouchStart() {
    startPressTimer();
  }

  function handleOnTouchEnd() {
    if (action === "longpress") return;

    //@ts-ignore
    clearTimeout(timerRef.current);
  }

  return {
    action,
    handlers: {
      handleOnClick,
      handleOnMouseDown,
      onMouseUp: handleOnMouseUp,
      onTouchStart: handleOnTouchStart,
      onTouchEnd: handleOnTouchEnd,
    },
  };
}
