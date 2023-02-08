import React, { useContext, useCallback } from "react";
import {
  OptionsMenu,
  OptionsMenuItem,
  OptionsMenuToggle,
} from "@patternfly/react-core";
import { AddNodeContext } from "./context";
import { useTypedSelector } from "../../../store/hooks";
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

  const onToggle = (isOpen: boolean) => {
    setMenuState({
      ...menuState,
      isOpen,
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
          <OptionsMenuItem
            className="configure-compute__optionsmenuitem"
            onSelect={onSelect}
            isSelected={selectedComputeEnv === computeEnv.data.name}
            id={computeEnv.data.name}
            key={computeEnv.data.id}
          >
            {computeEnv.data.name}
          </OptionsMenuItem>
        );
      })
    : [];
  const toggle = (
    <OptionsMenuToggle
      onToggle={onToggle}
      toggleTemplate={toggleTemplateText}
    />
  );

  return (
    <OptionsMenu
      id="options-menu"
      className="configure-compute__optionsmenu"
      menuItems={menuItems}
      isOpen={isOpen}
      toggle={toggle}
    />
  );
};

export default React.memo(ComputeEnvironment);
