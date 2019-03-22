import { UiActionTypes, } from "../../../src/store/ui/types";
import {
  uiOnBeforeRequest,
  uiOnCompleteRequest,
  onDropdownSelect,
  onKebabDropdownSelect,
  onSidebarToggle,
  setSidebarActive,
} from "../../../src/store/ui/actions";

describe("ui On Before Request", () => {
  it("return action of type ui On Before Request", () => {

    const expectedAction = {
      type: UiActionTypes.FETCH_REQUEST,
    };

    expect(uiOnBeforeRequest()).toEqual(expectedAction);
  });
});

describe("ui On Complete Request", () => {
  it("return action of type ui On Complete Request", () => {

    const expectedAction = {
      type: UiActionTypes.FETCH_COMPLETE,
    };

    expect(uiOnCompleteRequest()).toEqual(expectedAction);
  });
});

describe("Drop down Select", () => {
  it("return action of type drop down select", () => {
    const testIsOpened: boolean = false;

    const expectedAction = {
      type: UiActionTypes.TOGGLE_TOOLBAR_DROPDOWN,
      payload: testIsOpened
    };

    expect(onDropdownSelect(testIsOpened)).toEqual(expectedAction);
  });
});

describe("Kebab Drop down Select", () => {
  it("return action of type Kebab Drop down Select", () => {
    const testIsOpened: boolean = false;

    const expectedAction = {
      type: UiActionTypes.TOGGLE_TOOLBAR_KEBAB,
      payload: testIsOpened
    };

    expect(onKebabDropdownSelect(testIsOpened)).toEqual(expectedAction);
  });
});

describe("Sidebar Toggle", () => {
  it("return action of type Sidebar Toggle", () => {
    const testIsOpened: boolean = true;

    const expectedAction = {
      type: UiActionTypes.TOGGLE_SIDEBAR,
      payload: testIsOpened
    };

    expect(onSidebarToggle(testIsOpened)).toEqual(expectedAction);
  });
});

describe("set Sidebar Active", () => {
  it("return action of type set Sidebar Active", () => {
    const testActive = {
      activeItem: "my_feeds",
      activeGroup: "feeds_grp",
    };

    const expectedAction = {
      type: UiActionTypes.SET_SIDEBAR_ACTIVE_ITEM,
      payload: testActive
    };

    expect(setSidebarActive(testActive)).toEqual(expectedAction);
  });
});
