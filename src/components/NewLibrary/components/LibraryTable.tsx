import React from "react";
import {
  Table,
  Caption,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
} from "@patternfly/react-table";
import type {
  FileBrowserFolder,
  FileBrowserFolderFile,
  FileBrowserFolderLinkFile,
} from "@fnndsc/chrisapi";
import { getFolderName } from "./FolderCard";
import { getFileName, getLinkFileName } from "./FileCard";

interface TableProps {
  data: {
    folders: FileBrowserFolder[];
    files: FileBrowserFolderFile[];
    linkFiles: FileBrowserFolderLinkFile[];
  };
  computedPath: string;
}

const LibraryTable: React.FunctionComponent<TableProps> = (
  props: TableProps,
) => {
  // In real usage, this data would come from some external source like an API via props.

  const { data, computedPath } = props;

  const columnNames = {
    name: "Name",
    date: "Date",
    owner: "Owner",
    size: "Size",
  };

  return (
    <React.Fragment>
      <Table aria-label="Simple table" variant="compact">
        <Caption>Data Library</Caption>
        <Thead>
          <Tr>
            <Th>{columnNames.name}</Th>
            <Th>{columnNames.date}</Th>
            <Th>{columnNames.owner}</Th>
            <Th>{columnNames.size}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.folders.map((resource: FileBrowserFolder) => {
            const folderName = getFolderName(resource, computedPath);
            return (
              <Tr key={folderName}>
                <Td dataLabel={columnNames.name}>{folderName}</Td>
                <Td dataLabel={columnNames.date}>
                  {resource.data.creation_date}
                </Td>
                <Td dataLabel={columnNames.owner}>N/A</Td>
                <Td dataLabel={columnNames.size}>Size</Td>
              </Tr>
            );
          })}
          {data.files.map((resource) => {
            const fileName = getFileName(resource);
            return (
              <Tr key={fileName}>
                <Td dataLabel={columnNames.name}>{fileName}</Td>
                <Td dataLabel={columnNames.date}>
                  {resource.data.creation_date}
                </Td>
                <Td dataLabel={columnNames.owner}>
                  {resource.data.owner_username}
                </Td>
                <Td dataLabel={columnNames.size}>{resource.data.fsize}</Td>
              </Tr>
            );
          })}

          {data.linkFiles.map((resource) => {
            const fileName = getLinkFileName(resource);
            return (
              <Tr key={fileName}>
                <Td dataLabel={columnNames.name}>{fileName}</Td>
                <Td dataLabel={columnNames.date}>
                  {resource.data.creation_date}
                </Td>
                <Td dataLabel={columnNames.owner}>
                  {resource.data.owner_username}
                </Td>
                <Td dataLabel={columnNames.size}>{resource.data.fsize}</Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </React.Fragment>
  );
};

export default LibraryTable;
