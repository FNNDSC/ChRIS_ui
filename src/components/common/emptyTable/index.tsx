import React from "react";
import { Table, TableHeader, TableBody } from "@patternfly/react-table";
import {
  Title,
  EmptyState,
  EmptyStateVariant,
  EmptyStateBody,
  EmptyStateIcon,
} from "@patternfly/react-core";
import { SearchIcon } from "@patternfly/react-icons";
import LoadingContent from "../loading/LoadingContent";

interface ITableProps {
  cells: string[];
  rows: { cells: { title: JSX.Element }[] }[];
  title:string,
  description:string
  caption:string
}

export const EmptyStateTable = ({ cells, rows, title, description, caption }: ITableProps) => {
 
  return (
    <React.Fragment>
      <Table caption={caption} cells={cells} rows={rows}>
        <TableHeader />
        <TableBody />
      </Table>
      <EmptyState variant={EmptyStateVariant.small}>
        <EmptyStateIcon icon={SearchIcon} />
        <Title headingLevel="h2" size="lg">
         {title}
        </Title>
        <EmptyStateBody>
        {description}
        </EmptyStateBody>
      </EmptyState>
    </React.Fragment>
  );
};

export const generateTableLoading = () => {
  return (
    <tbody className="feed-list__loading">
      <tr>
        <td colSpan={6}>
          {new Array(6).fill(null).map((_, i) => (
            <LoadingContent height="45px" width="100%" key={i} />
          ))}
        </td>
      </tr>
    </tbody>
  );
};
