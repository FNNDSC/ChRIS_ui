import { test, expect, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import Client from "@fnndsc/chrisapi";
import useLonk, { getWebsocketUrl, UseLonkParams } from "./useLonk.ts";
import { createMockCubePacsWs } from "../testHelpers.ts";
import { ReadyState } from "react-use-websocket";

type TestLonkComponentProps = Omit<UseLonkParams, "client"> & {
  getClient: () => Client;
};

const TestLonkComponent: React.FC<TestLonkComponentProps> = ({
  getClient,
  ...props
}) => {
  const client = React.useMemo(() => getClient(), [getClient]);
  const lonk = useLonk({ client, ...props });
  const [pacs_name, setPacsName] = React.useState("");
  const [SeriesInstanceUID, setSeriesInstanceUID] = React.useState("");
  const [subscribedPacsName, setSubscribedPacsName] = React.useState("");
  const [subscribedSeriesUid, setSubscribedSeriesUid] = React.useState("");
  const [unsubscribed, setUnsubscribed] = React.useState("false");
  const onSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const result = await lonk.subscribe(pacs_name, SeriesInstanceUID);
      setSubscribedPacsName(result.pacs_name);
      setSubscribedSeriesUid(result.SeriesInstanceUID);
    },
    [lonk.subscribe, setSubscribedPacsName, setSubscribedSeriesUid],
  );
  const unsubscribe = React.useCallback(async () => {
    await lonk.unsubscribeAll();
    setUnsubscribed("true");
  }, [lonk.unsubscribeAll, setUnsubscribed]);
  return (
    <>
      <div data-testid="readyState">{lonk.readyState}</div>
      <form data-testid="subscribe" onSubmit={onSubmit}>
        <input
          data-testid="pacs_name"
          type="text"
          value={pacs_name}
          onChange={(e) => setPacsName(e.target.value)}
        />
        <input
          data-testid="SeriesInstanceUID"
          type="text"
          value={SeriesInstanceUID}
          onChange={(e) => setSeriesInstanceUID(e.target.value)}
        />
        <button data-testid="subscribe-button" type="submit">
          subscribe
        </button>
      </form>
      <div data-testid="subscribed-pacs_name">{subscribedPacsName}</div>
      <div data-testid="subscribed-SeriesInstanceUID">
        {subscribedSeriesUid}
      </div>
      <button data-testid="unsubscribe" onClick={unsubscribe}>
        unsubscribe
      </button>
      <div data-testid="unsubscribed">{unsubscribed}</div>
    </>
  );
};

test("LonkSubscriber", async () => {
  const [client, server] = createMockCubePacsWs(32525);
  const props = {
    getClient: vi.fn(() => client),
    onDone: vi.fn(),
    onProgress: vi.fn(),
    onError: vi.fn(),
    onMessageError: vi.fn(),
  };
  render(<TestLonkComponent {...props} />);
  await server.connected;
  expect(screen.getByTestId("readyState")).toHaveTextContent(
    "" + ReadyState.OPEN,
  );

  const SeriesInstanceUID = "1.234.56789";
  const pacs_name = "MyPACS";

  const subscriptionReceiveAndRespond = async () => {
    await expect(server).toReceiveMessage({
      pacs_name,
      SeriesInstanceUID,
      action: "subscribe",
    });
    server.send({
      pacs_name,
      SeriesInstanceUID,
      message: { subscribed: true },
    });
  };

  const subscriptionPromise = subscriptionReceiveAndRespond();
  const pacsNameInput = screen.getByTestId("pacs_name");
  const seriesUidInput = screen.getByTestId("SeriesInstanceUID");
  const subscribeForm = screen.getByTestId("subscribe");
  fireEvent.change(pacsNameInput, { target: { value: pacs_name } });
  fireEvent.change(seriesUidInput, { target: { value: SeriesInstanceUID } });
  fireEvent.submit(subscribeForm);
  await subscriptionPromise;
  await expect
    .poll(() => screen.getByTestId("subscribed-pacs_name"))
    .toHaveTextContent(pacs_name);
  await expect
    .poll(() => screen.getByTestId("subscribed-SeriesInstanceUID"))
    .toHaveTextContent(SeriesInstanceUID);

  server.send({
    pacs_name,
    SeriesInstanceUID,
    message: {
      ndicom: 48,
    },
  });
  expect(props.onProgress).toHaveBeenCalledOnce();
  expect(props.onProgress).toHaveBeenLastCalledWith(
    pacs_name,
    SeriesInstanceUID,
    48,
  );

  server.send({
    pacs_name,
    SeriesInstanceUID,
    message: {
      ndicom: 88,
    },
  });
  expect(props.onProgress).toHaveBeenCalledTimes(2);
  expect(props.onProgress).toHaveBeenLastCalledWith(
    pacs_name,
    SeriesInstanceUID,
    88,
  );

  server.send({
    pacs_name,
    SeriesInstanceUID,
    message: {
      error: "stuck in chimney",
    },
  });
  expect(props.onError).toHaveBeenCalledOnce();
  expect(props.onError).toHaveBeenLastCalledWith(
    pacs_name,
    SeriesInstanceUID,
    "stuck in chimney",
  );

  server.send({
    pacs_name,
    SeriesInstanceUID,
    message: {
      done: true,
    },
  });
  expect(props.onDone).toHaveBeenCalledOnce();
  expect(props.onDone).toHaveBeenLastCalledWith(pacs_name, SeriesInstanceUID);

  const bogusData = { bogus: "data" };
  server.send(bogusData);
  expect(props.onMessageError).toHaveBeenCalledOnce();
  expect(props.onMessageError).toHaveBeenCalledWith(
    JSON.stringify(bogusData),
    `Missing or invalid 'message' in ${JSON.stringify(bogusData)}`,
  );

  fireEvent.click(screen.getByTestId("unsubscribe"));
  await expect(server).toReceiveMessage({
    action: "unsubscribe",
  });
  server.send({ message: { subscribed: false } });
  await expect
    .poll(() => screen.getByTestId("unsubscribed"))
    .toHaveTextContent("true");
  cleanup();
  await server.closed;
});

test.each([
  [
    {
      url: "http://example.com/api/v1/downloadtokens/9/",
      auth: {
        token: "fakeauthtoken",
      },
      contentType: "application/vnd.collection+json",
      data: {
        id: 9,
        creation_date: "2024-08-27T17:17:28.580683-04:00",
        token: "nota.real.jwttoken",
        owner_username: "chris",
      },
    },
    "ws://example.com/api/v1/pacs/ws/?token=nota.real.jwttoken",
  ],
  [
    {
      url: "https://example.com/api/v1/downloadtokens/9/",
      auth: {
        token: "fakeauthtoken",
      },
      contentType: "application/vnd.collection+json",
      data: {
        id: 9,
        creation_date: "2024-08-27T17:17:28.580683-04:00",
        token: "stillnota.real.jwttoken",
        owner_username: "chris",
      },
    },
    "wss://example.com/api/v1/pacs/ws/?token=stillnota.real.jwttoken",
  ],
])("getWebsocketUrl(%o, %s) -> %s", (downloadTokenResponse, expected) => {
  // @ts-ignore
  let actual = getWebsocketUrl(downloadTokenResponse);
  expect(actual).toBe(expected);
});
