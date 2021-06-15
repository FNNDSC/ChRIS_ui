import React from "react";
import { Route, Switch } from "react-router-dom";

interface RouterContextProps<S, A = any> {
  state: S
  actions?: A
}

type RouterContextType<S, A = any> = React.Context<RouterObjectType<S,A>>
type RouterObjectType<S, A = any> = { 
  state: S
  actions?: A
  route: (path:string) => any 
}

export function RouterContext<S, A>
  ({ state, actions }: RouterContextProps<S,A>): [S, RouterContextType<S,A>] {
  return [
    state, 
    React.createContext<RouterObjectType<S,A>>({
      route: (path: string) => path,
      actions,
      state
    })
  ]
}

interface RouterProviderProps<S = any, A = any> {
  context: RouterContextType<S>
  state: S
  actions: A
  route?: string
  setRoute: (route?:string) => any
  children: React.ReactNode
}

export function RouterProvider
  ({ context, actions, state, route, setRoute, children }: RouterProviderProps) {
  return (
    <Route render={({ history, match }) => {
      if (route) {
        if (route !== match.path)
          history.push(route)
        setRoute(undefined)
      }

      return (
        <context.Provider
          value={{
            route: history.push,
            state,
            actions,
          }}
        >
          <Switch>
            { children }
          </Switch>
        </context.Provider>
      )
    }}/>
  )
}

export default RouterContext
