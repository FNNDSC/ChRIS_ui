import { useState, useRef, useContext } from 'react'

import { LibraryContext } from './context'
import { clearSelectFolder, setSelectFolder } from './context/actions'

export default function useLongPress() {
  const [action, setAction] = useState<string>()
  const { dispatch, state } = useContext(LibraryContext)
  const timerRef = useRef<ReturnType<typeof window.setTimeout>>()
  const isLongPress = useRef<boolean>()
  const { selectedFolder } = state

  function startPressTimer() {
    isLongPress.current = false
    //@ts-ignore
    timerRef.current = window.setTimeout(() => {
      isLongPress.current = true
      setAction('longpress')
    }, 600)
  }

  function handleOnClick(
    e: any,
    previousPath: string,
    path: string,
    folder: { name: string; path: string },
    browserType: string,
    operation: string,
    cbFolder?: (path: string) => void,
  ) {
    setAction('click')
    const folderCopy = { ...folder }
    folderCopy['path'] = path
    const payload = {
      previousPath,
      folder: folderCopy,
      type: browserType,
      operation,
    }

    const isExist = selectedFolder.findIndex(
      (item) => item.folder.name === folder.name,
    )

    if (isLongPress.current) {
      if (isExist === -1) {
        dispatch(setSelectFolder(payload))
      } else {
        dispatch(clearSelectFolder(payload))
      }
      return
    }

    if (e.ctrlKey || e.shiftKey) {
      if (isExist === -1) {
        dispatch(setSelectFolder(payload))
      } else {
        dispatch(clearSelectFolder(payload))
      }
      return
    }

    if (!(e.ctrlKey || e.shiftKey || e.detail === 2) && e.detail === 1) {
      cbFolder && cbFolder(path)
    }
  }

  function handleOnMouseDown() {
    startPressTimer()
  }

  function handleOnMouseUp() {
    //@ts-ignore
    clearTimeout(timerRef.current)
  }

  function handleOnTouchStart() {
    startPressTimer()
  }

  function handleOnTouchEnd() {
    if (action === 'longpress') return

    //@ts-ignore
    clearTimeout(timerRef.current)
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
  }
}
