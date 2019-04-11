import { PluginActionTypes ,IPluginState} from "../../../store/plugin/types";
import { IPluginItem } from "../../../api/models/pluginInstance.model";
import {pluginReducer} from "../../../store/plugin/reducer";
import { any, object } from "prop-types";
import {IUITreeNode} from "../../../api/models/file-explorer";
import { IFeedFile } from "../../../api/models/feed-file.model";
import { chrisId } from "../../../api/models/base.model";

const InitialState:IPluginState = {
    selected: undefined,
    descendants: undefined,
    files: [],
    explorer: undefined,
    parameters: []
    }

const TestItem : IPluginItem[] = 
    [{
        id: 1,
        title: "string",
        previous_id:2,
        plugin_id: 3,
        plugin_name: "string",
        pipeline_inst: null,
        feed_id: 4,
        start_date: "string",
        end_date: "string",
        status: "string",
        owner_username: "string",
        compute_resource_identifier: "string",
        cpu_limit: 5,
        memory_limit: 6,
        number_of_workers:7,
        gpu_limit: 8,
        url: "string",
        feed: "string",
        descendants: "string",
        files: "string",
        parameters: "string",
        plugin: "string",
        next: "string",
        previous: "string"
    }]

    const TestChrisId1 :chrisId = 1;
    const TestChrisId2 :chrisId = "testID";

    const TestFeedFile :IFeedFile[] = [{
        id: 1,
        feed_id: 4,
        plugin_inst_id: TestChrisId2,
        fname: "string",
        url: "string",
        file_resource: "string",
        plugin_instances: "string",
    }]

describe("Reducer of plugin", () => {
    it("the initial state should be ",() => {
        expect(pluginReducer(undefined,{type:any})).toEqual(
            InitialState
        )
    });

    it("GetPluginFileSuccess should return ",() => {

        expect(pluginReducer(InitialState,{
            type:PluginActionTypes.GET_PLUGIN_FILES_SUCCESS,
            payload: {
                data: {
                    results:TestFeedFile
                }
            }
        })).toEqual(
            {   selected: undefined,
                descendants: undefined,
                files:TestFeedFile,
                explorer: undefined,
                parameters: []
            }
        )


    });

    it("setExplorerSuccess should return" ,()=> {
        
        const Testfile:IFeedFile[] = [{
            id: TestChrisId1,
            feed_id: TestChrisId1,
            plugin_inst_id: TestChrisId1,
            fname: "string",
            url: "string",
            file_resource: "string",
            plugin_instances: "string"
        }];
        const TestTreeNode :IUITreeNode = {
            module: "root",
            children: []
          };
        
        const TestIUItreeNode2 = {
            module: "test",
            children: [],
            collapsed: false,
            leaf: false,
            file: 1
        }
        const TestIUItreeNode = {
            module: "test",
            children: [TestIUItreeNode2],
            collapsed: false,
            leaf: false,
            file: 1
        }
        //  {Testfile:IFeedFile[],TestItem:IPluginItem}
        
        expect(pluginReducer(InitialState,{
            type:PluginActionTypes.SET_EXPLORER_SUCCESS,
            payload: TestIUItreeNode
        })).toEqual(
            {
            selected: undefined,
            descendants: undefined,
            files: [],
            parameters: [],
            explorer: 
            {
                module: "test",
                children: [TestIUItreeNode2],
                collapsed: false,
                leaf: false,
                file: 1
            }
            }
        );
    });

    it("FetchError should return",() => {
        expect(pluginReducer(InitialState,{
            type:PluginActionTypes.FETCH_ERROR
        })).toEqual(InitialState)
    });
    it("FetchComplete should return",() => {
        expect(pluginReducer(InitialState,{
            type:PluginActionTypes.FETCH_COMPLETE
        })).toEqual(InitialState)
    });

    it("getPluginParametersSuccess should return ",() => {
        expect(pluginReducer(InitialState,{
            type:PluginActionTypes.GET_PLUGIN_PARAMETERS_SUCCESS,
            payload:{
                data: {
                    results:[TestItem]
                }
            }
        })).toEqual({
            selected: undefined,
            descendants: undefined,
            files: [],
            explorer: undefined,
            parameters: [TestItem]
            }
        )
    });
    
    it("getPluginDetailSuccess should return ",() => {
        const descendants = [TestItem];
        const selected = !![TestItem] &&
        [TestItem].length &&
        [TestItem][0];

        expect(pluginReducer(InitialState,{
            type:PluginActionTypes.GET_PLUGIN_DETAILS_SUCCESS,
            payload:{
                data : {
                    results:[TestItem]
                }
            }
        })).toEqual({
            selected: selected,
            descendants: descendants,
            files: [],
            explorer: undefined,
            parameters: []
        })

    })
    





});
