/**
 * The primary PACS Q/R UI code is found in ./PacsView.tsx. This file defines
 * a component which wraps the default export from ./PacsView.tsx, which
 * manages effects and state.
 */

import React from "react";
import { PACSqueryCore, PfdcmClient } from "../../api/pfdcm";
import Client, { PACSSeries } from "@fnndsc/chrisapi";
import { App } from "antd";
import { PageSection } from "@patternfly/react-core";
import PacsView from "./PacsView.tsx";
import PacsLoadingScreen from "./components/PacsLoadingScreen.tsx";
import ErrorScreen from "./components/ErrorScreen.tsx";
import {
  skipToken,
  useMutation,
  useQueries,
  useQuery,
} from "@tanstack/react-query";
import mergeStates, { SeriesQueryZip } from "./mergeStates.ts";
import {
  DEFAULT_RECEIVE_STATE,
  IPacsState,
  PacsPullRequestState,
  ReceiveState,
  RequestState,
  SeriesPullState,
  SeriesReceiveState,
  StudyKey,
} from "./types.ts";
import { DEFAULT_PREFERENCES } from "./defaultPreferences.ts";
import { zipPacsNameAndSeriesUids } from "./helpers.ts";
import { useImmer } from "use-immer";
import SeriesMap from "../../api/lonk/seriesMap.ts";
import { useLonk } from "../../api/lonk";
import { produce, WritableDraft } from "immer";

type PacsControllerProps = {
  getPfdcmClient: () => PfdcmClient;
  getChrisClient: () => Client;
};

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
const PacsController: React.FC<PacsControllerProps> = ({
  getChrisClient,
  getPfdcmClient,
}) => {
  // ========================================
  // CLIENTS AND MISC
  // ========================================

  const { message } = App.useApp();

  const pfdcmClient = React.useMemo(getPfdcmClient, [getPfdcmClient]);
  const chrisClient = React.useMemo(getChrisClient, [getChrisClient]);

  // ========================================
  // STATE
  // ========================================

  const [{ service, query }, setPacsQuery] = React.useState<{
    service?: string;
    query?: PACSqueryCore;
  }>({});

  /**
   * Indicates a fatal error with the WebSocket.
   */
  const [wsError, setWsError] = React.useState<React.ReactNode | null>(null);
  // TODO create a settings component for changing preferences
  const [preferences, setPreferences] = React.useState(DEFAULT_PREFERENCES);
  /**
   * The state of DICOM series, according to LONK.
   */
  const [receiveState, setReceiveState] = useImmer<ReceiveState>(
    new SeriesMap(),
  );
  /**
   * Studies which have their series visible on-screen.
   */
  const [expandedStudies, setExpandedStudies] = React.useState<
    ReadonlyArray<StudyKey>
  >([]);

  /**
   * List of PACS queries which the user wants to pull.
   */
  const [pullRequests, setPullRequests] = useImmer<
    ReadonlyArray<PacsPullRequestState>
  >([]);

  /**
   * Update the state of a pull request.
   */
  const updatePullRequestState = React.useCallback(
    (
      service: string,
      query: PACSqueryCore,
      delta: Partial<Omit<PacsPullRequestState, "service" | "query">>,
    ) =>
      setPullRequests((draft) => {
        const i = draft.findLastIndex(
          (pr) =>
            pr.service === service &&
            (pr.query.studyInstanceUID
              ? pr.query.studyInstanceUID === query.studyInstanceUID
              : true) &&
            (pr.query.seriesInstanceUID
              ? pr.query.seriesInstanceUID === query.seriesInstanceUID
              : true),
        );
        if (i === -1) {
          throw new Error(
            "pullFromPacs mutation called on unknown pull request: " +
              `service=${service}, query=${JSON.stringify(query)}`,
          );
        }
        draft[i] = { ...draft[i], ...delta };
      }),
    [setPullRequests],
  );

  // ========================================
  // QUERIES AND DATA
  // ========================================

  /**
   * List of PACS servers which PFDCM can talk to.
   */
  const pfdcmServices = useQuery({
    queryKey: ["pfdcmServices"],
    queryFn: () => pfdcmClient.getPacsServices(),
  });

  /**
   * The state of DICOM studies and series in PFDCM.
   */
  const pfdcmStudies = useQuery({
    queryKey: React.useMemo(
      () => ["pfdcmStudies", service, query],
      [service, query],
    ),
    queryFn:
      service && query ? () => pfdcmClient.query(service, query) : skipToken,
  });
  /**
   * List of series which are currently visible on-screen.
   */
  const expandedSeries = React.useMemo(
    () => zipPacsNameAndSeriesUids(expandedStudies, pfdcmStudies.data),
    [expandedStudies, pfdcmStudies.data],
  );

  /**
   * Check whether CUBE has any of the series that are expanded.
   */
  const cubeSeriesQuery = useQueries({
    queries: expandedSeries.map((series) => ({
      queryKey: ["cubeSeries", chrisClient.url, series],
      queryFn: async () => {
        const list = await chrisClient.getPACSSeriesList({
          limit: 1,
          ...series,
        });
        const items: PACSSeries[] | null = list.getItems();
        // https://github.com/FNNDSC/fnndsc/issues/101
        if (items === null) {
          return null;
        }
        return items[0] || null;
      },
    })),
  });

  /**
   * Zip together elements of `cubeSeriesQuery` and the parameters used for
   * each element.
   */
  const cubeSeriesQueryZip: ReadonlyArray<SeriesQueryZip> = React.useMemo(
    () =>
      expandedSeries.map((search, i) => ({
        search,
        result: cubeSeriesQuery[i],
      })),
    [expandedSeries, cubeSeriesQuery],
  );

  /**
   * Combined states of PFDCM, LONK, and CUBE into one object.
   */
  const studies = React.useMemo(() => {
    if (!pfdcmStudies.data) {
      return null;
    }
    return mergeStates(
      pfdcmStudies.data,
      pullRequests,
      cubeSeriesQueryZip,
      receiveState,
    );
  }, [mergeStates, pfdcmStudies, cubeSeriesQueryZip, receiveState]);

  /**
   * Entire state of the Pacs Q/R application.
   */
  const state: IPacsState = React.useMemo(() => {
    return { preferences, studies };
  }, [preferences, studies]);

  const error = React.useMemo(
    () => wsError || pfdcmServices.error?.message,
    [wsError, pfdcmServices.error],
  );

  // ========================================
  // LONK WEBSOCKET
  // ========================================

  const getSeriesDescriptionOr = React.useCallback(
    (pacs_name: string, SeriesInstanceUID: string) => {
      if (!pfdcmStudies.data) {
        return SeriesInstanceUID;
      }
      const series = pfdcmStudies.data
        .flatMap((s) => s.series)
        .find(
          (s) =>
            s.SeriesInstanceUID === SeriesInstanceUID &&
            s.RetrieveAETitle === pacs_name,
        );
      if (!series) {
        return SeriesInstanceUID;
      }
      return series.SeriesDescription;
    },
    [pfdcmStudies.data],
  );

  /**
   * Update (or insert) the state of a series' reception.
   */
  const updateReceiveState = React.useCallback(
    (
      pacs_name: string,
      SeriesInstanceUID: string,
      recipe: (draft: WritableDraft<SeriesReceiveState>) => void,
    ) =>
      setReceiveState((draft) => {
        const prevState =
          draft.get(pacs_name, SeriesInstanceUID) || DEFAULT_RECEIVE_STATE;
        const nextState = produce(prevState, recipe);
        draft.set(pacs_name, SeriesInstanceUID, nextState);
      }),
    [setReceiveState],
  );

  const lonk = useLonk({
    client: chrisClient,
    onDone(pacs_name: string, SeriesInstanceUID: string) {
      updateReceiveState(pacs_name, SeriesInstanceUID, (draft) => {
        draft.done = true;
      });
    },
    onProgress(pacs_name: string, SeriesInstanceUID: string, ndicom: number) {
      updateReceiveState(pacs_name, SeriesInstanceUID, (draft) => {
        draft.receivedCount = ndicom;
      });
    },
    onError(pacs_name: string, SeriesInstanceUID: string, error: string) {
      updateReceiveState(pacs_name, SeriesInstanceUID, (draft) => {
        draft.errors.push(error);
      });
      const desc = getSeriesDescriptionOr(pacs_name, SeriesInstanceUID);
      message.error(
        <>There was an error while receiving the series "{desc}"</>,
      );
    },
    onMessageError(data: any, error: string) {
      console.error("LONK message error", error, data);
      message.error(
        <>
          A <em>LONK</em> error occurred, please check the console.
        </>,
      );
    },
    retryOnError: true,
    reconnectAttempts: 3,
    reconnectInterval: 3000,
    shouldReconnect(e) {
      return e.code < 400 || e.code > 499;
    },
    onReconnectStop() {
      setWsError(<>The WebSocket is disconnected.</>);
    },
    onWebsocketError() {
      message.error(
        <>There was an error with the WebSocket. Reconnecting&hellip;</>,
      );
    },
  });

  // ========================================
  // CALLBACKS
  // ========================================

  /**
   * Fetch studies from PFDCM.
   */
  const onSubmit = React.useCallback(
    (service: string, query: PACSqueryCore) => {
      setPacsQuery({ service, query });
    },
    [setPacsQuery],
  );

  const onStudyExpand = React.useCallback(
    (pacs_name: string, StudyInstanceUIDs: ReadonlyArray<string>) => {
      setExpandedStudies(
        StudyInstanceUIDs.map((StudyInstanceUID) => ({
          StudyInstanceUID,
          pacs_name,
        })),
      );
    },
    [setExpandedStudies],
  );

  // ========================================
  // PACS RETRIEVAL
  // ========================================

  const onRetrieve = React.useCallback(
    (service: string, query: PACSqueryCore) => {
      setPullRequests((draft) => {
        // indicate that the user requests for something to be retrieved.
        draft.push({
          state: RequestState.NOT_REQUESTED,
          query,
          service,
        });
      });
    },
    [setPullRequests],
  );

  /**
   * @returns true if the study does not contain any series which are `NOT_CHECKED` or `CHECKING`.
   */
  const shouldPullStudy = React.useCallback(
    (pacs_name: string, StudyInstanceUID: string) =>
      (studies ?? [])
        .filter(
          ({ info }) =>
            info.StudyInstanceUID === StudyInstanceUID &&
            info.RetrieveAETitle === pacs_name,
        )
        .flatMap((study) => study.series)
        .findIndex(
          ({ pullState }) =>
            pullState === SeriesPullState.NOT_CHECKED ||
            pullState == SeriesPullState.CHECKING,
        ) === -1,
    [studies],
  );

  /**
   * All series states.
   */
  const allSeries = React.useMemo(
    () => (studies ?? []).flatMap((s) => s.series),
    [studies],
  );

  /**
   * @returns true if the series is ready to pull.
   */
  const shouldPullSeries = React.useCallback(
    (pacs_name: string, SeriesInstanceUID: string) =>
      allSeries.findIndex(
        ({ info, pullState }) =>
          info.RetrieveAETitle === pacs_name &&
          info.SeriesInstanceUID === SeriesInstanceUID &&
          pullState === SeriesPullState.READY,
      ) !== -1,
    [allSeries],
  );

  /**
   * Whether we should send the pull request (where the pull request
   * may be for either a DICOM study or series).
   */
  const shouldSendPullRequest = React.useCallback(
    (pullRequest: PacsPullRequestState): boolean => {
      if (pullRequest.state !== RequestState.NOT_REQUESTED) {
        return false;
      }
      if (!studies) {
        return false;
      }
      if (
        pullRequest.query.studyInstanceUID &&
        !pullRequest.query.seriesInstanceUID
      ) {
        return shouldPullStudy(
          pullRequest.service,
          pullRequest.query.studyInstanceUID,
        );
      }
      if (pullRequest.query.seriesInstanceUID) {
        return shouldPullSeries(
          pullRequest.service,
          pullRequest.query.seriesInstanceUID,
        );
      }
      return false;
    },
    [studies],
  );

  /**
   * Send request to PFDCM to pull from PACS.
   */
  const pullFromPacs = useMutation({
    mutationFn: ({ service, query }: PacsPullRequestState) =>
      pfdcmClient.retrieve(service, query),
    onMutate: ({ service, query }: PacsPullRequestState) =>
      updatePullRequestState(service, query, {
        state: RequestState.REQUESTING,
      }),
    onError: (error, { service, query }) =>
      updatePullRequestState(service, query, { error: error }),
    onSuccess: (_, { service, query }) =>
      updatePullRequestState(service, query, { state: RequestState.REQUESTED }),
  });

  React.useEffect(() => {
    pullRequests
      .filter(shouldSendPullRequest)
      .forEach((pr) => pullFromPacs.mutate(pr));
  }, [pullRequests]);

  // ========================================
  // EFFECTS
  // ========================================

  // Set document title
  React.useEffect(() => {
    const originalTitle = document.title;
    document.title = "ChRIS PACS";
    return () => {
      document.title = originalTitle;
    };
  }, []);

  // Subscribe to all expanded series
  React.useEffect(() => {
    for (const { pacs_name, SeriesInstanceUID } of expandedSeries) {
      lonk
        .subscribe(pacs_name, SeriesInstanceUID)
        .then(({ pacs_name, SeriesInstanceUID }) => {
          updateReceiveState(pacs_name, SeriesInstanceUID, (draft) => {
            draft.subscribed = true;
          });
        });
    }
    // Note: we are subscribing to series, but never unsubscribing.
    // This is mostly harmless.
  }, [expandedSeries]);

  // ========================================
  // RENDER
  // ========================================

  return (
    <PageSection>
      {error ? (
        <ErrorScreen>{error}</ErrorScreen>
      ) : pfdcmServices.data ? (
        <PacsView
          state={state}
          services={pfdcmServices.data}
          onSubmit={onSubmit}
          onRetrieve={onRetrieve}
          onStudyExpand={onStudyExpand}
          isLoadingStudies={pfdcmStudies.isLoading}
        />
      ) : (
        <PacsLoadingScreen />
      )}
    </PageSection>
  );
};

export type { PacsControllerProps };
export default PacsController;
