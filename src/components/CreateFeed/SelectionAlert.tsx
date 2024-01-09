import { Chip, ChipGroup } from "@patternfly/react-core";
import { pluralize } from "../../api/common";
import React, { useContext } from "react";
import { MainRouterContext } from "../../routes";

/** Wraps step component to add an alert to the top */

interface SelectionAlertWrapProps {
  // Adjusts padding of step component wrapper, so it must
  // be used for all steps, even steps which don't show the alert
  showAlert: boolean;
  stepComponent: React.ReactNode;
}

export const SelectionAlertWrap = ({
  showAlert,
  stepComponent,
}: SelectionAlertWrapProps) => {
  const { selectData } = useContext(MainRouterContext).state;

  const Alert = () => {
    if (showAlert && selectData && selectData.length > 0)
      return (
        <div className="pacs-alert">
          Creating analysis from {selectData.length}{" "}
          {pluralize("item", selectData.length)}&nbsp;
          <ChipGroup numChips={2}>
            {selectData &&
              selectData.map((path: string) => {
                return (
                  <Chip isReadOnly key={path}>
                    {path.split("/").reverse().shift()}
                  </Chip>
                );
              })}
          </ChipGroup>
        </div>
      );
    else return null;
  };

  return (
    <div className="pacs-alert-wrap">
      <Alert />
      <div className="pacs-alert-step-wrap">{stepComponent}</div>
    </div>
  );
};

export default function withSelectionAlert(
  stepComponent: React.ReactNode,
  showAlert = true
) {
  return (
    <SelectionAlertWrap showAlert={showAlert} stepComponent={stepComponent} />
  );
}
