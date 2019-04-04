import { messageActionTypes, IMessageState } from "../../../store/message/types";
import { messageReducer } from "../../../store/message/reducer";

const initialState: IMessageState = {
    message: {
        message: "hello",
        type: "success",
        displayType: "modal"
    },
    confirmation: {
        title: "world",
        text: "hi",
        confirm: {
            label: "cat",
            action: "do",
            data: "anytype"
        },
        dismiss: {
            label: "dog",
            action: "doit",
            data: "anytype"
        },
    }
};

describe("message reducer", () => {
    it("should return the initial state", () => {
        expect(messageReducer(initialState,  {
            type: null
        })).toEqual(
            initialState
        )
    })

    it("should display message", () => {
        expect(messageReducer(initialState, {
            type: messageActionTypes.DISPLAY_MESSAGE
        })).toEqual(
            {
                initialState
            }
        )
    })

    it("should dismiss message", () => {
        expect(messageReducer(initialState, {
            type: messageActionTypes.DISMISS_MESSAGE
        })).toEqual(
            {
                initialState
            }
        )
    })

    it("should display confirmation", () => {
        expect(messageReducer(initialState, {
            type: messageActionTypes.DISPLAY_CONFIRMATION
        })).toEqual(
            {
                initialState
            }
        )
    })

    it("should dismiss confirmation", () => {
        expect(messageReducer(initialState, {
            type: messageActionTypes.DISMISS_CONFIRMATION
        })).toEqual(
            {
                initialState
            }
        )
    })

})

