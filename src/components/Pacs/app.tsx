/**
 * The primary PACS Q/R UI code is found in ./pacs.tsx. This file defines a
 * component which wraps the default export from ./pacs.tsx, bootstrapping
 * the client objects it needs e.g.
 *
 * 1. Making an initial connection to PFDCM
 * 2. Connecting to the PACS receive progress WebSocket, `api/v1/pacs/ws/`
 *
 * During bootstrapping, a loading screen is shown.
 * If bootstrapping fails, an error screen is shown.
 */

import React from "react";
import { PfdcmClient } from "../../api/pfdcm";
import Client from "@fnndsc/chrisapi";
import LonkClient from "../../api/lonk";
import { App, Typography } from "antd";
import FpClient from "../../api/fp/chrisapi.ts";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { PageSection } from "@patternfly/react-core";
import PacsQR from "./pacs.tsx";
import PacsLoadingScreen from "./components/loading.tsx";
import ErrorScreen from "./components/ErrorScreen.tsx";
import { ReadonlyNonEmptyArray } from "fp-ts/ReadonlyNonEmptyArray";

/**
 * A title and paragraph.
 */
const ErrorNotificationBody: React.FC<
  React.PropsWithChildren<{ title: string }>
> = ({ title, children }) => (
  <Typography>
    <Typography.Title>{title}</Typography.Title>
    <Typography.Paragraph>{children}</Typography.Paragraph>
  </Typography>
);

/**
 * ChRIS_ui PACS Query and Retrieve application.
 */
const PacsQRApp: React.FC<{
  getPfdcmClient: () => PfdcmClient;
  getChrisClient: () => Client;
}> = ({ getChrisClient, getPfdcmClient }) => {
  /**
   * List of PACS server names which can be queried.
   */
  const [services, setServices] =
    React.useState<ReadonlyNonEmptyArray<string> | null>(null);
  const [lonkClient, setLonkClient] = React.useState<LonkClient | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const { notification } = App.useApp();

  /**
   * Show a notification for an error message.
   */
  const pushError = React.useMemo(() => {
    return (title: string) => {
      return (e: Error) => {
        notification.error({
          message: (
            <ErrorNotificationBody title={title}>
              {e.message}
            </ErrorNotificationBody>
          ),
        });
      };
    };
  }, [notification]);

  /**
   * Show an error screen with the error's message.
   *
   * Used to handle errors during necessary bootstrapping.
   */
  const failWithError = TE.mapLeft((e: Error) => setError(e.message));

  const pfdcmClient = React.useMemo(getPfdcmClient, [getPfdcmClient]);
  const chrisClient = React.useMemo(getChrisClient, [getChrisClient]);
  const fpClient = React.useMemo(
    () => new FpClient(chrisClient),
    [chrisClient],
  );

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
  }, [pfdcmClient, pushError]);

  React.useEffect(() => {
    let lonkClientRef: LonkClient | null = null;
    const connectWsPipeline = pipe(
      fpClient.connectPacsNotifications(),
      failWithError,
      TE.map((client) => (lonkClientRef = client)),
      TE.map((client) => {
        client.onclose = () =>
          setError("WebSocket closed, please refresh the page.");
        return client;
      }),
      TE.map(setLonkClient),
    );
    connectWsPipeline();

    return () => lonkClientRef?.close();
  }, [fpClient, pushError]);

  return (
    <PageSection>
      {error !== null ? (
        <ErrorScreen>{error}</ErrorScreen>
      ) : services && lonkClient ? (
        <PacsQR
          lonkClient={lonkClient}
          fpClient={fpClient}
          services={services}
          pushError={pushError}
        />
      ) : (
        <PacsLoadingScreen />
      )}
    </PageSection>
  );
};

export default PacsQRApp;
