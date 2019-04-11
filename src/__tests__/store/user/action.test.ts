import {
		getAuthToken,
		getAuthTokenSuccess,
		setUserLogout
		} from "../../../store/user/actions";
import {IUserState,UserActionTypes} from "../../../store/user/types";


describe("actions of user", () => {

	it("getAuthToken should return",() => {
		const UserState:IUserState = {
		    username: "string",
		    password: "string",
		    email: "string",
		    token: "string",	
		    isRememberMe: true,
		    isLoggedIn: false,
		   
		}

		const expectedResult = 
		{
			type:UserActionTypes.FETCH_TOKEN,
			payload: UserState
		}
		expect(getAuthToken(UserState)).toEqual(expectedResult)
	})

	it("getAuthTokenSuccess should return",() => {
		const TestToken:string = "string"

		const expectedResult = 
		{
			type:UserActionTypes.FETCH_TOKEN_SUCCESS,
			payload: TestToken
		}
		expect(getAuthTokenSuccess(TestToken)).toEqual(expectedResult)
	})

	it("setUserLogout should",() => {
		
		const expectedResult = 
		{
			type:UserActionTypes.LOGOUT_USER,
		}
		expect(setUserLogout()).toEqual(expectedResult)
	})
})
