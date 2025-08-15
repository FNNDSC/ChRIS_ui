import { Input } from "antd";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

type Props = {
  prompt: string;
  searchParamsPrompt: string;
  initValue: string;
};

// Use searchParams as the source of the truth for mrn/accessionNumber.
export default (props: Props) => {
  const [_, setSearchParams] = useSearchParams();

  const { initValue, searchParamsPrompt, prompt } = props;
  const [value, setValue] = useState(initValue);

  useEffect(() => {
    setValue(initValue);
  }, [initValue]);

  const onClear = () => {
    setSearchParams((params) => {
      params.delete(searchParamsPrompt);
      return params;
    });
  };

  const submit = (value?: string) => {
    if (!value) return;

    setSearchParams((params) => {
      params.set(searchParamsPrompt, value.trim());
      return params;
    });
  };

  return (
    <Input.Search
      defaultValue={initValue}
      placeholder={`Search for DICOM studies by ${prompt}`}
      allowClear
      onClear={onClear}
      onPressEnter={(e) => submit(e.currentTarget.value)}
      onSearch={submit}
      enterButton
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
};
