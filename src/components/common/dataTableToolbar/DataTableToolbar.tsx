import React, { useState } from "react";
import { InputGroup, InputGroupText, TextInput } from "@patternfly/react-core";
import "./dataTableToolbar.scss";

type AllProps = {
  label: string;
  onSearch: (term: string) => void;
};

const DataTableToolbar: React.FunctionComponent<AllProps> = (
  props: AllProps
) => {
  const [value, setValue] = useState("");

  const handleTextInputChange = (value: string) => {
    // Note: Use this block to filter data in table ***** working
    setValue(value);
    props.onSearch(value);
  };
  const { label } = props;
  return (
    <div className="datatable-toolbar">
      <InputGroup>
        <InputGroupText id="brainStructureLabel" className="toolbar-label">
          {label}
        </InputGroupText>
        <TextInput
          type="text"
          aria-label="text input field"
          value={value}
          onChange={handleTextInputChange}
        />
      </InputGroup>
    </div>
  );
};

export default React.memo(DataTableToolbar);
