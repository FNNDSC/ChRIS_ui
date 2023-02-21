import React, {
  useEffect,
  useState,
  useContext,
  useRef,
  useCallback,
} from "react";
import { PluginMeta } from "@fnndsc/chrisapi";
import { Types as AddNodeTypes } from "../AddNode/types";
import { Types} from "./types/feed"
import { Pagination, ToolbarItem, Radio } from "@patternfly/react-core";
import {
  Button,
  ButtonVariant,
  InputGroup,
  TextInput,
} from "@patternfly/react-core";
import { FaSearch } from "react-icons/fa";
import debounce from "lodash/debounce";

import { getPlugins } from "./utils/dataPacks";
import { WizardContext } from "@patternfly/react-core/";
import { AddNodeContext } from "../AddNode/context";
import { CreateFeedContext } from "./context";
import { toast, ToastContainer } from "react-toastify";

interface FilterProps {
  perPage: number;
  currentPage: number;
  filter: string;
  itemCount: number;
}

const getFilterState = () => {
  return {
    perPage: 9,
    currentPage: 1,
    filter: "",
    itemCount: 0,
  };
};

const DataPacks: React.FC = () => {
  const { state: addNodeState } = useContext(AddNodeContext);
  const { dispatch: nodeDispatch } = useContext(AddNodeContext);
  const {state, dispatch} = useContext(CreateFeedContext)
  const { pluginMeta } = addNodeState;
  const [fsPlugins, setfsPlugins] = useState<PluginMeta[]>([]);
  const [filterState, setFilterState] = useState<FilterProps>(getFilterState());
  const { perPage, currentPage, filter, itemCount } = filterState;
  const { onNext, onBack } = useContext(WizardContext);
  const [currentPluginId, setCurrentPluginId] = useState(-1);
  const radioInput = useRef<any>();
  useEffect(() => {
    getPlugins(filter, perPage, perPage * (currentPage - 1), "fs").then(
      (pluginDetails) => {
        if (pluginDetails.plugins) {
          setfsPlugins(pluginDetails.plugins);
          setFilterState((filterState) => ({
            ...filterState,
            itemCount: pluginDetails.totalCount,
          }));
        }
      }
    );
  }, [filter, perPage, currentPage, pluginMeta]);

  useEffect(() => {
     if(pluginMeta){
      setCurrentPluginId(pluginMeta.data.id)
     }else{
      setCurrentPluginId(-1);

     }
  }, [pluginMeta])

  // only update filter every half-second, to avoid too many requests
  const handleFilterChange = debounce((value: string) => {
    setFilterState({
      ...filterState,
      filter: value,
    });
  }, 500);

  const handlePageSet = (_e: any, currentPage: number) => {
    setFilterState({
      ...filterState,
      currentPage,
    });
  };
  const handlePerPageSet = (_e: any, perPage: number) => {
    setFilterState({
      ...filterState,
      perPage,
    });
  };

  const handleOnChange = useCallback((checked: any, plugin: PluginMeta) => {
    nodeDispatch({
      type: AddNodeTypes.SetPluginMeta,
      payload: {
        pluginMeta: plugin,

      },
    });
    toast.success(` ${plugin.data.name} Selected`, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
    if(checked){
      const nonDuplicateArray = new Set([...state.selectedConfig, "fs_plugin"])
       dispatch({
        type: Types.SelectedConfig,
        payload:{
         selectedConfig: Array.from(nonDuplicateArray)
        }
       })
    }
  }, [dispatch, nodeDispatch, state.selectedConfig])

  const handleKeyDown = useCallback((e: any, plugin: any = null) => {
    if (e.target.closest('INPUT#filter_plugin')) { return }
    else if (e.target.closest('BUTTON') && !e.target.closest('BUTTON.pf-c-button.pf-m-secondary') && !e.target.closest('BUTTON.pf-c-button.pf-m-primary')) {
      return;
    } else if (e.code == "Enter" && e.target.closest('DIV.pf-c-radio')) {
      e.preventDefault()
      if (pluginMeta == undefined) handleOnChange(true, plugin)
      onNext()
    } else if (pluginMeta && e.code == "ArrowRight") {
      onNext()
    } else if (e.code == "ArrowLeft") {
      onBack()
    }
  }, [pluginMeta, handleOnChange, onNext, onBack])



  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div className="local-file-upload">
      <h1 className="pf-c-title pf-m-2xl">Analysis Synthesis Plugin</h1>
      <p>Please choose the Analysis Synthesis Plugin you&lsquo;d like to run</p>
      <br />

      <div className="fsplugin__datatoolbar">
        <ToolbarItem>
          <InputGroup>
            <TextInput
              name="filter_plugin"
              id="filter_plugin"
              type="search"
              aria-label="search input"
              placeholder="Search by name..."
              onChange={handleFilterChange}
            />
            <Button
              variant={ButtonVariant.control}
              aria-label="search button for the plugin"
            >
              <FaSearch />
            </Button>
          </InputGroup>
        </ToolbarItem>
        <ToolbarItem variant="pagination">
          <Pagination
            itemCount={itemCount}
            perPage={perPage}
            page={currentPage}
            onSetPage={handlePageSet}
            onPerPageSelect={handlePerPageSet}
          />
        </ToolbarItem>
      </div>

      <div>
        {fsPlugins.map((plugin) => {
          const { name, title, id } = plugin.data;
          return (
            <>
            <Radio
              key={id}
              aria-labelledby="plugin-radioButton"
              id={name}
              ref={radioInput}
              label={name}
              name="plugin-radioGroup"
              onKeyDown={(e) => handleKeyDown(e, plugin)}
              description={title}
              onChange={(checked: any) => handleOnChange(checked, plugin)}
              checked={currentPluginId === plugin.data.id}
            />
            <ToastContainer/>
            </>
          );
        })}
      </div>
    </div>
  );
};

export default DataPacks;
