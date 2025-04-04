import {
  Alert,
  AlertActionCloseButton,
  Button,
  Toolbar,
  ToolbarItem,
  Tooltip,
} from "@patternfly/react-core";
import ResetIcon from "@patternfly/react-icons/dist/esm/icons/history-icon";
import * as dcmjs from "dcmjs";
import { useCallback, useEffect, useRef, useState } from "react";
import type { IFileBlob } from "../../../api/model";
import useSize from "../../FeedTree/useSize";
import {
  AddIcon,
  BrightnessIcon,
  InfoIcon,
  RotateIcon,
  RulerIcon,
  SearchIcon,
  ZoomIcon,
} from "../../Icons";
import { TagInfoModal } from "../HelperComponent";
import {
  basicInit,
  displayDicomImage,
  handleEvents,
  loadDicomImage,
  setUpTooling,
} from "./dicomUtils/utils";
import { SpinContainer } from "../../Common";

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
  const renderingEngineRef = useRef<any>(null);
  const activeViewportRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [dicomBlob, setDicomBlob] = useState<Blob | null>(null);
  const [tagInfo, setTagInfo] = useState<any>(null);
  const [parsingError, setParsingError] = useState("");
  const [previouslyActive, setPreviouslyActive] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
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
    const blob = await selectedFile.getFileBlob();
    setDicomBlob(blob);
    try {
      setIsLoading(true);
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
    } catch (err: any) {
      setError(err?.message || "Unknown error in displayPreviewFile");
    } finally {
      setIsLoading(false);
    }
  }, [selectedFile, renderImagesOnElement]);

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
      setIsLoading(true);
      await setupCornerstone();
      await displayPreviewFile();
    } catch (err: any) {
      setError(err?.message || "Unknown error during DICOM initialization");
    } finally {
      setIsLoading(false);
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

      {isLoading && <SpinContainer title="Fetching..." />}

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
