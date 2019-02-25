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
    items?: IPluginItem[];
    selected?: IPluginItem;
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
// ------------------------------------------
export interface IFeedLinks {
    url: string;
    files: string;
    comments: string;
    owner: string[];
    note: string;
    tags: string;
    taggings: string;
    plugin_instances: string;
}
export interface IFeedItem extends IFeedLinks {
    id: number;
    creation_date: string;
    modification_date: string;
    name: string;
    template: ITemplate;
}

// Plugin Instances
// ------------------------------------------
export interface IPluginItemInstanceResponse {
    count: number;
    results: IPluginItem[];
    collection_links: CollectionLinks;
    next?: string; // Link to next set
    previous?: string; // Link to previous set
}

export interface CollectionLinks {
    feed: string;
}
export interface IPluginItemLinks  {
    url: string;
    feed: string;
    descendants: string;
    files: string;
    parameters: string;
    plugin: string;
    next?: string;
    previous?: string;
}
export interface IPluginItem extends IPluginItemLinks  {
    id: number;
    title: string;
    previous_id?: number;
    plugin_id: number;
    plugin_name: string;
    pipeline_inst: null;
    feed_id: number;
    start_date: string;
    end_date: string;
    status: string;
    owner_username: string;
    compute_resource_identifier: string;
    cpu_limit: number;
    memory_limit: number;
    number_of_workers: number;
    gpu_limit: number;
}

export interface ITemplate {
    data: IDatum[];
}



/// ----------- Basic interface
export interface IPluginItemInstance {
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
