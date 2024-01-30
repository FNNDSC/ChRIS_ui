import React, { useContext, useCallback } from "react";
import {
  MenuItemAction,
  MenuToggle,
  Select,
  SelectList,
  SelectOption,
} from "@patternfly/react-core";
import { AddNodeContext } from "./context";
import { useTypedSelector } from "../../store/hooks";
import { Types } from "./types";

function getInititalState() {
  return {
    isOpen: false,
    toggleTemplateText: "",
  };
}

const ComputeEnvironment: React.FC = () => {
  const { computeEnv: computeEnvs } = useTypedSelector((state) => state.plugin);
  const { state, dispatch } = useContext(AddNodeContext);
  const { selectedComputeEnv } = state;
  const [menuState, setMenuState] = React.useState(getInititalState);
  const { isOpen, toggleTemplateText } = menuState;

  const setStates = useCallback(
    (currentComputeEnv: string) => {
      
      setMenuState((menuState) => {
        return {
          ...menuState,
          toggleTemplateText: currentComputeEnv,
        };
      });
      dispatch({
        type: Types.SetComputeEnv,
        payload: {
          computeEnv: currentComputeEnv,
        },
      });
    },
    [dispatch]
  );

  React.useEffect(() => {
    if (computeEnvs) {
      const currentComputeEnv = computeEnvs[0].data.name;
      setStates(currentComputeEnv);
    }
  }, [computeEnvs, setStates]);

  const onToggle = () => {
    setMenuState({
      ...menuState,
      isOpen: !isOpen,
    });
  };

  const onSelect = (
    event?: React.MouseEvent<HTMLAnchorElement> | React.KeyboardEvent
  ) => {
    const id = event?.currentTarget.id;
    
    if (id) {
      setStates(id);
    }
  };

  const menuItems = computeEnvs
    ? computeEnvs.map((computeEnv) => {
        return (
          <SelectOption
            actions={
              <MenuItemAction aria-label={computeEnv}  />
            }
            isSelected={selectedComputeEnv === computeEnv.data.name}
            id={computeEnv.data.name}
            key={computeEnv.data.id}
            onClick={onSelect}
          >
            {computeEnv.data.name}
          </SelectOption>
        );
      })
    : [];

  return (
    <Select
      isOpen={isOpen}
      toggle={(toggleRef: any) => (
        <MenuToggle ref={toggleRef} onClick={onToggle} isExpanded={isOpen}>
          {toggleTemplateText}
        </MenuToggle>
      )}
    >
      <SelectList>{menuItems}</SelectList>
    </Select>
  );
};

const ComputeEnvironmentMemoed = React.memo(ComputeEnvironment);

export default ComputeEnvironmentMemoed;
