import * as React from 'react'
import { SpinContainer } from '../../common/loading/LoadingContent'

const LoadingSpinner: React.FunctionComponent<any> = () => {
  return (
    <div
      style={{
        margin: '0, auto',
        textAlign: 'center',
      }}
    >
      <SpinContainer title="fetching" />
    </div>
  )
}

export default LoadingSpinner
