/**
 * The primary PACS Q/R UI code is found in ./PacsView.tsx. This file defines
 * a component which wraps the default export from ./PacsView.tsx, which
 * manages effects and state.
 */

import { PageSection } from "@patternfly/react-core";
import config from "config";
import { access } from "fs";
import { useEffect, useState } from "react";
import {
  genUUID,
  getRoot,
  getRootID,
  getState,
  type ModuleToFunc,
  StateType,
  useReducer,
} from "react-reducer-utils";
import { useLocation, useSearchParams } from "react-router-dom";
import type { Lonk, LonkMessageData } from "../../api/lonk/types.ts";
import type { PACSqueryCore } from "../../api/pfdcm/index.ts";
import * as DoPacs from "../../reducers/pacs";
import ErrorScreen from "./components/ErrorScreen.tsx";
import PacsLoadingScreen from "./components/PacsLoadingScreen.tsx";
import { DEFAULT_PREFERENCES } from "./defaultPreferences.ts";
import styles from "./PacsApp.module.css";
import PacsView from "./PacsView.tsx";
import { type PacsState, QUERY_PROMPT, SearchMode } from "./types.ts";
import { createFeedWithSeriesInstanceUID, errorCodeIsNot4xx } from "./utils.ts";

type TDoPacs = ModuleToFunc<typeof DoPacs>;

/**
 * ChRIS_ui "PACS Query and Retrieve" controller + view.
 *
 * ## Purpose
 *
 * This component handles all the state and effects for {@link PacsView},
 * which includes:
 *
 * - Managing the CUBE and PFDCM client objects and making requests with them
 * - Connecting to the progress notifications WebSocket at `api/v1/pacs/ws/`
 * - Knowing the state of which DICOM series are received, receiving, or
 *   ready to receive.
 * - Dispatching requests for querying and retrieving DICOM from PACS via PFDCM.
 *
 * ## Bootstrapping
 *
 * The PACS Q/R application needs to be "bootstrapped" which means:
 *
 * 1. Making an initial connection to PFDCM
 * 2. Connecting to the PACS receive progress WebSocket, `api/v1/pacs/ws/`
 *
 * During bootstrapping, a loading screen is shown. If bootstrapping fails,
 * an error screen is shown.
 *
 * ## PACS Retrieve Workflow
 *
 * ChRIS_ui and the rest of CUBE work together to implement the following
 * behavior:
 *
 * 1. User queries for data, which is resolved by PFDCM.
 * 2. User clicks to expand a DICOM study, showing a list of series.
 * 3. For each series...
 * 4. ChRIS_ui subscribes to a series' notifications via LONK
 * 5. ChRIS_ui checks CUBE whether a series exists in CUBE
 * 6. When both subscription and existence check is complete,
 *    and the series does not exist in CUBE, ChRIS_ui is ready
 *    to pull the DICOM series.
 * 7. During the reception of a DICOM series, `status.done === false`
 * 8. After the reception of a DICOM series, ChRIS enters a "waiting"
 *    state while the task to register the DICOM series is enqueued
 *    or running.
 * 9. The DICOM series will appear in CUBE after being registered.
 */

export default () => {
  // ========================================
  // CLIENTS AND MISC
  // ========================================
  const [statePacs, doPacs] = useReducer<DoPacs.State, TDoPacs>(
    DoPacs,
    StateType.LOCAL,
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [pacsID, _] = useState(genUUID());

  const pacs = getState(statePacs, pacsID) ?? DoPacs.defaultState;

  const {
    expandedStudyUids,
    expandedSeries,
    studies,
    services,
    service,
    isGetServices,
    isLoadingStudies,
    isExpandedAllDone,
  } = pacs;

  // ========================================
  // STATE
  // ========================================

  /**
   * Indicates a fatal error with the WebSocket.
   */
  const [wsError, setWsError] = useState("");
  // TODO create a settings component for changing preferences
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);

  // ========================================
  // COMBINED STATE OF EVERYTHING
  // ========================================

  /**
   * Combined states of PFDCM, LONK, and CUBE into one object.
   */
  const state: PacsState = { preferences, studies };

  const error = wsError || pacs.errmsg;

  // ========================================
  // CALLBACKS
  // ========================================

  // EXPANDED STUDIES AND SERIES STATE
  const onStudyExpand = (
    pacs_name: string,
    StudyInstanceUIDs: ReadonlyArray<string>,
  ) => {
    doPacs.onStudyExpand(pacsID, pacs_name, StudyInstanceUIDs);
  };

  // Fetch studies from PFDCM.
  const onSubmit = (service: string, prompt: string, value: string) => {
    doPacs.queryPacsStudies(pacsID, service, prompt, value);
  };

  // PACS RETRIEVAL
  const onRetrieve = (service: string, query: PACSqueryCore) => {
    doPacs.expandStudies(pacsID, service, query, studies);
    doPacs.retrievePACS(pacsID, service, query);
  };

  // ========================================
  // EFFECTS
  // ========================================

  // init
  useEffect(() => {
    doPacs.init(pacsID);

    doPacs.updateServiceQueryBySearchParams(pacsID, location, searchParams);
  }, [
    pacsID,
    doPacs.init,
    doPacs.updateServiceQueryBySearchParams,
    location,
    searchParams,
  ]);

  useEffect(() => {
    if (!pacsID) {
      return;
    }

    if (!location.pathname.startsWith("/pacs")) {
      return;
    }

    // set document title.
    const originalTitle = document.title;
    document.title = "ChRIS PACS";

    doPacs.updateServiceQueryBySearchParams(pacsID, location, searchParams);

    return () => {
      document.title = originalTitle;
    };
  }, [
    pacsID,
    location,
    location.pathname,
    searchParams,
    doPacs.updateServiceQueryBySearchParams,
  ]);

  // Subscribe to all expanded series
  // biome-ignore lint/correctness/useExhaustiveDependencies: updateReceiveState
  useEffect(() => {
    if (wsError) {
      return;
    }

    if (isExpandedAllDone) {
      return;
    }

    if (!expandedSeries.length) {
      return;
    }

    const series_uids = expandedSeries
      .map((each) => each.SeriesInstanceUID)
      .join(",");

    const url = `${config.API_ROOT}/pacs/sse/?pacs_name=${service}&series_uids=${series_uids}`;
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      const data: Lonk<LonkMessageData> = JSON.parse(event.data);
      doPacs.processLonkMsg(pacsID, data);
    };

    eventSource.onerror = (err) => {
      console.error("PacsApp.eventSource.onerror: err:", err);
      setWsError(`event error: ${err}`);
    };

    return () => {
      console.info("PacsApp.eventSource: to return");
      eventSource.close();
    };
    // Note: we are subscribing to series, but never unsubscribing.
    // This is mostly harmless.
  }, [expandedSeries, wsError, isExpandedAllDone]);

  // ========================================
  // RENDER
  // ========================================

  const isHidePacsLoadingScreen = !!error || isGetServices;
  const classPacsLoadingScreen = isHidePacsLoadingScreen ? styles.hide : "";
  const isHideError = !error;
  const classError = isHideError ? styles.hide : "";
  const isHidePacsView = !!error || !isGetServices;
  const classPacsView = isHidePacsView ? styles.hide : "";

  return (
    <>
      <PageSection className={classError}>
        <ErrorScreen>{error}</ErrorScreen>
      </PageSection>
      <PageSection className={classPacsView}>
        <PacsView
          state={state}
          services={services}
          onSubmit={onSubmit}
          onRetrieve={onRetrieve}
          expandedStudyUids={expandedStudyUids}
          onStudyExpand={onStudyExpand}
          isLoadingStudies={isLoadingStudies}
          pacsID={pacsID}
          pacs={pacs}
          doPacs={doPacs}
        />
      </PageSection>
      <PageSection className={classPacsLoadingScreen}>
        <PacsLoadingScreen />
      </PageSection>
    </>
  );
};
