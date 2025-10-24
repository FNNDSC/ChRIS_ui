import {
  MenuToggle,
  Select,
  SelectList,
  SelectOption,
} from "@patternfly/react-core";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { useAppSelector } from "../../store/hooks";
import { Alert } from "../Antd";
import { AddNodeContext } from "./context";
import { Types } from "./types";

const ComputeEnvironment: React.FC = () => {
  const { computeEnv: computeEnvs, resourceError } = useAppSelector(
    (state) => state.plugin,
  );
  const { state, dispatch } = useContext(AddNodeContext);
  const { selectedComputeEnv } = state;
  const [isOpen, setIsOpen] = useState(false);
  const [toggleTemplateText, setToggleTemplateText] = useState("");

  const setStates = useCallback(
    (currentComputeEnv: string) => {
      setToggleTemplateText(currentComputeEnv);
      dispatch({
        type: Types.SetComputeEnv,
        payload: {
          computeEnv: currentComputeEnv,
        },
      });
    },
    [dispatch],
  );

  useEffect(() => {
    if (computeEnvs && computeEnvs.length > 0) {
      const currentComputeEnv = computeEnvs[0].data.name;
      setStates(currentComputeEnv);
    }
  }, [computeEnvs, setStates]);

  const onToggle = () => {
    setIsOpen((prevState) => !prevState);
  };

  const onSelect = (
    event?: React.MouseEvent<HTMLAnchorElement> | React.KeyboardEvent,
  ) => {
    const id = event?.currentTarget.id;
    if (id) {
      setStates(id);
    }
    setIsOpen(false);
  };

  const menuItems = computeEnvs
    ? computeEnvs.map((computeEnv) => (
        <SelectOption
          isSelected={selectedComputeEnv === computeEnv.data.name}
          id={computeEnv.data.name}
          key={computeEnv.data.id}
          onClick={onSelect}
        >
          {computeEnv.data.name}
        </SelectOption>
      ))
    : [];

  return !resourceError ? (
    <Select
      isOpen={isOpen}
      toggle={(toggleRef) => (
        <MenuToggle ref={toggleRef} onClick={onToggle} isExpanded={isOpen}>
          {toggleTemplateText}
        </MenuToggle>
      )}
    >
      <SelectList>{menuItems}</SelectList>
    </Select>
  ) : (
    <Alert type="error" description={resourceError} />
  );
};

const ComputeEnvironmentMemoed = React.memo(ComputeEnvironment);

export default ComputeEnvironmentMemoed;
