/**
 * The primary PACS Q/R UI code is found in ./PacsView.tsx. This file defines
 * a component which wraps the default export from ./PacsView.tsx, which:
 *
 * 1. "bootstraps" the client objects it needs (see below)
 * 2. gets data from the Redux state and passes it to child components as props
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
import Client from "@fnndsc/chrisapi";
import LonkSubscriber from "../../api/lonk";
import { App } from "antd";
import FpClient from "../../api/fp/chrisapi.ts";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { PageSection } from "@patternfly/react-core";
import PacsView from "./PacsView.tsx";
import PacsLoadingScreen from "./components/PacsLoadingScreen.tsx";
import ErrorScreen from "./components/ErrorScreen.tsx";
import { ReadonlyNonEmptyArray } from "fp-ts/ReadonlyNonEmptyArray";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { StudyAndSeries } from "../../api/pfdcm/models.ts";
import { pacsSlice } from "../../store/pacs/pacsSlice.ts";
import { Either } from "fp-ts/Either";

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
  /**
   * List of PACS server names which can be queried.
   */
  const [services, setServices] =
    React.useState<ReadonlyNonEmptyArray<string> | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const { message } = App.useApp();

  const data = useAppSelector((state) => state.pacs);
  const dispatch = useAppDispatch();

  /**
   * Show an error screen with the error's message.
   *
   * Used to handle errors during necessary bootstrapping.
   */
  const failWithError = React.useMemo(
    () => TE.mapLeft((e: Error) => setError(e.message)),
    [setError],
  );

  const pfdcmClient = React.useMemo(getPfdcmClient, [getPfdcmClient]);
  const chrisClient = React.useMemo(getChrisClient, [getChrisClient]);
  const fpClient = React.useMemo(
    () => new FpClient(chrisClient),
    [chrisClient],
  );

  const setStudies = React.useMemo(
    () => (studies: Either<Error, ReadonlyArray<StudyAndSeries>>) => {
      dispatch(pacsSlice.actions.setStudies(studies));
    },
    [dispatch, pacsSlice],
  );

  /**
   * Set the "loading" state, then fetch the studies from PFDCM.
   */
  const onSubmit = React.useMemo(
    () => (service: string, query: PACSqueryCore) => {
      dispatch(pacsSlice.actions.setLoading());
      pfdcmClient.query(service, query)().then(setStudies);
    },
    [dispatch, pacsSlice, pfdcmClient, setStudies],
  );

  const onStudyExpand = (service: string, StudyInstanceUID: string) => {
    // TODO search for the study in CUBE
  };

  const onRetrieve = (service: string, query: PACSqueryCore) => {};

  React.useEffect(() => {
    document.title = "ChRIS PACS";
  }, []);

  React.useEffect(() => {
    const getServicesPipeline = pipe(
      pfdcmClient.getPacsServices(),
      failWithError,
      TE.map(setServices),
    );
    getServicesPipeline();
  }, [pfdcmClient, failWithError]);

  React.useEffect(() => {
    let subscriber: LonkSubscriber | null = null;
    const connectWsPipeline = pipe(
      fpClient.connectPacsNotifications(),
      failWithError,
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
  }, [fpClient, failWithError, message]);

  return (
    <PageSection>
      {error !== null ? (
        <ErrorScreen>{error}</ErrorScreen>
      ) : services ? (
        <PacsView
          services={services}
          data={data}
          onSubmit={onSubmit}
          onRetrieve={onRetrieve}
          onStudyExpand={onStudyExpand}
        />
      ) : (
        <PacsLoadingScreen />
      )}
    </PageSection>
  );
};

export type { PacsControllerProps };
export default PacsController;
