import { FeedActionTypes,  } from "../../../store/feed/types";
import { IFeedItem } from "../../../api/models/feed.model";
import { IPluginItem } from "../../../api/models/pluginInstance.model";
import {
  getFeedDetailsRequest,
  getFeedDetailsSuccess,
  getPluginInstanceListRequest,
  getPluginInstanceListSuccess,
  destroyFeed, 
  addFeed 
} from "../../../store/feed/actions";

describe("feed actions", () => {

  const TestFeedItem: IFeedItem = {
    url: "https://www.redhat.com/en/creating-chris",
    files: "vedio.mp4",
    comments: "initial comments",
    owner: ["Ethan", "Kevin"],
    note: "This is a note",
    tags: "testing",
    taggings: "what is the difference between tag and tagging?",
    plugin_instances: "simpledsapp",
    id: 123456,
    creation_date: "3/19/2019",
    modification_date: "3/20/2019",
    name: "Chris",
    template: {
      data: [{
        name: "patientA",
        value: 123
      }]
    },
    creator_username: "Chris_user"
  }

  it("getFeedDetailsRequest should return correct types", () => {
    const id: string = "testID"
    const expectedAction = {
      type: FeedActionTypes.GET_FEED_DETAILS,
      payload: id
    }
    expect(getFeedDetailsRequest(id)).toEqual(expectedAction)
  })

  it("getFeedDetailsSuccess should return correct types", () => {
    const expectedAction = {
      type: FeedActionTypes.GET_FEED_DETAILS_SUCCESS,
      payload:TestFeedItem
    }

    expect(getFeedDetailsSuccess(TestFeedItem)).toEqual(expectedAction)
  })

  it("getPluginInstanceListRequest should return correct types", () => {
    const url: string = "https://www.google.com"
    const expectedAction = {
      type: FeedActionTypes.GET_PLUGIN_INSTANCES,
      payload: url
    }
    expect(getPluginInstanceListRequest(url)).toEqual(expectedAction)
  })

  it("getPluginInstanceListSuccess should return correct types", () => {
    const items: IPluginItem[] = [{
      url: "https://www.redhat.com/en/creating-chris",
      feed: "This is a feed",
      descendants: "descendants",
      files: "whatever.txt",
      parameters: "e=mc2",
      plugin: "simpledsapp",
      next: "pacsretrieve",
      previous: "s3retrieve",
      id: 123,
      title: "title",
      previous_id: 325342,
      plugin_id: 53425,
      plugin_name: "simpledsapp",
      pipeline_inst: null,
      feed_id: 435634,
      start_date: "02/01/2019",
      end_date: "02/01/2100",
      status: "working",
      owner_username: "ethanhou",
      compute_resource_identifier: "wow",
      cpu_limit: 8,
      memory_limit: 1024,
      number_of_workers: 10,
      gpu_limit: 8,
    }]
    const expectedAction = {
      type: FeedActionTypes.GET_PLUGIN_INSTANCES_SUCCESS,
      payload: items
    }
    expect(getPluginInstanceListSuccess(items)).toEqual(expectedAction)
  })

  it("destroyFeed should return correct types", () => {
    const expectedAction = {
      type: FeedActionTypes.RESET_STATE,
    }
    expect(destroyFeed()).toEqual(expectedAction)
  })
  
  it("addFeed should return correct types", () => {
    const expectedAction = {
      type: FeedActionTypes.ADD_FEED,
      payload: TestFeedItem
    }
    expect(addFeed(TestFeedItem)).toEqual(expectedAction);
  })
})
