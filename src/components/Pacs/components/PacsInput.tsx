import React from "react";
import { PACSqueryCore } from "../../../api/pfdcm";
import { Radio, Select, Input, Row, Col, Grid } from "antd";
import { useSearchParams } from "react-router-dom";
import { useBooleanSearchParam } from "./helpers.ts";
import { ReadonlyNonEmptyArray } from "fp-ts/ReadonlyNonEmptyArray";

type InputFieldProps = {
  onSubmit: (query: PACSqueryCore) => void;
};

type PacsInputProps = {
  services: ReadonlyNonEmptyArray<string>;
  service: string;
  setService: (service: string) => void;
  onSubmit: (service: string, query: PACSqueryCore) => void;
};

/**
 * An input field for searching in PACS by MRN
 */
const MrnInput: React.FC<InputFieldProps> = ({ onSubmit }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const onClear = () => {
    setSearchParams((searchParams) => {
      searchParams.delete("mrn");
      return searchParams;
    });
  };

  const submitMrn = (value?: string) => {
    if (!value) {
      return;
    }
    setSearchParams((searchParams) => {
      searchParams.set("mrn", value.trim());
      onSubmit({ patientID: value.trim() });
      return searchParams;
    });
  };

  // on first page load: if URI contains ?mrn=... then submit
  // the search right away
  React.useEffect(() => {
    const initialValue = searchParams.get("mrn");
    if (initialValue && initialValue.trim().length > 0) {
      onSubmit({ patientID: initialValue.trim() });
    }
  }, [searchParams, onSubmit]);

  return (
    <Input.Search
      defaultValue={searchParams.get("mrn") || ""}
      placeholder="Search for DICOM studies by MRN"
      allowClear={true}
      onClear={onClear}
      onPressEnter={(e) => submitMrn(e.currentTarget.value)}
      onSearch={submitMrn}
      enterButton={true}
    />
  );
};

/**
 * An advanced search input field for searching in PACS by PatientID, AccessionNumber, ...
 */
const AdvancedInput: React.FC<InputFieldProps> = ({ onSubmit }) => {
  return (
    <>
      <h1>Advanced search not implemented.</h1>
    </>
  );
};

/**
 * A `<span>` which shows different text on mobile vs desktop layouts.
 */
const ScreenSizeSpan: React.FC<{
  mobile: React.ReactNode;
  desktop: React.ReactNode;
}> = ({ mobile, desktop }) => {
  const screens = Grid.useBreakpoint();
  return screens.md ? desktop : mobile;
};

const PacsInput: React.FC<PacsInputProps> = ({
  onSubmit,
  service,
  setService,
  services,
}) => {
  const [isAdvancedSearch, setIsAdvancedSearch] = useBooleanSearchParam(
    useSearchParams(),
    "advancedSearch",
  );

  const curriedOnSubmit = React.useMemo(
    () => (query: PACSqueryCore) => onSubmit(service, query),
    [service, onSubmit],
  );
  const input = React.useMemo(
    () =>
      isAdvancedSearch ? (
        <AdvancedInput onSubmit={curriedOnSubmit} />
      ) : (
        <MrnInput onSubmit={curriedOnSubmit} />
      ),
    [isAdvancedSearch, curriedOnSubmit],
  );
  const advancedSearchToggle = (
    <Radio.Group
      optionType="button"
      options={[
        {
          label: <ScreenSizeSpan mobile="MRN" desktop="MRN Search" />,
          value: false,
        },
        {
          label: <ScreenSizeSpan mobile="Advanced" desktop="Advanced Search" />,
          value: true,
        },
      ]}
      value={isAdvancedSearch}
      onChange={(e) => setIsAdvancedSearch(e.target.value)}
    />
  );

  const serviceDropdown = (
    <div title="PACS service">
      <Select
        options={services.map((value) => {
          return { label: value, value };
        })}
        value={service}
        onChange={setService}
        style={{ width: "100%" }}
      />
    </div>
  );

  return (
    <Row gutter={2}>
      <Col xs={12} md={6}>
        {advancedSearchToggle}
      </Col>
      <Col xs={{ span: 24, order: 1 }} md={{ span: 13, order: 0 }}>
        {input}
      </Col>
      <Col xs={12} md={5}>
        {serviceDropdown}
      </Col>
    </Row>
  );
};

export type { PacsInputProps };
export default PacsInput;
