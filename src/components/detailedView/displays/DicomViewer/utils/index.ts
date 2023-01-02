import { TAG_DICT, uids } from "./dataDictionary";
import * as dicomParser from "dicom-parser";
import * as cornerstone from "cornerstone-core";
import * as cornerstoneMath from "cornerstone-math";
import * as cornerstoneTools from "cornerstone-tools";
import * as cornerstoneNIFTIImageLoader from "cornerstone-nifti-image-loader";
import * as cornerstoneFileImageLoader from "cornerstone-file-image-loader";
import * as cornerstoneWebImageLoader from "cornerstone-web-image-loader";
import * as cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import ChrisAPIClient from "../../../../../api/chrisapiclient";
import Rusha from "rusha";

const ZoomTool = cornerstoneTools.ZoomTool;
const StackScrollMouseWheelTool = cornerstoneTools.StackScrollMouseWheelTool;
const PanTool = cornerstoneTools.PanTool;
const MagnifyTool = cornerstoneTools.MagnifyTool;
const RotateTool = cornerstoneTools.RotateTool;
const WwwcTool = cornerstoneTools.WwwcTool;
const LengthTool = cornerstoneTools.LengthTool;

const toolList = [
  ZoomTool,
  PanTool,
  StackScrollMouseWheelTool,
  MagnifyTool,
  RotateTool,
  WwwcTool,
  LengthTool,
];

export function initDicom() {
  cornerstoneTools.external.cornerstone = cornerstone;
  cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
  cornerstoneTools.external.Hammer = Hammer;
  cornerstoneTools.init({
    globalToolSyncEnabled: true,
    showSVGCursors: true,
  });

  cornerstoneNIFTIImageLoader.external.cornerstone = cornerstone;
  cornerstoneFileImageLoader.external.cornerstone = cornerstone;
  cornerstoneWebImageLoader.external.cornerstone = cornerstone;
  cornerstoneWADOImageLoader.external.cornerstone = cornerstone;

  const client = ChrisAPIClient.getClient();
  const token = client.auth.token;
  cornerstoneNIFTIImageLoader.nifti.configure({
    headers: {
      "Content-Type": "application/vnd.collection+json",
      Authorization: "Token " + token,
    },
    method: "get",
    responseType: "arrayBuffer",
  });

  const ImageId = cornerstoneNIFTIImageLoader.nifti.ImageId;

  toolList.forEach((tool) => {
    if (tool === "StackScrollMouseWheel") {
      cornerstoneTools.setToolActive("StackScrollMouseWheel", {});
    }
    cornerstoneTools.addTool(tool);
  });

  return { ImageId };
}

export const removeTool = () => {
  toolList.forEach((tool) => {
    cornerstoneTools.removeTool(tool.name);
  });
};

export function isDicom(fileName: string) {
  const fileExt = fileName.substring(fileName.lastIndexOf(".") + 1);
  if (fileExt === "dcm" || fileExt === "dicom") return true;
}

export function isNifti(fileName: string) {
  const fileExt = fileName.substring(fileName.lastIndexOf(".") + 1);
  if (fileExt === "nii" || fileExt === "gz") {
    return true;
  }
  return false;
}

function imageFrameLink(frameIndex: any) {
  let linkText = "<a class='imageFrameDownload' ";
  linkText += "data-frameIndex='" + frameIndex + "'";
  linkText += " href='#'> Frame #" + frameIndex + "</a>";
  return linkText;
}

const rusha = new Rusha();

// helper function to see if a string only has ascii characters in it
function isASCII(str: any) {
  return /^[\x00-\x7F]*$/.test(str);
}

function sha1(byteArray: any, position?: any, length?: any) {
  position = position || 0;
  length = length || byteArray.length;
  position = position || 0;
  length = length || byteArray.length;
  const subArray = dicomParser.sharedCopy(byteArray, position, length);
  return rusha.digest(subArray);
}

function sha1Text(byteArray: any, position?: any, length?: any) {
  const showSHA1 = false;
  if (showSHA1 === false) {
    return "";
  }
  const text = "; SHA1 " + sha1(byteArray, position, length);
  return text;
}

function escapeSpecialCharacters(str: any) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function isStringVr(vr: string) {
  if (
    vr === "AT" ||
    vr === "FL" ||
    vr === "FD" ||
    vr === "OB" ||
    vr === "OF" ||
    vr === "OW" ||
    vr === "SI" ||
    vr === "SQ" ||
    vr === "SS" ||
    vr === "UL" ||
    vr === "US"
  ) {
    return false;
  }
  return true;
}

function mapUid(str: any) {
  //@ts-ignore
  const uid = uids[str];
  if (uid) {
    return " [ " + uid + " ]";
  }
  return "";
}

const showPrivateElements = true;
const showP10Header = true;
const showEmptyValues = true;
const showLength = false;
const showVR = false;
const showFragments = true;
const showFrames = true;
const maxLength = 128;

function getTag(tag: any) {
  const group = tag.substring(1, 5);
  const element = tag.substring(5, 9);
  const tagIndex = ("(" + group + "," + element + ")").toUpperCase();

  //@ts-ignore
  const attr = TAG_DICT[tagIndex];
  return attr;
}

export function dumpDataSet(dataSet: any, output: any, testOutput: any) {
  try {
    const keys = [];
    for (const propertyName in dataSet.elements) {
      keys.push(propertyName);
    }
    keys.sort();

    // the dataSet.elements object contains properties for each element parsed.  The name of the property
    // is based on the elements tag and looks like 'xGGGGEEEE' where GGGG is the group number and EEEE is the
    // element number both with lowercase hexadecimal letters.  For example, the Series Description DICOM element 0008,103E would
    // be named 'x0008103e'.  Here we iterate over each property (element) so we can build a string describing its
    // contents to add to the output array
    for (let k = 0; k < keys.length; k++) {
      const propertyName = keys[k];
      const element = dataSet.elements[propertyName];

      //@ts-ignore
      if (showP10Header === false && element.tag <= "x0002ffff") {
        continue;
      }

      if (
        //@ts-ignore
        showPrivateElements === false &&
        dicomParser.isPrivateTag(element.tag)
      ) {
        continue;
      }
      //@ts-ignore
      if (showEmptyValues === false && element.length <= 0) {
        continue;
      }
      let text = "";
      let title = "";

      let color = "black";

      const tag = getTag(element.tag);

      // The output string begins with the element name (or tag if not in data dictionary), length and VR (if present).  VR is undefined for
      // implicit transfer syntaxes
      if (tag === undefined) {
        let lengthText = "length=" + element.length;
        if (element.hadUndefinedLength) {
          lengthText += " (-1)";
        }
        //@ts-ignore
        if (showLength === true) {
          text += lengthText + "; ";
        }

        title += lengthText;

        let vrText = "";
        if (element.vr) {
          vrText += "VR=" + element.vr;
        }

        if (showVR) {
          text += vrText + "; ";
        }
        if (vrText) {
          title += "; " + vrText;
        }

        title += "dataOffset=" + element.dataOffset;
        // make text lighter since this is an unknown attribute
        color = "#C8C8C8";
      } else {
        let vrText = "";
        if (element.vr) {
          vrText += "VR=" + element.vr;
        }

        if (showVR) {
          text += vrText + "; ";
        }
        if (vrText) {
          title += "" + vrText;
        }

        title += "; dataOffset=" + element.dataOffset;
      }

      // Here we check for Sequence items and iterate over them if present.  items will not be set in the
      // element object for elements that don't have SQ VR type.  Note that implicit little endian
      // sequences will are currently not parsed.
      if (element.items) {
        output.push("<li>" + text + "</li>");
        output.push("<ul>");

        // each item contains its own data set so we iterate over the items
        // and recursively call this function
        let itemNumber = 0;
        element.items.forEach(function (item: any) {
          output.push("<li>Item #" + itemNumber++ + " " + item.tag);
          let lengthText = " length=" + item.length;
          if (item.hadUndefinedLength) {
            lengthText += " (-1)";
          }
          //@ts-ignore
          if (showLength === true) {
            text += lengthText + "; ";
            output.push(lengthText);
          }
          output.push("</li>");
          output.push("<ul>");
          dumpDataSet(item.dataSet, output, testOutput);
          output.push("</ul>");
        });
        output.push("</ul>");
      } else if (element.fragments) {
        text +=
          "encapsulated pixel data with " +
          element.basicOffsetTable.length +
          " offsets and " +
          element.fragments.length +
          " fragments";
        text += sha1Text(dataSet.byteArray, element.dataOffset, element.length);

        output.push("<li title='" + title + "'=>" + text + "</li>");

        if (showFragments && element.encapsulatedPixelData) {
          output.push("Fragments:<br>");
          output.push("<ul>");
          let itemNumber = 0;
          element.fragments.forEach(function (fragment: any) {
            let str =
              "<li>Fragment #" +
              itemNumber++ +
              " dataOffset = " +
              fragment.position;
            str += "; offset = " + fragment.offset;
            str += "; length = " + fragment.length;
            str += sha1Text(
              dataSet.byteArray,
              fragment.position,
              fragment.length
            );
            str += "</li>";

            output.push(str);
          });
          output.push("</ul>");
        }
        if (showFrames && element.encapsulatedPixelData) {
          output.push("Frames:<br>");
          output.push("<ul>");
          let bot = element.basicOffsetTable;
          // if empty bot and not RLE, calculate it
          if (bot.length === 0) {
            bot = dicomParser.createJPEGBasicOffsetTable(dataSet, element);
          }

          for (let frameIndex = 0; frameIndex < bot.length; frameIndex++) {
            let str = "<li>";
            str += imageFrameLink(frameIndex);
            str +=
              " dataOffset = " +
              (element.fragments[0].position + bot[frameIndex]);
            str += "; offset = " + bot[frameIndex];
            const imageFrame = dicomParser.readEncapsulatedImageFrame(
              dataSet,
              element,
              frameIndex,
              bot
            );
            str += "; length = " + imageFrame.length;
            str += sha1Text(imageFrame);
            str += "</li>";
            output.push(str);
          }
          output.push("</ul>");
        }
      } else {
        // use VR to display the right value
        let vr;
        if (element.vr !== undefined) {
          vr = element.vr;
        } else {
          if (tag !== undefined) {
            vr = tag.vr;
          }
        }

        // if the length of the element is less than 128 we try to show it.  We put this check in
        // to avoid displaying large strings which makes it harder to use.
        if (element.length < maxLength) {
          // Since the dataset might be encoded using implicit transfer syntax and we aren't using
          // a data dictionary, we need some simple logic to figure out what data types these
          // elements might be.  Since the dataset might also be explicit we could be switch on the
          // VR and do a better job on this, perhaps we can do that in another example

          // First we check to see if the element's length is appropriate for a UI or US VR.
          // US is an important type because it is used for the
          // image Rows and Columns so that is why those are assumed over other VR types.
          if (element.vr === undefined && tag === undefined) {
            if (element.length === 2) {
              text += " (" + dataSet.uint16(propertyName) + ")";
            } else if (element.length === 4) {
              text += " (" + dataSet.uint32(propertyName) + ")";
            }

            // Next we ask the dataset to give us the element's data in string form.  Most elements are
            // strings but some aren't so we do a quick check to make sure it actually has all ascii
            // characters so we know it is reasonable to display it.
            const str = dataSet.string(propertyName);
            const stringIsAscii = isASCII(str);

            if (stringIsAscii) {
              // the string will be undefined if the element is present but has no data
              // (i.e. attribute is of type 2 or 3 ) so we only display the string if it has
              // data.  Note that the length of the element will be 0 to indicate "no data"
              // so we don't put anything here for the value in that case.
              if (str !== undefined) {
                text += escapeSpecialCharacters(str) + mapUid(str);
              }
            } else {
              if (element.length !== 2 && element.length !== 4) {
                color = "#C8C8C8";
                // If it is some other length and we have no string
                text += "<i>binary data</i>";
              }
            }
          } else {
            if (isStringVr(vr)) {
              // Next we ask the dataset to give us the element's data in string form.  Most elements are
              // strings but some aren't so we do a quick check to make sure it actually has all ascii
              // characters so we know it is reasonable to display it.
              const str = dataSet.string(propertyName);
              const stringIsAscii = isASCII(str);

              if (stringIsAscii) {
                // the string will be undefined if the element is present but has no data
                // (i.e. attribute is of type 2 or 3 ) so we only display the string if it has
                // data.  Note that the length of the element will be 0 to indicate "no data"
                // so we don't put anything here for the value in that case.
                if (str !== undefined) {
                  text += escapeSpecialCharacters(str) + mapUid(str);
                }
              } else {
                if (element.length !== 2 && element.length !== 4) {
                  color = "#C8C8C8";
                  // If it is some other length and we have no string
                  text += "<i>binary data</i>";
                }
              }
            } else if (vr === "US") {
              text += dataSet.uint16(propertyName);
              for (
                let i = 1;
                i < dataSet.elements[propertyName].length / 2;
                i++
              ) {
                text += "\\" + dataSet.uint16(propertyName, i);
              }
            } else if (vr === "SS") {
              text += dataSet.int16(propertyName);
              for (
                let i = 1;
                i < dataSet.elements[propertyName].length / 2;
                i++
              ) {
                text += "\\" + dataSet.int16(propertyName, i);
              }
            } else if (vr === "UL") {
              text += dataSet.uint32(propertyName);
              for (
                let i = 1;
                i < dataSet.elements[propertyName].length / 4;
                i++
              ) {
                text += "\\" + dataSet.uint32(propertyName, i);
              }
            } else if (vr === "SL") {
              text += dataSet.int32(propertyName);
              for (
                let i = 1;
                i < dataSet.elements[propertyName].length / 4;
                i++
              ) {
                text += "\\" + dataSet.int32(propertyName, i);
              }
            } else if (vr == "FD") {
              text += dataSet.double(propertyName);
              for (
                let i = 1;
                i < dataSet.elements[propertyName].length / 8;
                i++
              ) {
                text += "\\" + dataSet.double(propertyName, i);
              }
            } else if (vr == "FL") {
              text += dataSet.float(propertyName);
              for (
                let i = 1;
                i < dataSet.elements[propertyName].length / 4;
                i++
              ) {
                text += "\\" + dataSet.float(propertyName, i);
              }
            } else if (
              vr === "OB" ||
              vr === "OW" ||
              vr === "UN" ||
              vr === "OF" ||
              vr === "UT"
            ) {
              color = "#C8C8C8";
              // If it is some other length and we have no string
              /*
                if (element.length === 2) {
                  text +=
                    "<i>" +
                    dataDownloadLink(element, "binary data") +
                    " of length " +
                    element.length +
                    " as uint16: " +
                    dataSet.uint16(propertyName) +
                    "</i>";
                } else if (element.length === 4) {
                  text +=
                    "<i>" +
                    dataDownloadLink(element, "binary data") +
                    " of length " +
                    element.length +
                    " as uint32: " +
                    dataSet.uint32(propertyName) +
                    "</i>";
                } else {
                  text +=
                    "<i>" +
                    dataDownloadLink(element, "binary data") +
                    " of length " +
                    element.length +
                    " and VR " +
                    vr +
                    "</i>";
                }
                */
            } else if (vr === "AT") {
              const group = dataSet.uint16(propertyName, 0);
              const groupHexStr = ("0000" + group.toString(16)).substring(-4);
              const element = dataSet.uint16(propertyName, 1);
              const elementHexStr = ("0000" + element.toString(16)).substring(
                -4
              );
              text += "x" + groupHexStr + elementHexStr;
            } else if (vr === "SQ") {
            } else {
              // If it is some other length and we have no string
              text += "<i>no display code for VR " + vr + " yet, sorry!</i>";
            }
          }

          if (element.length === 0) {
            color = "#C8C8C8";
          }
        } else {
          color = "#C8C8C8";
          /*
                      // Add text saying the data is too long to show...
                      text += "<i>" + dataDownloadLink(element, "data");
                      text += " of length " + element.length + " for VR " + vr + " too long to show</i>";
                      text += sha1Text(dataSet.byteArray, element.dataOffset, element.length);
                      */
        }
        // finally we add the string to our output array surrounded by li elements so it shows up in the
        // DOM as a list

        testOutput.push({
          [tag.name]: text,
        });
        output.push(
          '<li style="color:' +
            color +
            ';" title="' +
            title +
            '">' +
            text +
            "</li>"
        );
      }
    }
  } catch (err) {
    console.error(err);
    return testOutput;
  }

  return testOutput;
}
