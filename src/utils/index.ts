import * as React from "react";

export function setWithExpiry(key:string, value:any, ttl:number) {
	const now = new Date()

	// `item` is an object which contains the original value
	// as well as the time when it's supposed to expire
	const item = {
		value: value,
		expiry: now.getTime() + ttl,
	}
	window.localStorage.setItem(key, btoa(JSON.stringify(item)))
}

export function getWithExpiry(key:string) {
	const itemStr = window.localStorage.getItem(key)
	// if the item doesn't exist, return null
	if (!itemStr) {
		return null
	}
  try{
    const item = JSON.parse(atob(itemStr))
    const now = new Date()
    // compare the expiry time of the item with the current time
    if (now.getTime() > item.expiry) {
      // If the item is expired, delete the item from storage
      // and return null
      window.localStorage.removeItem(key)
      return null
    }
    return item.value
  }catch(err){
    //This is just for acting as safety net if the user have old version of localStorage value
    window.localStorage.removeItem("CHRIS_TOKEN")
    window.localStorage.removeItem("PFDCM_SET_SERVICE")
  }
  return null
	
} 

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
  params: { limit: number; offset: number },
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
