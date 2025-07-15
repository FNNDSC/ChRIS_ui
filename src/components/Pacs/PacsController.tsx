/**
 * The primary PACS Q/R UI code is found in ./PacsView.tsx. This file defines
 * a component which wraps the default export from ./PacsView.tsx, which
 * manages effects and state.
 */

import React from "react";
import type { PACSqueryCore, PfdcmClient } from "../../api/pfdcm";
import type Client from "@fnndsc/chrisapi";
import type { PACSSeries } from "@fnndsc/chrisapi";
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
import { createCubeSeriesQueryUidMap, mergeStates } from "./mergeStates.ts";
import {
  DEFAULT_RECEIVE_STATE,
  type IPacsState,
  type PacsPullRequestState,
  type PullRequestStates,
  type ReceiveState,
  RequestState,
  SeriesNotRegisteredError,
  SeriesPullState,
  type SeriesReceiveState,
  type SpecificDicomQuery,
  type StudyKey,
} from "./types.ts";
import { DEFAULT_PREFERENCES } from "./defaultPreferences.ts";
import { toStudyKey, zipPacsNameAndSeriesUids } from "./helpers.ts";
import { useImmer } from "use-immer";
import SeriesMap from "../../api/lonk/seriesMap.ts";
import { useLonk } from "../../api/lonk";
import { produce, type WritableDraft } from "immer";
import {
  isFromPacs,
  sameSeriesInstanceUidAs,
  sameStudyInstanceUidAs,
} from "./curry.ts";
import type { Study } from "../../api/pfdcm/models.ts";
import terribleStrictModeWorkaround from "./terribleStrictModeWorkaround.ts";
import {
  createFeedWithFilepath,
  getPACSSeriesListBySeriesUID,
  getPACSSeriesListByStudyUID,
} from "../../api/serverApi.ts";
import type { PACSSeries as PACSSeriesType } from "../../api/types.ts";
import { filter } from "lodash";

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

  // biome-ignore lint/correctness/useExhaustiveDependencies: https://github.com/biomejs/biome/issues/4248
  const pfdcmClient = React.useMemo(getPfdcmClient, [getPfdcmClient]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: https://github.com/biomejs/biome/issues/4248
  const chrisClient = React.useMemo(getChrisClient, [getChrisClient]);

  // ========================================
  // STATE
  // ========================================

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
   * List of PACS queries which the user wants to pull.
   */
  const [pullRequests, setPullRequests] = useImmer<PullRequestStates>(
    new Map(),
  );

  /**
   * Update the state of a pull request.
   */
  const updatePullRequestState = React.useCallback(
    (query: SpecificDicomQuery, delta: Partial<PacsPullRequestState>) =>
      setPullRequests((draft) => {
        const prev = draft.get(query);
        if (!prev) {
          throw new Error(
            "pullFromPacs mutation called on unknown pull request: " +
              `service=${service}, query=${JSON.stringify(query)}`,
          );
        }
        draft.set(query, { ...prev, ...delta });
      }),
    [setPullRequests],
  );

  // ========================================
  // PFDCM QUERIES AND DATA
  // ========================================

  const [{ service, query }, setPacsQuery] = React.useState<{
    service?: string;
    query?: PACSqueryCore;
  }>({});

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

  // ========================================
  // EXPANDED STUDIES AND SERIES STATE
  // ========================================

  /**
   * Studies which have their series visible on-screen.
   */
  const [expandedStudies, setExpandedStudies] = useImmer<
    ReadonlyArray<StudyKey>
  >([]);

  /**
   * The StudyInstanceUIDs of all expanded studies.
   */
  const expandedStudyUids = React.useMemo(
    () => expandedStudies.map((s) => s.StudyInstanceUID),
    [expandedStudies],
  );

  /**
   * List of series which are currently visible on-screen.
   */
  const expandedSeries = React.useMemo(
    () => zipPacsNameAndSeriesUids(expandedStudies, pfdcmStudies.data),
    [expandedStudies, pfdcmStudies.data],
  );

  const changeExpandedStudies = React.useCallback(
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

  const appendExpandedStudies = React.useCallback(
    (studies: Pick<Study, "StudyInstanceUID" | "RetrieveAETitle">[]) =>
      setExpandedStudies((draft) => {
        draft.push(...studies.map(toStudyKey));
      }),
    [setExpandedStudies],
  );

  /**
   * Expand the studies of the query.
   */
  const expandStudiesFor = React.useCallback(
    (pacs_name: string, query: PACSqueryCore) => {
      if (!pfdcmStudies.data) {
        throw new Error(
          "Expanding studies is not currently possible because we do not " +
            "have data from PFDCM yet.",
        );
      }
      if (query.seriesInstanceUID) {
        const studies = pfdcmStudies.data
          .filter(isFromPacs(pacs_name))
          .flatMap((study) => study.series)
          .filter(sameSeriesInstanceUidAs(query));
        appendExpandedStudies(studies);
        return;
      }
      if (!query.seriesInstanceUID && query.studyInstanceUID) {
        const studies = pfdcmStudies.data
          .filter(isFromPacs(pacs_name))
          .map((s) => s.study)
          .filter(sameStudyInstanceUidAs(query));
        appendExpandedStudies(studies);
        return;
      }
    },
    [pfdcmStudies.data, appendExpandedStudies],
  );

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
   * Check whether CUBE has any of the series that are expanded.
   */
  const cubeSeriesQueries = useQueries({
    queries: expandedSeries.map((series) => ({
      queryKey: [
        "cubeSeries",
        chrisClient.url,
        series.pacs_name,
        series.SeriesInstanceUID,
      ],
      queryFn: async () => {
        const list = await chrisClient.getPACSSeriesList({
          limit: 1,
          ...series,
        });
        const items = list.getItems() as PACSSeries[];
        // https://github.com/FNNDSC/fnndsc/issues/101
        return items[0] ?? null;
      },
    })),
  });

  /**
   * Poll CUBE for the existence of DICOM series which have been reported as
   * "done" by LONK. It is necessary to poll CUBE because there will be a delay
   * between when LONK reports the series as "done" and when CUBE will run the
   * celery task of finally registering the series.
   */
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

  /**
   * Map for all the CUBE queries for PACSSeries existence.
   */
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
    const firstCheckQueriesMap = createCubeSeriesQueryUidMap(
      expandedSeries,
      cubeSeriesQueries,
    );
    return new Map([...firstCheckQueriesMap, ...lastCheckQueriesMap]);
  }, [receiveState, lastCheckQueries, expandedSeries, cubeSeriesQueries]);

  // ========================================
  // COMBINED STATE OF EVERYTHING
  // ========================================

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
      allCubeSeriesQueryMap,
      receiveState,
    );
  }, [pfdcmStudies.data, pullRequests, allCubeSeriesQueryMap, receiveState]);

  /**
   * Entire state of the Pacs Q/R application.
   */
  const state: IPacsState = React.useMemo(() => {
    return { preferences, studies };
  }, [preferences, studies]);

  const error = React.useMemo(
    () =>
      wsError || pfdcmServices.error?.message || pfdcmStudies.error?.message,
    [wsError, pfdcmServices.error, pfdcmStudies.error],
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
    onDone: React.useCallback(
      async (pacs_name: string, SeriesInstanceUID: string) => {
        updateReceiveState(pacs_name, SeriesInstanceUID, (draft) => {
          draft.done = true;
        });

        console.info(
          "PacsController.pullFromPacs: to createFeed: seriesInstanceUID:",
          SeriesInstanceUID,
        );

        await createFeedWithSeriesInstanceUID(SeriesInstanceUID);

        return;
      },

      [updateReceiveState],
    ),
    onProgress: React.useCallback(
      (pacs_name: string, SeriesInstanceUID: string, ndicom: number) =>
        updateReceiveState(pacs_name, SeriesInstanceUID, (draft) => {
          draft.receivedCount = ndicom;
        }),
      [updateReceiveState],
    ),
    onError: React.useCallback(
      (pacs_name: string, SeriesInstanceUID: string, error: string) => {
        updateReceiveState(pacs_name, SeriesInstanceUID, (draft) => {
          draft.errors.push(error);
        });
        const desc = getSeriesDescriptionOr(pacs_name, SeriesInstanceUID);
        message.error(
          <>There was an error while receiving the series "{desc}"</>,
        );
      },
      [updateReceiveState, getSeriesDescriptionOr, message.error],
    ),
    onMessageError: React.useCallback(
      (data: any, error: string) => {
        console.error("LONK message error", error, data);
        message.error(
          <>
            A <em>LONK</em> error occurred, please check the console.
          </>,
        );
      },
      [message.error],
    ),
    retryOnError: true,
    reconnectAttempts: 3,
    reconnectInterval: 3000,
    shouldReconnect: errorCodeIs4xx,
    onReconnectStop: React.useCallback(
      () => setWsError(<>The WebSocket is disconnected.</>),
      [],
    ),
    onWebsocketError: React.useCallback(
      () =>
        message.error(
          <>There was an error with the WebSocket. Reconnecting&hellip;</>,
        ),
      [message.error],
    ),
  });

  // ========================================
  // CALLBACKS
  // ========================================

  /**
   * Fetch studies from PFDCM.
   */
  const onSubmit = React.useCallback(
    (service: string, query: PACSqueryCore) => {
      console.info("PacsController.onSubmit: query:", query);
      setPacsQuery({ service, query });
    },
    [],
  );

  // ========================================
  // PACS RETRIEVAL
  // ========================================

  const onRetrieve = React.useCallback(
    (service: string, query: PACSqueryCore) => {
      console.info("PacsController.onRetrieve: query:", query);
      expandStudiesFor(service, query);
      setPullRequests((draft) => {
        const key = { service, query };
        // indicate that the user requests for something to be retrieved.
        draft.set(key, { state: RequestState.NOT_REQUESTED });
      });
    },
    [setPullRequests, expandStudiesFor],
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
            pullState === SeriesPullState.CHECKING,
        ) === -1,
    [studies],
  );

  /**
   * All DICOM series states.
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
          pullState === SeriesPullState.PULLING,
      ) !== -1,
    [allSeries],
  );

  /**
   * Whether we should send the pull request (where the pull request
   * may be for either a DICOM study or series).
   */
  const shouldSendPullRequest = React.useCallback(
    ({
      service,
      query,
      state,
    }: SpecificDicomQuery & Pick<PacsPullRequestState, "state">): boolean => {
      if (state !== RequestState.NOT_REQUESTED) {
        return false;
      }
      if (query.seriesInstanceUID) {
        return shouldPullSeries(service, query.seriesInstanceUID);
      }
      if (query.studyInstanceUID) {
        return shouldPullStudy(service, query.studyInstanceUID);
      }
      return false;
    },
    [shouldPullStudy, shouldPullSeries],
  );

  const createFeedWithSeriesInstanceUID = async (seriesUID: string) => {
    console.info(
      "PacsController.createFeedWithSeriesInstanceUID: to getPACSSeriesListBySeriesUID: folderPath:",
      seriesUID,
    );
    const pacsSeriesListResult = await getPACSSeriesListBySeriesUID(seriesUID);
    const { data: pacsSeriesList } = pacsSeriesListResult;
    if (!pacsSeriesList) {
      return;
    }

    for (const pacsSeries of pacsSeriesList) {
      await createFeedWithPACSSeries(pacsSeries);
    }

    return;
  };

  const createFeedWithStudyInstanceUID = async (studyUID: string) => {
    console.info(
      "PacsController.createFeedWithStudyInstanceUID: start: studyUID:",
      studyUID,
    );
    const pacsSeriesListResult = await getPACSSeriesListByStudyUID(studyUID);

    console.info(
      "PacsController.createFeedWithStudyInstanceUID: after getPACSSeriesListByStudyUID: pacsSeriesListResult:",
      pacsSeriesListResult,
    );

    const { data: pacsSeriesList } = pacsSeriesListResult;
    if (!pacsSeriesList) {
      return;
    }

    for (const pacsSeries of pacsSeriesList) {
      await createFeedWithPACSSeries(pacsSeries);
    }

    return;
  };

  const createFeedWithPACSSeries = async (series: PACSSeriesType) => {
    const {
      folder_path: thePath,
      PatientID: patientID,
      StudyDate: studyDate,
      StudyDescription: studyDescription,
      SeriesDescription: seriesDescription,
      Modality: modality,
    } = series;

    const studyDateStr = studyDate.replace(/[^0-9]/g, "");

    const theName = `PACS-${patientID}-${studyDateStr}-${studyDescription}-${seriesDescription}`;

    console.info(
      "PacsController.createFeedWithPACSSeries: to createFeedWithFilepath: folderPath:",
      thePath,
      "theName:",
      theName,
    );

    const tags = ["pacs"];
    return await createFeedWithFilepath({
      filepath: thePath,
      theName,
      tags,
      patientID,
      modality,
      studyDate,
      isPublic: true,
    });
  };

  /**
   * Send request to PFDCM to pull from PACS.
   */
  const pullFromPacs = useMutation({
    mutationFn: ({ service, query }: SpecificDicomQuery) => {
      console.info(
        "PacsController.pullFromPacs.mutationFn: to retrieve: service:",
        service,
        "query:",
        query,
      );
      return pfdcmClient.retrieve(service, query);
    },
    onMutate: (query: SpecificDicomQuery) => {
      console.info("PacsController.pullFromPacs.onMutate: query:", query);
      return updatePullRequestState(query, { state: RequestState.REQUESTING });
    },
    onError: (error, query) => updatePullRequestState(query, { error: error }),
    onSuccess: async (_, query) => {
      console.info("PacsController.pullFromPacs.onSuccess: query:", query);

      updatePullRequestState(query, { state: RequestState.REQUESTED });
    },
  });

  const terribleDoNotCallTwice =
    terribleStrictModeWorkaround<[SpecificDicomQuery, PacsPullRequestState]>();

  React.useEffect(() => {
    [...pullRequests.entries()]
      .filter(terribleDoNotCallTwice)
      .filter(([query, { state }]) =>
        shouldSendPullRequest({ ...query, state }),
      )
      .forEach(([query, _]) => pullFromPacs.mutate(query));
  }, [
    pullRequests,
    shouldSendPullRequest,
    pullFromPacs.mutate,
    terribleDoNotCallTwice,
  ]);

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
  }, [lonk.subscribe, expandedSeries, updateReceiveState]);

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
          expandedStudyUids={expandedStudyUids}
          onStudyExpand={changeExpandedStudies}
          isLoadingStudies={pfdcmStudies.isFetching}
        />
      ) : (
        <PacsLoadingScreen />
      )}
    </PageSection>
  );
};

function errorCodeIs4xx(e: { code: number }) {
  return e.code < 400 || e.code > 499;
}

export type { PacsControllerProps };
export default PacsController;
