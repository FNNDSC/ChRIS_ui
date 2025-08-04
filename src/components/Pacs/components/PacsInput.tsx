import { DownloadIcon } from "@patternfly/react-icons";
import { Col, Row, Segmented } from "antd";
import type { ReadonlyNonEmptyArray } from "fp-ts/ReadonlyNonEmptyArray";
import { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import type { PACSqueryCore } from "../../../api/pfdcm";
import OperationButton from "../../NewLibrary/components/operations/OperationButton";
import type { PacsStudyState } from "../types";
import PacsInputText from "./PacsInputText";
import ScreenSizeSpan from "./ScreenSizeSpan";
import ServiceDropdown from "./ServiceDropdown";

import { downloadStudiesToCSV } from "./utils";

enum SearchMode {
  MRN = "mrn",
  AccessNo = "accno",
}

export type Props = {
  services: ReadonlyNonEmptyArray<string>;
  service: string;
  studies: PacsStudyState[] | null;
  setService: (service: string) => void;
  onSubmit: (service: string, prompt: string, value: string) => void;
};

// Use searchParams as the source of the truth for mrn/accessionNumber.
export default (props: Props) => {
  const {
    service,
    services,
    studies: propsStudies,
    onSubmit,
    setService,
  } = props;

  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchMode, setSearchMode] = useState<SearchMode>(SearchMode.MRN);
  const mrn = searchParams.get(SearchMode.MRN) || "";
  const accessionNumber = searchParams.get(SearchMode.AccessNo) || "";

  const studies = propsStudies || [];

  // Single segmented control with 2 options

  const searchModeToggleOptions = [
    {
      label: <ScreenSizeSpan mobile="MRN" desktop="MRN Search" />,
      value: SearchMode.MRN,
    },
    {
      label: <ScreenSizeSpan mobile="Accession" desktop="Accession Search" />,
      value: SearchMode.AccessNo,
    },
  ];

  const ariaLabel = "Download queried results as csv";

  const inputPrompt = searchMode === SearchMode.MRN ? "MRN" : "Accession #";
  const searchParamsPrompt = searchMode;
  const value = searchMode === SearchMode.MRN ? mrn : accessionNumber;

  //init
  // biome-ignore lint/correctness/useExhaustiveDependencies: init
  useEffect(() => {
    if (location.pathname !== "/pacs") {
      return;
    }

    if (mrn !== "") {
      setSearchMode(SearchMode.MRN);
    } else if (accessionNumber !== "") {
      setSearchMode(SearchMode.AccessNo);
    }
  }, [location.pathname]);

  //submit query
  // biome-ignore lint/correctness/useExhaustiveDependencies: toSubmit
  useEffect(() => {
    if (!value) {
      return;
    }

    if (!service) {
      return;
    }

    if (location.pathname !== "/pacs") {
      return;
    }

    const prompt =
      searchMode === SearchMode.MRN ? "PatientID" : "AccessionNumber";

    console.info(
      "PacsInput: to onSubmit: service:",
      service,
      "prompt:",
      prompt,
    );
    onSubmit(service, prompt, value);
  }, [location.pathname, value, service]);

  const onChangeSearchMode = (val: SearchMode) => {
    setSearchParams({ service });
    setSearchMode(val);
  };

  return (
    <Row gutter={4}>
      <Col xs={24} sm={12} md={8} lg={6} xl={5}>
        <Segmented
          options={searchModeToggleOptions}
          value={searchMode}
          onChange={onChangeSearchMode}
        />
      </Col>
      <Col
        xs={{ span: 20, order: 1 }}
        sm={{ span: 20, order: 1 }}
        md={{ span: 6, order: 0 }}
        lg={{ span: 9, order: 0 }}
        xl={{ span: 11, order: 0 }}
      >
        <PacsInputText
          prompt={inputPrompt}
          searchParamsPrompt={searchParamsPrompt}
          initValue={value}
        />
      </Col>
      <Col xs={24} sm={12} md={5} lg={5} xl={4}>
        <ServiceDropdown
          services={services}
          service={service}
          setService={setService}
        />
      </Col>
      <Col
        xs={{ span: 4, order: 1 }}
        sm={{ span: 4, order: 1 }}
        md={{ span: 4, order: 0 }}
        lg={{ span: 4, order: 0 }}
        xl={{ span: 4, order: 0 }}
      >
        <OperationButton
          handleOperations={() => downloadStudiesToCSV(studies, searchMode)}
          count={studies?.length}
          icon={<DownloadIcon />}
          ariaLabel={ariaLabel}
          operationKey="download"
        />
      </Col>
    </Row>
  );
};
