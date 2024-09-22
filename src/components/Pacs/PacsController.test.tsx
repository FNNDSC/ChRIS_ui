import { cleanup, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import PacsQRApp from "./PacsController.tsx";
import * as TE from "fp-ts/TaskEither";
import { Configuration as PfdcmConfig, PfdcmClient } from "../../api/pfdcm";
import ChrisClient, { DownloadToken } from "@fnndsc/chrisapi";
import WS from "vitest-websocket-mock";
import { renderWithProviders } from "../../store/testHelpers.tsx";

test("PACS Q/R page can bootstrap", async () => {
  const pfdcmClient = createPfdcmMock(TE.right(["BCH", "MGH", "BWH"]));
  const [chrisClient, ws] = createWorkingMockPacsWs(32584);

  const getClientMocks = {
    getChrisClient: vi.fn(() => chrisClient),
    getPfdcmClient: vi.fn(() => pfdcmClient),
  };
  renderWithProviders(<PacsQRApp {...getClientMocks} />);

  await ws.connected;

  await expect
    .poll(() => screen.getByPlaceholderText("Search for DICOM studies by MRN"))
    .toBeInTheDocument();

  // First PACS service (besides 'default') should be automatically selected.
  expect(screen.getByTitle("PACS service")).toHaveTextContent("BCH");

  // component should close WebSocket connection when unmounted
  cleanup();
  await ws.closed;
});

test("Shows error screen if PFDCM is offline", async () => {
  const pfdcmClient = createPfdcmMock(
    TE.left(new Error("I am an expected error")),
  );
  const [chrisClient, _ws] = createWorkingMockPacsWs(32583);

  const getClientMocks = {
    getChrisClient: vi.fn(() => chrisClient),
    getPfdcmClient: vi.fn(() => pfdcmClient),
  };
  renderWithProviders(<PacsQRApp {...getClientMocks} />);

  await expect
    .poll(() => screen.getByText("I am an expected error"))
    .toBeInTheDocument();
  expect(
    screen.getByText(/PACS Q\/R application is currently unavailable/),
  ).toBeInTheDocument();
});

function createWorkingMockPacsWs(
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

function createPfdcmMock(
  servicesReturn: ReturnType<PfdcmClient["getPacsServices"]>,
) {
  const pfdcmConfig = new PfdcmConfig({ basePath: "https://example.com" });
  const pfdcmClient = new PfdcmClient(pfdcmConfig);
  pfdcmClient.getPacsServices = vi.fn(() => servicesReturn);
  return pfdcmClient;
}
