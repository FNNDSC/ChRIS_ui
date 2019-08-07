import { ITemplate, chrisId } from "./base.model";

// These will come from ClienAPI ts definition when completed
// ------------------------------------------
export interface IFeedItem extends IFeedLinks {
  id?: chrisId;
  creation_date: string;
  modification_date: string;
  name: string;
  creator_username: string;
  template?: ITemplate;
}

// Description: urls for IFeed
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
