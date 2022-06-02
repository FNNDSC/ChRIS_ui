import { useState, useRef } from 'react'

export default function useLongPress() {
  const [action, setAction] = useState<string>()

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

  function handleOnClick(e: any) {
    console.log('handleOnClick')
    if (isLongPress.current) {
      console.log('Is long press - not continuing.')
      return
    }
    setAction('click')
  }

  function handleOnMouseDown() {
    console.log('handleOnMouseDown')
    startPressTimer()
  }

  function handleOnMouseUp() {
    console.log('handleOnMouseUp')
    //@ts-ignore
    clearTimeout(timerRef.current)
  }

  function handleOnTouchStart() {
    console.log('handleOnTouchStart')
    startPressTimer()
  }

  function handleOnTouchEnd() {
    if (action === 'longpress') return
    console.log('handleOnTouchEnd')
    //@ts-ignore
    clearTimeout(timerRef.current)
  }

  return {
    action,
    handlers: {
      onClick: handleOnClick,
      onMouseDown: handleOnMouseDown,
      onMouseUp: handleOnMouseUp,
      onTouchStart: handleOnTouchStart,
      onTouchEnd: handleOnTouchEnd,
    },
  }
}
