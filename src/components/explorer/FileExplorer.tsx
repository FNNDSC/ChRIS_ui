import * as React from "react";

type AllProps = {
  data: any[];
};

const FileExplorer: React.FunctionComponent<AllProps> = (
  props: AllProps
) => {
  return (
    <div >
       File Explorer
    </div>
  );
};

export default React.memo(FileExplorer);
