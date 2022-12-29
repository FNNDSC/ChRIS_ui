import React, { useEffect, useState, useContext, useRef, useCallback } from "react";
import { Plugin } from "@fnndsc/chrisapi";
import { Types } from "./types/feed";
import { CreateFeedContext } from "./context";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import {
  Pagination,
  ToolbarItem,
  Radio,
} from "@patternfly/react-core";
import {
  Button,
  ButtonVariant,
  InputGroup,
  TextInput,
} from "@patternfly/react-core";
import { FaSearch } from "react-icons/fa";
import debounce from "lodash/debounce";

import { getParams } from "../../../store/plugin/actions";
import { getPlugins } from "./utils/dataPacks";
import { WizardContext } from "@patternfly/react-core/";


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

interface DataPacksReduxProp {
  getParams: (plugin: Plugin) => void;
}

const DataPacks: React.FC<DataPacksReduxProp> = (props: DataPacksReduxProp) => {
  const { state, dispatch } = useContext(CreateFeedContext);
  const { selectedPlugin } = state
  const [fsPlugins, setfsPlugins] = useState<Plugin[]>([]);
  const [filterState, setFilterState] = useState<FilterProps>(getFilterState());
  const { perPage, currentPage, filter, itemCount } = filterState;
  const {onNext, onBack} = useContext(WizardContext)
  const radioInput = useRef<any>()
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
  }, [filter, perPage, currentPage, selectedPlugin]);

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

  const handleOnChange = (checked:any, plugin: Plugin) =>{
    checked === true && props.getParams(plugin);
    dispatch({
      type: Types.SelectPlugin,
      payload: {
        plugin,
        checked,
      },
    });
  }

  const handleKeyDown = useCallback((e: any) => {
    if (selectedPlugin && e.code == "Enter" ) {
      e.preventDefault()
      onNext()
    } else if (selectedPlugin && e.code == "ArrowRight") {
      e.preventDefault()
      onNext()
    } else if (e.code == "ArrowLeft") {
      e.preventDefault()
      onBack()
    }
  }, [onNext, onBack, selectedPlugin])

 
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [ handleKeyDown])

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
          {fsPlugins.map((plugin, index) => {
            const { title, name } = plugin.data;
            const pluginName = `${title ? title : `${name} v.${plugin.data.version}`
              }`
            return (
              <>
                <Radio
                  key={index}
                  aria-labelledby="plugin-radioButton"
                  id={pluginName}
                  ref={radioInput}
                  label={pluginName}
                  name="plugin-radioButton"
                  description={plugin.data.description}
                  onChange={(checked:any) => handleOnChange(checked, plugin)}
                  checked={selectedPlugin?.data.id === plugin.data.id}
                />
                </>
            )})}
            </div>
            </div>
          
      );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
        getParams: (plugin: Plugin) => dispatch(getParams(plugin)),
});

      export default connect(null, mapDispatchToProps)(DataPacks);
