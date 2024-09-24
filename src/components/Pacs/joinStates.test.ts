import { expect, test } from "vitest";
import { pullStateOf } from "./mergeStates.ts";
import {
  DEFAULT_RECEIVE_STATE,
  SeriesPullState,
  SeriesReceiveState,
} from "./types.ts";

test.each(<
  [
    SeriesReceiveState,
    { isLoading: boolean; data: any } | undefined,
    SeriesPullState,
  ][]
>[
  [DEFAULT_RECEIVE_STATE, undefined, SeriesPullState.NOT_CHECKED],
  [
    {
      subscribed: true,
      requested: false,
      done: false,
      receivedCount: 0,
      errors: [],
    },
    {
      isLoading: true,
      data: undefined,
    },
    SeriesPullState.CHECKING,
  ],
  [
    {
      subscribed: false,
      requested: false,
      done: false,
      receivedCount: 0,
      errors: [],
    },
    {
      isLoading: false,
      data: null,
    },
    SeriesPullState.CHECKING,
  ],
  [
    {
      subscribed: true,
      requested: false,
      done: false,
      receivedCount: 0,
      errors: [],
    },
    {
      isLoading: false,
      data: null,
    },
    SeriesPullState.READY,
  ],
  [
    {
      subscribed: true,
      requested: true,
      done: false,
      receivedCount: 0,
      errors: [],
    },
    {
      isLoading: false,
      data: null,
    },
    SeriesPullState.PULLING,
  ],
  [
    {
      subscribed: true,
      requested: true,
      done: true,
      receivedCount: 10,
      errors: [],
    },
    {
      isLoading: false,
      data: null,
    },
    SeriesPullState.WAITING_OR_COMPLETE,
  ],
  [
    {
      subscribed: true,
      requested: true,
      done: true,
      receivedCount: 10,
      errors: [],
    },
    {
      isLoading: false,
      data: "some",
    },
    SeriesPullState.WAITING_OR_COMPLETE,
  ],
])("pullStateOf(%o, %o) -> %o", (state, result, expected) => {
  const actual = pullStateOf(state, result);
  expect(actual).toStrictEqual(expected);
});
