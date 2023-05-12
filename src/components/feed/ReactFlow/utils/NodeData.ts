import { PluginInstance } from "@fnndsc/chrisapi";
import { RawNodeDatum } from "react-d3-tree";

export class NodeFileRef {
  name: string;
  fullname: string;

  constructor() {
    this.name = "";
    this.fullname = "";
  }
}

export class NodeData {
  title: string;
  node: PluginInstance | undefined;
  status: string;
  id: number;
  pid: number;
  time_start_ms: number;
  time_end_ms: number;
  thumb_url: string;

  constructor() {
    this.title = "";
    this.node = undefined;
    this.status = "";
    this.id = 0;
    this.pid = 0;
    this.time_start_ms = 0;
    this.time_end_ms = 0;
    this.thumb_url = "";
  }
}

export class NodeTree implements RawNodeDatum {
  name: string;
  data: NodeData;
  children: NodeTree[];

  constructor() {
    this.name = "";
    this.data = new NodeData();
    this.children = [];
  }
}

export default NodeData;
