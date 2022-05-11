import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import Wrapper from '../../../Layout/PageWrapper'
import { Typography } from 'antd'
import {
  Grid,
  GridItem,
  EmptyState,
  EmptyStateIcon,
  Spinner,
  Title,
  Button,
  EmptyStateBody,
  EmptyStatePrimary,
} from '@patternfly/react-core'
import { FaCubes } from 'react-icons/fa'
import pluralize from 'pluralize'
import PFDCMClient, {
  PACSPatient,
  PACSPullStages,
  PFDCMFilters,
  PFDCMPull,
} from '../../../../api/pfdcm'
import { setSidebarActive } from '../../../../store/ui/actions'

const { Title: AntTitle, Paragraph } = Typography

import QueryBuilder from './QueryBuilder'
import QueryResults from './QueryResults'

export enum PFDCMQueryTypes {
  PMRN,
  NAME,
  ACCN,
}

export interface PFDCMQuery {
  value: string
  type: PFDCMQueryTypes
  filters: PFDCMFilters
}

/**
 * @note This type had to be made `Map<string, PACSPull>`
 * instead of the preferrable `Map<PFDCMFilters, PACSPull>`
 * because Map.has() works with object references and
 * not values so it always returned `false`.
 */
export class PACSPulls extends Map<string, PFDCMPull> {
  hasPull(key: PFDCMFilters): boolean {
    let _has = false
    this.forEach((_, _key) => {
      if (_key === JSON.stringify(key)) _has = true
    })

    return _has
  }

  getPull(key: PFDCMFilters): PFDCMPull | undefined {
    return this.get(JSON.stringify(key))
  }

  setPull(key: PFDCMFilters, value: PFDCMPull) {
    this.set(JSON.stringify(key), value)
  }
}

const pStyle = {
  fontSize: '1.15em',
}

const client = new PFDCMClient()

export const PACSLookup = () => {
  document.title = 'PACS Lookup'
  const dispatch = useDispatch()
  const [loading, setLoading] = useState<boolean>()
  const [progress, setProgress] = useState<[number, number]>([0, 0])

  const [results, setResults] = useState<PACSPatient[]>()
  const [selectedPACS, setSelectedPACS] = useState<string>()
  const [PACSservices, setPACSservices] = useState<string[]>()

  useEffect(() => {
    client.getPACSservices().then((list) => {
      setPACSservices(list)
      if (!client.service)
        client.service =
          list.length > 1
            ? list[1]
            : (list.slice(list.length - 1).shift() as string)

      setSelectedPACS(client.service)
    })
  }, [])

  useEffect(() => {
    dispatch(
      setSidebarActive({
        activeItem: 'pacs',
      }),
    )
  }, [dispatch])

  const StartPACSQuery = useCallback(async (queries: PFDCMQuery[]) => {
    setLoading(true)
    const response: PACSPatient[] = []
    setProgress([0, queries.length])

    for (let q = 0; q < queries.length; q++) {
      const { type, value, filters } = queries[q]

      switch (type) {
        case PFDCMQueryTypes.PMRN:
          response.push(
            ...(await client.find({ PatientID: value, ...filters })),
          )
          break

        case PFDCMQueryTypes.NAME:
          response.push(
            ...(await client.find({ PatientName: value, ...filters })),
          )
          break

        case PFDCMQueryTypes.ACCN:
          response.push(
            ...(await client.find({ AccessionNumber: value, ...filters })),
          )
          break

        default:
          throw TypeError('Unsupported PFDCM Query Type')
      }

      setProgress([q + 1, queries.length])
    }

    setResults(response)
    setLoading(false)
  }, [])

  const handlePACSSelect = (key: string) => {
    /**
     * Client handles validation of PACS
     * service key internally.
     */
    client.service = key
    setSelectedPACS(client.service)
  }

  const executePACSStage = useCallback(
    (query: PFDCMFilters, stage: PACSPullStages) => {
      try {
        switch (stage) {
          case PACSPullStages.RETRIEVE:
            return client.findRetrieve(query)

          case PACSPullStages.PUSH:
            return client.findPush(query)

          case PACSPullStages.REGISTER:
            return client.findRegister(query)

          case PACSPullStages.COMPLETED:
            return
        }
      } catch (error) {
        console.error(error)
      }
    },
    [],
  )

  const handlePACSStatus = useCallback(async (query: PFDCMFilters) => {
    return client.status(query)
  }, [])

  const Results = () => {
    if (loading === undefined) return null

    if (loading)
      return (
        <EmptyState>
          <EmptyStateIcon variant="container" component={Spinner} />
          <Title size="lg" headingLevel="h4">
            Searching
          </Title>
          <EmptyStateBody>
            Completed {progress[0]} of {progress[1]} searches.
          </EmptyStateBody>
        </EmptyState>
      )

    if (results)
      return (
        <>
          <GridItem>
            <h2>
              <b>Results</b>
            </h2>
            <div>
              {results.length} {pluralize('patient', results.length)} matched
              your search.
            </div>
          </GridItem>

          <GridItem>
            <QueryResults
              results={results}
              onRequestStatus={handlePACSStatus}
              onExecutePACSStage={executePACSStage}
            />
          </GridItem>
        </>
      )
    else
      return (
        <EmptyState>
          <EmptyStateIcon variant="container" component={FaCubes} />
          <Title size="lg" headingLevel="h4">
            No results found
          </Title>
          <EmptyStateBody>
            No results match the filter criteria. Clear all filters to show
            results.
          </EmptyStateBody>
          <EmptyStatePrimary>
            <Button variant="link">Clear all filters</Button>
          </EmptyStatePrimary>
        </EmptyState>
      )
  }

  return (
    <Wrapper>
      <article>
        <Grid hasGutter>
          <GridItem>
            <AntTitle>PACS Query/Retrieve</AntTitle>
            <Paragraph style={pStyle}>
              Medical images are typically stored in a Picture Archive and
              Communications System (PACS) database. ChRIS can be optionally
              configured to communicate with such a PACS by an administrator.
              If this ChRIS has been configured in this manner, you should see
              something available in the <b>PACS Service</b> drop down. You can Query this
              {' '}<b>PACS Service</b> to find images of interest by searching on various Patient
              data fields (such as Patient Name, Medical Record Number, Study
              Date, etc).
            </Paragraph>
            <Paragraph style={pStyle}>
              {' '}
              After a Query, ChRIS will structure results by
              Patient/Study/Series - allowing for easy navigation. Images that
              have been retrieved previously will appear as thumbnails. Images
              that have not been retrieved will simply offer the option to{' '}
              <b>Pull Series</b>. Any Series that is known to ChRIS can be
              selected and an analysis started directly from this page.
            </Paragraph>
          </GridItem>

          <GridItem>
            <QueryBuilder
              PACS={selectedPACS}
              PACSservices={PACSservices}
              onSelectPACS={handlePACSSelect}
              onFinalize={StartPACSQuery}
            />
          </GridItem>

          <GridItem />
          <Results />
        </Grid>
      </article>
    </Wrapper>
  )
}

export default PACSLookup
