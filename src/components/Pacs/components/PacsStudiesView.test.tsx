import { describe, it, vi, expect } from "vitest";
import { PacsStudyState, SeriesPullState } from "../types";
import { DAI_SERIES, DAI_STUDY } from "./testData/dai.ts";
import { render } from "@testing-library/react";
import PacsStudiesView from "./PacsStudiesView.tsx";
import { DEFAULT_PREFERENCES } from "../defaultPreferences.ts";

describe("'Pull Study' button", () => {
  it("expands first study if there is only one study", async () => {
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
});
