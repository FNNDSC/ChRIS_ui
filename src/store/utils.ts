import {
  PluginInstance,
  PluginInstanceFileList,
  PluginInstanceList,
} from "@fnndsc/chrisapi";
import ChrisAPIClient from "../api/chrisapiclient";

export function* getPluginFiles(plugin: PluginInstance) {
  const params = { limit: 200, offset: 0 };
  let fileList: PluginInstanceFileList = yield plugin.getFiles(params);
  let files = fileList.getItems();

  while (fileList.hasNextPage) {
    try {
      params.offset += params.limit;
      fileList = yield plugin.getFiles(params);
      files = files.concat(fileList.getItems());
    } catch (e) {
      throw new Error("Error while paginating files");
    }
  }
  return files;
}

export function* getPlugin(pluginName: string) {
  const client = ChrisAPIClient.getClient();
  const pluginLookup: PluginInstanceList = yield client.getPlugins({
    name_exact: pluginName,
  });
  const plugin: Plugin = yield pluginLookup.getItems()[0];
  return plugin;
}

export function* checkRegistration(workflowType: string) {
  let registrationSuccessfull = false;

  const dircopy: Plugin = yield getPlugin("pl-dircopy");
  const med2Img: Plugin = yield getPlugin("pl-med2Img");

  let workflowPlugin: Plugin | undefined = undefined;

  if (workflowType === "covidnet") {
    workflowPlugin = yield getPlugin("pl-covidnet");
  }

  if (workflowType === "infant-freesurfer") {
    workflowPlugin = yield getPlugin("pl-fshack-infant");
  }
  if (workflowType === "adult-freesurfer") {
    workflowPlugin = yield getPlugin("pl-fshack");
  }

  if (dircopy && med2Img && workflowPlugin) {
    registrationSuccessfull = true;
  }
  return {
    registrationSuccessfull,
    pluginList: {
      dircopy,
      workflowPlugin,
      med2Img,
    },
  };
}

export function* fastsurferRegistration() {
  const plMriSagAnon: Plugin = yield getPlugin("pl-mri_sag_anon_192");
  const plPfdicomTagSub: Plugin = yield getPlugin("pl-pfdicom_tagsub");
  const plPfdicomTagExtract: Plugin = yield getPlugin("pl-pfdicom_tagextract");
  const plFshack: Plugin = yield getPlugin("pl-fshack");
  const plMultipass: Plugin = yield getPlugin("pl-multipass");
  const plPfdoRun: Plugin = yield getPlugin("pl-pfdorun");
  const plMgz2Report: Plugin = yield getPlugin("pl-mgz2lut_report");
  let registrationSuccessfull = false;

  if (
    plMgz2Report &&
    plPfdoRun &&
    plMultipass &&
    plFshack &&
    plPfdicomTagExtract &&
    plPfdicomTagSub &&
    plMriSagAnon
  ) {
    registrationSuccessfull = true;
  }
  return {
    registrationSuccessfull,
    pluginList: {
      plMriSagAnon,
      plPfdicomTagSub,
      plPfdicomTagExtract,
      plFshack,
      plMultipass,
      plPfdoRun,
      plMgz2Report,
    },
  };
}
