import React, { useEffect, useRef } from "react";
import { IFileBlob } from "../../../../api/models/file-viewer.model";

type AllProps = {
  fileItem: IFileBlob;
};

// Added with a global script
declare const X: any;

const XtkDisplay: React.FC<AllProps> = ({ fileItem }: AllProps) => {

  useEffect(() => {
    let r: any;
    async function renderFileData() {
      const fileData = await fileItem.blob?.arrayBuffer();

      const fileName = fileItem.file?.data.fname;
      let object;

      if (fileItem.fileType === 'mgz') {
        r = new X.renderer2D();
        r.orientation = 'x';
        object = new X.volume();
        // X requires file name to know which file type to render
        object.file = fileName;
        object.filedata = fileData;
      } else if (fileItem.fileType === 'fsm') {
        r = new X.renderer3D();
        object = new X.mesh();
        object.file = fileName;
        object.filedata = fileData;
      } else {
        return;
      }

      r.container = renderContainerRef.current;
      r.init();
      r.add(object);
      r.camera.position = [0, 400, 0];
      r.render();
    }

    renderFileData();
  }, [fileItem])

  const renderContainerRef = useRef(null);

  return (
    <div style={{ height: '100%' }}>
      {
        fileItem.fileType === 'crv'
          ? <div style={{ 
            height: '100%', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            marginTop: -40,
            fontSize: 18, 
            fontStyle: 'italic',
          }}>
            Please open the XTK Viewer to preview this file
          </div>
          : <div style={{ height: '100%', background: 'black' }} ref={renderContainerRef}></div>
      }
    </div>
  );
};

export default XtkDisplay;