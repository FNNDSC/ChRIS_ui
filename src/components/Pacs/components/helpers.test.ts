import { describe, it, vi, expect } from "vitest";
import { createSearchParams, type URLSearchParamsInit } from "react-router-dom";
import { useBooleanSearchParam } from "./helpers.ts";

describe("useBooleanSearchParam", () => {
  it("should default to false", () => {
    const searchParams = createSearchParams();
    const setSearchParams = vi.fn();
    const [bool, _setBool] = useBooleanSearchParam(
      [searchParams, setSearchParams],
      "keyName",
    );
    expect(bool).toBe(false);
  });

  it('should load "y" value from search params', () => {
    const searchParams = createSearchParams({ keyName: "y" });
    const setSearchParams = vi.fn();
    const [bool, _setBool] = useBooleanSearchParam(
      [searchParams, setSearchParams],
      "keyName",
    );
    expect(bool).toBe(true);
  });

  it.each(
    (<URLSearchParamsInit[]>[
      {},
      { keyName: "y" },
      { keyName: "n" },
      { keyName: "y", otherKey: "ok" },
      { keyName: "n", otherKey: "ok" },
    ]).map(createSearchParams),
  )("should set keyName=y (given %o)", (given) => {
    const searchParams = createSearchParams();
    const setSearchParams = vi.fn();
    const [_bool, setBool] = useBooleanSearchParam(
      [searchParams, setSearchParams],
      "keyName",
    );
    setBool(true);
    expect(setSearchParams).toHaveBeenCalledOnce();
    const setter = setSearchParams.mock.lastCall?.[0];
    expect(typeof setter).toBe("function");
    const result = setter(given);
    expect(result.get("keyName")).toBe("y");
    expect(result.get("otherKey")).toBe(given.get("otherKey"));
  });

  it.each(
    (<URLSearchParamsInit[]>[
      {},
      { keyName: "y" },
      { keyName: "n" },
      { keyName: "y", otherKey: "ok" },
      { keyName: "n", otherKey: "ok" },
    ]).map(createSearchParams),
  )("should delete keyName from searchParams", (given) => {
    const searchParams = createSearchParams();
    const setSearchParams = vi.fn();
    const [_bool, setBool] = useBooleanSearchParam(
      [searchParams, setSearchParams],
      "keyName",
    );
    setBool(false);
    expect(setSearchParams).toHaveBeenCalledOnce();
    const setter = setSearchParams.mock.lastCall?.[0];
    expect(typeof setter).toBe("function");
    const result = setter(given);
    expect(result.get("keyName")).toBeFalsy();
    expect(result.get("otherKey")).toBe(given.get("otherKey"));
  });
});
