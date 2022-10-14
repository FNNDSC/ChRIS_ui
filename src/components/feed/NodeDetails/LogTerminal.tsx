import React from 'react'
import { LazyLog } from 'react-lazylog'

type LogTerminalProps = {
  text: string
}

const LogTerminal = ({ text }: LogTerminalProps) => (
  <div
    style={{
      height: '40vh',
    }}
  >
    <LazyLog selectableLines extraLines={1} enableSearch text={text} caseInsensitive />;
  </div>
)

export default LogTerminal
