import { UiActionTypes, IUiState } from "../../../src/store/ui/types";
import { uiReducer } from "../../../src/store/ui/reducer";

const initialState: IUiState = {
    loading: false,
    progress: 0,
    isDropdownOpen: false,
    isKebabDropdownOpen: false,
    isSidebarOpen: true,
    sidebarActiveItem: "dashboard",
    sidebarActiveGroup: "feeds_grp"
};

describe('ui reducer', () => {
    it('should return the initial state', () => {
        expect(uiReducer(undefined, {
            type: null
        })).toEqual(
            initialState
        )
    })

    it('should fetch request', () => {
        const testState: IUiState = {
            loading: true,
            progress: 0,
            isDropdownOpen: false,
            isKebabDropdownOpen: false,
            isSidebarOpen: true,
            sidebarActiveItem: "dashboard",
            sidebarActiveGroup: "feeds_grp"
        };
        expect(uiReducer(initialState, {
            type: UiActionTypes.FETCH_REQUEST,
            payload: testState.loading
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

    it('should fetch complete', () => {
        const testState: IUiState = {
            loading: false,
            progress: 0,
            isDropdownOpen: false,
            isKebabDropdownOpen: false,
            isSidebarOpen: true,
            sidebarActiveItem: "dashboard",
            sidebarActiveGroup: "feeds_grp"
        };

        expect(uiReducer(initialState, {
            type: UiActionTypes.FETCH_COMPLETE,
            payload: testState.loading
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

    it('should toggle toolbar dropdown', () => {
        const testState: IUiState = {
            loading: false,
            progress: 0,
            isDropdownOpen: true,
            isKebabDropdownOpen: false,
            isSidebarOpen: true,
            sidebarActiveItem: "dashboard",
            sidebarActiveGroup: "feeds_grp"
        };
        expect(uiReducer(initialState, {
            type: UiActionTypes.TOGGLE_TOOLBAR_DROPDOWN,
            payload: testState.isDropdownOpen
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

    it('should toggle toolbar kebab', () => {
        const testState: IUiState = {
            loading: false,
            progress: 0,
            isDropdownOpen: false,
            isKebabDropdownOpen: true,
            isSidebarOpen: true,
            sidebarActiveItem: "dashboard",
            sidebarActiveGroup: "feeds_grp"
        };
        expect(uiReducer(initialState, {
            type: UiActionTypes.TOGGLE_TOOLBAR_KEBAB,
            payload: testState.isKebabDropdownOpen
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

    it('should toggle sidebar', () => {
        const testState: IUiState = {
            loading: false,
            progress: 0,
            isDropdownOpen: false,
            isKebabDropdownOpen: false,
            isSidebarOpen: false,
            sidebarActiveItem: "dashboard",
            sidebarActiveGroup: "feeds_grp"
        };
        expect(uiReducer(initialState, {
            type: UiActionTypes.TOGGLE_SIDEBAR,
            payload: testState.isSidebarOpen
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

    // it('should set sidebar active item', () => {
    //     const testState: IUiState = {
    //         loading: false,
    //         progress: 0,
    //         isDropdownOpen: false,
    //         isKebabDropdownOpen: false,
    //         isSidebarOpen: true,
    //         sidebarActiveItem: "dashboard",
    //         sidebarActiveGroup: "feeds_grp"
    //     };
    //     expect(uiReducer(initialState, {
    //         type: UiActionTypes.SET_SIDEBAR_ACTIVE_ITEM,
    //         payload: testState
    //     })).toEqual(
    //         {
    //             loading: true,
    //             progress: 0,
    //             isDropdownOpen: true,
    //             isKebabDropdownOpen: true,
    //             isSidebarOpen: true,
    //             sidebarActiveItem: "dashboard",
    //             sidebarActiveGroup: "feeds_grp"
    //         }
    //     )
    // })

})
