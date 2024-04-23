import { TextInput } from "@patternfly/react-core";
import React, { useState } from "react";

const Search = () => {
  const [value, setValue] = useState("");

  const handleChange = (_event: React.FormEvent, value: string) => {
    setValue(value);
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ): void => {
    if (event.key === "Enter") {
      console.log("Submit hit");
    }
  };

  return (
    <TextInput
      onKeyDown={handleKeyDown}
      value={value}
      onChange={handleChange}
    />
  );
};

export default Search;
