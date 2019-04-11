import { feedReducer } from "../../../store/feed/reducer"
import { IFeedState, FeedActionTypes } from "../../../store/feed/types";
import { IFeedItem } from "../../../api/models/feed.model";
import { IPluginItem } from "../../../api/models/pluginInstance.model";

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

const Testitems:IPluginItem[] = [{
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

const initialState: IFeedState = {
  details: undefined,
  items: undefined
};

describe("feed reducer", () => {
  it("should return the initial state", () => {
    expect(feedReducer(initialState, {type: null})).toEqual(initialState)
  })
  
  it("should handle GET_FEED_DETAILS_SUCCESS", () => {
    expect(
      feedReducer(initialState, {
        type: FeedActionTypes.GET_FEED_DETAILS_SUCCESS,
        payload: TestFeedItem
      })
    ).toEqual(
      { ...initialState,
        details: TestFeedItem,
      })
  })

  it("should handle GET_PLUGIN_INSTANCES_SUCCESS", () => {
    expect(
      feedReducer(initialState, {
        type: FeedActionTypes.GET_PLUGIN_INSTANCES_SUCCESS,
        payload:{
            data: {
              results: Testitems
            }
        }
      })
    ).toEqual(
      {
        ...initialState,
        items: Testitems
      })
  })

  it("should handle FETCH_REQUEST", () => {
    expect(
      feedReducer(initialState, {
        type: FeedActionTypes.FETCH_REQUEST,
      })
    ).toEqual(
      {
        ...initialState,
      })
  })

  it("should handle FETCH_SUCCESS", () => {
    expect(
      feedReducer(initialState, {
        type: FeedActionTypes.FETCH_SUCCESS,
        payload: {
          data: {
          results: Testitems
         }
        }
      })
    ).toEqual(
      {
        ...initialState,
        items: Testitems
      })
  })

  it("should handle FETCH_ERROR", () => {
    expect(
      feedReducer(initialState, {
        type: FeedActionTypes.FETCH_ERROR,
      })
    ).toEqual(
      {
        ...initialState,
      })
  })

  it("should handle FETCH_COMPLETE", () => {
    expect(
      feedReducer(initialState, {
        type: FeedActionTypes.FETCH_COMPLETE,
      })
    ).toEqual(
      {
        ...initialState,
      })
  })

  it("should handle RESET_STATE", () => {
    expect(
      feedReducer(initialState, {
        type: FeedActionTypes.RESET_STATE,
      })
    ).toEqual(
      {
        ...initialState,
      })
  })
})