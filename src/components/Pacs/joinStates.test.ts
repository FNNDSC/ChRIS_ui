import { expect, test } from "vitest";
import { pullStateOf } from "./mergeStates.ts";
import {
  DEFAULT_RECEIVE_STATE,
  RequestState,
  SeriesPullState,
  SeriesReceiveState,
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
