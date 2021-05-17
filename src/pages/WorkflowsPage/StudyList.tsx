import React from "react";
import { Table, TableHeader, TableBody } from "@patternfly/react-table";
import { PageSection, Button } from "@patternfly/react-core";
import { useTypedSelector } from "../../store/hooks";
import { useDispatch } from "react-redux";
import { setCurrentPacsFile } from "../../store/workflows/actions";
import { PACSFile } from "../../store/workflows/types";
import {
  EmptyStateTable,
  generateTableLoading,
} from "../../components/common/emptyTable";


 
const StudyList = () => {
  const dispatch = useDispatch();
  const pacsPayload = useTypedSelector((state) => state.workflows.pacsPayload);
  const currentFile = useTypedSelector((state) => state.workflows.currentFile);

  const { files, error, loading } = pacsPayload;

  const columns = [
    "Patient Name",
    "MRN",
    "Study Date",
    "Modality",
    "Study Description",
    "",
  ];

  const generateTableRow = (file: PACSFile) => {
    const patientName = file.data.PatientName;
    const mrn = file.data.PatientID;
    const studyDate = file.data.StudyDate;
    const modality = file.data.Modality;
    const description = file.data.StudyDescription;
    const isCurrent = currentFile === file;
    const button = {
      title: (
        <Button
          isDisabled={isCurrent}
          onClick={() => dispatch(setCurrentPacsFile(file))}
        >
          {`Select${isCurrent ? "ed" : ""}`}
        </Button>
      ),
    };
    return {
      cells: [patientName, mrn, studyDate, modality, description, button],
    };
  };

  const rows = files ? files.map(generateTableRow) : [];

 if (files.length === 0 || error) {
  
   return (
     <EmptyStateTable
       cells={columns}
        //@ts-ignore
       rows={rows}
       caption='Empty File List'
       title="No files found"
       description="Push files to to the SERVICES/PACS endpoint"
     />
   );
 }

  return (
    <div>
      <PageSection>
        <Table
          aria-label="Study List"
          rows={rows}
          cells={columns}
          variant="compact"
        >
          <TableHeader />
          {loading ? generateTableLoading() : <TableBody />}
        </Table>
      </PageSection>
    </div>
  );
};

export default React.memo(StudyList);
