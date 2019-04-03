import React from "react";
import {
		getAuthToken,
		getAuthTokenSuccess,
		setUserLogout
		} from "../../../store/user/actions";
import {IUserState,UserActionTypes} from "../../../store/user/types";
import {userReducer} from "../../../store/user/reducer";
import { any } from "prop-types";


const initialState: IUserState = {
    username: null,
    token:  null,
    isRememberMe: false,
    isLoggedIn: false
};

const UserState:IUserState = {
    username: "string",
    password: 'string',
    email: 'string',
    token: 'string',	
    isRememberMe: true,
    isLoggedIn: true,
}

describe('Reducer of user', () => {
    it("the initial state should be ",() => {
        expect(userReducer(undefined,{type:any})).toEqual(
                initialState
        )
    });

    it("FetchToken should return ",()=>{
        expect(userReducer(initialState,{
            type:UserActionTypes.FETCH_TOKEN,
            payload:UserState
        })).toEqual(
            {
                username: "string",
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
    //action not implemented
    /** 
    it("FetchTokenError should return ",()=>{
        expect(userReducer(initialState,{
            type:UserActionTypes.FETCH_TOKEN_ERROR,
            payload:UserState
        })).toEqual(
            {
                username: "string",
                token:  "token",
                isRememberMe: false,
                isLoggedIn: false
            }
        )
    });
    **/

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
