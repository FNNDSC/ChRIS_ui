import { describe, expect, it, test, vi } from "vitest";
import { PacsSeriesState, PacsStudyState, SeriesPullState } from "../types";
import { DAI_SERIES, DAI_STUDY } from "./testData/dai.ts";
import { render, screen } from "@testing-library/react";
import PacsStudiesView from "./PacsStudiesView.tsx";
import { DEFAULT_PREFERENCES } from "../defaultPreferences.ts";
import REMIND_STUDIES from "./testData/remind.ts";

test("First study should be expanded if there is only one study", async () => {
  const studies: PacsStudyState[] = [
    {
      info: DAI_STUDY,
      series: [
        {
          errors: [],
          info: DAI_SERIES,
          receivedCount: 0,
          inCube: null,
          pullState: SeriesPullState.NOT_CHECKED,
        },
      ],
    },
  ];
  const onRetrieve = vi.fn();
  const onStudyExpand = vi.fn();

  render(
    <PacsStudiesView
      preferences={DEFAULT_PREFERENCES}
      studies={studies}
      onRetrieve={onRetrieve}
      expandedStudyUids={[]}
      onStudyExpand={onStudyExpand}
    />,
  );
  expect(onStudyExpand).toHaveBeenCalledOnce();
  expect(onStudyExpand.mock.lastCall?.[0]).toStrictEqual([
    studies[0].info.StudyInstanceUID,
  ]);
});

describe("'Pull Study' button", () => {
  it.skip("should be clickable if not expanded, and should call both `onRetrieve` and `onStudyExpand` when clicked", async () => {
    const studies: PacsStudyState[] = remindStartingState();
    // Start off with the first study expanded and all of their series
    // pending check for existence in CUBE.
    const initiallyExpandedStudyUids = [studies[0].info.StudyInstanceUID];
    studies[0].series = studies[0].series.map((state) => ({
      ...state,
      pullState: SeriesPullState.CHECKING,
    }));
    const onRetrieve = vi.fn();
    const onStudyExpand = vi.fn();
    render(
      <PacsStudiesView
        preferences={DEFAULT_PREFERENCES}
        studies={studies}
        expandedStudyUids={initiallyExpandedStudyUids}
        onStudyExpand={onStudyExpand}
        onRetrieve={onRetrieve}
      />,
    );
    const pullStudyButtons = screen.getAllByTitle("Pull study");
    expect(pullStudyButtons).toHaveLength(studies.length);
    const loadingIcons = screen.getAllByLabelText("loading");
    expect(
      // First "Pull Study" button should contain a loading indicator,
      // because its series are currently `SeriesPullState.CHECKING`
      loadingIcons.find((ele) => pullStudyButtons[0].contains(ele)),
    ).toBeTruthy();
    expect(
      // Second "Pull Study" button should not contain a loading indicator,
      // because it is not expanded.
      loadingIcons.find((ele) => pullStudyButtons[1].contains(ele)),
    ).toBeUndefined();
    pullStudyButtons[1].click();
    await expect.poll(() => onRetrieve).toHaveBeenCalledOnce();
    expect(onRetrieve).toHaveBeenCalledWith({
      patientID: studies[1].info.PatientID,
      studyInstanceUID: studies[1].info.StudyInstanceUID,
    });
    await expect.poll(() => onStudyExpand).toHaveBeenCalledOnce();
    expect(onStudyExpand).toHaveBeenCalledWith(
      initiallyExpandedStudyUids.concat([studies[1].info.StudyInstanceUID]),
    );
  });

  it.skip.each([
    [
      {
        pullState: SeriesPullState.CHECKING,
      },
    ],
    [
      {
        pullState: SeriesPullState.WAITING_OR_COMPLETE,
        inCube: null,
      },
    ],
    [
      {
        pullState: SeriesPullState.PULLING,
      },
    ],
    [
      {
        pullState: SeriesPullState.CHECKING,
      },
    ],
  ])(
    "should be loading when any series has partial state %o",
    async (state: Partial<Pick<PacsSeriesState, "pullState" | "inCube">>) => {
      const studies = remindStartingState();
      studies[0].series[2] = { ...studies[0].series[2], ...state };
      const onRetrieve = vi.fn();
      render(
        <PacsStudiesView
          preferences={DEFAULT_PREFERENCES}
          studies={studies}
          onRetrieve={onRetrieve}
          expandedStudyUids={[studies[0].info.StudyInstanceUID]}
          onStudyExpand={vi.fn()}
        />,
      );
      const pullStudyButtons = screen.getAllByTitle("Pull study");
      const pullStudyButton = pullStudyButtons[0];
      const loadingIcons = screen.getAllByLabelText("loading");
      expect(
        // First "Pull Study" button should contain a loading indicator,
        loadingIcons.find((ele) => pullStudyButton.contains(ele)),
      ).toBeTruthy();
    },
  );
});

function remindStartingState(): PacsStudyState[] {
  return REMIND_STUDIES.map(({ study, series }) => ({
    info: study,
    series: series.map((info) => ({
      info,
      errors: [],
      receivedCount: 0,
      pullState: SeriesPullState.NOT_CHECKED,
      inCube: null,
    })),
  }));
}
