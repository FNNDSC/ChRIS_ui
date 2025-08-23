import { Empty, Flex, Spin, Typography } from "antd";
import type { CSSProperties } from "react";
import type { DispatchFuncMap, ModuleToFunc } from "react-reducer-utils";
import type { PACSqueryCore } from "../../api/pfdcm";
import type * as DoPacs from "../../reducers/pacs";
import PacsInput, {
  type Props as PacsInputProps,
} from "./components/PacsInput.tsx";
import PacsStudiesView, {
  type Props as PacsStudiesViewProps,
} from "./components/PacsStudiesView.tsx";
import type { PacsState } from "./types.ts";

type TDoPacs = ModuleToFunc<typeof DoPacs>;

type Props = Pick<PacsInputProps, "services" | "onSubmit"> &
  Pick<PacsStudiesViewProps, "expandedStudyUids"> & {
    onRetrieve: (service: string, query: PACSqueryCore) => void;
    onStudyExpand: (
      service: string,
      StudyInstanceUIDs: ReadonlyArray<string>,
    ) => void;
    state: PacsState;
    isLoadingStudies?: boolean;

    pacsID: string;
    pacs: DoPacs.State;
    doPacs: DispatchFuncMap<DoPacs.State, TDoPacs>;
  };

/**
 * PACS Query and Retrieve view component.
 *
 * This component has a text input field for specifying a PACS query,
 * and will display studies and series found in PACS.
 */
export default (props: Props) => {
  const {
    state: { preferences, studies },
    services,
    onSubmit,
    onRetrieve,
    expandedStudyUids,
    onStudyExpand,
    isLoadingStudies,

    pacsID,
    pacs,
    doPacs,
  } = props;

  const service = pacs.service;

  const setService = (service: string) => {
    doPacs.setService(pacsID, service);
  };

  const curriedOnRetrieve = (query: PACSqueryCore) =>
    onRetrieve(service, query);

  const curriedOnStudyExpand = (StudyInstanceUIDS: ReadonlyArray<string>) =>
    onStudyExpand(service, StudyInstanceUIDS);

  // CSS
  const pacsStudiesViewStyle: CSSProperties = {
    position: "relative",
    minHeight: isLoadingStudies ? "200px" : "auto",
  };
  if (!studies) {
    pacsStudiesViewStyle.display = "none";
  }
  const studyList = studies || [];

  const searchImageStyle: CSSProperties = {
    height: "100%",
  };
  if (studies) {
    searchImageStyle.display = "none";
  }

  const loadingStyle: CSSProperties = {
    position: isLoadingStudies ? "absolute" : "static",
    top: "50%",
    left: "50%",
    transform: isLoadingStudies ? "translate(-50%, -50%)" : "none",
    zIndex: 100,
  };

  // return
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
      <div style={pacsStudiesViewStyle}>
        <Spin
          spinning={isLoadingStudies}
          size="large"
          tip={<Typography.Text strong>Loading studies...</Typography.Text>}
          style={loadingStyle}
        />
        <div style={{ opacity: isLoadingStudies ? 0.5 : 1 }}>
          <PacsStudiesView
            preferences={preferences}
            studies={studyList}
            onRetrieve={curriedOnRetrieve}
            expandedStudyUids={expandedStudyUids}
            onStudyExpand={curriedOnStudyExpand}
          />
        </div>
      </div>
      <Flex align="center" justify="center" style={searchImageStyle}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Enter a search to get started."
        />
      </Flex>
    </>
  );
};
