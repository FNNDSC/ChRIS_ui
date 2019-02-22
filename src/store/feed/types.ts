/*
*  File:            message/types.ts
*  Description:     Holds types and constants for managing Chris API feed calls
*  Author:          ChRIS ui Demo
*  Notes:           Work in progres ...
*/
import keyMirror from "keymirror";

// Description state for main user items[] and item
export interface IFeedState {
    details?: IFeedItem;
    items?: IItem[];
    selected?: IItem;
}

export const FeedActionTypes = keyMirror({
    GET_FEED_LIST: null,
    GET_FEED_DETAILS: null,
    GET_FEED_DETAILS_SUCCESS: null,
    GET_PLUGIN_INSTANCES: null,
    GET_PLUGIN_INSTANCES_SUCCESS: null,
    SET_SELECTED_PLUGIN: null,
    FETCH_COMPLETE: null, // after request completes
    FETCH_ERROR: null, // request failed
    FETCH_REQUEST: null, // before request
    FETCH_SUCCESS: null, // request is successful
});


// These will come from ClienAPI ts definition when completed ***** working typings *****
export interface IFeedLinks {
    files: string;
    comments: string;
    owner: string;
    note: string;
    taggings: string;
    plugin_instances: string;
}
export interface IFeedItem extends IFeedLinks {
    id: number;
    creation_date: string;
    modification_date: string;
    name: string;
}


/// ----------- Basic interface
export interface IPluginInstance {
    collection: ICollection;
}

export interface ICollection {
    version: string;
    href: string;
    items: IItem[];
    links: ILink[];
}

export interface IItem {
    data: IDatum[];
    href: string;
    links: ILink[];
}

export interface IDatum {
    name: string;
    value: number | string;
}

export interface ILink {
    rel: IRel;
    href: string;
}

export enum IRel {
    Descendants = "descendants",
    Feed = "feed",
    Files = "files",
    Parameters = "parameters",
    Plugin = "plugin",
    Previous = "previous",
}
