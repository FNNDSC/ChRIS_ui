import { IPluginItem } from "../../api/models/pluginInstance.model";
import { Plugin, PluginParameter } from "@fnndsc/chrisapi";

export interface InputIndex {
  [key: string]: string;
}

export interface InputType {
  [key: string]: InputIndex;
}

export interface InputState {
  dropdownInput: InputType;
  requiredInput: InputType;
}

export interface AddNodeState extends InputState {
  isOpen: boolean;
  stepIdReached: number;
  nodes?: IPluginItem[];
  data: {
    plugin?: Plugin;
    parent?: IPluginItem;
  };
}

export interface AddNodeProps {
  selected?: IPluginItem;
  nodes?: IPluginItem[];
  addNode: (pluginItem: IPluginItem) => void;
  getParams: (plugin: Plugin) => void;
}

export interface GuidedConfigState {
  isOpen: boolean;
  componentList: string[];
  value: string;
  flag: string;
  count: number;
  errors: string[];
  alertVisible: boolean;
}
export interface GuidedConfigProps extends InputState {
  plugin: Plugin;
  params?: PluginParameter[];
  inputChange(
    id: string,
    paramName: string,
    value: string,
    required: boolean
  ): void;
  deleteInput(input: string): void;
}

export interface EditorState {
  value: string;
  docsExpanded: boolean;
  errors: string[];
}

export interface EditorProps extends InputState {
  plugin: Plugin;
  params?: PluginParameter[];
  inputChange(
    id: string,
    paramName: string,
    value: string,
    required: boolean
  ): void;
  inputChangeFromEditor(
    dropdownInput: InputType,
    requiredInput: InputType
  ): void;
}

export interface SimpleDropdownState {
  isOpen: boolean;
  value: string;
  flag: string;
  placeholder: string;
}

export interface SimpleDropdownProps {
  params?: PluginParameter[];
  toggle?: React.ReactElement<any>;
  onSelect?: (event: React.SyntheticEvent<HTMLDivElement>) => void;
  isOpen?: boolean;
  dropdownItems?: any[];
  id: string;
  handleChange(
    id: string,
    paramName: string,
    value: string,
    required: boolean
  ): void;
  deleteComponent(id: string): void;
  deleteInput(id: string): void;
  dropdownInput: InputType;
}

export interface ReviewProps extends InputState {
  data: {
    plugin?: Plugin;
    parent?: IPluginItem;
  };
}
