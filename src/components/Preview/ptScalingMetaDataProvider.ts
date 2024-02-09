import { utilities as csUtils } from "@cornerstonejs/core";

const scalingPerImageId: any = {};

function addInstance(imageId: string, scalingMetaData: any) {
  const imageURI = csUtils.imageIdToURI(imageId);
  scalingPerImageId[imageURI] = scalingMetaData;
}

function get(type: any, imageId: any) {
  if (type === "scalingModule") {
    const imageURI = csUtils.imageIdToURI(imageId);
    return scalingPerImageId[imageURI];
  }
}

export default { addInstance, get };
