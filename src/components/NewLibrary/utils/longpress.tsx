import type {
  FileBrowserFolder,
  FileBrowserFolderFile,
  FileBrowserFolderLinkFile,
} from "@fnndsc/chrisapi";
import { Button, Tooltip } from "@patternfly/react-core";
import { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
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

  function handleOnClick(
    e: React.MouseEvent | React.TouchEvent,
    payload: PayloadTypes,
    pathForCart: string,
    type: string,
  ) {
    const isExist = selectedPaths.some((item) => item.path === pathForCart);
    if (e.type === "contextmenu") {
      // Handle right-click (context menu)
      e.preventDefault(); // Prevent the default context menu from appearing
      if (!isExist) {
        selectFolder(pathForCart, type, payload);
      }
    } else {
      // Handle every click on the card
      if (!isExist) {
        selectFolder(pathForCart, type, payload);
      } else {
        deselectFolder(pathForCart);
      }
    }
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
      dispatch(
        setSelectedPaths({
          path,
          type,
          payload,
        }),
      );
    } else {
      dispatch(clearSelectedPaths(path));
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
