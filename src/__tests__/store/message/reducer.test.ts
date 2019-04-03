import { messageActionTypes, IMessageState } from "../../../src/store/message/types";
import { messageReducer } from "../../../src/store/message/reducer";

const initialState: IMessageState = {
    message: undefined,
    confirmation: undefined
};
const testState : IMessageState = {
    message: undefined,
    confirmation: undefined
}


describe('message reducer', () => {
    it('should return the initial state', () => {
        expect(messageReducer(undefined,  {
            type: null,
        })).toEqual(

                initialState

        )
    })

    it('should display message', () => {
        expect(messageReducer(initialState, {
            type: messageActionTypes.DISPLAY_MESSAGE,
            payload: testState
        })).toEqual(
            {
                message: undefined,
                confirmation: undefined
            }
        )
    })

    it('should dismiss message', () => {
        expect(messageReducer(initialState, {
            type: messageActionTypes.DISMISS_MESSAGE,
            payload: testState
        })).toEqual(
            {
                message: undefined,
                confirmation: undefined
            }
        )
    })

    it('should display confirmation', () => {
        expect(messageReducer(initialState, {
            type: messageActionTypes.DISPLAY_CONFIRMATION,
            payload: testState
        })).toEqual(
            {
                message: undefined,
                confirmation: undefined
            }
        )
    })

    it('should dismiss confirmation', () => {
        expect(messageReducer(initialState, {
            type: messageActionTypes.DISMISS_CONFIRMATION,
            payload: testState
        })).toEqual(
            {
                message: undefined,
                confirmation: undefined
            }
        )
    })

})

