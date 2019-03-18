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

