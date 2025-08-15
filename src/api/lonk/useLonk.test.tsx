import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { ReadyState } from "react-use-websocket";
import { expect, test, vi } from "vitest";
import { createMockCubePacsWs } from "../testHelpers.ts";
import useLonk, { type UseLonkParams } from "./useLonk.ts";

type TestLonkComponentProps = UseLonkParams;

const TestLonkComponent: React.FC<TestLonkComponentProps> = ({ ...props }) => {
  const lonk = useLonk({ ...props });
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
    [
      lonk.subscribe,
      pacs_name,
      SeriesInstanceUID,
      setSubscribedPacsName,
      setSubscribedSeriesUid,
    ],
  );
  const unsubscribe = React.useCallback(async () => {
    await lonk.unsubscribeAll();
    setUnsubscribed("true");
  }, [lonk.unsubscribeAll, setUnsubscribed]);
  return (
    <>
      <div data-testid="readyState">{""}</div>
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
      <button type="button" data-testid="unsubscribe" onClick={unsubscribe}>
        unsubscribe
      </button>
      <div data-testid="unsubscribed">{unsubscribed}</div>
    </>
  );
};

test("LonkSubscriber", async () => {
  /*
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
  */
});
