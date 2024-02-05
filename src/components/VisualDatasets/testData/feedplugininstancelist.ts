import { FeedPluginInstanceList } from "@fnndsc/chrisapi";
import data from "./feedplugininstancelist.json";

function getPluginInstances(): FeedPluginInstanceList {
  const list = new FeedPluginInstanceList(
    "https://example.org",
    { token: "i am a mock, I have no token"}
  );
  list.collection = data["collection"];
  return list;
}

export default getPluginInstances;
