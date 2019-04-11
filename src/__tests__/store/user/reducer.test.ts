import {IUserState,UserActionTypes} from "../../../store/user/types";
import {userReducer} from "../../../store/user/reducer";
import { any } from "prop-types";


const initialState: IUserState = {
    username: null,
    token:  null,
    isRememberMe: false,
    isLoggedIn: false
};

const UserState: IUserState = {
    username: "Chris",
    password: "thisisapassword",
    email: "chris@gmail.com",
    token: "dsfj23lj234njk43nrk34j",	
    isRememberMe: true,
    isLoggedIn: true, 
}
describe("Reducer of user", () => {
    it("the initial state should be ",() => {
        expect(userReducer(undefined,{type: null})).toEqual(
                initialState
        )
    });

    it("FetchToken should return ",()=>{
        expect(userReducer(initialState,{
            type:UserActionTypes.FETCH_TOKEN,
            payload:UserState
        })).toEqual(
            {
                username: "Chris",
                token:  null,
                isRememberMe: false,
                isLoggedIn: false
            }
        )
    });

    it("FetchTokenSuccess should return ",()=>{
        expect(userReducer(initialState,{
            type:UserActionTypes.FETCH_TOKEN_SUCCESS,
            payload:"string"
        })).toEqual(
            {
                username: null,
                token: "string",
                isRememberMe: false,
                isLoggedIn: true
            }
        )
    });

   it("Logout should return ",()=>{
    expect(userReducer(initialState,{
        type:UserActionTypes.LOGOUT_USER,
    })).toEqual(
        {
            username: null,
            token:  null,
            isRememberMe: false,
            isLoggedIn: false
        }
    )
});

});
