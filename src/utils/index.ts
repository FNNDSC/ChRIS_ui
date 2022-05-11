import * as React from "react";

export function useSafeDispatch(dispatch: any) {
  const mounted = React.useRef(false);
  React.useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  return React.useCallback(
    (...args) => (mounted.current ? dispatch(...args) : void 0),
    [dispatch]
  );
}

const defaultInitialState = {
  status: "idle",
  data: null,
  error: null,
};

function useAsync(initialState?: any) {
  const initialStateRef = React.useRef({
    ...defaultInitialState,
    initialState,
  });

  const [{ status, data, error }, setState] = React.useReducer(
    (s: any, a: any) => ({ ...s, ...a }),
    initialStateRef.current
  );

  const safeSetState = useSafeDispatch(setState);
  const setData = React.useCallback(
    (data) => safeSetState({ data, status: "resolved" }),
    [safeSetState]
  );
  const setError = React.useCallback(
    (error) => safeSetState({ error, status: "rejected" }),
    [safeSetState]
  );
  const reset = React.useCallback(
    () => safeSetState(initialStateRef.current),
    [safeSetState]
  );

  const run = React.useCallback(
    (promise) => {
      if (!promise || !promise.then) {
        throw new Error(
          `The argument passed to useAsync().run must be a promise`
        );
      }
      safeSetState({ status: "pending" });
      return promise.then(
        (data: any) => {
          setData(data);
          return data;
        },
        (error: any) => {
          setError(error);
          return Promise.reject(error);
        }
      );
    },
    [safeSetState, setData, setError]
  );

  return {
    isIdle: status === "idle",
    isLoading: status === "pending",
    isError: status === "rejected",
    isSuccess: status === "resolved",

    setData,
    setError,
    error,
    status,
    data,
    run,
    reset,
  };
}

async function fetchResource<T>(
  params: { limit: number; offset: number; fname_icontains?: string },
  fn: any
) {
  let resourceList = await fn(params);
  let resource: T[] = [];
  if (resourceList.getItems()) {
    resource = resourceList.getItems() as T[];
  }
  while (resourceList.hasNextPage) {
    try {
      params.offset += params.limit;
      resourceList = await fn(params);
      if (resourceList.getItems()) {
        resource.push(...(resourceList.getItems() as T[]));
      }
    } catch (e) {
      console.error(e);
    }
  }
  return resource;
}

export { useAsync, fetchResource };
