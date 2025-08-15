/**
 * The primary PACS Q/R UI code is found in ./PacsView.tsx. This file defines
 * a component which wraps the default export from ./PacsView.tsx, which
 * manages effects and state.
 */

import { PageSection } from "@patternfly/react-core";
import { App } from "antd";
import type React from "react";
import { useEffect, useState } from "react";
import { getRoot, getRootID, useReducer } from "react-reducer-utils";
import { useLonk } from "../../api/lonk/index.ts";
import type { PACSqueryCore } from "../../api/pfdcm/index.ts";
import * as DoPacs from "../../reducers/pacs";
import ErrorScreen from "./components/ErrorScreen.tsx";
import PacsLoadingScreen from "./components/PacsLoadingScreen.tsx";
import { getSeriesDescription } from "./components/utils.ts";
import { DEFAULT_PREFERENCES } from "./defaultPreferences.ts";
import styles from "./PacsApp.module.css";
import PacsView from "./PacsView.tsx";
import {
  DEFAULT_RECEIVE_STATE,
  type PacsState,
  SeriesPullState,
  type SeriesReceiveState,
  type SeriesReceiveStateMap,
} from "./types.ts";
import { createFeedWithSeriesInstanceUID } from "./utils.ts";

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
  const { message } = App.useApp();

  const [statePacs, doPacs] = useReducer(DoPacs);

  const pacsID = getRootID(statePacs);
  const pacs = getRoot(statePacs) ?? DoPacs.defaultState;

  const {
    expandedStudyUids,
    expandedSeries,
    studies,
    services,
    isGetServices,
    seriesMap,
    seriesReceiveStateMap,
    pullRequestMap: pullRequests,
    isLoadingStudies,
    wsUrl,
  } = pacs;

  console.info("PacsApp: start: pacs:", pacs);

  // ========================================
  // STATE
  // ========================================

  /**
   * Indicates a fatal error with the WebSocket.
   */
  const [wsError, setWsError] = useState<React.ReactNode | null>(null);
  // TODO create a settings component for changing preferences
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);

  /**
   * The state of DICOM series, according to LONK.
   */
  /**
   * List of PACS queries which the user wants to pull.
   */

  // ========================================
  // PFDCM QUERIES AND DATA
  // ========================================

  /**
   * The state of DICOM studies and series in PFDCM.
   */

  // ========================================
  // CUBE QUERIES AND DATA
  // ========================================

  // We have two instances of `useQueries` for checking whether DICOM series
  // exists in CUBE:
  //
  // `cubeSeriesQueries`: initial check for existence when series is expanded,
  //                      runs once.
  // `lastCheckQueries`:  final check for existence when series is done being
  //                      received by oxidicom, polls repeatedly until found.

  /**
   * Poll CUBE for the existence of DICOM series which have been reported as
   * "done" by LONK. It is necessary to poll CUBE because there will be a delay
   * between when LONK reports the series as "done" and when CUBE will run the
   * celery task of finally registering the series.
   */
  /*
  const lastCheckQueries = useQueries({
    queries: React.useMemo(
      () =>
        receiveState.entries().map(([pacs_name, SeriesInstanceUID, state]) => ({
          queryKey: [
            "lastCheckCubeSeriesRegistration",
            pacs_name,
            SeriesInstanceUID,
          ],
          queryFn: async () => {
            const search = { pacs_name, SeriesInstanceUID, limit: 1 };
            const list = await chrisClient.getPACSSeriesList(search);
            const items = list.getItems() as ReadonlyArray<PACSSeries>;
            if (items.length === 0) {
              throw new SeriesNotRegisteredError(pacs_name, SeriesInstanceUID);
            }
            return items[0];
          },
          enabled: state.done,
          retry: 300,
          retryDelay:
            Number.parseInt(import.meta.env.VITE_CUBE_POLL_INTERVAL_MS) || 2000,
        })),
      [receiveState, chrisClient.getPACSSeriesList],
    ),
  });
  */

  /**
   * Map for all the CUBE queries for PACSSeries existence.
   */
  /*
  const allCubeSeriesQueryMap = React.useMemo(() => {
    const lastCheckParams = receiveState
      .entries()
      .map(([pacs_name, SeriesInstanceUID]) => ({
        pacs_name,
        SeriesInstanceUID,
      }));
    const lastCheckQueriesMap = createCubeSeriesQueryUidMap(
      lastCheckParams,
      lastCheckQueries,
    );

    return new Map([...firstCheckQueriesMap, ...lastCheckQueriesMap]);
  }, [receiveState, lastCheckQueries, expandedSeries, cubeSeriesQueries]);
  */

  // ========================================
  // COMBINED STATE OF EVERYTHING
  // ========================================

  /**
   * Combined states of PFDCM, LONK, and CUBE into one object.
   */

  /**
   * Entire state of the Pacs Q/R application.
   */
  const state: PacsState = { preferences, studies };

  const error = wsError || pacs.errmsg;

  // ========================================
  // LONK WEBSOCKET
  // ========================================

  const lonk = useLonk({
    url: wsUrl,
    onDone: async (pacs_name: string, SeriesInstanceUID: string) => {
      doPacs.updateReceiveState(pacsID, pacs_name, SeriesInstanceUID, {
        pullState: SeriesPullState.WAITING_OR_COMPLETE,
        done: true,
      });
      doPacs.queryCubeSeriesStateBySeriesUID(
        pacsID,
        pacs_name,
        SeriesInstanceUID,
      );

      console.info(
        "PacsApp.lonk.onDone: to createFeed: seriesInstanceUID:",
        SeriesInstanceUID,
      );

      await createFeedWithSeriesInstanceUID(SeriesInstanceUID);

      return;
    },
    onProgress: (
      pacs_name: string,
      SeriesInstanceUID: string,
      ndicom: number,
    ) => {
      console.info(
        "PacsApp.lonk.onProgress: start: seriesUID:",
        SeriesInstanceUID,
        "ndicom:",
        ndicom,
      );
      doPacs.updateReceiveState(
        pacsID,
        pacs_name,
        SeriesInstanceUID,
        { receivedCount: ndicom },
        (theOrig: number, theNew: number) => theOrig < theNew,
      );
    },
    onLonkError: (
      pacs_name: string,
      SeriesInstanceUID: string,
      error: string,
    ) => {
      console.info("PacsApp.lonk.onError: start:", SeriesInstanceUID);
      doPacs.pushReceiveStateError(pacsID, pacs_name, SeriesInstanceUID, error);

      const desc = getSeriesDescription(
        pacs_name,
        SeriesInstanceUID,
        seriesMap,
      );
      message.error(
        <>There was an error while receiving the series "{desc}"</>,
      );
    },
    onMessageError: (data: any, error: string) => {
      console.error("LONK message error", error, data);
      message.error(
        <>
          A <em>LONK</em> error occurred, please check the console.
        </>,
      );
    },
    heartbeat: false,
    retryOnError: true,
    reconnectAttempts: 3,
    reconnectInterval: 3000,
    shouldReconnect: errorCodeIs4xx,
    onReconnectStop: () => {
      console.error("PacsApp.lonk: onReconnectStop");
      setWsError(<>The WebSocket is disconnected.</>);
    },
    onWebsocketError: () => {
      console.error("PacsApp.lonk: onWebsocketError");
      message.error(
        <>There was an error with the WebSocket. Reconnecting&hellip;</>,
      );
    },
  });

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
    console.info("PacsApp.onRetrieve: query:", query);
    doPacs.expandStudies(pacsID, service, query, studies);
    doPacs.retrievePACS(pacsID, service, query);
  };

  // ========================================
  // EFFECTS
  // ========================================

  // init
  // biome-ignore lint/correctness/useExhaustiveDependencies: doPacs.init
  useEffect(() => {
    // set document title.
    const originalTitle = document.title;
    document.title = "ChRIS PACS";

    console.info("PacsApp: useEffect (init): start");

    // doPacs
    doPacs.init();

    return () => {
      document.title = originalTitle;
    };
  }, []);

  // Subscribe to all expanded series
  // biome-ignore lint/correctness/useExhaustiveDependencies: updateReceiveState
  useEffect(() => {
    console.info("PacsApp: lonk.subscribe");
    for (const { pacs_name, SeriesInstanceUID } of expandedSeries) {
      lonk
        .subscribe(pacs_name, SeriesInstanceUID)
        .then(({ pacs_name, SeriesInstanceUID }) => {
          doPacs.updateReceiveState(pacsID, pacs_name, SeriesInstanceUID, {
            subscribed: true,
          });
        });
    }
    // Note: we are subscribing to series, but never unsubscribing.
    // This is mostly harmless.
  }, [expandedSeries]);

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

const errorCodeIs4xx = (e: { code: number }) => {
  console.info("PacsApp: lonk: errorCodeIs4xx: e:", e);
  return e.code >= 400 && e.code < 500;
};
