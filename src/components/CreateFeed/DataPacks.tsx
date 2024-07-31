import { useEffect, useState, useContext, useRef, useCallback } from "react";
import type { PluginMeta } from "@fnndsc/chrisapi";
import {
  Pagination,
  ToolbarItem,
  Radio,
  Button,
  ButtonVariant,
  InputGroup,
  TextInput,
  useWizardContext,
} from "@patternfly/react-core";
import { SearchIcon } from "../Icons";
import { Types as AddNodeTypes } from "../AddNode/types";
import { Types } from "./types/feed";
import { notification } from "antd";
import debounce from "lodash/debounce";
import { getPlugins } from "./utils";
import { AddNodeContext } from "../AddNode/context";
import { CreateFeedContext } from "./context";

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

const DataPacks = ({ next }: { next: () => any }) => {
  const { state: addNodeState } = useContext(AddNodeContext);
  const { dispatch: nodeDispatch } = useContext(AddNodeContext);
  const { state, dispatch } = useContext(CreateFeedContext);
  const { pluginMeta } = addNodeState;
  const [fsPlugins, setfsPlugins] = useState<PluginMeta[]>([]);
  const [filterState, setFilterState] = useState<FilterProps>(getFilterState());
  const { perPage, currentPage, filter, itemCount } = filterState;

  const { goToNextStep: onNext, goToPrevStep: onBack } = useWizardContext();
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
      },
    );
  }, [filter, perPage, currentPage, pluginMeta]);

  useEffect(() => {
    if (pluginMeta) {
      setCurrentPluginId(pluginMeta.data.id);
    } else {
      setCurrentPluginId(-1);
    }
  }, [pluginMeta]);

  // only update filter every half-second, to avoid too many requests
  const handleFilterChange = debounce((_event, value: string) => {
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

  const handleOnChange = useCallback(
    (checked: any, plugin: PluginMeta) => {
      nodeDispatch({
        type: AddNodeTypes.SetPluginMeta,
        payload: {
          pluginMeta: plugin,
        },
      });

      notification.info({
        message: "Plugin Selected",
        description: `${plugin.data.name} plugin unselected`,
        duration: 1,
      });

      if (checked) {
        const nonDuplicateArray = new Set([
          ...state.selectedConfig,
          "fs_plugin",
        ]);
        dispatch({
          type: Types.SelectedConfig,
          payload: {
            selectedConfig: Array.from(nonDuplicateArray),
          },
        });
      }
      next();
    },
    [dispatch, next, nodeDispatch, state.selectedConfig],
  );

  const handleKeyDown = useCallback(
    (e: any, plugin: any = null) => {
      if (e.target.closest("INPUT#filter_plugin")) {
        return;
      }
      if (
        e.target.closest("BUTTON") &&
        !e.target.closest("BUTTON.pf-c-button.pf-m-secondary") &&
        !e.target.closest("BUTTON.pf-c-button.pf-m-primary")
      ) {
        return;
      }
      if (e.code == "Enter" && e.target.closest("DIV.pf-c-radio")) {
        e.preventDefault();
        if (pluginMeta === undefined) handleOnChange(true, plugin);
        onNext();
      } else if (pluginMeta && e.code == "ArrowRight") {
        onNext();
      } else if (e.code === "ArrowLeft") {
        onBack();
      }
    },
    [pluginMeta, handleOnChange, onNext, onBack],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div className="local-file-upload">
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
              <SearchIcon />
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
                onChange={(_event, checked: boolean) =>
                  handleOnChange(checked, plugin)
                }
                checked={currentPluginId === plugin.data.id}
              />
            </>
          );
        })}
      </div>
    </div>
  );
};

export default DataPacks;
