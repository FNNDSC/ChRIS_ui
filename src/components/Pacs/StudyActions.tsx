import { useEffect, useState } from "react";
import { PFDCMFilters, PACSPullStages, PACSStudy } from "./types";
import { PACSFileList } from "@fnndsc/chrisapi";
import { PFDCMPull } from "./pfdcm";
import ChrisAPIClient from "../../api/chrisapiclient";

const client = ChrisAPIClient.getClient();

interface StudyActionsProps {
  study: PACSStudy;
  onRequestStatus: (query: PFDCMFilters) => Promise<PFDCMPull>;
  onExecutePACSStage: (query: PFDCMFilters, stage: PACSPullStages) => any;
}

const StudyActions = (props: StudyActionsProps) => {
  const { study, onExecutePACSStage, onRequestStatus } = props;
  const { StudyInstanceUID, PatientID } = study;

  const [existingStudyFiles, setExistingStudyFiles] = useState<PACSFileList>();
  const [pullStatus, setPullStatus] = useState<PFDCMPull>();
  const [poll, setPoll] = useState<any>();

  const cubeHasStudy =
    !!existingStudyFiles && existingStudyFiles.totalCount > 0;
  const studyFiles = existingStudyFiles?.getItems() || [];
  const cubeStudyPath = studyFiles.length
    ? studyFiles[0].data.fname.split("/").slice(0, -2).join("/")
    : "#";

  useEffect(() => {
    const pullQuery = { StudyInstanceUID, PatientID };
    client.getPACSFiles(pullQuery).then((files) => {
      setExistingStudyFiles(files);
    });

    async function fetchStatus() {
      const pullStatus = await onRequestStatus(pullQuery);
      setPullStatus(pullStatus);
    }
    fetchStatus();
  }, [onRequestStatus, StudyInstanceUID, PatientID]);

  useEffect(() => {
    if (cubeHasStudy || !pullStatus || !pullStatus.isRunning) {
      return () => clearTimeout(poll);
    }
  });

  return <div>Study Actions</div>;
};

export default StudyActions;
