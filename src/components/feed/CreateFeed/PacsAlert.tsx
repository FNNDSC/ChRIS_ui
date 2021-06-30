import { Chip, ChipGroup } from '@patternfly/react-core';
import React, { useContext } from 'react';
import { CreateFeedContext } from './context';

/** Wraps step component to add a PACS alert to the top */

interface PacsAlertWrapProps {
  // PacsAlert adjusts padding of step component wrapper, so it must
  // be used for all steps, even steps which don't show the alert
  showAlert: boolean;
  stepComponent: React.ReactNode;
}

const PacsAlertWrap: React.FC<PacsAlertWrapProps> = ({ 
  showAlert, stepComponent 
}: PacsAlertWrapProps) => {

  const { state } = useContext(CreateFeedContext);

  const { pacsSeries } = state.data;

  return (
    <div className="pacs-alert-wrap">
      {
        showAlert && pacsSeries.length > 0 && (
          <div className="pacs-alert">
            Creating feed from {pacsSeries.length} PACS series&nbsp;
            <ChipGroup numChips={2}>
              {
                pacsSeries.map(study => {
                  return (
                    <Chip isReadOnly key={study.patientID}>
                      {study.patientName}, {study.modality}, {study.seriesDescription}
                    </Chip>
                  )
                })
              }
            </ChipGroup>
          </div>
        )
      }

      <div className="pacs-alert-step-wrap">
        {stepComponent}
      </div>
    </div>
  )
}

export default function addPacsAlert(stepComponent: React.ReactNode, showAlert = true) {
  return <PacsAlertWrap
    showAlert={showAlert}
    stepComponent={stepComponent} 
  />;
}