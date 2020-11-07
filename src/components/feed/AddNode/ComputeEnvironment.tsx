import React from "react";
import {
  OptionsMenu,
  OptionsMenuItem,
  OptionsMenuToggle,
} from "@patternfly/react-core";

type ComputeProp = {
  computeEnvs: any[];
  selectedOption: string;
  setComputeEnviroment: (computeEnv: string) => void;
};

function getInititalState() {
  return {
    isOpen: false,
    toggleTemplateText: "host",
  };
}

const ComputeEnvironment: React.FC<ComputeProp> = ({
  computeEnvs,
  selectedOption,
  setComputeEnviroment,
}) => {
  const [computeEnv, setComputeEnv] = React.useState(getInititalState);
  const { isOpen, toggleTemplateText } = computeEnv;

  const onToggle = (isOpen: boolean) => {
    setComputeEnv({
      ...computeEnv,
      isOpen,
    });
  };
  const onSelect = (
    event?: React.MouseEvent<HTMLAnchorElement> | React.KeyboardEvent
  ) => {
    const id = event?.currentTarget.id;
    if (id) {
      setComputeEnv({
        ...computeEnv,
        toggleTemplateText: id,
      });
      setComputeEnviroment(id);
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
