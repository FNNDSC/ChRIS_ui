/**
 * The primary PACS Q/R UI code is found in ./PacsView.tsx. This file defines
 * a component which wraps the default export from ./PacsView.tsx, which:
 *
 * 1. "bootstraps" the client objects it needs (see below)
 *
 * The PACS Q/R application needs to be "bootstrapped" which means:
 *
 * 1. Making an initial connection to PFDCM
 * 2. Connecting to the PACS receive progress WebSocket, `api/v1/pacs/ws/`
 *
 * During bootstrapping, a loading screen is shown.
 * If bootstrapping fails, an error screen is shown.
 */

import React from "react";
import { PACSqueryCore, PfdcmClient } from "../../api/pfdcm";
import Client, { PACSSeries } from "@fnndsc/chrisapi";
import LonkSubscriber from "../../api/lonk";
import { App } from "antd";
import FpClient from "../../api/fp/chrisapi.ts";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { PageSection } from "@patternfly/react-core";
import PacsView from "./PacsView.tsx";
import PacsLoadingScreen from "./components/PacsLoadingScreen.tsx";
import ErrorScreen from "./components/ErrorScreen.tsx";
import { skipToken, useQueries, useQuery } from "@tanstack/react-query";
import joinStates, { SeriesQueryZip } from "./joinStates.ts";
import { IPacsState, StudyKey } from "./types.ts";
import { DEFAULT_PREFERENCES } from "./defaultPreferences.ts";
import { zipPacsNameAndSeriesUids } from "./helpers.ts";

type PacsControllerProps = {
  getPfdcmClient: () => PfdcmClient;
  getChrisClient: () => Client;
};

/**
 * ChRIS_ui PACS Query and Retrieve controller + view.
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
  const fpClient = React.useMemo(
    () => new FpClient(chrisClient),
    [chrisClient],
  );

  // ========================================
  // STATE
  // ========================================

  const [{ service, query }, setPacsQuery] = React.useState<{
    service?: string;
    query?: PACSqueryCore;
  }>({});
  const [wsError, setWsError] = React.useState<Error | null>(null);

  // TODO create a settings component for changing preferences
  const [preferences, setPreferences] = React.useState(DEFAULT_PREFERENCES);

  const [expandedStudies, setExpandedStudies] = React.useState<
    ReadonlyArray<StudyKey>
  >([]);

  // ========================================
  // QUERIES AND DATA
  // ========================================

  const pfdcmServices = useQuery({
    queryKey: ["pfdcmServices"],
    queryFn: () => pfdcmClient.getPacsServices(),
  });

  const pfdcmStudiesQueryKey = React.useMemo(
    () => ["pfdcmStudies", service, query],
    [service, query],
  );
  const pfdcmStudies = useQuery({
    queryKey: pfdcmStudiesQueryKey,
    queryFn:
      service && query ? () => pfdcmClient.query(service, query) : skipToken,
  });
  const expandedSeries = React.useMemo(
    () => zipPacsNameAndSeriesUids(expandedStudies, pfdcmStudies.data),
    [expandedStudies, pfdcmStudies.data],
  );

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

  const cubeSeriesQueryZip: ReadonlyArray<SeriesQueryZip> = React.useMemo(
    () =>
      expandedSeries.map((search, i) => ({
        search,
        result: cubeSeriesQuery[i],
      })),
    [expandedSeries, cubeSeriesQuery],
  );

  const studies = React.useMemo(() => {
    if (!pfdcmStudies.data) {
      return null;
    }
    return joinStates(pfdcmStudies.data, cubeSeriesQueryZip);
  }, [joinStates, pfdcmStudies]);

  const state: IPacsState = React.useMemo(() => {
    return { preferences, studies };
  }, [preferences, studies]);

  const error = React.useMemo(
    () => wsError || pfdcmServices.error,
    [wsError, pfdcmServices.error],
  );

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
      console.log(`onStudyExpand`);
      setExpandedStudies(
        StudyInstanceUIDs.map((StudyInstanceUID) => ({
          StudyInstanceUID,
          pacs_name,
        })),
      );
    },
    [setExpandedStudies],
  );

  // TODO onRetrieve
  const onRetrieve = React.useCallback(
    (service: string, query: PACSqueryCore) => {
      console.log(`onRetrieve`);
    },
    [],
  );

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

  // Connect to PACS progress websocket and respond to updates.
  React.useEffect(() => {
    let subscriber: LonkSubscriber | null = null;
    const connectWsPipeline = pipe(
      fpClient.connectPacsNotifications(),
      TE.mapLeft(setWsError),
      TE.map((s) => (subscriber = s)),
      TE.map((s) => {
        s.onclose = () =>
          message.error(<>WebSocket closed, please refresh the page.</>);
        s.init({
          // TODO
          onError: () => {},
          onDone: () => {},
          onProgress: () => {},
        });
      }),
    );
    connectWsPipeline();
    return () => subscriber?.close();
  }, [fpClient, setWsError, message]);

  // ========================================
  // RENDER
  // ========================================

  return (
    <PageSection>
      {error ? (
        <ErrorScreen>{error.message}</ErrorScreen>
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
