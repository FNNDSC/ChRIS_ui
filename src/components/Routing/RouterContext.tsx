import React from "react";

type RouterContextProps<S, A = any> = {
  state: S;
  actions?: A;
};

type RouterContextType<S, A = any> = React.Context<RouterObjectType<S, A>>;

type RouterObjectType<S, A = any> = {
  state: S;
  actions: A;
};

export const RouterContext = <S, A = any>(
  props: RouterContextProps<S, A>,
): [S, RouterContextType<S, A>] => {
  const { state, actions } = props;
  return [
    state,
    React.createContext<RouterObjectType<S, A>>({
      actions: actions ? actions : ({} as A),
      state,
    }),
  ];
};

type RouterProviderProps<S = any, A = any> = {
  context: RouterContextType<S>;
  state: S;
  actions: A;
  children: React.ReactNode;
};

export const RouterProvider = (props: RouterProviderProps) => {
  return <RouterComponent {...props} />;
};

const RouterComponent = (props: RouterProviderProps) => {
  const { context, state, actions, children } = props;

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
