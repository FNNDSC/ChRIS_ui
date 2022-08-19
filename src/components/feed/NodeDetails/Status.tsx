import React from 'react'

import { Steps, Spin } from 'antd'

import usePluginInstanceResource from './usePluginInstanceResource'

const { Step } = Steps

const Status = () => {
  const pluginInstanceResource = usePluginInstanceResource()
  const pluginStatus =
    pluginInstanceResource && pluginInstanceResource.pluginStatus

  if (pluginStatus && pluginStatus.length > 0) {
    return (
      <>
        <Steps
          className="node-details__status"
          direction="horizontal"
          size="small"
        >
          {pluginStatus.map((label: any, index: number) => {
            return (
              <Step
                key={index}
                icon={label.process && <Spin />}
                status={
                  label.wait === true
                    ? 'wait'
                    : label.error === true
                    ? 'error'
                    : label.finish === true
                    ? 'finish'
                    : 'process'
                }
              />
            )
          })}
        </Steps>
        <Steps
          direction="horizontal"
          size="small"
          className="node-details__status-descriptions"
        >
          {pluginStatus.map((label: any, index: number) => {
            return (
              <Step
                key={index}
                description={label.description}
                status={
                  label.status === true
                    ? 'finish'
                    : label.error === true
                    ? 'error'
                    : undefined
                }
              />
            )
          })}
        </Steps>
      </>
    )
  } else return null
}

export default React.memo(Status)
