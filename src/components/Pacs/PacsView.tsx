import React from "react";
import PacsInput, { PacsInputProps } from "./components/PacsInput.tsx";
import PacsStudiesView, {
  PacsStudiesViewProps,
} from "./components/PacsStudiesView.tsx";
import { getDefaultPacsService } from "./components/helpers.ts";
import { useSearchParams } from "react-router-dom";
import { PACSqueryCore } from "../../api/pfdcm";
import { Empty, Flex, Spin } from "antd";
import { IPacsState } from "./types.ts";

type PacsViewProps = Pick<PacsInputProps, "services" | "onSubmit"> &
  Pick<PacsStudiesViewProps, "expandedStudyUids"> & {
    onRetrieve: (service: string, query: PACSqueryCore) => void;
    onStudyExpand: (
      service: string,
      StudyInstanceUIDs: ReadonlyArray<string>,
    ) => void;
    state: IPacsState;
    isLoadingStudies?: boolean;
  };

/**
 * PACS Query and Retrieve view component.
 *
 * This component has a text input field for specifying a PACS query,
 * and will display studies and series found in PACS.
 */
const PacsView: React.FC<PacsViewProps> = ({
  state: { preferences, studies },
  services,
  onSubmit,
  onRetrieve,
  expandedStudyUids,
  onStudyExpand,
  isLoadingStudies,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultService = React.useMemo(
    () => getDefaultPacsService(services),
    [services],
  );
  const service = searchParams.get("service") || defaultService;
  const setService = (service: string) =>
    setSearchParams((searchParams) => {
      searchParams.set("service", service);
      return searchParams;
    });

  const curriedOnRetrieve = React.useCallback(
    (query: PACSqueryCore) => onRetrieve(service, query),
    [onRetrieve],
  );

  const curriedOnStudyExpand = React.useCallback(
    (StudyInstanceUIDS: ReadonlyArray<string>) =>
      onStudyExpand(service, StudyInstanceUIDS),
    [onStudyExpand],
  );

  return (
    <>
      <PacsInput
        onSubmit={onSubmit}
        services={services}
        service={service}
        setService={setService}
      />
      <br />
      {studies ? (
        <Spin spinning={isLoadingStudies}>
          <PacsStudiesView
            preferences={preferences}
            studies={studies}
            onRetrieve={curriedOnRetrieve}
            expandedStudyUids={expandedStudyUids}
            onStudyExpand={curriedOnStudyExpand}
          />
        </Spin>
      ) : (
        <Flex align="center" justify="center" style={{ height: "100%" }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Enter a search to get started."
          />
        </Flex>
      )}
    </>
  );
};

export default PacsView;
