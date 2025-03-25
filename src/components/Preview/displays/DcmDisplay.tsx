import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  AlertActionCloseButton,
  Button,
  Toolbar,
  ToolbarItem,
  Tooltip,
} from "@patternfly/react-core";
import { Progress } from "antd";
import axios, { type AxiosRequestConfig, type AxiosProgressEvent } from "axios";
import * as dcmjs from "dcmjs";
import useSize from "../../FeedTree/useSize";
import {
  basicInit,
  displayDicomImage,
  loadDicomImage,
  handleEvents,
  setUpTooling,
  getFileResourceUrl,
} from "./dicomUtils/utils";
import { TagInfoModal } from "../HelperComponent";
import {
  AddIcon,
  BrightnessIcon,
  InfoIcon,
  RotateIcon,
  RulerIcon,
  SearchIcon,
  ZoomIcon,
} from "../../Icons";
import ResetIcon from "@patternfly/react-icons/dist/esm/icons/history-icon";
import type { IFileBlob } from "../../../api/model";

const TOOL_KEY = "cornerstone-display";

export type DcmImageProps = {
  selectedFile: IFileBlob;
  preview: string;
};

type LocalToolState = {
  [key: string]: boolean;
};

export default function DcmDisplay(props: DcmImageProps) {
  const { selectedFile, preview } = props;
  const dicomImageRef = useRef<HTMLDivElement>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  // Keep a reference to the rendering engine and viewport so we can destroy them on file change
  const renderingEngineRef = useRef<any>(null);
  const activeViewportRef = useRef<any>(null);

  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dicomBlob, setDicomBlob] = useState<Blob | null>(null);
  const [tagInfo, setTagInfo] = useState<any>(null);
  const [parsingError, setParsingError] = useState("");
  const [previouslyActive, setPreviouslyActive] = useState<string>("");

  const size = useSize(dicomImageRef);
  const fname = selectedFile.data.fname;

  const [toolState, setToolState] = useState<LocalToolState>({
    Zoom: false,
    Pan: false,
    Magnify: false,
    PlanarRotate: false,
    WindowLevel: false,
    Length: false,
    Reset: false,
    TagInfo: false,
  });

  const actions = [
    { name: "Zoom", icon: <ZoomIcon /> },
    { name: "Pan", icon: <SearchIcon /> },
    { name: "Magnify", icon: <AddIcon /> },
    { name: "PlanarRotate", icon: <RotateIcon /> },
    { name: "WindowLevel", icon: <BrightnessIcon /> },
    { name: "Length", icon: <RulerIcon /> },
    { name: "Reset", icon: <ResetIcon /> },
    { name: "TagInfo", icon: <InfoIcon /> },
  ];

  function onToolClick(toolName: string) {
    if (["Reset", "TagInfo"].includes(toolName)) {
      setToolState((prev) => ({
        ...deactivateAllNormalTools(prev),
        [toolName]: !prev[toolName],
      }));
    } else {
      setToolState((prev) => {
        const next = deactivateAllNormalTools(prev);
        next[toolName] = !prev[toolName];
        return next;
      });
    }
  }

  function deactivateAllNormalTools(prev: LocalToolState) {
    const next = { ...prev };
    const normalTools = Object.keys(next).filter((toolName) =>
      [
        "Zoom",
        "Pan",
        "Magnify",
        "PlanarRotate",
        "WindowLevel",
        "Length",
      ].includes(toolName),
    );
    normalTools.forEach((toolName) => {
      next[toolName] = false;
    });
    return next;
  }

  const handleResize = useCallback(() => {
    if (!dicomImageRef.current || !elementRef.current || !size) return;
    const { width, height } = size;
    elementRef.current.style.width = `${width}px`;
    elementRef.current.style.height = `${height}px`;
    if (renderingEngineRef.current) {
      renderingEngineRef.current.resize(true, true);
    }
    if (activeViewportRef.current) {
      activeViewportRef.current.resize();
    }
  }, [size]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);

  const setupCornerstone = useCallback(async () => {
    await basicInit();
    setUpTooling(TOOL_KEY);
  }, []);

  const downloadDicomFile = useCallback(async (url: string, token: string) => {
    const config: AxiosRequestConfig = {
      responseType: "blob",
      onDownloadProgress: (progressEvent: AxiosProgressEvent) => {
        if (!progressEvent.total) return;
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total,
        );
        setDownloadProgress(percent);
      },
    };
    if (token) {
      config.headers = { Authorization: `Token ${token}` };
    }
    const response = await axios.get(url, config);
    return response.data;
  }, []);

  const renderImagesOnElement = useCallback(
    async (imageIDs: string[]) => {
      if (!elementRef.current) return;
      const elementId = `cornerstone-element-${fname}`;
      const { viewport, renderingEngine } = await displayDicomImage(
        elementRef.current,
        imageIDs,
        elementId,
      );
      activeViewportRef.current = viewport;
      renderingEngineRef.current = renderingEngine;
    },
    [fname],
  );

  const displayPreviewFile = useCallback(async () => {
    if (!elementRef.current) return;
    const url = getFileResourceUrl(selectedFile);
    const token = selectedFile.auth?.token || "";
    const blob = await downloadDicomFile(url, token);
    setDicomBlob(blob);
    const { framesCount, imageID } = await loadDicomImage(blob);
    const framesList =
      framesCount > 1
        ? Array.from(
            { length: framesCount },
            (_, i) => `${imageID}#frame=${i + 1}`,
          )
        : imageID;
    const imageIDs = Array.isArray(framesList) ? framesList : [framesList];
    await renderImagesOnElement(imageIDs);
  }, [selectedFile, downloadDicomFile, renderImagesOnElement]);

  const parseDicomTags = useCallback(async () => {
    if (!dicomBlob) return;
    try {
      const arrayBuffer = await dicomBlob.arrayBuffer();
      const dicomData = dcmjs.data.DicomMessage.readFile(arrayBuffer);
      const dataset = dcmjs.data.DicomMetaDictionary.naturalizeDataset(
        dicomData.dict,
      );
      const sortedDataset = Object.keys(dataset)
        .sort()
        .reduce((acc: any, key) => {
          acc[key] = dataset[key];
          return acc;
        }, {});
      setTagInfo(sortedDataset);
      setParsingError("");
    } catch (err) {
      setParsingError("Failed to parse DICOM tags");
    }
  }, [dicomBlob]);

  const initialize = useCallback(async () => {
    try {
      await setupCornerstone();
      await displayPreviewFile();
    } catch (err: any) {
      setError(err?.message || "Unknown error during DICOM initialization");
    }
  }, [setupCornerstone, displayPreviewFile]);

  const destroyRenderingEngine = useCallback(() => {
    if (renderingEngineRef.current) {
      renderingEngineRef.current.destroy();
      renderingEngineRef.current = null;
      activeViewportRef.current = null;
    }
  }, []);

  useEffect(() => {
    destroyRenderingEngine();
    setDicomBlob(null);
    setTagInfo(null);
    setPreviouslyActive("");
    setToolState({
      Zoom: false,
      Pan: false,
      Magnify: false,
      PlanarRotate: false,
      WindowLevel: false,
      Length: false,
      Reset: false,
      TagInfo: false,
    });
    initialize();
  }, [initialize, destroyRenderingEngine]);

  useEffect(() => {
    const viewport = activeViewportRef.current;
    if (!viewport) return;
    if (toolState.TagInfo) {
      parseDicomTags();
    } else {
      setTagInfo(null);
    }
    const newlyActiveTool = Object.keys(toolState).find(
      (t) => toolState[t] === true && !["Reset", "TagInfo"].includes(t),
    );
    if (previouslyActive && previouslyActive !== newlyActiveTool) {
      handleEvents({ previouslyActive }, viewport);
    }
    if (toolState.Reset) {
      handleEvents({ Reset: true, previouslyActive }, viewport);
      setToolState((prev) => ({ ...prev, Reset: false }));
    }
    if (newlyActiveTool) {
      setPreviouslyActive(newlyActiveTool);
      handleEvents({ [newlyActiveTool]: true, previouslyActive }, viewport);
    } else {
      setPreviouslyActive("");
    }
  }, [toolState, parseDicomTags, previouslyActive]);

  const showProgress = downloadProgress > 0 && downloadProgress < 100;
  const isTagModalOpen = toolState.TagInfo && tagInfo;

  return (
    <div
      ref={dicomImageRef}
      className={preview === "large" ? "dcm-preview" : ""}
      style={{ position: "relative", width: "100%", height: "100%" }}
    >
      <Toolbar className="centered-container">
        {actions.map((action) => {
          const isActive = toolState[action.name];
          return (
            <ToolbarItem key={action.name} style={{ marginRight: "0.5em" }}>
              <Tooltip content={<span>{action.name}</span>}>
                <Button
                  className={`${preview === "large" ? "large-button" : "small-button"} button-style`}
                  variant={isActive ? "primary" : "control"}
                  size="sm"
                  icon={action.icon}
                  onClick={() => onToolClick(action.name)}
                  aria-label={action.name}
                />
              </Tooltip>
            </ToolbarItem>
          );
        })}
      </Toolbar>
      {showProgress && <Progress percent={downloadProgress} />}
      <div
        ref={elementRef}
        id={`cornerstone-element-${fname}`}
        style={{
          width: "100%",
          height: "calc(100% - 50px)",
          position: "relative",
        }}
      />
      {error && (
        <div
          style={{
            position: "fixed",
            top: "1rem",
            right: "1rem",
            zIndex: 10000,
          }}
        >
          <Alert
            variant="danger"
            title="Error"
            actionClose={
              <AlertActionCloseButton onClose={() => setError(null)} />
            }
          >
            {error}
          </Alert>
        </div>
      )}
      {isTagModalOpen && (
        <TagInfoModal
          isModalOpen={isTagModalOpen}
          isDrawer={true}
          output={tagInfo}
          parsingError={parsingError}
          handleModalToggle={() => {
            setToolState((prev) => ({ ...prev, TagInfo: false }));
          }}
        />
      )}
    </div>
  );
}
