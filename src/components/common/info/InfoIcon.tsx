import React from 'react'
import { FcInfo } from 'react-icons/fc'
import { Hint } from '@patternfly/react-core'
import { Popover, Typography } from 'antd'

const { Title } = Typography

const InfoIcon = ({
  title,
  p1,
  p2,
  p3,
  p4,
}: {
  title: string
  p1?: any
  p2?: any
  p3?: any
  p4?: any
}) => {
  const content = (
    <Hint>
      {p1}
      {p2}
      {p3}
      {p4}
    </Hint>
  )

  return (
    <Title>
      {title}
      <Popover placement='ottom'trigger='over'content={content}>
        <FcInfo
          style={{
            height: 'em'
            width: '.75em'
            marginLeft: '.25em'
          }}
        />
      </Popover>
    </Title>
  )
}

export default InfoIcon
