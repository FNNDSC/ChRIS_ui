import {ICollectionLinks, chrisId} from "./base.model";
// import _ from "lodash";

// Plugin Instances
// ------------------------------------------
export interface IPluginItemInstanceResponse {
    count: number;
    results: IPluginItem[];
    collection_links: ICollectionLinks;
    next?: string; // Link to next set
    previous?: string; // Link to previous set
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
    id: chrisId;
    title: string;
    previous_id?: number;
    plugin_id: number;
    plugin_name: string;
    plugin_version: string;
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
export const statusLabels: any = {
    finishedSuccessfully: "Finished Successfully",
    started : "Started"
     // Add more status strings as BE devs...
};

// Description: This will fix the title field for the UI demo - should be replaced with plugin name or title
// (!!plugin.title &&  plugin.title.length) ? plugin.title : plugin.plugin_name;
export function getPluginInstanceTitle(plugin: IPluginItem) {
    const title = (plugin.plugin_name === "dircopy") ? ("PACS Pull") :
        (plugin.plugin_name === "freesurfer_pp") ? ("Freesurfer") :
    (!!plugin.title &&  plugin.title.length) ? plugin.title : plugin.plugin_name;
    return title;
}
