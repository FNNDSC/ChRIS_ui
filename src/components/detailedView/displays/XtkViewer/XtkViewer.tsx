import React, { useEffect, useRef, useState } from "react";
import { ExpandIcon } from "@patternfly/react-icons";
import { DataNode } from "../../../../store/explorer/types";
import { useTypedSelector } from "../../../../store/hooks";

import './xtk-viewer.scss';
import { Button } from "@patternfly/react-core";
import FsmFileSelect from "./PrimaryFileSelect";
import CrvFileSelect from "./CrvFileSelect";

// X and dat are loaded in from script file
declare const X: any;
declare const dat: any;

type ViewerMode = 'volume' | 'mesh';
type VolumeMode = '3D' | '2D';

const getFileType = (file?: DataNode) => file?.title.split('.').slice(-1)[0];
const getFileData = async (file: DataNode) => (await file.file?.getFileBlob())?.arrayBuffer();

function getPrimaryFileMode(file: DataNode): ViewerMode | undefined {
  const volumeExtensions = ['mgz'];
  const meshExtensions = ['fsm'];
  const fileType = getFileType(file);
  if (!fileType) {
    return;
  } else if (volumeExtensions.includes(fileType)) {
    return 'volume';
  } else if (meshExtensions.includes(fileType)) {
    return 'mesh';
  }
}

const XtkViewer = () => {
  const directoryFiles = useTypedSelector((state) => state.explorer.selectedFolder) || [];
  const crvFiles = directoryFiles.filter(file => {
    const fileName = file.file?.data.fname;
    return fileName?.endsWith('.crv');
  });

  const selectedFile = useTypedSelector(state => state.explorer.selectedFile);
  const selectedFileType = getFileType(selectedFile);

  // data based on first load, before further interactions
  const defaultPrimaryFile = selectedFileType === 'crv' ? undefined : selectedFile;
  const defaultCrvFile = selectedFileType === 'crv' ? selectedFile : undefined;
  const defaultViewerMode = defaultPrimaryFile ? getPrimaryFileMode(defaultPrimaryFile) : undefined;

  const [primaryFile, setPrimaryFile] = useState<DataNode | undefined>(defaultPrimaryFile);
  const [viewerMode, setViewerMode] = useState<ViewerMode | undefined>(defaultViewerMode);
  const [volumeMode, setVolumeMode] = useState<VolumeMode>('3D');
  const [crvFile, setCrvFile] = useState<DataNode | undefined>(defaultCrvFile);
  const [secondaryFile, setSecondaryFile] = useState<DataNode | undefined>();
  const [orientation, setOrientation] = useState('x');
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    let r: any;
    let gui: any;
    let object: any;
    let secondaryObject: any;
    
    async function renderFileData() {
      if (!primaryFile || !viewerMode) {
        return;
      }

      const fileData = await getFileData(primaryFile);

      if (!fileData) {
        return;
      }

      if (viewerMode === 'volume') {
        if (volumeMode === '3D') {
          r = new X.renderer3D();
        } else {
          r = new X.renderer2D();
          r.orientation = orientation;
        }

        object = new X.volume();
        object.file = primaryFile.title; 
        object.filedata = fileData;
      }
      
      if (viewerMode === 'mesh') {
        r = new X.renderer3D();
        object = new X.mesh();
        object.file = primaryFile.title;
        object.filedata = fileData;
        if (crvFile) {
          object.scalars.file = 'crv_file.crv';
          object.scalars.filedata = await getFileData(crvFile);
        }

        if (secondaryFile) {
          secondaryObject = new X.mesh();
          secondaryObject.file = secondaryFile.title;
          const secondaryFileData = await getFileData(secondaryFile);
          secondaryObject.filedata = secondaryFileData;
        }
      }

      r.container = renderContainerRef.current;
      r.camera.position = [0, 400, 0];
      r.init();

      r.add(object);
      if (secondaryObject) {
        r.add(secondaryObject);
      }

      r.onShowtime = function() {
        gui = new dat.GUI();

        if (viewerMode === 'mesh') {
          const meshgui = gui.addFolder('Mesh');
          meshgui.addColor(object, 'color');
          meshgui.open();
        }
        
        if (crvFile) {
          const curvgui = gui.addFolder('Curvature');
          const { scalars } = object;
          curvgui.addColor(scalars, 'minColor');
          curvgui.addColor(scalars, 'maxColor');
          curvgui.add(scalars, 'lowerThreshold', scalars.min, scalars.max);
          curvgui.add(scalars, 'upperThreshold', scalars.min, scalars.max);
          curvgui.open();
        }

        if (viewerMode === 'volume') {
          const volumegui = gui.addFolder('Volume');
          volumegui.add(object, 'indexX', 0, 248);
          volumegui.add(object, 'indexY', 0, 248);
          volumegui.add(object, 'indexZ', 0, 248);
          volumegui.open();
        }
        
        // manually move controls to inside panel
        datGuiContainerRef.current?.appendChild(gui.domElement.parentElement);
      };

      r.render();
    }

    renderFileData();

  return () => {
    try {
      r.destroy();
      gui.destroy();
    } catch (e) {
      console.log(e);
    }
    }
  }, [viewerMode, volumeMode, primaryFile, crvFile, orientation, secondaryFile])

  const handleFullscreenToggle = () => {
    if (!fullscreen) {
      fullscreenRef?.current?.requestFullscreen();
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    setFullscreen(!fullscreen);
  }

  const renderContainerRef = useRef(null);
  const datGuiContainerRef = useRef<HTMLDivElement>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);

  return (
    <div className={`xtk-viewer-wrap ${fullscreen ? 'fullscreen' : ''}`} ref={fullscreenRef}>
      <div className="xtk-header">
        <h3 className="xtk-title">XTK Viewer</h3>
        <div className="xtk-info">
          {
            primaryFile && <div>Selected File: {primaryFile.title}</div>
          }
          {
            secondaryFile && <div>Selected Secondary File: {secondaryFile.title}</div>
          }
          {
            crvFile && <div>Selected CRV File: {crvFile.title}</div>
          }
        </div>
      </div>

      <div ref={datGuiContainerRef} />

      {
        // Cannot detect mode for primary file
        primaryFile && !viewerMode && (
          <div className="xtk-viewer-mode">
            <div className="instructions">Please select a viewer mode for <u>{primaryFile?.title}</u></div>
            <Button onClick={() => setViewerMode('volume')}>Volume</Button>
            <Button onClick={() => setViewerMode('mesh')}>Mesh</Button>
          </div>
        )
      }

      {
        !primaryFile
          ? (
            <FsmFileSelect
              files={directoryFiles} 
              handleSelect={file => {
                setPrimaryFile(file);
                setViewerMode(getPrimaryFileMode(file));
              }}
            />
          )
          : (
            <>
              <div ref={renderContainerRef} className="xtk-render">
              </div>
              <div className="xtk-controls">
                {
                  viewerMode === 'mesh' ? (
                  <div className="additional-files">
                    <CrvFileSelect 
                      files={crvFiles} 
                      selectedFile={crvFile}
                      handleSelect={setCrvFile} 
                    />
                    <CrvFileSelect 
                      files={directoryFiles} 
                      title="Select Additional Mesh File"
                      selectedFile={secondaryFile}
                      handleSelect={setSecondaryFile}
                    />
                  </div>
                  )
                  : (
                    <div className="volume-mode">
                      <div>
                        <div className="caption">&nbsp;</div>
                        <Button className={volumeMode === '3D' ? 'active' : ''} onClick={() => setVolumeMode('3D')}>3D</Button>
                        <Button className={volumeMode === '2D' ? 'active' : ''} onClick={() => setVolumeMode('2D')}>2D</Button>
                      </div>
                      {
                        volumeMode === '2D' &&
                        <div className="orientation">
                          <div className="caption">Orientation</div>
                          <div className="orientation-button-wrap">
                            <Button className={orientation === 'x' ? 'active' : ''} onClick={() => setOrientation('x')}>X</Button>
                            <Button className={orientation === 'y' ? 'active' : ''} onClick={() => setOrientation('y')}>Y</Button>
                            <Button className={orientation === 'z' ? 'active' : ''} onClick={() => setOrientation('z')}>Z</Button>
                          </div>
                        </div>
                      }
                    </div>
                  )
                }

                <ExpandIcon className="fullscreen-toggle" onClick={handleFullscreenToggle} />
              </div>
            </>
          )
      }
    </div>
  )
}

export default XtkViewer;