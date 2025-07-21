import React from "react";
import type { PACSqueryCore } from "../../../api/pfdcm";
import { Select, Input, Row, Col, Grid, Segmented } from "antd";
import { useSearchParams } from "react-router-dom";
import type { ReadonlyNonEmptyArray } from "fp-ts/ReadonlyNonEmptyArray";
import {
  type PacsStudyState,
  PacsSeriesCSVKeys,
  PacsStudyCSVKeys,
} from "../types";
import { DownloadIcon } from "@patternfly/react-icons";
import OperationButton from "../../NewLibrary/components/operations/OperationButton";

/** ------------------ Shared Types ------------------ **/
type InputFieldProps = {
  onSubmit: (query: PACSqueryCore) => void;
};

type PacsInputProps = {
  services: ReadonlyNonEmptyArray<string>;
  service: string;
  studies: PacsStudyState[] | null;
  setService: (service: string) => void;
  onSubmit: (service: string, query: PACSqueryCore) => void;
};

/** ------------------ MRN Input ------------------ **/
const MrnInput: React.FC<InputFieldProps> = ({ onSubmit }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const onClear = () => {
    setSearchParams((params) => {
      params.delete("mrn");
      return params;
    });
  };

  const submitMrn = (value?: string) => {
    if (!value) return;
    const trimmed = value.trim();
    setSearchParams((params) => {
      params.set("mrn", trimmed);
      onSubmit({ patientID: trimmed });
      return params;
    });
  };

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
      allowClear
      onClear={onClear}
      onPressEnter={(e) => submitMrn(e.currentTarget.value)}
      onSearch={submitMrn}
      enterButton
    />
  );
};

/** ------------------ Accession Input ------------------ **/
const AccessionInput: React.FC<InputFieldProps> = ({ onSubmit }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const onClear = () => {
    setSearchParams((params) => {
      params.delete("accno");
      return params;
    });
  };

  const submitAccNo = (value?: string) => {
    if (!value) return;
    const trimmed = value.trim();
    setSearchParams((params) => {
      params.set("accno", trimmed);
      onSubmit({ accessionNumber: trimmed });
      return params;
    });
  };

  React.useEffect(() => {
    const initialValue = searchParams.get("accno");
    if (initialValue && initialValue.trim().length > 0) {
      onSubmit({ accessionNumber: initialValue.trim() });
    }
  }, [searchParams, onSubmit]);

  return (
    <Input.Search
      defaultValue={searchParams.get("accno") || ""}
      placeholder="Search for DICOM studies by Accession #"
      allowClear
      onClear={onClear}
      onPressEnter={(e) => submitAccNo(e.currentTarget.value)}
      onSearch={submitAccNo}
      enterButton
    />
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
  return screens.md ? <>{desktop}</> : <>{mobile}</>;
};

/** ------------------ Main PACS Input ------------------ **/
const PacsInput: React.FC<PacsInputProps> = ({
  onSubmit,
  service,
  setService,
  services,

  studies: propsStudies,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // "searchMode" can be "mrn" or "accno"
  const searchMode = searchParams.get("searchMode") || "mrn";

  const studies = propsStudies || [];

  // Helper to update the search mode in the URL
  const setSearchMode = React.useCallback(
    (mode: string) => {
      setSearchParams((prev) => {
        // Clean up old query params if switching between modes
        if (mode === "mrn") {
          prev.delete("accno");
        } else {
          // mode === "accno"
          prev.delete("mrn");
        }
        prev.set("searchMode", mode);
        return prev;
      });
    },
    [setSearchParams],
  );

  // We'll pass (service, query) up to the parent
  const curriedOnSubmit = React.useMemo(
    () => (query: PACSqueryCore) => onSubmit(service, query),
    [service, onSubmit],
  );

  // Decide which input to show based on searchMode
  let input: React.ReactNode;
  if (searchMode === "mrn") {
    input = <MrnInput onSubmit={curriedOnSubmit} />;
  } else {
    input = <AccessionInput onSubmit={curriedOnSubmit} />;
  }

  // Single segmented control with 2 options
  const searchModeToggle = (
    <Segmented
      options={[
        {
          label: <ScreenSizeSpan mobile="MRN" desktop="MRN Search" />,
          value: "mrn",
        },
        {
          label: (
            <ScreenSizeSpan mobile="Accession" desktop="Accession Search" />
          ),
          value: "accno",
        },
      ]}
      value={searchMode}
      onChange={(val) => setSearchMode(val.toString())}
    />
  );

  // The PACS service dropdown remains the same
  const serviceDropdown = (
    <div title="PACS service">
      <Select
        options={services.map((value) => ({ label: value, value }))}
        value={service}
        onChange={setService}
        style={{ width: "100%" }}
      />
    </div>
  );

  const csvLine = (data: string[]) =>
    data
      .map((v) => v.replaceAll('"', '""')) // escape double quotes
      .map((v) => `"${v}"`) // quote it
      .join(","); // comma-separated

  const downloadStudiesToCSV = () => {
    const csvKeys = csvLine(PacsStudyCSVKeys.concat(PacsSeriesCSVKeys));
    const studyCSV = studies.map(({ info, series }) =>
      series
        .map((eachSeries) => {
          const studyList: string[] = PacsStudyCSVKeys.map((each) =>
            // @ts-expect-error
            String(info[each] || ""),
          );
          const seriesList = PacsSeriesCSVKeys.map((each) =>
            // @ts-expect-error
            String(eachSeries.info[each] || ""),
          );

          return csvLine(studyList.concat(seriesList));
        })
        .join("\r\n"),
    );

    const theCSV = [csvKeys].concat(studyCSV).join("\r\n");

    const blob = new File([theCSV], "PACS.csv", { type: "text/csv" });

    const downloadLink = document.createElement("a");
    const dataUrl = URL.createObjectURL(blob);
    downloadLink.href = dataUrl;

    const filenameNumber =
      searchMode === "mrn"
        ? studies[0].info.PatientID
        : studies[0].info.AccessionNumber;

    const filename = `PACS-${searchMode}-${filenameNumber}.csv`;
    downloadLink.download = filename;

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const ariaLabel = "Download queried results as csv";

  return (
    <Row gutter={4}>
      <Col xs={24} sm={12} md={8} lg={6} xl={5}>
        {searchModeToggle}
      </Col>
      <Col
        xs={{ span: 20, order: 1 }}
        sm={{ span: 20, order: 1 }}
        md={{ span: 6, order: 0 }}
        lg={{ span: 9, order: 0 }}
        xl={{ span: 11, order: 0 }}
      >
        {input}
      </Col>
      <Col xs={24} sm={12} md={5} lg={5} xl={4}>
        {serviceDropdown}
      </Col>
      <Col
        xs={{ span: 4, order: 1 }}
        sm={{ span: 4, order: 1 }}
        md={{ span: 4, order: 0 }}
        lg={{ span: 4, order: 0 }}
        xl={{ span: 4, order: 0 }}
      >
        <OperationButton
          handleOperations={downloadStudiesToCSV}
          count={studies?.length}
          icon={<DownloadIcon />}
          ariaLabel={ariaLabel}
          operationKey="download"
        />
      </Col>
    </Row>
  );
};

export type { PacsInputProps };
export default PacsInput;
