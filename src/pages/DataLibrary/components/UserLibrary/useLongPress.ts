import { useState, useRef, useContext } from 'react'

import { LibraryContext } from './context'
import { clearSelectFolder, setSelectFolder } from './context/actions'

//@ts-ignore
let timer: NodeJS.Timeout = 0
const delay = 400
let prevent = false

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
    }, 500)
  }

  function handleOnClick(
    e: any,
    path: string,
    folder: string,
    initialPath: string,
    browserType: string,
    cb?: (path: string, prevPath: string) => void,
  ) {
    setAction('click')
    const payload = {
      exactPath: path,
      path: initialPath,
      folder,
      type: browserType,
      event: '',
    }

    const isExist = selectedFolder.findIndex(
      (folder) => folder.exactPath === path,
    )

    if (e.ctrlKey || e.shiftKey) {
      payload['event'] = 'ctrl/shift'
      if (isExist === -1) {
        dispatch(setSelectFolder(payload))
      } else {
        dispatch(clearSelectFolder(payload))
      }
      return
    }

    if (!(e.ctrlKey || e.shiftKey) || e.detail === 1) {
      timer = setTimeout(function () {
        if (!prevent) {
          if (isExist === -1) {
            dispatch(setSelectFolder(payload))
          } else {
            dispatch(clearSelectFolder(payload))
          }
        }
        prevent = false
      }, delay)
    }

    if (e.detail === 2) {
      clearTimeout(timer)
      prevent = true
      cb && cb(`${initialPath}/${folder}`, initialPath)
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
