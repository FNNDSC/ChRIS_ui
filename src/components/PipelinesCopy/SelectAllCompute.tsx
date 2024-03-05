import { ComputeResource } from "@fnndsc/chrisapi";
import {
  Select,
  SelectList,
  MenuToggle,
  MenuToggleElement,
  SelectOption,
} from "@patternfly/react-core";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import ChrisAPIClient from "../../api/chrisapiclient";
import { fetchResource } from "../../api/common";

function SelectAllCompute() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState("");
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
      setSelectedItem("");
    } else setSelectedItem(value as string);
  };

  const onToggleClick = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

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
      {selectedItem ? "Compute Selected" : "Select a Compute"}
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
        {data?.resource ? (
          data.resource.map((resource) => {
            return (
              <SelectOption
                isSelected={resource.data.name === selectedItem}
                value={resource.data.name}
              >
                {resource.data.name}
              </SelectOption>
            );
          })
        ) : (
          <span>No Compute Registered</span>
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
