import React, { useState } from "react";
import * as dicomParser from "dicom-parser";
import * as cornerstone from "cornerstone-core";
import * as cornerstoneTools from "cornerstone-tools";
import * as cornerstoneMath from "cornerstone-math";
import * as cornerstoneNIFTIImageLoader from "cornerstone-nifti-image-loader";
import * as cornerstoneFileImageLoader from "cornerstone-file-image-loader";
import * as cornerstoneWebImageLoader from "cornerstone-web-image-loader";
import * as cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import { useTypedSelector } from "../../../../store/hooks";
import { isDicom, isNifti } from "../../../dicomViewer/utils";
import ChrisAPIClient from "../../../../api/chrisapiclient";
import { TAG_DICT, uids } from "./dataDictionary";
import { Button, Grid, GridItem } from "@patternfly/react-core";
import Rusha from "rusha";

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
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
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
const StackScrollMouseWheelTool = cornerstoneTools.StackScrollMouseWheelTool;

const PanTool = cornerstoneTools.PanTool;
const MagnifyTool = cornerstoneTools.MagnifyTool;
const RotateTool = cornerstoneTools.RotateTool;
const WwwcTool = cornerstoneTools.WwwcTool;
const LengthTool = cornerstoneTools.LengthTool;

cornerstoneTools.addTool(cornerstoneTools.ZoomTool, {
  configuration: {
    invert: false,
    preventZoomOutsideImage: false,
    minScale: 0.1,
    maxScale: 20.0,
  },
});
cornerstoneTools.addTool(PanTool);
cornerstoneTools.addTool(StackScrollMouseWheelTool);
cornerstoneTools.setToolActive("StackScrollMouseWheel", {});
cornerstoneTools.addTool(MagnifyTool);
cornerstoneTools.addTool(RotateTool);
cornerstoneTools.addTool(WwwcTool);
cornerstoneTools.addTool(LengthTool);

const DicomViewerContainer = () => {
  const files = useTypedSelector((state) => state.explorer.selectedFolder);
  const [images, setImages] = useState<any[]>([]);
  const [output, setOutput] = useState("");
  const [frames, setFrames] = useState(0);
  const [showTagInfo, setTagInfo] = useState(false);
  const [gallery, setGallery] = useState(false);
  const dicomImageRef = React.useRef<HTMLDivElement>(null);

  const displayImageFromFiles = React.useCallback(async () => {
    const imageIds = [];
    const images: any[] = [];
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (isNifti(file.data.fname)) {
        } else if (isDicom(file.data.fname)) {
          const blob = await file.getFileBlob();

          const imageId =
            cornerstoneWADOImageLoader.wadouri.fileManager.add(blob);
          imageIds.push(imageId);
          const image = await cornerstone
            .loadAndCacheImage(imageId)
            .then((image: any) => {
              return image;
            });
          images.push(image);
        } else {
          const blob = await file.getFileBlob();
          const imageId = cornerstoneFileImageLoader.fileManager.add(blob);
          imageIds.push(imageId);
          const image = await cornerstone
            .loadAndCacheImage(imageId)
            .then((image: any) => {
              return image;
            });
          images.push(image);
        }
      }
    }
    const element = dicomImageRef.current;
    if (element) cornerstone.enable(element);
    const stack = {
      currentImageIdIndex: 0,
      imageIds: imageIds,
    };
    cornerstone.displayImage(element, images[0]);

    cornerstoneTools.addStackStateManager(element, ["stack"]);
    cornerstoneTools.addToolState(element, "stack", stack);
    setImages(images);
  }, [files]);

  React.useEffect(() => {
    displayImageFromFiles();
  }, [displayImageFromFiles]);

  const handleEvents = (event: string) => {
    if (event === "Zoom") {
      cornerstoneTools.setToolActive("Zoom", { mouseButtonMask: 1 });
    }

    if (event === "Pan") {
      cornerstoneTools.setToolActive("Pan", { mouseButtonMask: 1 });
    }
    if (event === "Magnify") {
      cornerstoneTools.setToolActive("Magnify", { mouseButtonMask: 1 });
    }

    if (event === "Rotate") {
      cornerstoneTools.setToolActive("Rotate", { mouseButtonMask: 1 });
    }

    if (event === "Wwwc") {
      cornerstoneTools.setToolActive("Wwwc", { mouseButtonMask: 1 });
    }

    if (event === "Reset") {
      cornerstone.reset(dicomImageRef.current);
      setGallery(false);
    }

    if (event === "Length") {
      cornerstoneTools.setToolActive("Length", { mouseButtonMask: 1 });
    }

    if (event === "Gallery") {
      cornerstone.reset(dicomImageRef.current);
      setGallery(!gallery);
    }

    if (event === "TagInfo") {
      setTagInfo(!showTagInfo);
      displayTagInfo();
    }
  };

  const displayTagInfo = async () => {
    if (files) {
      const file = files[frames];
      const reader = new FileReader();

      reader.onloadend = async () => {
        try {
          if (reader.result) {
            //@ts-ignore
            const byteArray = new Uint8Array(reader.result);
            const options = { TransferSyntaxUID: "1.2.840.10008.1.2" };
            //@ts-ignore
            const dataSet = dicomParser.parseDicom(byteArray);
            //@ts-ignore
            const output: any[] = [];
            dumpDataSet(dataSet, output);
            const newOutput = "<ul>" + output.join("") + "</ul>";
            const divElement = document.getElementById("output");
            if (divElement) {
              // divElement.innerHTML = newOutput;
            }
            setOutput(newOutput);
          }
        } catch (error) {
          console.log("Error", error);
        }
      };

      if (file) {
        const blob = await file.getFileBlob();
        reader.readAsArrayBuffer(blob);
      }
    }

    return <div>test</div>;
  };

  return (
    <>
      <div
        style={{
          width: "100%",
          height: "768px",
          color: "#fff",
          position: "relative",
          fontSize: "1rem",
          textShadow: "1px 1px #000000",
        }}
        ref={dicomImageRef}
      >
        <div id="dicomImageWebGL"></div>
      </div>
      <div
        style={{
          marginTop: "1rem",
        }}
      >
        <ButtonContainer action="Zoom" handleEvents={handleEvents} />
        <ButtonContainer action="Pan" handleEvents={handleEvents} />
        <ButtonContainer action="Magnify" handleEvents={handleEvents} />
        <ButtonContainer action="Rotate" handleEvents={handleEvents} />
        <ButtonContainer action="Wwwc" handleEvents={handleEvents} />
        <ButtonContainer action="Reset" handleEvents={handleEvents} />
        <ButtonContainer action="Length" handleEvents={handleEvents} />
        <ButtonContainer action="Gallery" handleEvents={handleEvents} />
        <ButtonContainer action="TagInfo" handleEvents={handleEvents} />
      </div>
      {gallery && (
        <div style={{ marginTop: "1rem" }}>
          <GalleryButtonContainer
            text="Next"
            handleClick={() => {
              if (frames < images.length - 1) {
                const newFrame = frames + 1;
                cornerstone.displayImage(
                  dicomImageRef.current,
                  images[newFrame]
                );

                setFrames(newFrame);
              }
            }}
          />

          <GalleryButtonContainer
            text="Previous"
            handleClick={() => {
              if (frames >= 0) {
                const newFrame = frames - 1;
                cornerstone.displayImage(
                  dicomImageRef.current,
                  images[newFrame]
                );

                setFrames(newFrame);
              }
            }}
          />

          <GalleryButtonContainer
            text="Next"
            handleClick={() => {
              if (frames >= 0) {
                const newFrame = frames - 1;
                cornerstone.displayImage(
                  dicomImageRef.current,
                  images[newFrame]
                );

                setFrames(newFrame);
              }
            }}
          />

          <GalleryButtonContainer
            handleClick={() => {
              const frame = 0;
              setFrames(frame);
              cornerstone.displayImage(dicomImageRef.current, images[frame]);
            }}
            text=" First"
          />

          <GalleryButtonContainer
            handleClick={() => {
              const frame = images.length - 1;
              setFrames(frame);
              cornerstone.displayImage(dicomImageRef.current, images[frame]);
            }}
            text="Last"
          />

          <GalleryButtonContainer
            handleClick={() => {
              cornerstoneTools.playClip(dicomImageRef.current, 5);
            }}
            text="Play"
          />

          <GalleryButtonContainer
            handleClick={() => {
              cornerstoneTools.stopClip(dicomImageRef.current);
            }}
            text="Pause"
          />
        </div>
      )}
      {showTagInfo && (
        <div id="output" dangerouslySetInnerHTML={{ __html: output }}></div>
      )}
    </>
  );
};

export default DicomViewerContainer;

const GalleryButtonContainer = ({
  handleClick,
  text,
}: {
  text: string;
  handleClick: () => void;
}) => {
  return (
    <Button
      style={{ marginRight: "1rem" }}
      variant="tertiary"
      onClick={handleClick}
    >
      {text}
    </Button>
  );
};

const ButtonContainer = ({
  action,
  handleEvents,
}: {
  action: string;
  handleEvents: (action: string) => void;
}) => {
  return (
    <Button
      style={{ marginRight: "1rem" }}
      variant="tertiary"
      onClick={() => handleEvents(action)}
    >
      {action}
    </Button>
  );
};

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
const showGroupElement = true;
const showFragments = true;
const showFrames = true;
const maxLength = 128;

function dumpDataSet(dataSet: any, output: any) {
  function getTag(tag: any) {
    const group = tag.substring(1, 5);
    const element = tag.substring(5, 9);
    const tagIndex = ("(" + group + "," + element + ")").toUpperCase();

    //@ts-ignore
    const attr = TAG_DICT[tagIndex];
    return attr;
  }

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
        text += element.tag;
        text += " : ";

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
        text += tag.name;
        if (showGroupElement === true) {
          text += "(" + element.tag + ")";
        }
        text += " : ";

        title += "(" + element.tag + ")";

        let lengthText = " length=" + element.length;
        if (element.hadUndefinedLength) {
          lengthText += " (-1)";
        }
        //@ts-ignore
        if (showLength === true) {
          text += lengthText + "; ";
        }
        title += "; " + lengthText;

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
          dumpDataSet(item.dataSet, output);
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
                text += '"' + escapeSpecialCharacters(str) + '"' + mapUid(str);
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
                  text +=
                    '"' + escapeSpecialCharacters(str) + '"' + mapUid(str);
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
              const groupHexStr = ("0000" + group.toString(16)).substr(-4);
              const element = dataSet.uint16(propertyName, 1);
              const elementHexStr = ("0000" + element.toString(16)).substr(-4);
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
    const ex = {
      exception: err,
      output: output,
    };
    throw ex;
  }
}
