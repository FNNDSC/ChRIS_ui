import React from 'react'
import { Spin } from 'antd'
import './loadingcontent.scss'

interface LoadingContentProps {
  width?: string
  height?: string
  top?: string
  left?: string
  bottom?: string
  right?: string
  className?: string
  type?: string
}

export const LoadingContent = ({
  width,
  height,
  top,
  left,
  bottom,
  right,
}: LoadingContentProps): React.ReactElement => {
  const computedStyle = {
    width,
    height,
    marginTop: top,
    marginLeft: left,
    marginBottom: bottom,
    marginRight: right,
  }

  return <div className={`loading-content `} style={computedStyle} />
}

LoadingContent.defaultProps = {
  top: '0',
  left: '0',
  bottom: '0',
  right: '0',
  className: '',
  type: '',
}

export const SpinContainer = ({
  title,
  background = 'rgba(0, 0, 0, 0.05)',
}: {
  title: string
  background?: string
}) => (
  <div
    style={{
      background,
    }}
    className="example"
  >
    <Spin tip={title} />
  </div>
)
