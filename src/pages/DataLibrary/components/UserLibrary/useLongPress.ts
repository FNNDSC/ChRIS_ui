import { useState, useRef, useContext } from "react";

import { LibraryContext, Types } from "./context";
import { addFileSelect, setSelectFolder } from "./context/actions";

export default function useLongPress() {
  const [action, setAction] = useState<string>();
  const { dispatch, state } = useContext(LibraryContext);
  const timerRef = useRef<ReturnType<typeof window.setTimeout>>();
  const isLongPress = useRef<boolean>();

  function startPressTimer() {
    isLongPress.current = false;
    //@ts-ignore
    timerRef.current = window.setTimeout(() => {
      isLongPress.current = true;
      setAction("longpress");
    }, 500);
  }

  function handleOnClick(
    e: any,
    path: string,
    folder: string,
    initialPath: string,
    browserType: string,
    addFile: boolean,
    cb?: (path: string, prevPath: string) => void
  ) {
    setAction("click");
    const payload = {
      exactPath: path,
      path: initialPath,
      folder,
      type: browserType,
      event: "",
    };
    if (e.detail === 2) {
      console.log("CLICKED");
      cb && cb(`${initialPath}/${folder}`, initialPath);
    }
    if (!addFile) {
      if (isLongPress.current) {
        if (state.fileSelect.length === 0) {
          dispatch(addFileSelect(payload));
          return;
        } else dispatch(addFileSelect(payload));
      }

      if (e.ctrlKey || e.shiftKey) {
        payload["event"] = "ctrl/shift";
        dispatch(setSelectFolder(payload));
        return;
      }

      if (!(e.ctrlKey || e.shiftKey) || e.detail === 1) {
        payload["event"] = "click";
        dispatch(setSelectFolder(payload));
        return;
      }
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
