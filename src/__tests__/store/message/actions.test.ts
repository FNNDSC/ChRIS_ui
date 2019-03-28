import { IConfirmation, IMessage, messageActionTypes } from "../../../store/message/types";
import {
  handleMessage,
  dismissMessage,
  handleConfirmation,
  dismissConfirmation,
} from "../../../store/message/actions";

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
    expect(handleMessage(testMessage)).toEqual(expectedAction);
  });
});

describe("dismiss message", () => {
  it("return action of type dismiss message", () => {
    const expectedAction = {
      type: messageActionTypes.DISMISS_MESSAGE
    };

    expect(dismissMessage()).toEqual(expectedAction);
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

    expect(handleConfirmation(testConformation)).toEqual(expectedAction);
  });
});

describe("dismiss confirmation", () => {
  it("return action of type dismiss confirmation", () => {
    const expectedAction = {
      type: messageActionTypes.DISMISS_CONFIRMATION
    };
    expect(dismissConfirmation()).toEqual(expectedAction);
  });
});
