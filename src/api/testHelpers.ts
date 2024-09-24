import { vi } from "vitest";
import ChrisClient, { DownloadToken } from "@fnndsc/chrisapi";
import WS from "vitest-websocket-mock";

/**
 * Helper function for mocking LONK-WS.
 */
function createMockCubePacsWs(
  port: number,
  id: number = 55,
): [ChrisClient, WS] {
  const fakeChrisHost = `localhost:${port}`;
  const fakeChrisUrl = `http://${fakeChrisHost}/api/v1/`;
  const fakeChrisAuth = { token: "12345" };
  vi.spyOn(DownloadToken.prototype, "data", "get").mockReturnValue({
    token: "abcdefgnotarealjwt",
  });
  const fakeDownloadToken = new DownloadToken(
    `${fakeChrisUrl}downloadtokens/${id}/`,
    fakeChrisAuth,
  );

  const client = new ChrisClient(fakeChrisUrl, fakeChrisAuth);
  client.createDownloadToken = vi.fn(async () => fakeDownloadToken);

  const ws = new WS(
    `ws://${fakeChrisHost}/api/v1/pacs/ws/?token=abcdefgnotarealjwt`,
    { jsonProtocol: true },
  );

  return [client, ws];
}

export { createMockCubePacsWs };
