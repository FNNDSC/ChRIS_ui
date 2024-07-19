import type {
  FileBrowserFolder,
  FileBrowserFolderFile,
} from "@fnndsc/chrisapi";
import { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import {
  clearSelectFolder,
  setSelectFolder,
} from "../../../store/cart/actions"; // Make sure the path is correct
import { useTypedSelector } from "../../../store/hooks";

export function elipses(str: string, len: number) {
  if (str.length <= len) return str;
  return `${str.slice(0, len - 3)}...`;
}

export default function useLongPress() {
  const dispatch = useDispatch();
  const [action, setAction] = useState<string>();
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
    dispatch(setSelectFolder({ path: pathForCart, type, payload }));
  }

  function deselectFolder(pathForCart: string) {
    dispatch(clearSelectFolder(pathForCart));
  }

  function handleOnClick(
    e: any,
    payload: FileBrowserFolder | FileBrowserFolderFile,
    path: string,
    pathForCart: string,
    type: string,
    cbFolder?: (path: string) => void,
  ) {
    const isExist = selectedPaths.some(
      (item: any) => item.path === pathForCart,
    );

    if (isLongPress.current || e.ctrlKey || e.shiftKey || e.metaKey) {
      if (!isExist) {
        selectFolder(pathForCart, type, payload);
      } else {
        deselectFolder(pathForCart);
      }
    } else if (e.detail === 1) {
      cbFolder?.(path);
    }
  }

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
    },
  };
}
