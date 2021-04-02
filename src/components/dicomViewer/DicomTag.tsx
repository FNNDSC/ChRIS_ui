import React from "react";
import { List, ListItem, Text } from "@patternfly/react-core";
import { Image } from "./types";
import { uids } from "./constants";

interface DicomTagProps {
  image: Image | undefined;
}

const DicomTag: React.FC<DicomTagProps> = ({ image }: DicomTagProps) => {
  const header = [];
  header.push({
    name: "SOP Instance UID",
    value: getSopInstanceUID(image),
  });
  if (image && image.data) {
    header.push({ name: "SOP Class", value: getSopClass(image) });
    header.push({
      name: "Modality",
      value: image.data.string("x00080060"),
    });
    header.push({
      name: "Manufacturer",
      value: image.data.string("x00080070"),
    });
    header.push({
      name: "Study Description",
      value: image.data.string("x00081030"),
    });
    header.push({
      name: "Series Description",
      value: image.data.string("x0008103E"),
    });
    header.push({
      name: "Patient Name",
      value: image.data.string("x00100010"),
    });
    header.push({
      name: "Frame Rate",
      value: image.data.string("x00082144"),
    });

    header.push({
      name: "MR Acquisition Type",
      value: image.data.string("x00180023"),
    });
    header.push({
      name: "Slice Thickness",
      value: image.data.string("x00180050"),
    });
    header.push({
      name: "Spacing Between Slice",
      value: image.data.string("x00180088"),
    });
    header.push({
      name: "Patient Position",
      value: image.data.string("x00185100"),
    });

    header.push({
      name: "Study ID",
      value: image.data.string("x00200010"),
    });
    header.push({
      name: "Series Number",
      value: image.data.string("x00200011"),
    });
    header.push({
      name: "Acquisition Number",
      value: image.data.string("x00200012"),
    });
    header.push({
      name: "Instance Number",
      value: image.data.string("x00200013"),
    });
    header.push({
      name: "Image Position (Patient)",
      value: image.data.string("x00200032"),
    });
    header.push({
      name: "Image Orientation (Patient)",
      value: image.data.string("x00200037"),
    });
    header.push({
      name: "Images in Acquisition",
      value: image.data.string("x00201002"),
    });
    header.push({
      name: "Slice Location",
      value: image.data.string("x00201041"),
    });

    header.push({
      name: "Samples per Pixel",
      value: image.data.uint16("x00280002"),
    });
    header.push({
      name: "Photometric Interpretation",
      value: image.data.string("x00280004"),
    });
    header.push({
      name: "Number of Frames",
      value: image.data.string("x00280008"),
    });
    header.push({
      name: "Rows",
      value: image.data.uint16("x00280010"),
    });
    header.push({
      name: "Columns",
      value: image.data.uint16("x00280011"),
    });
    header.push({
      name: "Pixel Spacing",
      value: image.data.string("x00280030"),
    });
    header.push({
      name: "Bits Allocated",
      value: image.data.uint16("x00280100"),
    });
    header.push({
      name: "Bits Stored",
      value: image.data.uint16("x00280101"),
    });
    header.push({
      name: "High Bit",
      value: image.data.uint16("x00280102"),
    });
    header.push({
      name: "Window Center",
      value: image.data.string("x00281050"),
    });
    header.push({
      name: "Window Width",
      value: image.data.string("x00281051"),
    });
    header.push({
      name: "Rescale Intercept",
      value: image.data.string("x00281052"),
    });
    header.push({
      name: "Rescale Slope",
      value: image.data.string("x00281053"),
    });
    header.push({
      name: "Min Stored Pixel Value",
      value: image.minPixelValue,
    });
    header.push({
      name: "Max Stored Pixel Value",
      value: image.maxPixelValue,
    });

    header.push({
      name: "Image Orientation",
      value: image.data.string("x00700042"),
    });
    header.push({
      name: "Image Horizontal Flip",
      value: image.data.string("x00700041"),
    });
  }

  header.push({
    name: "Planar Configuration",
    value: getPlanarConfiguration(image),
  });

  header.push({
    name: "Pixel Representation",
    value: getPixelRepresentation(image),
  });

  const listItems = header.map((item, index) => {
    if (item.value !== undefined) {
      return (
        <ListItem className="dicomTag__list__item" key={index}>
          <span className="dicomTag__list__item--name">{item.name}: </span>
          <span className="dicomTag__list__item--value">{item.value}</span>
        </ListItem>
      );
    } else return undefined;
  });

  return (
    <div className="dicomTag">
      <div className="dicomTag__list">
        {listItems.filter((item) => item !== undefined).length > 0 ? (
          <List>{listItems}</List>
        ) : (
          <Text>
            The tag information is only available for dicoms currently
          </Text>
        )}
      </div>
    </div>
  );
};

export default React.memo(DicomTag);

const getSopClass = (image: Image | undefined) => {
  if (image && image.data) {
    const value: string = image.data.string("x00080016");
    return value + " [" + uids[value] + "]";
  }
  return undefined;
};

const getSopInstanceUID = (image: Image | undefined) => {
  if (image && image.data) {
    const value = image.data.string("x00080018");
    return value;
  }
  return undefined;
};

const getPixelRepresentation = (image: Image | undefined) => {
  if (image && image.data) {
    const value = image.data.uint16("x00280103");
    return value + (value === 0 ? " (unsigned)" : " (signed)");
  }

  return undefined;
};

const getPlanarConfiguration = (image: Image | undefined) => {
  if (image && image.data) {
    const value = image.data.uint16("x00280006");
    return value + (value === 0 ? " (pixel)" : " (plane)");
  }

  return undefined;
};
