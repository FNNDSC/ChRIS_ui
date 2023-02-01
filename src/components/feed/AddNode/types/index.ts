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
  selectedPlugin: PluginInstance;
}

export interface BasicConfigurationState {
  parentDropdownOpen: boolean;
  typeDropdownOpen: boolean;
  nodes: PluginInstance[];
}

export interface PluginMetaListProps {
  pluginMetas?: PluginMeta[];
}

export interface PluginListState {
  filter: string;
}

export interface PluginSelectState {
  expanded: string;
  allPlugins?: Plugin[];
  recentPlugins?: Plugin[];
}

export interface PluginMetaSelectState {
  expanded: string;
  allPlugins?: PluginMeta[];
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
  errors: Record<string, unknown>;
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
  params?: {
    dropdown: PluginParameter[];
    required: PluginParameter[];
  };
  id: string;
}

export interface RequiredParamProp {
  param: PluginParameter;
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

export interface AddNodeState extends InputState {
  stepIdReached: number;
  nodes?: PluginInstance[];
  pluginMeta?: PluginMeta;
  selectedPluginFromMeta?: Plugin;
  selectedComputeEnv: string;
  errors: Record<string, unknown>;
  editorValue: string;
  loading: boolean;
  isOpen: boolean;
  pluginMetas: PluginMeta[];
  componentList: string[];
  showPreviousRun: boolean;
  currentMetaIndex: number;
}

export enum Types {
  RequiredInput = "REQUIRED_INPUT",
  DropdownInput = "DROPDOWN_INPUT",
  SetPluginMeta = "SET_PLUGIN_META",
  SetPluginMetaList = "SET_PLUGIN_META_LIST",
  SetStepIdReached = "SET_STEP_ID_REACHED",
  SetSelectedPluginFromMeta = "SET_SELECTED_PLUGIN_FROM_META",
  SetToggleWizard = "SET_TOGGLE_WIZARD",
  SetComponentList = "SET_COMPONENT_LIST",
  DeleteComponentList = "DELETE_COMPONENT_LIST",
  SetEditorValue = "SET_EDITOR_VALUE",
  SetComputeEnv = "SET_COMPUTE_ENV",
  ResetState = "RESET_STATE",
  SetShowPreviousRun = "SET_SHOW_PREVIOUS_RUN",
  SetCurrentMetaIndex = "SET_CURRENT_META_INDEX",
}

export interface AddNodeStateActions {
  [Types.RequiredInput]: {
    input: {
      [id: string]: InputIndex;
    };
    editorValue: boolean;
  };

  [Types.DropdownInput]: {
    input: {
      [id: string]: InputIndex;
    };
    editorValue: boolean;
  };
  [Types.SetPluginMeta]: {
    pluginMeta: PluginMeta;
  };

  [Types.SetPluginMetaList]: {
    pluginMetas: PluginMeta[];
  };

  [Types.SetStepIdReached]: {
    id: number;
  };

  [Types.SetSelectedPluginFromMeta]: {
    plugin: Plugin;
  };
  [Types.SetToggleWizard]: {
    isOpen: boolean;
  };

  [Types.SetComponentList]: {
    componentList: string[];
  };

  [Types.DeleteComponentList]: {
    id: string;
  };
  [Types.SetEditorValue]: {
    value: string;
  };

  [Types.SetComputeEnv]: {
    computeEnv: string;
  };

  [Types.SetShowPreviousRun]: {
    showPreviousRun: boolean;
  };

  [Types.SetCurrentMetaIndex]: {
    currentIndex: number;
  };

  [Types.ResetState]: Record<string, unknown>;
}
