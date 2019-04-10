import { UiActionTypes, IUiState } from "../../../store/ui/types";
import { uiReducer } from "../../../store/ui/reducer";

const initialState: IUiState = {
    loading: false,
    progress: 0,
    isDropdownOpen: false,
    isKebabDropdownOpen: false,
    isSidebarOpen: true,
    sidebarActiveItem: "dashboard",
    sidebarActiveGroup: "feeds_grp"
};

describe("ui reducer", () => {
    it("should return the initial state", () => {
        expect(uiReducer(undefined, {
            type: null
        })).toEqual(
            initialState
        )
    })

    it("should fetch request", () => {
        expect(uiReducer(initialState, {
            type: UiActionTypes.FETCH_REQUEST,
        })).toEqual(
            {
                loading: true,
                progress: 0,
                isDropdownOpen: false,
                isKebabDropdownOpen: false,
                isSidebarOpen: true,
                sidebarActiveItem: "dashboard",
                sidebarActiveGroup: "feeds_grp"
            }
        )
    })

    it("should fetch complete", () => {
        expect(uiReducer(initialState, {
            type: UiActionTypes.FETCH_COMPLETE,
        })).toEqual(
            {
                loading: false,
                progress: 0,
                isDropdownOpen: false,
                isKebabDropdownOpen: false,
                isSidebarOpen: true,
                sidebarActiveItem: "dashboard",
                sidebarActiveGroup: "feeds_grp"
            }
        )
    })

    it("should toggle toolbar dropdown", () => {
        expect(uiReducer(initialState, {
            type: UiActionTypes.TOGGLE_TOOLBAR_DROPDOWN,
            payload: true
        })).toEqual(
            {
                loading: false,
                progress: 0,
                isDropdownOpen: true,
                isKebabDropdownOpen: false,
                isSidebarOpen: true,
                sidebarActiveItem: "dashboard",
                sidebarActiveGroup: "feeds_grp"
            }
        )
    })

    it("should toggle toolbar kebab", () => {
        expect(uiReducer(initialState, {
            type: UiActionTypes.TOGGLE_TOOLBAR_KEBAB,
            payload: true
        })).toEqual(
            {
                loading: false,
                progress: 0,
                isDropdownOpen: false,
                isKebabDropdownOpen: true,
                isSidebarOpen: true,
                sidebarActiveItem: "dashboard",
                sidebarActiveGroup: "feeds_grp"
            }
        )
    })

    it("should toggle sidebar", () => {
        expect(uiReducer(initialState, {
            type: UiActionTypes.TOGGLE_SIDEBAR,
            payload: false
        })).toEqual(
            {
                loading: false,
                progress: 0,
                isDropdownOpen: false,
                isKebabDropdownOpen: false,
                isSidebarOpen: false,
                sidebarActiveItem: "dashboard",
                sidebarActiveGroup: "feeds_grp"
            }
        )
    })

    it("should set sidebar active item", () => {
        expect(uiReducer(initialState, {
            type: UiActionTypes.SET_SIDEBAR_ACTIVE_ITEM,
            payload: {
                activeItem: "all_feeds",
                activeGroup: "feeds_grp"
            }
        })).toEqual(
            {
                loading: false,
                progress: 0,
                isDropdownOpen: false,
                isKebabDropdownOpen: false,
                isSidebarOpen: true,
                sidebarActiveItem: "all_feeds",
                sidebarActiveGroup: "feeds_grp"
            }
        )
    })

})
