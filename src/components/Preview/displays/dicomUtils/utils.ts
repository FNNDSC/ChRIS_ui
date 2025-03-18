import * as cornerstone from "@cornerstonejs/core";
import {
  EVENTS,
  Enums,
  RenderingEngine,
  type Types,
  init as csInitCore,
} from "@cornerstonejs/core";
import cornerstoneDICOMImageLoader from "@cornerstonejs/dicom-image-loader";
import * as cornerstoneTools from "@cornerstonejs/tools";
import {
  type Types as CornerstoneToolTypes,
  init as csToolsInit,
} from "@cornerstonejs/tools";
import { Collection } from "@fnndsc/chrisapi";
import dicomParser from "dicom-parser";
import type { IFileBlob } from "../../../../api/model";
import ptScalingMetaDataProvider from "./ptScalingMetaDataProvider";

const { ViewportType } = Enums;
const { preferSizeOverAccuracy } = cornerstone.getConfiguration().rendering;
const { calibratedPixelSpacingMetadataProvider } = cornerstone.utilities;

export const {
  PanTool,
  WindowLevelTool,
  StackScrollMouseWheelTool,
  ZoomTool,
  PlanarRotateTool,
  MagnifyTool,
  LengthTool,
  ToolGroupManager,
  Enums: csToolsEnums,
  utilities,
} = cornerstoneTools;
export const { MouseBindings } = csToolsEnums;
export const events = EVENTS;
export const stopClip = utilities.cine.stopClip;
export const playClip = utilities.cine.playClip;
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
  cornerstoneTools.addTool(PanTool);
  cornerstoneTools.addTool(WindowLevelTool);
  cornerstoneTools.addTool(StackScrollMouseWheelTool);
  cornerstoneTools.addTool(ZoomTool);
  cornerstoneTools.addTool(MagnifyTool);
  cornerstoneTools.addTool(PlanarRotateTool);
  cornerstoneTools.addTool(LengthTool);
};

export const removeTools = () => {
  cornerstoneTools.removeTool(PanTool);
  cornerstoneTools.removeTool(WindowLevelTool);
  cornerstoneTools.removeTool(StackScrollMouseWheelTool);
  cornerstoneTools.removeTool(ZoomTool);
  cornerstoneTools.removeTool(MagnifyTool);
  cornerstoneTools.removeTool(PlanarRotateTool);
  cornerstoneTools.removeTool(LengthTool);
};

export const cleanupCornerstoneTooling = () => {
  const id = toolGroup?.id;
  if (id) {
    const existing = ToolGroupManager.getToolGroup(id);
    if (existing) {
      ToolGroupManager.destroyToolGroup(id);
      toolGroup = undefined;
    }
  }
};

export function setUpTooling(uniqueToolId: string) {
  const id = toolGroup?.id;
  if (!id) {
    registerToolingOnce();
    toolGroup = ToolGroupManager.createToolGroup(uniqueToolId);
    if (toolGroup) {
      toolGroup.addTool(WindowLevelTool.toolName);
      toolGroup.addTool(PanTool.toolName);
      toolGroup.addTool(ZoomTool.toolName);
      toolGroup.addTool(StackScrollMouseWheelTool.toolName);
      toolGroup.addTool(PlanarRotateTool.toolName);
      toolGroup.addTool(LengthTool.toolName);
      toolGroup.addTool(MagnifyTool.toolName);
    }
  }
}

export const initializeCornerstoneForDicoms = () => {
  cornerstoneDICOMImageLoader.external.cornerstone = cornerstone;
  cornerstoneDICOMImageLoader.external.dicomParser = dicomParser;
  cornerstoneDICOMImageLoader.configure({
    useWebWorkers: true,
    decodeConfig: {
      convertFloatPixelDataToInt: false,
      use16BitDataType: preferSizeOverAccuracy,
    },
  });
  let maxWebWorkers = 1;
  if (navigator.hardwareConcurrency) {
    maxWebWorkers = Math.min(navigator.hardwareConcurrency, 7);
  }
  cornerstoneDICOMImageLoader.webWorkerManager.initialize({
    maxWebWorkers,
    startWebWorkersOnDemand: false,
    taskConfiguration: {
      decodeTask: {
        initializeCodecsOnStartup: false,
        strict: false,
      },
    },
  });
};

export const basicInit = async () => {
  initProviders();
  initializeCornerstoneForDicoms();
  await csInitCore();
  csToolsInit();
};

export type IStackViewport = Types.IStackViewport;

export const handleEvents = (
  actionState: { [key: string]: boolean | string },
  activeViewport?: IStackViewport,
) => {
  const activeTool = Object.keys(actionState)[0];
  const previousTool = actionState.previouslyActive as string;
  const id = toolGroup?.id;
  if (activeTool === "TagInfo" || activeTool === "Play") return;
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
  try {
    const imageID = cornerstoneDICOMImageLoader.wadouri.fileManager.add(blob);
    await cornerstone.imageLoader.loadImage(imageID);
    const generalImageModule = await cornerstone.metaData.get(
      "multiframeModule",
      imageID,
    );
    const framesCount = generalImageModule?.NumberOfFrames
      ? Number.parseInt(generalImageModule.NumberOfFrames, 10)
      : 1;
    return {
      imageID,
      framesCount,
    };
  } catch (err: any) {
    const errorMessage = err?.error?.message || "Failed to load";
    throw new Error(errorMessage);
  }
};

type ImagePoint = [number, number];

function createDisplayArea(
  size: number,
  pointValue: number | ImagePoint,
  canvasValue: number | [number, number] = pointValue,
  rotation = 0,
  flipHorizontal = false,
) {
  const imagePoint: ImagePoint = Array.isArray(pointValue)
    ? pointValue
    : [pointValue, pointValue];
  const canvasPoint: ImagePoint = Array.isArray(canvasValue)
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
  imageIds: string[],
  uniqueId: string,
): Promise<{
  viewport: Types.IStackViewport;
  renderingEngine: RenderingEngine;
}> => {
  try {
    const viewportId = uniqueId;
    const renderingEngineId = `myRenderingEngine_${uniqueId}`;
    const renderingEngine = new RenderingEngine(renderingEngineId);
    const viewportInput = {
      viewportId,
      type: ViewportType.STACK,
      element,
    };
    renderingEngine.enableElement(viewportInput);
    toolGroup?.addViewport(viewportId, renderingEngineId);
    const viewport = renderingEngine.getViewport(
      viewportId,
    ) as Types.IStackViewport;
    const displayArea = createDisplayArea(1, 0.5);
    viewport.setOptions(displayArea, true);
    viewport.setProperties(displayArea);
    await viewport.setStack(imageIds);
    cornerstoneTools.utilities.stackPrefetch.enable(viewport.element);
    toolGroup?.setToolActive(StackScrollMouseWheelTool.toolName);
    viewport.render();
    return {
      viewport,
      renderingEngine,
    };
  } catch (e) {
    throw new Error(e as string);
  }
};

export function getFileResourceUrl(file: IFileBlob): string {
  return Collection.getLinkRelationUrls(
    file?.collection.items[0],
    "file_resource",
  )[0];
}
