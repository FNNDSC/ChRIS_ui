import React, { useEffect } from 'react'
import { Typography } from 'antd'
import { PageSection, PageSectionVariants } from '@patternfly/react-core'
import { useDispatch } from 'react-redux'
import { setSidebarActive } from '../../store/ui/actions'
import Wrapper from '../Layout/PageWrapper'
import DataLibrary from './components/UserLibrary/'
import InfoIcon from '../../components/common/info/InfoIcon'
import { LibraryProvider } from './components/UserLibrary/context'

export type File = string
export type Series = File[]
const { Paragraph, Text } = Typography

export const Library: React.FC = () => {
  const dispatch = useDispatch()
  document.title = 'Data Library'
  const pStyle = {
    fontSize: '1.15em',
  }

  useEffect(() => {
    document.title = 'My Library'
    dispatch(
      setSidebarActive({
        activeItem: 'lib',
      }),
    )
  }, [dispatch])

  return (
    <Wrapper>
      <PageSection isFilled={false} variant={PageSectionVariants.light}>
        <div>
          <InfoIcon
            title="Library"
            p1={
              <Paragraph style={pStyle}>
                The Library provides a card-focused mechanism for browsing,
                viewing, and interacting with data in the ChRIS system. In
                addition to browsing over the entire file space, the Library
                also allows for powerful searching and group selection. By
                selecting a group of cards in the Library, you can easily apply
                a single analysis to all the elements of that selection.
              </Paragraph>
            }
            p2={
              <Paragraph style={pStyle}>
                Data is organized broadly in three areas. The{' '}
                <Text strong>Uploads </Text>
                shows all the data (organized by folder) that you might have
                uploaded. The <Text strong>Completed Analyses</Text> allows easy
                navigation down all the Analyses you have run. The{' '}
                <Text strong>External Services</Text> allows you to browse data
                associated with some external service, such as a PACS database.
                You can select multiple or single cards from any place in this
                Library and start new Analyses on that selection. The resultant
                Analysis will start in its root node with a folder for each card
                you have selected.
              </Paragraph>
            }
          />
        </div>
      </PageSection>

      <LibraryProvider>
        <PageSection isFilled>
          <DataLibrary />
        </PageSection>
      </LibraryProvider>
    </Wrapper>
  )
}

export default Library
