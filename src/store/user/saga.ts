import { all, call, fork, put, takeEvery } from 'redux-saga/effects';
import { push } from 'connected-react-router';
import Client from '@fnndsc/chrisapi';
import { UserActionTypes } from './types';
import {
    getAuthTokenSuccess
} from './actions';

// ----------------------------------------------------------------
// Description: List - Get all Users
// ----------------------------------------------------------------
const url = `${process.env.REACT_APP_CHRIS_UI_URL}`;
function* handleGetAuthToken(action: any) {
    try {
        const authURL = process.env.REACT_APP_CHRIS_UI_AUTH_URL;
        const authObj = {
            password: action.payload.password,
            username: action.payload.username
        };
        const res = yield call(Client.getAuthToken, authURL, authObj.username, authObj.password);
        if (res.error) {
            console.log(res.error); // working ***** user messaging
        } else {
            yield put(getAuthTokenSuccess(res));
            yield put(push('/'));
        }
    } catch (error) {
        console.log(error); // working user messaging
        yield put(push('/not-found'));
        // yield put(handleUIMessage({ message: (err instanceof Error ? (err.stack!) :
        //   managerDefaults.defaultMessage.Error), type: UIMessageType.error, displayType: MessageHandlerType.toastr }));
    }
}

// This is our watcher function. We use `take*()` functions to watch Redux for a specific action
// type, and run our saga, for example the `handleFetch()` saga above.
function* watchGetAuthTokenRequest() {
    yield takeEvery(UserActionTypes.FETCH_TOKEN, handleGetAuthToken);
}

// ----------------------------------------------------------------
// We can also use `fork()` here to split our saga into multiple watchers.
export function* userSaga() {
    yield all([
        fork(watchGetAuthTokenRequest),
    ]);
}
