import { chrisId } from "./base.model";

// Description: ChRIS API Feed File
// ------------------------------------------
export interface IFeedFile extends IFeedFileLinks {
  id: chrisId;
  feed_id: chrisId;
  plugin_inst_id: chrisId;
  fname: string;
}

// Description: urls for IFeedFile
export interface IFeedFileLinks {
  url: string;
  file_resource: string;
  plugin_instances: string;
}
