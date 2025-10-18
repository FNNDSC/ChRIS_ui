import type { FileBrowserFolderFile } from "@fnndsc/chrisapi";
import { Button } from "@patternfly/react-core";
import AiOutlineExpand from "@patternfly/react-icons/dist/esm/icons/expand-alt-icon";
import { useEffect, useRef, useState } from "react";
import { useAppSelector } from "../../store/hooks";
import { Alert } from "../Antd";
import { useFeedBrowser } from "../FeedOutputBrowser/useFeedBrowser";
import CrvFileSelect from "./CrvFileSelect";
import FsmFileSelect from "./PrimaryFileSelect";
import "./xtk-viewer.css";

// XXX X and dat in xtk are loaded in from script file.
declare const X: any;
declare const dat: any;

export type ViewerMode = "volume" | "mesh" | "other";
type VolumeMode = "3D" | "2D";

const getFileType = (file?: FileBrowserFolderFile) =>
  file?.data.fname.split(".").slice(-1)[0];

const getFileData = async (file: FileBrowserFolderFile) =>
  (await file.getFileBlob())?.arrayBuffer();

export function getXtkFileMode(fileType?: string): ViewerMode | undefined {
  const volumeExtensions = ["mgz", "dcm"];
  const meshExtensions = ["fsm", "smoothwm", "pial"];
  const otherExtensions = ["crv"];
  if (!fileType) {
    return;
  }
  if (volumeExtensions.includes(fileType)) {
    return "volume";
  }
  if (meshExtensions.includes(fileType)) {
    return "mesh";
  }
  if (otherExtensions.includes(fileType)) {
    return "other";
  }
}

function getPrimaryFileMode(
  file: FileBrowserFolderFile,
): ViewerMode | undefined {
  const fileType = getFileType(file);
  return getXtkFileMode(fileType);
}

const XtkViewer = () => {
  const selectedFile = useAppSelector((state) => state.explorer.selectedFile);
  const selectedFileType = getFileType(selectedFile);
  const { pluginFilesPayload } = useFeedBrowser();
  const directoryFiles = pluginFilesPayload?.folderFiles;
  const crvFiles = directoryFiles?.filter((file) => {
    const fileName = file.data.fname;
    return fileName?.endsWith(".crv");
  });
  const defaultPrimaryFile =
    selectedFileType === "crv" ? undefined : selectedFile;
  const defaultCrvFile = selectedFileType === "crv" ? selectedFile : undefined;
  const defaultViewerMode = defaultPrimaryFile
    ? getPrimaryFileMode(defaultPrimaryFile)
    : undefined;

  const [primaryFile, setPrimaryFile] = useState<
    FileBrowserFolderFile | undefined
  >(defaultPrimaryFile);
  const [viewerMode, setViewerMode] = useState<ViewerMode | undefined>(
    defaultViewerMode,
  );
  const [volumeMode, setVolumeMode] = useState<VolumeMode>("3D");
  const [crvFile, setCrvFile] = useState<FileBrowserFolderFile | undefined>(
    defaultCrvFile,
  );
  const [secondaryFile, setSecondaryFile] = useState<
    FileBrowserFolderFile | undefined
  >();
  const [orientation, setOrientation] = useState("x");
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

      if (viewerMode === "volume") {
        if (volumeMode === "3D") {
          r = new X.renderer3D();
        } else {
          r = new X.renderer2D();
          r.orientation = orientation;
        }

        object = new X.volume();
        object.file = primaryFile.data.fname;
        object.filedata = fileData;
      }

      if (viewerMode === "mesh") {
        r = new X.renderer3D();
        object = new X.mesh();
        object.file = primaryFile.data.fname;
        object.filedata = fileData;
        if (crvFile) {
          object.scalars.file = "crv_file.crv";
          object.scalars.filedata = await getFileData(crvFile);
        }

        if (secondaryFile) {
          secondaryObject = new X.mesh();
          secondaryObject.file = secondaryFile.data.fname;
          const secondaryFileData = await getFileData(secondaryFile);
          secondaryObject.filedata = secondaryFileData;
        }
      }

      r.container = renderContainerRef.current;
      r.init();
      r.camera.position = [0, 400, 0];

      r.add(object);
      if (secondaryObject) {
        r.add(secondaryObject);
      }

      r.onShowtime = () => {
        gui = new dat.GUI();

        if (viewerMode === "mesh") {
          const meshgui = gui.addFolder("Mesh");
          meshgui.addColor(object, "color");
          meshgui.open();
        }

        if (crvFile) {
          const curvgui = gui.addFolder("Curvature");
          const { scalars } = object;
          curvgui.addColor(scalars, "minColor");
          curvgui.addColor(scalars, "maxColor");
          curvgui.add(scalars, "lowerThreshold", scalars.min, scalars.max);
          curvgui.add(scalars, "upperThreshold", scalars.min, scalars.max);
          curvgui.open();
        }

        if (viewerMode === "volume") {
          const volumegui = gui.addFolder("Volume");
          volumegui.add(object, "indexX", 0, 248);
          volumegui.add(object, "indexY", 0, 248);
          volumegui.add(object, "indexZ", 0, 248);
          volumegui.open();
        }

        // manually move controls to inside panel
        datGuiContainerRef.current?.appendChild(gui.domElement.parentElement);
      };

      r.render();
    }

    renderFileData();

    return () => {
      r?.destroy();
      gui?.destroy();
    };
  }, [
    viewerMode,
    volumeMode,
    primaryFile,
    crvFile,
    orientation,
    secondaryFile,
  ]);
  const handleFullscreenToggle = () => {
    if (!fullscreen) {
      fullscreenRef?.current?.requestFullscreen();
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    setFullscreen(!fullscreen);
  };

  const renderContainerRef = useRef(null);
  const datGuiContainerRef = useRef<HTMLDivElement>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);

  if (!directoryFiles) {
    return <Alert type="error" description="Files are not available" />;
  }

  return (
    <div
      className={`xtk-viewer-wrap ${fullscreen ? "fullscreen" : ""}`}
      ref={fullscreenRef}
    >
      <div className="xtk-header">
        <h3 className="xtk-title">XTK Viewer</h3>
        <div className="xtk-info">
          {primaryFile && <div>Selected File: {primaryFile.data.fname}</div>}
          {secondaryFile && (
            <div>Selected Secondary File: {secondaryFile.data.fname}</div>
          )}
          {crvFile && <div>Selected CRV File: {crvFile.data.fname}</div>}
        </div>
      </div>

      <div ref={datGuiContainerRef} />

      {
        // Cannot detect mode for primary file
        primaryFile && !viewerMode && (
          <div className="xtk-viewer-mode">
            <div className="instructions">
              Please select a viewer mode for <u>{primaryFile?.data.fname}</u>
            </div>
            <Button onClick={() => setViewerMode("volume")}>Volume</Button>
            <Button onClick={() => setViewerMode("mesh")}>Mesh</Button>
          </div>
        )
      }

      {!primaryFile ? (
        <FsmFileSelect
          files={directoryFiles}
          handleSelect={(file) => {
            setPrimaryFile(file);
            setViewerMode(getPrimaryFileMode(file));
          }}
        />
      ) : (
        <>
          <div ref={renderContainerRef} className="xtk-render" />
          <div className="xtk-controls">
            {viewerMode === "mesh" ? (
              <div className="additional-files">
                {crvFiles ? (
                  <>
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
                  </>
                ) : (
                  <Alert
                    type="info"
                    description="Failed to find files with the .crv extension"
                  />
                )}
              </div>
            ) : (
              <div className="volume-mode">
                <div>
                  <div className="caption">&nbsp;</div>
                  <Button
                    className={volumeMode === "3D" ? "active" : ""}
                    onClick={() => setVolumeMode("3D")}
                  >
                    3D
                  </Button>
                  <Button
                    className={volumeMode === "2D" ? "active" : ""}
                    onClick={() => setVolumeMode("2D")}
                  >
                    2D
                  </Button>
                </div>
                {volumeMode === "2D" && (
                  <div className="orientation">
                    <div className="caption">Orientation</div>
                    <div className="orientation-button-wrap">
                      <Button
                        className={orientation === "x" ? "active" : ""}
                        onClick={() => setOrientation("x")}
                      >
                        X
                      </Button>
                      <Button
                        className={orientation === "y" ? "active" : ""}
                        onClick={() => setOrientation("y")}
                      >
                        Y
                      </Button>
                      <Button
                        className={orientation === "z" ? "active" : ""}
                        onClick={() => setOrientation("z")}
                      >
                        Z
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <AiOutlineExpand
              className="fullscreen-toggle"
              onClick={handleFullscreenToggle}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default XtkViewer;
