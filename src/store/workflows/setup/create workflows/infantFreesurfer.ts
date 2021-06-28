import { PluginInstance } from "@fnndsc/chrisapi";
import { IFSHackData, PluginList } from "../../types";
import ChrisAPIClient from "../../../../api/chrisapiclient";
import { setYieldAnalysis } from "../../saga";

export function* runInfantFreesurferWorkflow(
  dircopy: PluginInstance,
  pluginList: PluginList,
  infantAge: string
) {
  const client = ChrisAPIClient.getClient();
  const plInfantFs = pluginList["pl-infantfs"];
  const plInfantFsArgs: IFSHackData = {
    title: "infant-fs",
    previous_id: dircopy.data.id,
    age: +infantAge,
  };
  yield client.createPluginInstance(plInfantFs.data.id, plInfantFsArgs);
  yield setYieldAnalysis(3, "Created a Feed Tree", "finish", "");
  yield setYieldAnalysis(4, "Success", "finish", "");
}
