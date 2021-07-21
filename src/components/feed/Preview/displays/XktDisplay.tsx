import React, { useEffect, useRef } from "react";
import { X } from 'xtk';
import { IFileBlob } from "../../../../api/models/file-viewer.model";

type AllProps = {
  fileItem: IFileBlob;
};

console.log(window);
declare const window: any;
window.X = X;
// `import xtk` does not use modules, it only adds the X variable to the global
// declare const X: any;

const XktDisplay: React.FC<AllProps> = ({ fileItem }: AllProps) => {

  useEffect(() => {
    async function renderFileData() {
      const fileData = await fileItem.blob?.arrayBuffer()
      // const fileData = await fetch('http://localhost:1000/proxy/xtk/X/blob/2860d788cf156036b843f4532f626d0433be0c03/testing/visualization/data/daniel.crv?raw=true').then(r => r.arrayBuffer());
      // const fsmFileData = await fetch('http://localhost:1000/proxy/xtk/X/blob/2860d788cf156036b843f4532f626d0433be0c03/testing/visualization/data/daniel.fsm?raw=true').then(r => r.arrayBuffer())

      const r = new X.renderer3D();
      r.container = renderContainerRef.current;
      r.init();

      let renderedObject; 

      if (fileItem.fileType === 'mgz') {
        renderedObject = new X.volume();
        // X requires file name to know which file type to render
        renderedObject.file = fileItem.file?.data.fname; 
        renderedObject.filedata = fileData;
      } else if (fileItem.fileType === 'crv') {
        console.log('heyo')
        renderedObject = new X.mesh();
        renderedObject.file = 'test.fsm'
        // renderedObject.filedata = fsmFileData;
        renderedObject.scalars.file = 'test.crv';//fileItem.file?.data.fname;
        renderedObject.scalars.filedata = fileData;
      }

      r.add(renderedObject);

      r.camera.position = [0, 400, 0];

      r.render();

      // TODO: cleanup
    }

    renderFileData();
  }, [fileItem])

  const renderContainerRef = useRef(null);

  return (
    <div>
      <div style={{ height: 300 }} ref={renderContainerRef}></div>
    </div>
  );
};

export default XktDisplay;