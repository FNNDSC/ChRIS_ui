import {
  CreateFeedData,
  CreateFeedActions,
  CreateFeedState,
  Types,
} from "../types";
import { Key } from "rc-tree/lib/interface";
import { clearCache } from "../ChrisFileSelect";
import { MainRouterContextState } from '../../../../routes';


import { InputType } from "../../AddNode/types";
import { PACSSeries } from "../../../../api/pfdcm";

function getDefaultCreateFeedData(selectedPacsData?: PACSSeries[]): CreateFeedData {
  return {
    feedName: "",
    feedDescription: "",
    tags: [],
    chrisFiles: [],
    localFiles: [],
    checkedKeys:{},
    pacsSeries: selectedPacsData || [],
  };
}

export function getInitialState(routerContextState?: MainRouterContextState) {
  const selectedPacsData = routerContextState?.selectData;
  const pacsDataSelected = !!selectedPacsData?.length;

  return {
    // if pacsdata is selected, the user is navigated directly 
    // from pacs lookup to create feed wizard
    wizardOpen: pacsDataSelected,

    step: 1,
    data: getDefaultCreateFeedData(selectedPacsData),
    selectedPlugin: undefined,
    selectedConfig: "",
    requiredInput: {},
    dropdownInput: {},
    feedProgress: "",
    feedError: "",
    value: 0,
    computeEnvironment: " ",
  };
}

export const createFeedReducer = (
  state: CreateFeedState,
  action: CreateFeedActions
): CreateFeedState => {
  switch (action.type) {
    case Types.ToggleWizzard:
      return {
        ...state,
        wizardOpen: !state.wizardOpen,
      };
    case Types.SetStep:
      return {
        ...state,
        step: action.payload.id,
      };
    case Types.FeedDescriptionChange:
      return {
        ...state,
        data: { ...state.data, feedDescription: action.payload.value },
      };
    case Types.FeedNameChange:
      return {
        ...state,
        data: { ...state.data, feedName: action.payload.value },
      };
    case Types.TagsChange:
      return {
        ...state,
        data: {
          ...state.data,
          tags: action.payload.tags,
        },
      };
    case Types.SelectedConfig:
      clearCache()
      return {
        ...state,
        data: {
          ...state.data,
          chrisFiles: [],
          localFiles: [],
          checkedKeys:{}          
        },
        requiredInput: {},
        dropdownInput: {},
        selectedPlugin: undefined,
        
        selectedConfig: action.payload.selectedConfig,
      
      };
    case Types.AddChrisFile:
      const file = action.payload.file;
      const checkedKeysDict: {
        [key: string]: Key[];
      } = { ...state.data.checkedKeys };

      if(!state.data.checkedKeys[file]){
        checkedKeysDict[file]=action.payload.checkedKeys
      }
      
      return {
        ...state,
        data: {
          ...state.data,
          chrisFiles: [...state.data.chrisFiles, action.payload.file],
          checkedKeys: checkedKeysDict
        },
    }
    case Types.RemoveChrisFile: {
      let checkedKeysDict: {
        [key:string]:Key[]
      }={}

      checkedKeysDict=Object.keys(state.data.checkedKeys).reduce(
        (object:{[key:string]:Key[]}, key)=>{
          if(key!==action.payload.file){
            object[key]=state.data.checkedKeys[key]
          }
          return object;
        },{})

      return {
        ...state,
        data: {
          ...state.data,
          chrisFiles: state.data.chrisFiles.filter(
            (path) => path !== action.payload.file
          ),
          checkedKeys:checkedKeysDict
        },
      };
      
    }

    case Types.AddLocalFile:
      return {
        ...state,
        data: {
          ...state.data,
          localFiles: action.payload.files,
        },
      };

    case Types.RemoveLocalFile:
      return {
        ...state,
        data: {
          ...state.data,
          localFiles: state.data.localFiles.filter(
            (file) => file.name !== action.payload.filename
          ),
        },
      };

    case Types.SelectPlugin: {
      if (action.payload.checked === true) {
        return {
          ...state,
          selectedPlugin: action.payload.plugin,
        };
      } else {
        return {
          ...state,
          selectedPlugin: undefined,
        };
      }
    }

    case Types.DropdownInput: {
      return {
        ...state,
        dropdownInput: {
          ...state.dropdownInput,
          [action.payload.id]: action.payload.input,
        },
      };
    }

    case Types.RequiredInput: {
      return {
        ...state,
        requiredInput: {
          ...state.requiredInput,
          [action.payload.id]: action.payload.input,
        },
      };
    }

    case Types.DeleteInput: {
      const { dropdownInput } = state;
      const { input } = action.payload;

      const newObject = Object.entries(dropdownInput)
        .filter(([key]) => {
          return key !== input;
        })
        .reduce((acc: InputType, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {});

      return {
        ...state,
        dropdownInput: newObject,
      };
    }

    case Types.ResetState: {
      clearCache();
      return {
        ...state,
        data: getDefaultCreateFeedData(),
        step: 1,
        selectedPlugin: undefined,
        selectedConfig: "",
        requiredInput: {},
        dropdownInput: {},
        computeEnvironment: "",
      };
    }

    case Types.SetProgress: {
       if (state.feedProgress.includes("Uploading Files To Cube")) {
        return {
           ...state,
           feedProgress: action.payload.feedProgress,
           value:state.value+5
         };
       } else {
         return {
           ...state,
           feedProgress: action.payload.feedProgress,
           value: state.value + 20,
         };
       }    
    }

    case Types.SetComputeEnvironment:{
      return {
        ...state,
        computeEnvironment:action.payload.computeEnvironment
      }
    }

    case Types.SetError: {
      return {
        ...state,
        feedError: action.payload.feedError,
      };
    }
    case Types.ResetProgress: {
      return {
        ...state,
        feedProgress: "",
        value: 0,
        feedError: "",
      };
    }

    default:
      return state;
  }
};
