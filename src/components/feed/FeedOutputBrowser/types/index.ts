export interface PluginStatusProps {
  pluginStatus?: string;
  pluginLog?: {};
}

type Return = {
  [key: string]: [boolean];
};

type Status = {
  [key: string]: boolean;
};

type Submit = {
  submit: boolean;
};

export interface PluginStatusLabels {
  pushPath: { [key: string]: boolean };
  compute: {
    [key: string]: Return & Status & Submit;
  };
  swiftPut: { [key: string]: boolean };
  pullPath: { [key: string]: boolean };
}

export interface Label {
  [key: string]: boolean;
}
export interface Logs {
  [info: string]: {
    [key: string]: {
      [key: string]: string;
    };
  };
}

export interface LogStatus {
  [key: string]: {};
}
