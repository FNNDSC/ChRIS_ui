import { Request, Collection } from "@fnndsc/chrisapi";

// Chris API base id type
export type chrisId = number | string;

// Base Chris API objects
export interface ICollection {
  version: string;
  href: string;
  items: IItem[];
  links: ILink[];
}

export interface IItem {
  data: IDatum[]; //
  href: string;
  links: ILink[];
}

export interface IDatum {
  name: string;
  value: chrisId;
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
  Previous = "previous"
}

export interface ICollectionLinks {
  feed: string;
}

export interface ITemplate {
  data: IDatum[];
}


// CHRIS API REQUEST
export default class ChrisModel {
  static fetchRequest(url: string) {
    const auth = { token: `${window.sessionStorage.getItem("AUTH_TOKEN")}` };
    const req = new Request(auth, "application/vnd.collection+json");
    return req.get(url);
  }
}
