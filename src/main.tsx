import * as React from 'react'
import Routes from './routes'
import { Provider } from 'react-redux'
import { Store } from 'redux'
import { BrowserRouter } from 'react-router-dom'
import { RootState } from './store/root/applicationState'
import { CookiesProvider } from 'react-cookie'
interface AllProps {
  store: Store<RootState>
}

const Main: React.FC<AllProps> = (props: AllProps) => {
  const { store } = props

  return (
    <Provider store={store}>
      <CookiesProvider>
        <BrowserRouter>
          <Routes />
        </BrowserRouter>
      </CookiesProvider>
    </Provider>
  )
}

export default Main
