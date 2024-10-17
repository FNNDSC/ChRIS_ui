import type { ComputeResource, Pipeline } from "@fnndsc/chrisapi";
import {
  MenuToggle,
  type MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
} from "@patternfly/react-core";
import { useQuery } from "@tanstack/react-query";
import { Avatar } from "../Antd";
import React, { useContext } from "react";
import ChrisAPIClient from "../../api/chrisapiclient";
import { fetchResource } from "../../api/common";
import { stringToColour } from "../CreateFeed/utils";
import { PipelineContext, Types } from "./context";
import { useLocation } from "react-router";

type OwnProps = {
  pipeline: Pipeline;
};

function SelectAllCompute({ pipeline }: OwnProps) {
  const location = useLocation();
  const { id } = pipeline.data;
  const { state, dispatch } = useContext(PipelineContext);
  const [isOpen, setIsOpen] = React.useState(false);

  const selectedItem = state.generalCompute?.[id] || "";

  const fetchCompute = async () => {
    const client = ChrisAPIClient.getClient();
    const fn = client.getComputeResources;
    const boundFn = fn.bind(client);
    try {
      const data: {
        resource: ComputeResource[];
        totalCount: number;
      } = await fetchResource<ComputeResource>(
        { limit: 100, offset: 0 },
        boundFn,
      );
      return data;
    } catch (e) {
      throw new Error(
        "Count not fetch the compute resources registered to this ChRIS instance",
      );
    }
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["computeResource"],
    queryFn: () => fetchCompute(),
  });

  const onSelect = (
    event: React.MouseEvent<Element, MouseEvent> | undefined,
    value: string | number | undefined,
  ) => {
    event?.stopPropagation();

    if (value === "none") {
      dispatch({
        type: Types.SetAllCompute,
        payload: {
          pipelineId: id,
          compute: "",
        },
      });
    } else
      dispatch({
        type: Types.SetAllCompute,
        payload: {
          pipelineId: id,
          compute: value as string,
        },
      });
  };

  const onToggleClick = (e: any) => {
    e?.stopPropagation();
    setIsOpen(!isOpen);
  };

  const browseOnly = location.pathname === "/pipelines";
  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={onToggleClick}
      isExpanded={isOpen}
      style={
        {
          width: "200px",
        } as React.CSSProperties
      }
    >
      {browseOnly
        ? "List of Compute"
        : selectedItem
          ? selectedItem
          : "Set a Compute for the Tree"}
    </MenuToggle>
  );

  return (
    <Select
      onOpenChange={(nextOpen: boolean) => setIsOpen(nextOpen)}
      selected={data?.resource || []}
      onSelect={onSelect}
      isOpen={isOpen}
      toggle={toggle}
    >
      <SelectList>
        {data?.resource && !isLoading && !isError ? (
          data.resource.map((resource) => {
            return (
              <SelectOption
                isSelected={resource.data.name === selectedItem}
                value={resource.data.name}
                key={resource.data.name}
              >
                <Avatar
                  style={{
                    background: `${stringToColour(resource.data.name)}`,
                    marginRight: "0.5em",
                  }}
                />
                <span>{resource.data.name}</span>
              </SelectOption>
            );
          })
        ) : (
          <SelectOption>No Compute Registered</SelectOption>
        )}
        {isLoading && <span>Fetching compute...</span>}
        {isError && <span>{error.message}</span>}
        <SelectOption isSelected={!selectedItem} value="none">
          None Selected
        </SelectOption>
      </SelectList>
    </Select>
  );
}

export default SelectAllCompute;
