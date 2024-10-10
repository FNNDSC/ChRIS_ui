import { expect, test } from "vitest";
import {
  createCubeSeriesQueryUidMap,
  pullStateOf,
  type UseQueryResultLike,
} from "./mergeStates.ts";
import {
  DEFAULT_RECEIVE_STATE,
  RequestState,
  type SeriesKey,
  SeriesNotRegisteredError,
  SeriesPullState,
  type SeriesReceiveState,
} from "./types.ts";

test.each(<
  [
    SeriesReceiveState,
    RequestState | undefined,
    { isLoading: boolean; data: any } | undefined,
    SeriesPullState,
    string,
  ][]
>[
  [
    DEFAULT_RECEIVE_STATE,
    undefined,
    undefined,
    SeriesPullState.NOT_CHECKED,
    "base case",
  ],
  [
    {
      subscribed: true,
      done: false,
      receivedCount: 0,
      errors: [],
    },
    undefined,
    undefined,
    SeriesPullState.NOT_CHECKED,
    "subscribed, but have not checked whether series exists in CUBE",
  ],
  [
    {
      subscribed: true,
      done: false,
      receivedCount: 0,
      errors: [],
    },
    undefined,
    {
      isLoading: true,
      data: undefined,
    },
    SeriesPullState.CHECKING,
    "pending check on series' existence in CUBE",
  ],
  [
    {
      subscribed: false,
      done: false,
      receivedCount: 0,
      errors: [],
    },
    undefined,
    {
      isLoading: false,
      data: null,
    },
    SeriesPullState.CHECKING,
    "checked and does not exist in CUBE, but not yet subscribed",
  ],
  [
    {
      subscribed: true,
      done: false,
      receivedCount: 0,
      errors: [],
    },
    undefined,
    {
      isLoading: false,
      data: null,
    },
    SeriesPullState.READY,
    "subscribed and ready to pull",
  ],
  [
    {
      subscribed: true,
      done: false,
      receivedCount: 0,
      errors: [],
    },
    RequestState.NOT_REQUESTED,
    {
      isLoading: false,
      data: null,
    },
    SeriesPullState.PULLING,
    "user clicked a button to retrieve",
  ],
  [
    {
      subscribed: true,
      done: false,
      receivedCount: 20,
      errors: [],
    },
    RequestState.REQUESTED,
    {
      isLoading: false,
      data: null,
    },
    SeriesPullState.PULLING,
    "pulling, some files received",
  ],
  [
    {
      subscribed: true,
      done: true,
      receivedCount: 10,
      errors: [],
    },
    RequestState.REQUESTED,
    {
      isLoading: false,
      data: null,
    },
    SeriesPullState.WAITING_OR_COMPLETE,
    "pulled, not yet registered by CUBE",
  ],
  [
    {
      subscribed: true,
      done: true,
      receivedCount: 10,
      errors: [],
    },
    RequestState.REQUESTED,
    {
      isLoading: false,
      data: "some",
    },
    SeriesPullState.WAITING_OR_COMPLETE,
    "pulled and in CUBE",
  ],
])(
  "pullStateOf(%o, %o, %o) -> %o  // %s",
  (state, pacsRequest, result, expected) => {
    const actual = pullStateOf(state, pacsRequest, result);
    expect(actual).toStrictEqual(expected);
  },
);

test("createCubeSeriesQueryUidMap", () => {
  const params: ReadonlyArray<SeriesKey> = [
    { pacs_name: "MyPACS", SeriesInstanceUID: "1.2.345" },
    { pacs_name: "MyPACS", SeriesInstanceUID: "1.2.678" },
    { pacs_name: "MyPACS", SeriesInstanceUID: "1.2.910" },
    { pacs_name: "MyPACS", SeriesInstanceUID: "1.2.123" },
  ];
  const queries: ReadonlyArray<UseQueryResultLike> = [
    {
      isError: false,
      error: null,
    },
    {
      isError: true,
      error: new Error("i am some other error"),
    },
    {
      isError: true,
      error: new SeriesNotRegisteredError("MyPACS", "1.2.910"),
    },
    {
      isError: false,
      error: null,
    },
  ];
  const actual = createCubeSeriesQueryUidMap(params, queries);
  expect(actual.get(params[0].SeriesInstanceUID)).toBe(queries[0]);
  expect(actual.get(params[1].SeriesInstanceUID)).toBe(queries[1]);
  expect(actual.get(params[3].SeriesInstanceUID)).toBe(queries[3]);
  expect(actual.size).toBe(3);
  expect(actual.values()).not.toContain(queries[2]);
});
