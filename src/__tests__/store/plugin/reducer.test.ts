import { PluginActionTypes ,IPluginState} from "../../../store/plugin/types";
import { IPluginItem } from "../../../api/models/pluginInstance.model";
import {pluginReducer} from "../../../store/plugin/reducer";
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

const TestItem:IPluginItem[] = [{
    id: 1,
    title: "testPlugin",
    previous_id:2,
    plugin_id: 3,
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
    number_of_workers:7,
    gpu_limit: 8,
    url: "www.chrisplugintest.com",
        feed: "christestfeed",
    descendants: "testdescendants",
    files: "plugin",
    parameters: "plugin_para",
    plugin: "test",
    next: "test2",
    previous: "test0"
}]


    const TestChrisId1 :chrisId = 1;
    const TestChrisId2 :chrisId = "23";

    const TestFeedFile :IFeedFile[] = [{
        id: 1,
        feed_id: 4,
        plugin_inst_id: TestChrisId2,
        fname: "boston_BU_MRI",
        url: "www.chrisfeed.com",
        file_resource: "www.chrismocbackend.com",
        plugin_instances: "MRI",
    }]

describe("Reducer of plugin", () => {
    it("the initial state should be ",() => {
        expect(pluginReducer(undefined,{type:null})).toEqual(
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
            {   
                ...InitialState,
                files:TestFeedFile
            }
        )


    });

    it("setExplorerSuccess should return" ,()=> {
        
        const Testfile:IFeedFile[] = [{
            id: TestChrisId1,
            feed_id: TestChrisId1,
            plugin_inst_id: TestChrisId1,
            fname: "boston_BU_MRI",
            url: "www.chrisfeed.com",
            file_resource: "www.chrismocbackend.com",
            plugin_instances: "MRI",
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
            ...InitialState,
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
            ...InitialState,
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
            ...InitialState,
            selected: selected,
            descendants: descendants
        })

    })
    





});
