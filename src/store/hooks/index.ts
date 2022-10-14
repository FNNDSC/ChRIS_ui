import { useSelector, TypedUseSelectorHook } from 'react-redux'
import { RootState } from '../root/applicationState'
export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector
