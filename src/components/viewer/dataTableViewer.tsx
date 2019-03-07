import * as React from "react";
import { Table, TableHeader, TableBody, TableVariant } from "@patternfly/react-table";
import DataTableToolbar from "./dataTableToolbar";

type AllProps = {
  data: any[];
};

const DataTableViewer: React.FunctionComponent<AllProps> = (
  props: AllProps
) => {
  const data = {
    columns: [
    "Basic Structure",
    "Side",
    "Volume",
    "Avg Vol",
    "Deviation"
    ],
    rows: [["one", "two", "three", "four", "five"], ["one", "two", "three", "four", "five"], ["one", "two", "three", "four", "five"]]
  };
  const onSearch = (term: string) => {
    console.log("search", term);
  };
  return (
    <div className="pf-u-p-lg">
      <h1>Data Table section</h1>
      <DataTableToolbar onSearch={onSearch} />
      <Table caption="Compact Table" variant={TableVariant.compact} cells={data.columns} rows={data.rows}>
        <TableHeader />
        <TableBody />
      </Table>
    </div>
  );
};

export default React.memo(DataTableViewer);
