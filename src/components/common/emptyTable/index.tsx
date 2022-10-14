import React from 'react'
import { Table, TableHeader, TableBody } from '@patternfly/react-table'
import {
  Title,
  EmptyState,
  EmptyStateVariant,
  EmptyStateBody,
  EmptyStateIcon,
} from '@patternfly/react-core'
import { FaSearch } from 'react-icons/fa'
import {LoadingContent} from '../loading/LoadingContent'

interface ITableProps {
  cells: string[]
  rows: { cells: { title: JSX.Element }[] }[]
  title: string
  description: string
  caption: string
}

export const EmptyStateTable = ({
  cells,
  rows,
  title,
  description,
  caption,
}: ITableProps) => (
    <>
      <Table caption={caption} cells={cells} rows={rows}>
        <TableHeader />
        <TableBody />
      </Table>
      <EmptyState variant={EmptyStateVariant.small}>
        <EmptyStateIcon icon={FaSearch} />
        <Title headingLevel="h2" size="lg">
          {title}
        </Title>
        <EmptyStateBody>{description}</EmptyStateBody>
      </EmptyState>
    </>
  )

export const generateTableLoading = ( type: string ) => (
    <tbody className="feed-list__loading">
      <tr>
        <td colSpan={6}>
          {new Array(20).fill(null).map((_, i) => (
            <LoadingContent type={type} height="45px" width="100%" key={i} />
          ))}
        </td>
      </tr>
    </tbody>
  )
