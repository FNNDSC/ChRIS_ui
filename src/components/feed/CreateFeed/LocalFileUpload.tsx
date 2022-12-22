import React, { useContext } from "react";
import { Grid, GridItem, WizardContextConsumer } from "@patternfly/react-core";
import { CreateFeedContext } from "./context";
import { LocalFile, Types } from "./types/feed";
import FileUpload from "../../common/fileupload";
import { LocalFileList } from "../../feed/CreateFeed/helperComponents";


const LocalFileUpload: React.FC = () => {
  const { state, dispatch } = useContext(CreateFeedContext);
  const { localFiles } = state.data;

  const handleDispatch = (files: LocalFile[]) => {
    dispatch({
      type: Types.AddLocalFile,
      payload: {
        files,
      },
    });
  };

  const handleDeleteDispatch = (file: string) => {
    dispatch({
      type: Types.RemoveLocalFile,
      payload: {
        filename: file,
      },
    });
  };
 

  return (
    <div className="pacs-alert-wrap">
      <div className="pacs-alert-step-wrap">
        <h1 className="pf-c-title pf-m-2xl">
          File Selection: Local File Upload
        </h1>
        <p>Choose files from your local computer to create an analysis</p>
        <FileUploadComponent
          className="local-file-upload"
          handleDeleteDispatch={handleDeleteDispatch}
          localFiles={localFiles}
          dispatchFn={handleDispatch}
        />
      </div>
    </div>
  );
};

export default LocalFileUpload;

type FileUploadProps = {
  localFiles: LocalFile[];
  dispatchFn: (files: LocalFile[]) => void;
  handleDeleteDispatch: (file: string) => void;
  uploadName?: JSX.Element;
  className: string;
};

const FileUploadComponent = ({
  localFiles,
  dispatchFn,
  uploadName,
  handleDeleteDispatch,
  className,
}: FileUploadProps) => {
  const handleChoseFilesClick = (files: any[]) => {
    const filesConvert = Array.from(files).map((file) => {
      return {
        name: file.name,
        blob: file,
      };
    });
    dispatchFn(filesConvert);
  };

  const fileList =
    localFiles.length > 0
      ? localFiles.map((file: LocalFile, index: number) => (
          <React.Fragment key={index}>
            <LocalFileList
              handleDeleteDispatch={handleDeleteDispatch}
              file={file}
              index={index}
              showIcon={true}
            />
          </React.Fragment>
        ))
      : null;
    
    const handleKeyDown = (e:any, next:() => void, prev:() =>void)=>{
        if(e.code == "ArrowLeft"){
          prev()
        }else if(e.code == "ArrowRight" && localFiles.length > 0 ){
          next()
        }
    }
  return (
    <WizardContextConsumer>
      {({onNext, onBack}: {onNext:any;onBack:any}) => (
        <div className={className}>
      <Grid hasGutter={true}>
        <GridItem span={4} rowSpan={4} style={{ minWidth: "9rem" }} onKeyDown={(e) => handleKeyDown(e, onNext, onBack)}>
          <FileUpload handleLocalUploadFiles={handleChoseFilesClick}/>
          {uploadName && uploadName}
        </GridItem>
        <GridItem
          className={`${className}-grid`}
          span={8}
          rowSpan={12}
          style={{ marginLeft: "1rem" }}
        >
          <div className="file-list">{fileList}</div>
        </GridItem>
      </Grid>
    </div>
      )}
    </WizardContextConsumer>
  );
};
