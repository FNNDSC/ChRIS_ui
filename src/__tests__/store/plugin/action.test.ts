import {
  getPluginDescendantsRequest,
  getPluginDescendantsSuccess,
  getPluginDetailsRequest,
  getPluginDetailsSuccess,
  getPluginFilesSuccess,
  getPluginFiles,
} from "../../../store/plugin/actions";
import { PluginActionTypes } from "../../../store/plugin/types";
import { IPluginItem } from "../../../api/models/pluginInstance.model";

describe("actions of plugin", () => {
  const TestItem: IPluginItem = {
    id: 1,
    title: "testPlugin",
    previous_id: 2,
    plugin_id: 3,
    plugin_version: "v01",
    plugin_name: "MRI",
    pipeline_inst: null,
    feed_id: 4,
    start_date: "2019-02-28",
    end_date: "2019-03-18",
    status: "good",
    owner_username: "Joe",
    compute_resource_identifier: "Chandler",
    cpu_limit: 5,
    memory_limit: 6,
    number_of_workers: 7,
    gpu_limit: 8,
    url: "www.chrisplugintest.com",
    feed: "christestfeed",
    descendants: "testdescendants",
    files: "plugin",
    parameters: "plugin_para",
    plugin: "test",
    next: "test2",
    previous: "test0",
  };

  it("getPluginDescendantsRequest should return", () => {
    const TestString = "string";
    const expectedResult = {
      type: PluginActionTypes.GET_PLUGIN_DESCENDANTS,
      payload: TestString,
    };
    expect(getPluginDescendantsRequest(TestString)).toEqual(expectedResult);
  });

  it("getPluginDescendantsSuccess should return", () => {
    const expectedResult = {
      type: PluginActionTypes.GET_PLUGIN_DESCENDANTS_SUCCESS,
      payload: [TestItem],
    };
    expect(getPluginDescendantsSuccess([TestItem])).toEqual(expectedResult);
  });

  it("getPluginFilesRequest should return", () => {
    const expectedResult = {
      type: PluginActionTypes.GET_PLUGIN_FILES,
      payload: TestItem,
    };
    expect(getPluginFiles(TestItem)).toEqual(expectedResult);
  });

  it("getPluginFilesSuccess should return", () => {
    const expectedResult = {
      type: PluginActionTypes.GET_PLUGIN_FILES_SUCCESS,
      payload: [TestItem],
    };
    expect(getPluginFilesSuccess([TestItem])).toEqual(expectedResult);
  });

  it("getPluginDetailsRequest should return", () => {
    // fetchMock
    // .getOnce("")

    const expectedResult = {
      type: PluginActionTypes.GET_PLUGIN_DETAILS,
      payload: TestItem,
    };
    expect(getPluginDetailsRequest(TestItem)).toEqual(expectedResult);
  });

  it("getPluginDetailsSuccess should return", () => {
    const expectedResult = {
      type: PluginActionTypes.GET_PLUGIN_DETAILS_SUCCESS,
      payload: [TestItem],
    };
    expect(getPluginDetailsSuccess([TestItem])).toEqual(expectedResult);
  });
});
