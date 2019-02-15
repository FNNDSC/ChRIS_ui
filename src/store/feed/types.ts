/*
*  File:            message/types.ts
*  Description:     Holds types and constants for managing Chris API feed calls
*  Author:          ChRIS ui Demo 
*  Notes:           Work in progres ...                
*/
import keyMirror from 'keymirror';

// Description state for main user items[] and item
export interface IFeedState {
    items: Item[];
}

export const FeedActionTypes = keyMirror({
    FETCH_REQUEST: null, //before request
    FETCH_SUCCESS: null, // request is successful 
    FETCH_ERROR: null, // request failed
    FETCH_COMPLETE: null, //after request completes 
})


// These will come from ClienAPI ts definition when completed ***** working typings ***** 
export interface PluginInstance {
    collection: Collection;
}

export interface Collection {
    version: string;
    href: string;
    items: Item[];
    links: Link[];
}

export interface Item {
    data: Datum[];
    href: string;
    links: Link[];
}

export interface Datum {
    name: string;
    value: number | string;
}

export interface Link {
    rel: Rel;
    href: string;
}

export enum Rel {
    Descendants = "descendants",
    Feed = "feed",
    Files = "files",
    Parameters = "parameters",
    Plugin = "plugin",
    Previous = "previous",
}
