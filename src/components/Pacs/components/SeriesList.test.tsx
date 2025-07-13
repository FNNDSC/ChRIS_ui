import { expect, test, vi } from "vitest";
import { SeriesPullState } from "../types.ts";
import { render, screen } from "@testing-library/react";
import REMIND_STUDIES from "./testData/remind.ts";
import SeriesList from "./SeriesList.tsx";

test.skip("DICOM series should be ready and then fire onRetrieve when clicked", async () => {
  const onRetrieve = vi.fn();
  const states = REMIND_STUDIES[0].series.map((info) => ({
    info,
    errors: [],
    inCube: null,
    pullState: SeriesPullState.READY,
    receivedCount: 0,
  }));
  render(<SeriesList states={states} onRetrieve={onRetrieve} />);
  const buttons = screen.getAllByRole("button");
  const thirdButton = buttons[2];
  thirdButton.click();
  await expect.poll(() => onRetrieve).toHaveBeenCalledOnce();
  expect(onRetrieve).toHaveBeenCalledWith(states[2]);
});
