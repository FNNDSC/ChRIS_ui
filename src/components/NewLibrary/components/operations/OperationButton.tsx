import { Tooltip, Button } from "@patternfly/react-core";

type Props = {
  handleOperations: (operationKey: string) => void;
  count: number;

  icon: React.ReactElement;
  ariaLabel: string;
  operationKey: string;
  label?: string;
  isHide?: boolean;
};

export default (props: Props) => {
  const {
    ariaLabel,
    handleOperations,
    operationKey,
    count,
    label: propsLabel,
    icon,
    isHide: propsIsHide,
  } = props;
  const label = propsLabel || "";
  const isHide = propsIsHide || false;

  const tooltipStyle = {};
  const buttonStyle = {
    marginRight: "1em",
  };
  if (isHide || count === 0) {
    // @ts-ignore
    tooltipStyle.display = "none";
    // @ts-ignore
    buttonStyle.display = "none";
  }

  return (
    <Tooltip content={ariaLabel} style={tooltipStyle}>
      <Button
        style={buttonStyle}
        icon={icon}
        size="sm"
        onClick={() => handleOperations(operationKey)}
        variant="tertiary"
        aria-label={ariaLabel}
      >
        {label}
      </Button>
    </Tooltip>
  );
};
