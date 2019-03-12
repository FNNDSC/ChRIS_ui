import * as React from "react";
import { Table, TableHeader, TableBody, TableVariant } from "@patternfly/react-table";
import DataTableToolbar from "./dataTableToolbar";

type AllProps = {
  data: any[];
};

const DataTableViewer: React.FunctionComponent<AllProps> = (
  props: AllProps
) => {

  const onSearch = (term: string) => {
    console.log("search", term);
  };
  return (
    <div className="dataTable-viewer pf-u-px-lg">
      <DataTableToolbar onSearch={onSearch} />
      <Table aria-label="Data table" variant={TableVariant.compact} cells={data.columns} rows={data.rows}>
        <TableHeader />
        <TableBody />
      </Table>
    </div>
  );
};

const data = {
  columns: [
  "Basic Structure",
  "Side",
  "Volume",
  "Avg Vol",
  "Deviation"
  ],
  rows: [
    ["Corpus Callosum ", "---", "123.345", "123.345", {
      title:  <span><i className="dot red"></i> 5.43</span>
    }],
    ["Superior Frontal Gyrus ", "Left", "123.345", "123.345", {
      title:  <span><i className="dot"></i> 0.12</span>
    }],
    ["Superior Frontal Gyrus ", "Right", "123.345", "123.345", {
      title:  <span><i className="dot"></i> 0.321</span>
    }],
    ["Middle Frontal Gyrus ", "Left", "123.345", "123.345", {
      title:  <span><i className="dot orange"></i> 0.45</span>
    }],
    ["Middle Frontal Gyrus ", "Right", "123.345", "123.345", "0.115"  ],
    ["Inferior Frontal Gyrus ", "Left", "123.345", "123.345", "0.167"  ],
    ["Inferior Frontal Gyrus ", "Right", "123.345", "123.345", "0.329"  ],
    ["Precentral Gyrus ", "Left", "123.345", "123.345", "0.228"  ],
    ["Precentral Gyrus ", "Right", "123.345", "123.345", "0.187"  ],
    ["Middle Orbitofrontal Gyrus ", "Left", "123.345", "123.345", "0.136"  ],
    ["Middle Orbitofrontal Gyrus ", "Right", "123.345", "123.345", "0.481"  ],
    ["Lateral Orbitofrontal Gyrus ", "Left", "123.345", "123.345", "0.124"  ],
    ["Lateral Orbitofrontal Gyrus ", "Right", "123.345", "123.345", "0.763"  ],
    ["Gyrus Rectus ", "Left", "123.345", "123.345", "4.32"  ],
    ["Gyrus Rectus ", "Right", "123.345", "123.345", "4.21"  ],
    ["Postcentral Gyrus ", "Left", "123.345", "123.345", "0.328"  ],
    ["Postcentral Gyrus ", "Right", "123.345", "123.345", "0.211"  ],
    ["Superior Parietal Gyrus ", "Left", "123.345", "123.345", "0.365"  ],
    ["Superior Parietal Gyrus ", "Right", "123.345", "123.345", "0.014"  ],
    ["Supramarginal Gyrus ", "Left", "123.345", "123.345", "0.118"  ],
    ["Supramarginal Gyrus ", "Right", "123.345", "123.345", "0.241"  ],
    ["Angular Gyrus ", "Left", "123.345", "123.345", "2.56"  ],
    ["Angular Gyrus ", "Right", "123.345", "123.345", "2.73"  ],
    ["Precuneus ", "Left", "123.345", "123.345", "0.123"  ]
  ]
};

export default React.memo(DataTableViewer);
