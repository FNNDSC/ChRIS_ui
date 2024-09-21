import { test, expect, vi } from "vitest";
import LonkClient, { LonkHandlers } from "./client.ts";
import WS from "vitest-websocket-mock";

test("LonkClient", async () => {
  const handlers: LonkHandlers = {
    onDone: vi.fn(),
    onProgress: vi.fn(),
    onError: vi.fn(),
  };
  const [server, client] = await createMockubeWs(32585);
  client.init(handlers);

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

  await Promise.all([
    subscriptionReceiveAndRespond(),
    client.subscribe(pacs_name, SeriesInstanceUID),
  ]);

  server.send({
    pacs_name,
    SeriesInstanceUID,
    message: {
      ndicom: 48,
    },
  });
  expect(handlers.onProgress).toHaveBeenCalledOnce();
  expect(handlers.onProgress).toHaveBeenLastCalledWith(
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
  expect(handlers.onProgress).toHaveBeenCalledTimes(2);
  expect(handlers.onProgress).toHaveBeenLastCalledWith(
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
  expect(handlers.onError).toHaveBeenCalledOnce();
  expect(handlers.onError).toHaveBeenLastCalledWith(
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
  expect(handlers.onDone).toHaveBeenCalledOnce();
  expect(handlers.onDone).toHaveBeenLastCalledWith(
    pacs_name,
    SeriesInstanceUID,
  );

  const unsub = client.unsubscribeAll();
  await expect(server).toReceiveMessage({
    action: "unsubscribe",
  });
  server.send({ message: { subscribed: false } });
  await unsub;
});

/**
 * Create a mock WebSockets server and client.
 */
async function createMockubeWs(port: number): Promise<[WS, LonkClient]> {
  const url = `ws://localhost:${port}`;
  const server = new WS(url, { jsonProtocol: true });
  const ws = new WebSocket(url);
  const client = new LonkClient(ws);

  let callback: null | (([server, client]: [WS, LonkClient]) => void) = null;
  const promise: Promise<[WS, LonkClient]> = new Promise((resolve) => {
    callback = resolve;
  });
  ws.onopen = () => callback && callback([server, client]);
  return promise;
}
