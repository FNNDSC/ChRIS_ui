import React from "react";
import { Table, TableHeader, TableBody } from "@patternfly/react-table";
import { PageSection, Button, Pagination } from "@patternfly/react-core";
import { useTypedSelector } from "../../store/hooks";
import { useDispatch } from "react-redux";
import {
  getPacsFilesRequest,
  setCurrentPacsFile,
} from "../../store/workflows/actions";
import { PACSFile } from "../../store/workflows/types";
import {
  EmptyStateTable,
  generateTableLoading,
} from "../../components/common/emptyTable";
import { usePaginate } from "../../components/common/pagination";


const StudyList = () => {
  const dispatch = useDispatch();
  const pacsPayload = useTypedSelector((state) => state.workflows.pacsPayload);
  const currentFile = useTypedSelector((state) => state.workflows.currentFile);
  const totalFileCount = useTypedSelector(
    (state) => state.workflows.totalFileCount
  );
  const { files, error, loading } = pacsPayload;
  const { filterState, handlePageSet, handlePerPageSet, run } = usePaginate();
  const { page, perPage } = filterState;


  React.useEffect(() => {
    run(getPacsFilesRequest);
  }, [run]);

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

 if ((files.length === 0 || error) && !loading) {
   return (
     <EmptyStateTable
       cells={columns}
       //@ts-ignore
       rows={rows}
       caption="Empty File List"
       title="No files found"
       description="Push files to the SERVICES/PACS endpoint"
     />
   );
 }

 const generatePagination = () => {
   if (totalFileCount > 0) {
     return (
       <Pagination
         itemCount={totalFileCount}
         perPage={perPage}
         page={page}
         onSetPage={handlePageSet}
         onPerPageSelect={handlePerPageSet}
       />
     );
   }
 };

  return (
    <div>
      <PageSection>
        {generatePagination()}
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
