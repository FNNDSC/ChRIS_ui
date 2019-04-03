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
const testState : IMessageState = {
    message: {
        message: "hello1",
        type: "error",
        displayType: "toastr"
    },
    confirmation: {
        title: "world1",
        text: "hi1",
        confirm: {
            label: "tiger",
            action: "doitagain",
            data: 1
        },
        dismiss: {
            label: "lion",
            action: "do",
            data: 2
        },
    }
}


describe('message reducer', () => {
    it('should return the initial state', () => {
        expect(messageReducer(initialState,  {
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
            }
        )
    })

    it('should dismiss message', () => {
        expect(messageReducer(initialState, {
            type: messageActionTypes.DISMISS_MESSAGE,
            payload: testState
        })).toEqual(
            {
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
            }
        )
    })

    it('should display confirmation', () => {
        expect(messageReducer(initialState, {
            type: messageActionTypes.DISPLAY_CONFIRMATION,
            payload: testState
        })).toEqual(
            {
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
            }
        )
    })

    it('should dismiss confirmation', () => {
        expect(messageReducer(initialState, {
            type: messageActionTypes.DISMISS_CONFIRMATION,
            payload: testState
        })).toEqual(
            {
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
            }
        )
    })

})

