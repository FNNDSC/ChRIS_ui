import React from "react";

interface RouterContextProps<S, A = any> {
  state: S;
  actions?: A;
}

type RouterContextType<S, A = any> = React.Context<RouterObjectType<S, A>>;
type RouterObjectType<S, A = any> = {
  state: S;
  actions: A;
};

export function RouterContext<S, A = any>({
  state,
  actions,
}: RouterContextProps<S, A>): [S, RouterContextType<S, A>] {
  return [
    state,
    React.createContext<RouterObjectType<S, A>>({
      actions: actions ? actions : ({} as A),
      state,
    }),
  ];
}

interface RouterProviderProps<S = any, A = any> {
  context: RouterContextType<S>;
  state: S;
  actions: A;
  children: React.ReactNode;
}

export function RouterProvider({
  context,
  actions,
  state,
  children,
}: RouterProviderProps) {
  const props = {
    context,
    actions,
    state,
    children,
  };
  return <RouterComponent propsElement={props} />;
}

const RouterComponent = ({
  propsElement: { context, actions, state, children },
}: {
  propsElement: RouterProviderProps;
}) => {
  return (
    <context.Provider
      value={{
        state,
        actions,
      }}
    >
      {children}
    </context.Provider>
  );
};

export default RouterContext;
