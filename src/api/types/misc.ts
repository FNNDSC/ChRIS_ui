import type { Datetime } from "./datetime";
import type { ID } from "./id";

export interface DownloadToken {
  id: ID;
  creation_date: Datetime;
  token: string;
  owner_username: string;
}

export interface Link {
  [key: string]: string;
}
