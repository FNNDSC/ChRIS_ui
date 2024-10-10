import { test, expect, vi } from "vitest";
import React from "react";
import terribleStrictModeWorkaround from "./terribleStrictModeWorkaround.ts";
import { render, screen } from "@testing-library/react";

type ExampleProps<T> = {
  obj: T;
  callback: (calledBefore: boolean) => void;
};

const ExampleComponent = <T,>({ obj, callback }: ExampleProps<T>) => {
  const workaroundFn = terribleStrictModeWorkaround<T>();
  const [state, setState] = React.useState<ReadonlyArray<T>>([]);
  React.useEffect(() => {
    state.forEach((s) => callback(workaroundFn(s)));
  }, [state]);
  return <button onClick={() => setState([obj])}>click me</button>;
};

test("terribleStrictModeWorkaround", async () => {
  const callback = vi.fn();
  render(<ExampleComponent obj={{}} callback={callback} />);
  expect(callback).not.toHaveBeenCalled();
  screen.getByText("click me").click();
  await expect.poll(() => callback).toHaveBeenCalledOnce();
  expect(callback).toHaveBeenLastCalledWith(true);
  screen.getByText("click me").click();
  await expect.poll(() => callback).toHaveBeenCalledTimes(2);
  expect(callback).toHaveBeenLastCalledWith(false);
});
