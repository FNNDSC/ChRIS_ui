import React from 'react';
import { feedReducer } from '../../../src/store/feed/reducer'
import { IFeedState, FeedActionTypes } from "../../../src/store/feed/types";
import { any } from 'prop-types';
import { IFeedItem } from "../../../src/api/models/feed.model";
import { IPluginItem } from "../../../src/api/models/pluginInstance.model";

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

const Testitems: IPluginItem[] = [{
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

const initialState: IFeedState = {
  details: undefined,
  items: undefined
};

describe('feed reducer', () => {
  it('should return the initial state', () => {
    expect(feedReducer(initialState, {type:any})).toEqual(initialState)
  })
  
  it('should handle GET_FEED_DETAILS_SUCCESS', () => {
    expect(
      feedReducer(initialState, {
        type: FeedActionTypes.GET_FEED_DETAILS_SUCCESS,
        payload: TestIFeedItem
      })
    ).toEqual(
      {
        details: TestIFeedItem,
        items: undefined
      })
  })

  it('should handle GET_PLUGIN_INSTANCES_SUCCESS', () => {
    expect(
      feedReducer(initialState, {
        type: FeedActionTypes.GET_PLUGIN_INSTANCES_SUCCESS,
        payload: TestIFeedItem
      })
    ).toEqual(
      {
        details: undefined,
        items: Testitems
      })
  })

  it('should handle FETCH_REQUEST', () => {
    expect(
      feedReducer(initialState, {
        type: FeedActionTypes.FETCH_REQUEST,
        payload: TestIFeedItem
      })
    ).toEqual(
      {
        details: undefined,
        items: undefined
      })
  })

  it('should handle FETCH_SUCCESS', () => {
    expect(
      feedReducer(initialState, {
        type: FeedActionTypes.FETCH_SUCCESS,
        payload: TestIFeedItem
      })
    ).toEqual(
      {
        details: undefined,
        items: undefined
      })
  })

  it('should handle FETCH_ERROR', () => {
    expect(
      feedReducer(initialState, {
        type: FeedActionTypes.FETCH_ERROR,
        payload: TestIFeedItem
      })
    ).toEqual(
      {
        details: undefined,
        items: undefined
      })
  })

  it('should handle FETCH_COMPLETE', () => {
    expect(
      feedReducer(initialState, {
        type: FeedActionTypes.FETCH_COMPLETE,
        payload: TestIFeedItem
      })
    ).toEqual(
      {
        details: undefined,
        items: undefined
      })
  })

  it('should handle RESET_STATE', () => {
    expect(
      feedReducer(initialState, {
        type: FeedActionTypes.RESET_STATE,
        payload: TestIFeedItem
      })
    ).toEqual(
      {
        details: undefined,
        items: undefined
      })
  })
})