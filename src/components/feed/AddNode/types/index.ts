import {
  Plugin,
  PluginParameter,
  PluginInstance,
  PluginMeta,
} from "@fnndsc/chrisapi";
import { IUserState } from "../../../../store/user/types";

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
  errors: string[];
  alertVisible: boolean;
  docsExpanded: boolean;
}

export interface chooseConfigProps {
  user?: IUserState;
  handleFileUpload: (files: any[]) => void;
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
  errors?: Record<string, unknown>;
  editorValue: string;
  loading: boolean;
  isOpen: boolean;
  pluginMetas: PluginMeta[];
  componentList: string[];
  showPreviousRun: boolean;
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
  SetError = "SET_ERROR",
}

export interface AddNodeStateActions {
  [Types.SetError]: {
    error: any;
  };

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

  [Types.ResetState]: Record<string, unknown>;
}
