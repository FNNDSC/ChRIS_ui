import { test, expect } from "vitest";
import { getWebsocketUrl } from "./chrisapi.ts";

test.each([
  [
    {
      url: "http://example.com/api/v1/downloadtokens/9/",
      auth: {
        token: "fakeauthtoken",
      },
      contentType: "application/vnd.collection+json",
      data: {
        id: 9,
        creation_date: "2024-08-27T17:17:28.580683-04:00",
        token: "nota.real.jwttoken",
        owner_username: "chris",
      },
    },
    "ws://example.com/api/v1/pacs/ws/?token=nota.real.jwttoken",
  ],
  [
    {
      url: "https://example.com/api/v1/downloadtokens/9/",
      auth: {
        token: "fakeauthtoken",
      },
      contentType: "application/vnd.collection+json",
      data: {
        id: 9,
        creation_date: "2024-08-27T17:17:28.580683-04:00",
        token: "stillnota.real.jwttoken",
        owner_username: "chris",
      },
    },
    "wss://example.com/api/v1/pacs/ws/?token=stillnota.real.jwttoken",
  ],
])("getWebsocketUrl(%o, %s) -> %s", (downloadTokenResponse, expected) => {
  // @ts-ignore
  let actual = getWebsocketUrl(downloadTokenResponse);
  expect(actual).toBe(expected);
});
