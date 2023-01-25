import {
  Plugin,
  PluginParameter,
  PluginInstance,
  PluginMeta,
} from "@fnndsc/chrisapi";

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
  selectedPlugin?: PluginMeta;
  handlePluginSelect: (plugin: PluginMeta) => void;
}

export interface BasicConfigurationState {
  parentDropdownOpen: boolean;
  typeDropdownOpen: boolean;
  nodes: PluginInstance[];
}

export interface PluginListProps {
  handlePluginSelect: (plugin: PluginMeta) => void;
  plugins?: Plugin[];
  selected?: PluginMeta;
}

export interface PluginMetaListProps {
  handlePluginSelect: (plugin: PluginMeta) => void;
  pluginMetas?: PluginMeta[];
  selected?: PluginMeta;
}

export interface PluginListState {
  filter: string;
}

export interface PluginSelectProps {
  selected?: PluginMeta;
  handlePluginSelect: (plugin: PluginMeta) => void;
}

export interface PluginSelectState {
  expanded: string;
  allPlugins?: Plugin[];
  recentPlugins?: Plugin[];
}

export interface PluginMetaSelectState {
  expanded: string;
  allPlugins?: PluginMeta[];
  recentPlugins?: PluginMeta[];
}

export interface AddNodeState extends InputState {
  stepIdReached: number;
  nodes?: PluginInstance[];
  data: {
    pluginMeta?: PluginMeta;
    selectedPluginFromMeta?: Plugin;
    parent?: PluginInstance;
  };
  selectedComputeEnv: string;
  errors: {};
  editorValue: string;
  loading: boolean;
  autoFill: boolean;
}

export interface AddNodeProps {
  selectedPlugin?: PluginInstance;
  pluginInstances?: {
    data?: PluginInstance[];
    error: any;
    loading: boolean;
  };
  params?: {
    dropdown: PluginParameter[];
    required: PluginParameter[];
  };
  addNode: (item: {
    pluginItem: PluginInstance;
    nodes?: PluginInstance[];
  }) => void;
  getParams: (plugin: Plugin) => void;
}

export interface GuidedConfigState {
  componentList: string[];
  count: number;
  alertVisible: boolean;
  editorValue: string;
}
export interface GuidedConfigProps extends InputProps {
  defaultValueDisplay: boolean;
  renderComputeEnv?: boolean;
  params?: {
    dropdown: PluginParameter[];
    required: PluginParameter[];
  };
  computeEnvs?: any[];
  inputChange(
    id: string,
    flag: string,
    value: string,
    type: string,
    placeholder: string,
    required: boolean,
    paramName?: string
  ): void;
  deleteInput(input: string): void;
  selectedComputeEnv?: string;
  setComputeEnviroment?: (computeEnv: string) => void;
  selectedPluginFromMeta?: Plugin;
  handlePluginSelect: (plugin: Plugin) => void;
  handleCheckboxChange?: (checked: boolean) => void;
  checked?: boolean;
  pluginMeta?: PluginMeta;
  errors: {};
}

export interface EditorState {
  value: string;
  docsExpanded: boolean;
  errors: string[];
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
  defaultValueDisplay: boolean;
  params?: {
    dropdown: PluginParameter[];
    required: PluginParameter[];
  };
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
    required: boolean,
    paramName: string
  ): void;
  deleteComponent(id: string): void;
  deleteInput(id: string): void;
  dropdownInput: InputType;

  addParam: () => void;
}

export interface RequiredParamProp {
  param: PluginParameter;
  requiredInput: InputType;
  inputChange(
    id: string,
    flag: string,
    value: string,
    type: string,
    placeholder: string,
    required: boolean,
    paramName?: string
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

export interface AddNodeStateActions {}
