import React from "react";
import PacsInput, { type PacsInputProps } from "./components/PacsInput.tsx";
import PacsStudiesView, {
  type PacsStudiesViewProps,
} from "./components/PacsStudiesView.tsx";
import { getDefaultPacsService } from "./components/helpers.ts";
import { useSearchParams } from "react-router-dom";
import type { PACSqueryCore } from "../../api/pfdcm";
import { Empty, Flex, Spin, Typography } from "antd";
import type { IPacsState } from "./types.ts";

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
    [onRetrieve, service],
  );

  const curriedOnStudyExpand = React.useCallback(
    (StudyInstanceUIDS: ReadonlyArray<string>) =>
      onStudyExpand(service, StudyInstanceUIDS),
    [onStudyExpand, service],
  );

  return (
    <>
      <PacsInput
        onSubmit={onSubmit}
        services={services}
        service={service}
        setService={setService}
        studies={studies}
      />
      <br />
      {studies ? (
        <div
          style={{
            position: "relative",
            minHeight: isLoadingStudies ? "200px" : "auto",
          }}
        >
          <Spin
            spinning={isLoadingStudies}
            size="large"
            tip={<Typography.Text strong>Loading studies...</Typography.Text>}
            style={{
              position: isLoadingStudies ? "absolute" : "static",
              top: "50%",
              left: "50%",
              transform: isLoadingStudies ? "translate(-50%, -50%)" : "none",
              zIndex: 100,
            }}
          />
          <div style={{ opacity: isLoadingStudies ? 0.5 : 1 }}>
            <PacsStudiesView
              preferences={preferences}
              studies={studies}
              onRetrieve={curriedOnRetrieve}
              expandedStudyUids={expandedStudyUids}
              onStudyExpand={curriedOnStudyExpand}
            />
          </div>
        </div>
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
