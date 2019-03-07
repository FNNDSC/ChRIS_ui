import * as React from "react";

type AllProps = {
//   data: any[];
  onSearch: (term: string) => void;
};

const DataTableToolbar: React.FunctionComponent<AllProps> = (
  props: AllProps
) => {
  return (
    <small>
        Data table toolbar goes here
    </small>
  );
};

export default React.memo(DataTableToolbar);
