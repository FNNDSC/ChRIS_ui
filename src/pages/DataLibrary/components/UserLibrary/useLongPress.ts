import { useState, useRef, useContext } from 'react'
import { LibraryContext, Types } from './context'

export default function useLongPress() {
  const [action, setAction] = useState<string>()
  const { dispatch, state } = useContext(LibraryContext)
  const timerRef = useRef<ReturnType<typeof window.setTimeout>>()
  const isLongPress = useRef<boolean>()

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
    cb?: (path: string, prevPath: string) => void,
  ) {
    if (isLongPress.current) {
      console.log('Is long press - not continuing.')
      dispatch({
        type: Types.SET_ADD_FILE_SELECT,
        payload: {
          path,
        },
      })
    }

    if (e.detail === 1) {
      dispatch({
        type: Types.SET_SELECTED_FOLDER,
        payload: {
          folder,
        },
      })
    }

    if (e.detail === 2) {
      cb && cb(`${initialPath}/${folder}`, initialPath)
    }
    setAction('click')
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
