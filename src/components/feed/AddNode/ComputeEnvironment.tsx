import React from "react";
import {
  OptionsMenu,
  OptionsMenuItem,
  OptionsMenuToggle,
} from "@patternfly/react-core";

type ComputeProp = {
  computeEnvs: any[];
  selectedOption: string;
  setComputeEnvironment: (computeEnv: string) => void;
};

function getInititalState() {
  return {
    isOpen: false,
    toggleTemplateText: "",
  };
}

const ComputeEnvironment: React.FC<ComputeProp> = ({
  computeEnvs,
  selectedOption,
  setComputeEnvironment,
}) => {
  const [menuState, setMenuState] = React.useState(getInititalState);
  const { isOpen, toggleTemplateText } = menuState;
  

  React.useEffect(() => {
    setMenuState({
      ...menuState,
      toggleTemplateText: computeEnvs[0].data.name,
    });
    setComputeEnvironment(computeEnvs[0].data.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      setMenuState({
        ...menuState,
        toggleTemplateText: id,
      });
      setComputeEnvironment(id);
    }
  };

  const menuItems = computeEnvs.map((computeEnv) => {
    return (
      <OptionsMenuItem
        className="configure-compute__optionsmenuitem"
        onSelect={onSelect}
        isSelected={selectedOption === computeEnv.data.name}
        id={computeEnv.data.name}
        key={computeEnv.data.id}
      >
        {computeEnv.data.name}
      </OptionsMenuItem>
    );
  });
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
