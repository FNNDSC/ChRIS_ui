import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import { bindActionCreators } from "redux";
import { feedActions } from "../feed";
import { uiActions } from "../ui";
import { RootState } from "../root/applicationState";

export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useFeedActions = () => {
  const dispatch = useDispatch();
  return bindActionCreators(feedActions, dispatch);
};

export const useUiActions = () => {
  const dispatch = useDispatch();
  return bindActionCreators(uiActions, dispatch);
};
