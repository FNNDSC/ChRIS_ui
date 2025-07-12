import { describe, it, expect, vi } from "vitest";
import SeriesRow, { type SeriesRowProps } from "./SeriesRow.tsx";
import { render, screen } from "@testing-library/react";
import { DAI_SERIES } from "./testData/dai.ts";
import { type PacsSeriesState, SeriesPullState } from "../types.ts";
import { PACSSeries } from "@fnndsc/chrisapi";

const DEFAULT_STATE: PacsSeriesState = {
  info: DAI_SERIES,
  errors: [],
  pullState: SeriesPullState.NOT_CHECKED,
  inCube: null,
  receivedCount: 0,
};

describe("'Pull Series' button", () => {
  it.skip.each([
    [
      {
        pullState: SeriesPullState.CHECKING,
      },
    ],
    [
      {
        pullState: SeriesPullState.PULLING,
      },
    ],
    [
      {
        pullState: SeriesPullState.WAITING_OR_COMPLETE,
        inCube: null,
      },
    ],
  ])(
    "should be loading",
    async (
      state: Partial<Omit<SeriesRowProps, "info" | "showUid" | "onRetrieve">>,
    ) => {
      const props = { ...DEFAULT_STATE, ...state };
      render(<SeriesRow {...props} />);
      const button = screen.getByRole("button");
      expect(button.getAttribute("color")).toBe("default");
      const loadingIcon = screen.getByLabelText("loading");
      expect(button.contains(loadingIcon)).toBe(true);
    },
  );

  it.skip("should be done pulling", async () => {
    const props = {
      ...DEFAULT_STATE,
      pullState: SeriesPullState.WAITING_OR_COMPLETE,
      inCube: new PACSSeries("https://example.com/api/v1/pacs/series/5/", {
        token: "abc123",
      }),
      receivedCount: DEFAULT_STATE.info
        .NumberOfSeriesRelatedInstances as number,
    };
    render(<SeriesRow {...props} />);
    const button = screen.getByRole("button");
    expect(button.getAttribute("color")).toBe("default");
  });

  it.skip("should be waiting at 99% while CUBE task to register the DICOM series is pending", async () => {
    const props = {
      ...DEFAULT_STATE,
      pullState: SeriesPullState.WAITING_OR_COMPLETE,
      inCube: null,
      receivedCount: DEFAULT_STATE.info
        .NumberOfSeriesRelatedInstances as number,
    };
    render(<SeriesRow {...props} />);
    const button = screen.getByRole("button");
    expect(button.getAttribute("color")).toBe("default");
    const loadingIcon = screen.getByLabelText("loading");
    expect(button.contains(loadingIcon)).toBe(true);
    expect(screen.getByText("99%")).toBeInTheDocument();
  });
});
