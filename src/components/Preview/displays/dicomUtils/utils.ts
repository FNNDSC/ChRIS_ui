import {
  Enums,
  RenderingEngine,
  type Types,
  imageLoader,
  init,
  metaData,
  volumeLoader,
  EVENTS,
} from "@cornerstonejs/core";
import * as cornerstone from "@cornerstonejs/core";
import cornerstonejsDICOMImageLoader from "@cornerstonejs/dicom-image-loader";
import {
  cornerstoneStreamingDynamicImageVolumeLoader,
  cornerstoneStreamingImageVolumeLoader,
} from "@cornerstonejs/streaming-image-volume-loader";
import {
  type Types as CornerstoneToolTypes,
  init as csToolsInit,
} from "@cornerstonejs/tools";
import * as cornerstoneTools from "@cornerstonejs/tools";
import dicomParser from "dicom-parser";
import hardcodedMetaDataProvider from "./hardcodedMetaDataProvider";
import ptScalingMetaDataProvider from "./ptScalingMetaDataProvider";
import registerWebImageLoader from "./webImageLoader";

//@ts-ignore
window.cornerstone = cornerstone;
//@ts-ignore
window.cornerstoneTools = cornerstoneTools;
const { preferSizeOverAccuracy, useNorm16Texture } =
  cornerstone.getConfiguration().rendering;
const { ViewportType } = Enums;
const { calibratedPixelSpacingMetadataProvider } = cornerstone.utilities;
const {
  PanTool,
  WindowLevelTool,
  StackScrollMouseWheelTool,
  ZoomTool,
  PlanarRotateTool,
  MagnifyTool,
  LengthTool,
  ToolGroupManager,
  Enums: csToolsEnums,
} = cornerstoneTools;
const { MouseBindings } = csToolsEnums;
export const events = EVENTS;

let toolGroup: CornerstoneToolTypes.IToolGroup | undefined;

function initProviders() {
  cornerstone.metaData.addProvider(
    ptScalingMetaDataProvider.get.bind(ptScalingMetaDataProvider),
    10000,
  );
  cornerstone.metaData.addProvider(
    calibratedPixelSpacingMetadataProvider.get.bind(
      calibratedPixelSpacingMetadataProvider,
    ),
    11000,
  );
}

export const registerToolingOnce = () => {
  // Add tools to the tool group
  cornerstoneTools.addTool(LengthTool);
  cornerstoneTools.addTool(PanTool);
  cornerstoneTools.addTool(WindowLevelTool);
  cornerstoneTools.addTool(StackScrollMouseWheelTool);
  cornerstoneTools.addTool(ZoomTool);
  cornerstoneTools.addTool(MagnifyTool);
  cornerstoneTools.addTool(PlanarRotateTool);
};

export const removeTools = () => {
  // Remove tools from the tool group
  cornerstoneTools.removeTool(LengthTool);
  cornerstoneTools.removeTool(PanTool);
  cornerstoneTools.removeTool(WindowLevelTool);
  cornerstoneTools.removeTool(StackScrollMouseWheelTool);
  cornerstoneTools.removeTool(ZoomTool);
  cornerstoneTools.removeTool(MagnifyTool);
  cornerstoneTools.removeTool(PlanarRotateTool);
};

export const cleanupCornerstoneTooling = () => {
  // Remove the tool group
  const id = toolGroup?.id;
  if (id) {
    const existingToolGroup = ToolGroupManager.getToolGroup(id);
    if (existingToolGroup) {
      ToolGroupManager.destroyToolGroup(id);
      toolGroup = undefined;
    }
  }
};

export function setUpTooling(uniqueToolId: string) {
  // Check if tool group already exists
  const id = toolGroup?.id;
  if (!id) {
    // Tool group doesn't exist, create a new one
    toolGroup = ToolGroupManager.createToolGroup(uniqueToolId);

    if (toolGroup) {
      toolGroup.addTool(WindowLevelTool.toolName);
      toolGroup.addTool(PanTool.toolName);
      toolGroup.addTool(ZoomTool.toolName);
      toolGroup.addTool(StackScrollMouseWheelTool.toolName, { loop: false });
      toolGroup.addTool(PlanarRotateTool.toolName);
      toolGroup.addTool(LengthTool.toolName);
      toolGroup.addTool(MagnifyTool.toolName);
    }
  }
}

export const initializeCornerstoneForDicoms = () => {
  cornerstonejsDICOMImageLoader.external.cornerstone = cornerstone;
  cornerstonejsDICOMImageLoader.external.dicomParser = dicomParser;
  cornerstonejsDICOMImageLoader.configure({
    useWebWorkers: true,
    decodeConfig: {
      convertFloatPixelDataToInt: false,
      use16BitDataType: preferSizeOverAccuracy || useNorm16Texture,
    },
  });

  let maxWebWorkers = 1;

  if (navigator.hardwareConcurrency) {
    maxWebWorkers = Math.min(navigator.hardwareConcurrency, 7);
  }

  const config = {
    maxWebWorkers,
    startWebWorkersOnDemand: false,
    taskConfiguration: {
      decodeTask: {
        initializeCodecsOnStartup: false,
        strict: false,
      },
    },
  };

  cornerstonejsDICOMImageLoader.webWorkerManager.initialize(config);
};

function initVolumeLoader() {
  volumeLoader.registerUnknownVolumeLoader(
    //@ts-ignore
    cornerstoneStreamingImageVolumeLoader,
  );
  volumeLoader.registerVolumeLoader(
    "cornerstoneStreamingImageVolume",
    //@ts-ignore
    cornerstoneStreamingImageVolumeLoader,
  );
  volumeLoader.registerVolumeLoader(
    "cornerstoneStreamingDynamicImageVolume",
    //@ts-ignore
    cornerstoneStreamingDynamicImageVolumeLoader,
  );
}

export const basicInit = async () => {
  cornerstone.setUseSharedArrayBuffer(Enums.SharedArrayBufferModes.FALSE);
  initProviders();
  initializeCornerstoneForDicoms();
  initVolumeLoader();
  await init();
  csToolsInit();
  registerWebImageLoader(imageLoader);
};

export type IStackViewport = Types.IStackViewport;

export const handleEvents = (
  actionState: { [key: string]: boolean | string },
  activeViewport?: IStackViewport,
) => {
  const activeTool = Object.keys(actionState)[0];
  const previousTool = actionState.previouslyActive as string;
  const id = toolGroup?.id;

  if (activeTool === "TagInfo") return;

  if (id) {
    toolGroup?.setToolPassive(previousTool);
    if (activeTool === "Reset") {
      activeViewport?.resetCamera(true, true);
      activeViewport?.resetProperties();
      activeViewport?.render();
    } else {
      toolGroup?.setToolActive(activeTool, {
        bindings: [{ mouseButton: MouseBindings.Primary }],
      });
    }
  }
};

export const loadDicomImage = async (blob: Blob) => {
  const imageID = cornerstonejsDICOMImageLoader.wadouri.fileManager.add(blob);
  const image = await cornerstone.imageLoader.loadImage(imageID);

  // Detect if the DICOM is a multi-frame image
  //@ts-ignore
  const numberOfFrames = image.data.string("x00280008");
  const framesCount = numberOfFrames ? Number.parseInt(numberOfFrames, 10) : 1;

  return {
    imageID,
    framesCount,
  };
};

type ImagePoint = [number, number];

interface DisplayArea {
  imageArea: ImagePoint;
  imageCanvasPoint: {
    imagePoint: ImagePoint;
    canvasPoint: ImagePoint;
  };
}

interface ViewportInputOptions {
  rotation: number;
  flipHorizontal: boolean;
  displayArea: DisplayArea;
}

function createDisplayArea(
  size: number,
  pointValue: number | ImagePoint,
  canvasValue: number | [number, number] = pointValue,
  rotation = 0,
  flipHorizontal = false,
): ViewportInputOptions {
  const imagePoint: ImagePoint = Array.isArray(pointValue)
    ? pointValue
    : [pointValue, pointValue];
  const canvasPoint: [number, number] = Array.isArray(canvasValue)
    ? canvasValue
    : [canvasValue, canvasValue];

  return {
    rotation,
    flipHorizontal,
    displayArea: {
      imageArea: [size, size] as ImagePoint,
      imageCanvasPoint: {
        imagePoint,
        canvasPoint,
      },
    },
  };
}

export const displayDicomImage = async (
  element: HTMLDivElement,
  imageId: string,
  uniqueId: string,
): Promise<{
  viewport: Types.IStackViewport;
  renderingEngine: RenderingEngine;
}> => {
  try {
    const viewportId = uniqueId;
    const renderingEngineId = `myRenderingEngine_${uniqueId}`;
    const imageIds = [imageId];
    if (imageId.startsWith("web")) {
      metaData.addProvider(
        (type, imageId) => hardcodedMetaDataProvider(type, imageId, imageIds),
        10000,
      );
    }
    const renderingEngine = new RenderingEngine(renderingEngineId);
    const viewportInput = {
      viewportId,
      type: ViewportType.STACK,
      element,
    };
    renderingEngine.enableElement(viewportInput);
    toolGroup?.addViewport(viewportId, renderingEngineId);
    const viewport = <Types.IStackViewport>(
      renderingEngine.getViewport(viewportId)
    );
    const displayArea: ViewportInputOptions = createDisplayArea(1, 0.5);
    viewport.setOptions(displayArea, true);
    viewport.setProperties(displayArea);
    await viewport.setStack(imageIds);
    cornerstoneTools.utilities.stackPrefetch.enable(viewport.element);
    viewport.render();
    // Set the stack scroll mouse wheel tool
    toolGroup?.setToolActive(StackScrollMouseWheelTool.toolName);
    return {
      viewport,
      renderingEngine,
    };
  } catch (e) {
    throw new Error(e as string);
  }
};
