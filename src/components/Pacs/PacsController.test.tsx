import { cleanup, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import PacsQRApp from "./PacsController.tsx";
import { Configuration as PfdcmConfig, PfdcmClient } from "../../api/pfdcm";
import { renderWithProviders } from "../../store/testHelpers.tsx";
import { createMockCubePacsWs } from "../../api/testHelpers.ts";

test("PACS Q/R page can bootstrap", async () => {
  const pfdcmClient = createPfdcmMock(async () => ["BCH", "MGH", "BWH"]);
  const [chrisClient, ws] = createMockCubePacsWs(32584);

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
});

test("Shows error screen if PFDCM is offline", async () => {
  const pfdcmClient = createPfdcmMock(async () => {
    throw new Error("I am an expected error");
  });
  const [chrisClient, _ws] = createMockCubePacsWs(32583);

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

function createPfdcmMock(getPacsServices: PfdcmClient["getPacsServices"]) {
  const pfdcmConfig = new PfdcmConfig({ basePath: "https://example.com" });
  const pfdcmClient = new PfdcmClient(pfdcmConfig);
  pfdcmClient.getPacsServices = vi.fn(getPacsServices);
  return pfdcmClient;
}
