import { Plugin, PluginParameter, PluginInstance } from "@fnndsc/chrisapi";

export interface InputIndex {
  [key: string]: string;
}

export interface InputType {
  [key: string]: InputIndex;
}

export interface InputProps {
  dropdownInput: InputType;
  requiredInput: InputType;
}

export interface InputState {
  dropdownInput: InputType;
  requiredInput: InputType;
}

export interface BasicConfigurationProps {
  nodes: PluginInstance[];
  parent: PluginInstance;
  selectedPlugin?: Plugin;
  handlePluginSelect: (plugin: Plugin) => void;
}

export interface BasicConfigurationState {
  parentDropdownOpen: boolean;
  typeDropdownOpen: boolean;
  nodes: PluginInstance[];
}

export interface PluginListProps {
  handlePluginSelect: (plugin: Plugin) => void;
  plugins?: Plugin[];
  selected?: Plugin;
}

export interface PluginListState {
  filter: string;
}

export interface PluginSelectProps {
  selected?: Plugin;
  handlePluginSelect: (plugin: Plugin) => void;
}

export interface PluginSelectState {
  expanded: string;
  allPlugins?: Plugin[];
  recentPlugins?: Plugin[];
}

export interface AddNodeState extends InputState {
  isOpen: boolean;
  stepIdReached: number;
  nodes?: PluginInstance[];
  data: {
    plugin?: Plugin;
    parent?: PluginInstance;
  };
  selectedComputeEnv: string;
  errors: {
    [key: string]: string[];
  };
  editorValue: string;
}

export interface AddNodeProps {
  selectedPlugin?: PluginInstance;
  pluginInstances?: {
    data?: PluginInstance[];
    error: any;
    loading: boolean;
  };
  params?: PluginParameter[];
  addNode: (item: {
    pluginItem: PluginInstance;
    nodes?: PluginInstance[];
  }) => void;
  getParams: (plugin: Plugin) => void;
}

export interface GuidedConfigState {
  componentList: string[];
  count: number;
  errors: string[];
  alertVisible: boolean;
  docsExpanded: boolean;
}
export interface GuidedConfigProps extends InputProps {
  plugin?: Plugin;
  params?: PluginParameter[];
  computeEnvs?: any[];
  inputChange(
    id: string,
    flag: string,
    value: string,
    type: string,
    placeholder: string,
    required: boolean
  ): void;
  deleteInput(input: string): void;
  selectedComputeEnv: string;
  setComputeEnviroment: (computeEnv: string) => void;
}

export interface EditorState {
  value: string;
  docsExpanded: boolean;
  errors: string[];
  readOnly: boolean;
  dictionary: InputIndex;
  savingValues: boolean;
}

export interface EditorProps extends InputState {
  plugin: Plugin;
  params?: PluginParameter[];
  setEditorValue: (value: string) => void;
}

export interface SimpleDropdownState {
  isOpen: boolean;
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
    flag: string,
    value: string,
    type: string,
    placeholder: string,
    required: boolean
  ): void;
  deleteComponent(id: string): void;
  deleteInput(id: string): void;
  dropdownInput: InputType;

  addParam: () => void;
}

export interface RequiredParamProp {
  param: PluginParameter;
  addParam: () => void;
  requiredInput: InputType;
  inputChange(
    id: string,
    flag: string,
    value: string,
    type: string,
    placeholder: string,
    required: boolean
  ): void;
  id: string;
}

export interface ReviewProps extends InputState {
  parent?: PluginInstance;
  currentPlugin: Plugin;
  computeEnvironment: string;
  errors: {
    [key: string]: string[];
  };
}
