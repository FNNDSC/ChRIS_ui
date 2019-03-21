import React from 'react';
import { FeedActionTypes,  } from "../../../src/store/feed/types";
import { IFeedItem } from "../../../src/api/models/feed.model";
import { IPluginItem } from "../../../src/api/models/pluginInstance.model";
import * as actions from "../../../src/store/feed/actions"; 

describe('actions', () => {
  it('getFeedDetailsRequest should return correct types', () => {
    const id: string = 'testID'
    const expectedAction = {
      type: FeedActionTypes.GET_FEED_DETAILS,
      payload: id
    }
    expect(actions.getFeedDetailsRequest(id)).toEqual(expectedAction)
  })

  it('getFeedDetailsSuccess should return correct types', () => {
    const TestIFeedItem: IFeedItem = {
      url: 'string',
      files: 'string',
      comments: 'string',
      owner: ['string'],
      note: 'string',
      tags: 'string',
      taggings: 'string',
      plugin_instances: 'string',
      id: 123,
      creation_date: '3/19/2019',
      modification_date: '3/20/2019',
      name: 'Chris',
      template: {
        data: [{
          name: 'string',
          value: 123
        }]
      },
      creator_username: 'Chris_user'
    }
    
    const expectedAction = {
      type: FeedActionTypes.GET_FEED_DETAILS_SUCCESS,
      payload:TestIFeedItem
    }
    
    expect(actions.getFeedDetailsSuccess(TestIFeedItem)).toEqual(expectedAction)
  })

  it('getPluginInstanceListRequest should return correct types', () => {
    const url: string = 'https://www.google.com'
    const expectedAction = {
      type: FeedActionTypes.GET_PLUGIN_INSTANCES,
      payload: url
    }
    expect(actions.getPluginInstanceListRequest(url)).toEqual(expectedAction)
  })

  it('getPluginInstanceListSuccess should return correct types', () => {
    const items: IPluginItem[] = [{
      url: 'string',
      feed: 'string',
      descendants: 'string',
      files: 'string',
      parameters: 'string',
      plugin: 'string',
      next: 'string',
      previous: 'string',
      id: 123,
      title: 'string',
      previous_id: 123,
      plugin_id: 123,
      plugin_name: 'string',
      pipeline_inst: null,
      feed_id: 123,
      start_date: 'string',
      end_date: 'string',
      status: 'string',
      owner_username: 'string',
      compute_resource_identifier: 'string',
      cpu_limit: 123,
      memory_limit: 123,
      number_of_workers: 123,
      gpu_limit: 123,
    }]
    const expectedAction = {
      type: FeedActionTypes.GET_PLUGIN_INSTANCES_SUCCESS,
      payload: items
    }
    expect(actions.getPluginInstanceListSuccess(items)).toEqual(expectedAction)
  })

  it('destroyFeed should return correct types', () => {
    const expectedAction = {
      type: FeedActionTypes.RESET_STATE,
    }
    expect(actions.destroyFeed()).toEqual(expectedAction)
  })
})