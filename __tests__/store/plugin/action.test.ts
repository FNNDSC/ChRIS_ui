import React from "react";
import {
		getPluginDescendantsRequest,
		getPluginDescendantsSuccess,
		getPluginDetailsRequest,
		getPluginDetailsSuccess,
		getPluginParametersRequest,
		getPluginParametersSuccess,
		getPluginFilesRequest,
		getPluginFilesSuccess
		} from "../../../src/store/plugin/actions";
import { PluginActionTypes } from "../../../src/store/plugin/types";
import { IPluginItem } from "../../../src/api/models/pluginInstance.model";

describe('actions of plugin', () => {

	it("getPluginDescendantsRequest should return",() => {
		const TestString = "string";
		const expectedResult = 
		{
			type:PluginActionTypes.GET_PLUGIN_DESCENDANTS,
			payload: TestString
		}
		expect(getPluginDescendantsRequest(TestString)).toEqual(expectedResult)
		})

	it("getPluginDescendantsSuccess should return",() => {
		const TestItem:IPluginItem[] = [{
		    id: 1,
		    title: "string",
		    previous_id:2,
		    plugin_id: 3,
		    plugin_name: 'string',
		    pipeline_inst: null,
		    feed_id: 4,
		    start_date: 'string',
		    end_date: "string",
		    status: "string",
		    owner_username: "string",
		    compute_resource_identifier: "string",
		    cpu_limit: 5,
		    memory_limit: 6,
		    number_of_workers:7,
		    gpu_limit: 8,
		    url: 'string',
   			feed: 'string',
    		descendants: 'string',
	    	files: 'string',
		    parameters: 'string',
		    plugin: 'string',
		    next: 'string',
		    previous: 'string'
		}]

		const expectedResult = 
		{
			type:PluginActionTypes.GET_PLUGIN_DESCENDANTS_SUCCESS,
			payload: TestItem
		}
		expect(getPluginDescendantsSuccess(TestItem)).toEqual(expectedResult)
		})

	it("getPluginFilesRequest should return",() => {
		const TestString = "string";
		const expectedResult = 
		{
			type:PluginActionTypes.GET_PLUGIN_FILES,
			payload: TestString
		}
		expect(getPluginFilesRequest(TestString)).toEqual(expectedResult)
		})

	it("getPluginFilesSuccess should return",() => {
		const TestItem = [{
		    id: 1,
		    title: "string",
		    previous_id:2,
		    plugin_id: 3,
		    plugin_name: 'string',
		    pipeline_inst: null,
		    feed_id: 4,
		    start_date: 'string',
		    end_date: "string",
		    status: "string",
		    owner_username: "string",
		    compute_resource_identifier: "string",
		    cpu_limit: 5,
		    memory_limit: 6,
		    number_of_workers:7,
		    gpu_limit: 8,
		    url: 'string',
   			feed: 'string',
    		descendants: 'string',
	    	files: 'string',
		    parameters: 'string',
		    plugin: 'string',
		    next: 'string',
		    previous: 'string'
		}]

		const expectedResult = 
		{
			type:PluginActionTypes.GET_PLUGIN_FILES_SUCCESS,
			payload: TestItem
		}
		expect(getPluginFilesSuccess(TestItem)).toEqual(expectedResult)
		})


	it("getPluginParametersRequest should return",() => {
		const TestString = "string";
		const expectedResult = 
		{
			type:PluginActionTypes.GET_PLUGIN_PARAMETERS,
			payload: TestString
		}
		expect(getPluginParametersRequest(TestString)).toEqual(expectedResult)
		})

	it("getPluginParametersSuccess should return",() => {
		const TestItem = [{
		    id: 1,
		    title: "string",
		    previous_id:2,
		    plugin_id: 3,
		    plugin_name: 'string',
		    pipeline_inst: null,
		    feed_id: 4,
		    start_date: 'string',
		    end_date: "string",
		    status: "string",
		    owner_username: "string",
		    compute_resource_identifier: "string",
		    cpu_limit: 5,
		    memory_limit: 6,
		    number_of_workers:7,
		    gpu_limit: 8,
		    url: 'string',
   			feed: 'string',
    		descendants: 'string',
	    	files: 'string',
		    parameters: 'string',
		    plugin: 'string',
		    next: 'string',
		    previous: 'string'
		}]

		const expectedResult = 
		{
			type:PluginActionTypes.GET_PLUGIN_PARAMETERS_SUCCESS,
			payload: TestItem
		}
		expect(getPluginParametersSuccess(TestItem)).toEqual(expectedResult)
		})

	it("getPluginDetailsRequest should return",() => {
		// fetchMock
		// .getOnce("")

		const TestItem = {
		    id: 1,
		    title: "string",
		    previous_id:2,
		    plugin_id: 3,
		    plugin_name: 'string',
		    pipeline_inst: null,
		    feed_id: 4,
		    start_date: 'string',
		    end_date: "string",
		    status: "string",
		    owner_username: "string",
		    compute_resource_identifier: "string",
		    cpu_limit: 5,
		    memory_limit: 6,
		    number_of_workers:7,
		    gpu_limit: 8,
		    url: 'string',
   			feed: 'string',
    		descendants: 'string',
	    	files: 'string',
		    parameters: 'string',
		    plugin: 'string',
		    next: 'string',
		    previous: 'string'
		}

		const expectedResult = 
		{
			type:PluginActionTypes.GET_PLUGIN_DETAILS,
			payload: TestItem
		}
		expect(getPluginDetailsRequest(TestItem)).toEqual(expectedResult)
		})

	it("getPluginDetailsSuccess should return",() => {
		const TestItem = [{
		    id: 1,
		    title: "string",
		    previous_id:2,
		    plugin_id: 3,
		    plugin_name: 'string',
		    pipeline_inst: null,
		    feed_id: 4,
		    start_date: 'string',
		    end_date: "string",
		    status: "string",
		    owner_username: "string",
		    compute_resource_identifier: "string",
		    cpu_limit: 5,
		    memory_limit: 6,
		    number_of_workers:7,
		    gpu_limit: 8,
		    url: 'string',
   			feed: 'string',
    		descendants: 'string',
	    	files: 'string',
		    parameters: 'string',
		    plugin: 'string',
		    next: 'string',
		    previous: 'string'
		}]

		const expectedResult = 
		{
			type:PluginActionTypes.GET_PLUGIN_DETAILS_SUCCESS,
			payload: TestItem
		}
		expect(getPluginDetailsSuccess(TestItem)).toEqual(expectedResult)
		})
});
