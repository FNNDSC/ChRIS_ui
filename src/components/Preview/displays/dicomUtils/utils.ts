/***********************************************************************
 * Cornerstone + CornerstoneTools: New API references
 ***********************************************************************/

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

// Attach (optionally) to global namespace for debug
// @ts-ignore
window.cornerstone = cornerstone;
// @ts-ignore
window.cornerstoneTools = cornerstoneTools;

/***********************************************************************
 * Destructure what we need from the new Cornerstone 3+ imports
 ***********************************************************************/

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

// Export a convenience alias for the EVENTS object
export const events = EVENTS;

// Tools from the new Cornerstone Tools utilities
export const stopClip = utilities.cine.stopClip;
export const playClip = utilities.cine.playClip;

/***********************************************************************
 * Local state: a single ToolGroup reference
 ***********************************************************************/
let toolGroup: CornerstoneToolTypes.IToolGroup | undefined;

/***********************************************************************
 * Providers: set up additional metaData providers
 ***********************************************************************/
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

/***********************************************************************
 * Tools: register/unregister sets of tools with the library
 ***********************************************************************/
export const registerToolingOnce = () => {
  // Add each tool to Cornerstone Tools so they can be used or instantiated
  cornerstoneTools.addTool(LengthTool);
  cornerstoneTools.addTool(PanTool);
  cornerstoneTools.addTool(WindowLevelTool);
  cornerstoneTools.addTool(StackScrollMouseWheelTool);
  cornerstoneTools.addTool(ZoomTool);
  cornerstoneTools.addTool(MagnifyTool);
  cornerstoneTools.addTool(PlanarRotateTool);
};

export const removeTools = () => {
  // Remove each registered tool
  cornerstoneTools.removeTool(LengthTool);
  cornerstoneTools.removeTool(PanTool);
  cornerstoneTools.removeTool(WindowLevelTool);
  cornerstoneTools.removeTool(StackScrollMouseWheelTool);
  cornerstoneTools.removeTool(ZoomTool);
  cornerstoneTools.removeTool(MagnifyTool);
  cornerstoneTools.removeTool(PlanarRotateTool);
};

/***********************************************************************
 * Cleanup the tool group if needed
 ***********************************************************************/
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

/***********************************************************************
 * Create or retrieve the tool group, add the relevant tools
 ***********************************************************************/
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

/***********************************************************************
 * Cornerstone DICOM loader setup (new API)
 ***********************************************************************/
export const initializeCornerstoneForDicoms = () => {
  // Bridge DICOM image loader references
  cornerstoneDICOMImageLoader.external.cornerstone = cornerstone;
  cornerstoneDICOMImageLoader.external.dicomParser = dicomParser;

  // Configure the decode pipeline
  cornerstoneDICOMImageLoader.configure({
    useWebWorkers: true,
    decodeConfig: {
      convertFloatPixelDataToInt: false,
      use16BitDataType: preferSizeOverAccuracy,
    },
  });

  // Decide how many web workers can run in parallel
  let maxWebWorkers = 1;
  if (navigator.hardwareConcurrency) {
    maxWebWorkers = Math.min(navigator.hardwareConcurrency, 7);
  }

  // Initialize the worker manager
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

/***********************************************************************
 * Basic Cornerstone + Tools initialization
 ***********************************************************************/
export const basicInit = async () => {
  initProviders();
  initializeCornerstoneForDicoms();
  // The "init" calls for core + tools
  csInitCore();
  csToolsInit();
};

/***********************************************************************
 * Cornerstone StackViewport type alias
 ***********************************************************************/
export type IStackViewport = Types.IStackViewport;

/***********************************************************************
 * Example of an action handler for tool usage
 ***********************************************************************/
export const handleEvents = (
  actionState: { [key: string]: boolean | string },
  activeViewport?: IStackViewport,
) => {
  const activeTool = Object.keys(actionState)[0];
  const previousTool = actionState.previouslyActive as string;
  const id = toolGroup?.id;

  // Bypass certain tools or states
  if (activeTool === "TagInfo" || activeTool === "Play") return;

  if (id) {
    toolGroup?.setToolPassive(previousTool);

    if (activeTool === "Reset") {
      activeViewport?.resetCamera(true, true);
      activeViewport?.resetProperties();
      activeViewport?.render();
    } else {
      // Activate the selected tool
      toolGroup?.setToolActive(activeTool, {
        bindings: [{ mouseButton: MouseBindings.Primary }],
      });
    }
  }
};

/***********************************************************************
 * Load a single DICOM image (or multi-frame) from a Blob
 ***********************************************************************/
export const loadDicomImage = async (blob: Blob) => {
  try {
    // Add the Blob to wadouri's fileManager for loading
    const imageID = cornerstoneDICOMImageLoader.wadouri.fileManager.add(blob);

    // Force an image load via Cornerstone so metadata is accessible
    await cornerstone.imageLoader.loadImage(imageID);

    // Retrieve multi-frame info if present
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

/***********************************************************************
 * Helper to build a "display area" for the viewport
 ***********************************************************************/
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

/***********************************************************************
 * Set up a new RenderingEngine & StackViewport, then render images
 ***********************************************************************/
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
    const viewport = <Types.IStackViewport>(
      renderingEngine.getViewport(viewportId)
    );
    const displayArea = createDisplayArea(1, 0.5);
    viewport.setOptions(displayArea, true);
    viewport.setProperties(displayArea);
    await viewport.setStack(imageIds);
    cornerstoneTools.utilities.stackPrefetch.enable(viewport.element);
    // Set the stack scroll mouse wheel tool
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
/***********************************************************************
 * Retrieve the file_resource URL from a Chris API file
 ***********************************************************************/
export function stupidlyGetFileResourceUrl(file: IFileBlob): string {
  return Collection.getLinkRelationUrls(
    file?.collection.items[0],
    "file_resource",
  )[0];
}
