import { Chip, ChipGroup } from '@patternfly/react-core';
import React, { useContext } from 'react';
import { CreateFeedContext } from './context';

/** Wraps step component to add an alert to the top */

interface SelectionAlertWrapProps {
  // Adjusts padding of step component wrapper, so it must
  // be used for all steps, even steps which don't show the alert
  showAlert: boolean;
  stepComponent: React.ReactNode;
}

const SelectionAlertWrap: React.FC<SelectionAlertWrapProps> = ({ 
  showAlert, stepComponent 
}: SelectionAlertWrapProps) => {

  const { state } = useContext(CreateFeedContext);

  const { selected } = state.data;

  const Alert = () => {
    if (showAlert && selected.length > 0)
      return (
        <div className="pacs-alert">
          Creating feed from {selected.length} files&nbsp;
          <ChipGroup numChips={2}>
            {
              selected.map(({ data }) => {
                return (
                  <Chip isReadOnly key={data.id}>
                    {data.fname}
                    {/* {study.patientName}, {study.modality}, {study.seriesDescription} */}
                  </Chip>
                )
              })
            }
          </ChipGroup>
        </div>
      )
    else return null;
  }

  return (
    <div className="pacs-alert-wrap">
      <Alert/>

      <div className="pacs-alert-step-wrap">
        {stepComponent}
      </div>
    </div>
  )
}

export default function withSelectionAlert(stepComponent: React.ReactNode, showAlert = true) {
  return <SelectionAlertWrap
    showAlert={showAlert}
    stepComponent={stepComponent} 
  />;
}