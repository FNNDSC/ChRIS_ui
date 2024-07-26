import type {
  FileBrowserFolder,
  FileBrowserFolderFile,
} from "@fnndsc/chrisapi";
import { Button, Tooltip } from "@patternfly/react-core";
import { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import {
  clearSelectFolder,
  setSelectFolder,
  setToggleCart,
} from "../../../store/cart/actions";
import { useTypedSelector } from "../../../store/hooks";
import { FolderIcon } from "../../Icons";

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

export function getBackgroundRowColor(
  isSelected: boolean,
  isDarkTheme: boolean,
) {
  const backgroundColor = isDarkTheme ? "#002952" : "#E7F1FA";

  const backgroundRow = "inherit";
  const selectedBgRow = isSelected ? backgroundColor : backgroundRow;

  return selectedBgRow;
}

export function TitleNameClipped({ name }: { name: string }) {
  const clippedName = elipses(name, 40);

  return (
    <Tooltip content={name}>
      <span>{clippedName}</span>
    </Tooltip>
  );
}

export function ShowInFolder({ path }: { path: string }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  return (
    <Tooltip content={"Show in Folder"}>
      <Button
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
