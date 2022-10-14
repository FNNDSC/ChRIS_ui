import React, { useContext } from 'react'
import { List, Checkbox, Avatar } from 'antd'
import ChrisAPIClient from '../../../api/chrisapiclient'
import { CreateFeedContext } from '../CreateFeed/context'
import { Types, colorPalette } from '../CreateFeed/types'

const GeneralCompute = ({ currentPipelineId }: { currentPipelineId: number }) => {
  const { state, dispatch } = useContext(CreateFeedContext)
  const [computes, setComputes] = React.useState<any[]>([])

  const { generalCompute } = state.pipelineData[currentPipelineId]

  React.useEffect(() => {
    async function fetchCompute() {
      const client = ChrisAPIClient.getClient()
      const computeResourceList = await client.getComputeResources({
        limit: 100,
        offset: 0,
      })
      const computes = computeResourceList.getItems()
      computes && setComputes(computes)
    }

    fetchCompute()
  }, [])

  return (
    <div
      style={{
        width: '25%',
        background: 'black',
      }}
      className="general-compute"
    >
      <List
        itemLayout="horizontal"
        dataSource={computes || []}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              avatar={
                <>
                  <Checkbox
                    style={{
                      marginRight: '0.5em',
                    }}
                    checked={!!(generalCompute && generalCompute === item.data.name)}
                    onClick={() => {
                      dispatch({
                        type: Types.SetGeneralCompute,
                        payload: {
                          currentPipelineId,
                          computeEnv: item.data.name,
                        },
                      })
                    }}
                  />

                  <Avatar
                    style={{
                      background: `${
                        colorPalette[item.data.name]
                          ? colorPalette[item.data.name]
                          : colorPalette.default
                      }`,
                    }}
                  />
                </>
              }
              title={item.data.name}
              description={item.data.description}
            />
          </List.Item>
        )}
      />
    </div>
  )
}

export default GeneralCompute
