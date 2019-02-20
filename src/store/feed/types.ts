/*
*  File:            message/types.ts
*  Description:     Holds types and constants for managing Chris API feed calls
*  Author:          ChRIS ui Demo
*  Notes:           Work in progres ...
*/
import keyMirror from 'keymirror';

// Description state for main user items[] and item
export interface IFeedState {
    items?: IItem[];
}

export const FeedActionTypes = keyMirror({
    FETCH_COMPLETE: null, // after request completes
    FETCH_ERROR: null, // request failed
    FETCH_REQUEST: null, // before request
    FETCH_SUCCESS: null, // request is successful
});


// These will come from ClienAPI ts definition when completed ***** working typings *****
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
    Descendants = 'descendants',
    Feed = 'feed',
    Files = 'files',
    Parameters = 'parameters',
    Plugin = 'plugin',
    Previous = 'previous',
}
