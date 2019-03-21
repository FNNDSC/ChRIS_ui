import { IConfirmation, IMessage, MessageType, IModalActions, messageActionTypes } from "../../../src/store/message/types";
import * as actions from "../../../src/store/message/actions";

describe("display message", () => {
    it("return action of type display message", () => {
        const testMessage: IMessage = {
            message: "hello",
            type: "success",
            displayType: "modal",
        }

        const expectedAction = {
            type: messageActionTypes.DISPLAY_CONFIRMATION,
            payload: testMessage
        };
        expect(actions.handleMessage(testMessage)).toEqual(expectedAction);
    });
});

describe("dismiss message", () => {
    it("return action of type dismiss message", () => {
        const expectedAction = {
            type: messageActionTypes.DISMISS_MESSAGE
        };

        expect(actions.dismissMessage()).toEqual(expectedAction);
    });
});

describe("display confirmation", () => {
    it("return action of type display confirmation", () => {
        const testConformation: IConfirmation = {
            title: "text",
            text: "conform",
            confirm: {
                label: "hello",
                action: "action1",// Pass the name of the action
                data: "hello"
            },
            dismiss: {
                label: "hello",
                action: "action2", // Pass the name of the action
                data: "hello",
            }
        }
        const expectedAction = {
            type: messageActionTypes.DISPLAY_CONFIRMATION,
            payload: testConformation
        };

        expect(actions.handleConfirmation(testConformation)).toEqual(expectedAction);
    });
});

describe("dismiss confirmation", () => {
    it("return action of type dismiss confirmation", () => {
        const expectedAction = {
            type: messageActionTypes.DISMISS_CONFIRMATION
        };

        expect(actions.dismissConfirmation()).toEqual(expectedAction);
    });
});
