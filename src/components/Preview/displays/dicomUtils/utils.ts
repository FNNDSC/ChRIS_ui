import {
  RenderingEngine,
  init,
  Types,
  Enums,
  imageLoader,
  metaData,
  volumeLoader,
} from "@cornerstonejs/core";
import registerWebImageLoader from "./webImageLoader";
import {
  init as csToolsInit,
  Types as CornerstoneToolTypes,
} from "@cornerstonejs/tools";
import dicomParser from "dicom-parser";
import * as cornerstone from "@cornerstonejs/core";
import * as cornerstoneTools from "@cornerstonejs/tools";
import {
  cornerstoneStreamingImageVolumeLoader,
  cornerstoneStreamingDynamicImageVolumeLoader,
} from "@cornerstonejs/streaming-image-volume-loader";
import hardcodedMetaDataProvider from "./hardcodedMetaDataProvider";
import cornerstonejsDICOMImageLoader from "@cornerstonejs/dicom-image-loader";
import ptScalingMetaDataProvider from "./ptScalingMetaDataProvider";

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

let toolGroup: CornerstoneToolTypes.IToolGroup | undefined;
const alreadyAdded: {
  [key: string]: boolean;
} = {};

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

export function setUpTooling(uniqueToolId: string) {
  if (!alreadyAdded[uniqueToolId]) {
    // Check if tool group already exists
    const existingToolGroup = ToolGroupManager.getToolGroup(uniqueToolId);

    if (!existingToolGroup) {
      // Tool group doesn't exist, create a new one
      const toolGroupId = uniqueToolId;
      toolGroup = ToolGroupManager.createToolGroup(toolGroupId);

      if (toolGroup) {
        // Add tools to the tool group
        cornerstoneTools.addTool(LengthTool);
        cornerstoneTools.addTool(PanTool);
        cornerstoneTools.addTool(WindowLevelTool);
        cornerstoneTools.addTool(StackScrollMouseWheelTool);
        cornerstoneTools.addTool(ZoomTool);
        cornerstoneTools.addTool(MagnifyTool);
        cornerstoneTools.addTool(PlanarRotateTool);

        toolGroup.addTool(WindowLevelTool.toolName);
        toolGroup.addTool(PanTool.toolName);
        toolGroup.addTool(ZoomTool.toolName);
        toolGroup.addTool(StackScrollMouseWheelTool.toolName, { loop: false });
        toolGroup.addTool(PlanarRotateTool.toolName);
        toolGroup.addTool(LengthTool.toolName);
        toolGroup.addTool(MagnifyTool.toolName);

        // Mark the tool as added
        alreadyAdded[uniqueToolId] = true;
      }
    } else {
      console.error(`Tool group with ID ${uniqueToolId} already exists.`);
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
  uniqueToolId: string,
  activeViewport?: IStackViewport,
) => {
  const activeTool = Object.keys(actionState)[0];
  const previousTool = actionState.previouslyActive as string;
  const existingToolGroup = ToolGroupManager.getToolGroup(uniqueToolId);

  if (!existingToolGroup) return;

  existingToolGroup?.setToolPassive(previousTool);

  if (activeTool === "Reset") {
    activeViewport?.resetCamera(true, true);
    activeViewport?.resetProperties();
    activeViewport?.render();
  }

  toolGroup?.setToolActive(activeTool, {
    bindings: [{ mouseButton: MouseBindings.Primary }],
  });
};

export const loadDicomImage = (blob: Blob) => {
  return cornerstonejsDICOMImageLoader.wadouri.fileManager.add(blob);
};

type ImagePoint = [number, number];

interface DisplayArea {
  imageArea: ImagePoint;
  imageCanvasPoint: {
    imagePoint: ImagePoint;
    canvasPoint: ImagePoint;
  };
  // storeAsInitialCamera?: boolean;
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
      // storeAsInitialCamera: true,
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

    return {
      viewport,
      renderingEngine,
    };
  } catch (e) {
    throw new Error(e as string);
  }
};
