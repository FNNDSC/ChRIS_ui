import { Image } from "../types";

export function getDicomPatientName(image: Image) {
  const value = image.data.string("x00100010");
  if (value === undefined) return;
  return value;
}

export function getDicomStudyId(image: Image) {
  if (image === null) return null;
  const value = image.data.string("x00200010");
  if (value === undefined) return;
  return value;
}

export function getDicomStudyDate(image: Image) {
  const value = image.data.string("x00080020");
  if (value === undefined) return;
  return value;
}

export function getDicomStudyTime(image: Image) {
  const value = image.data.string("x00080030");
  if (value === undefined) {
    return;
  }
  return value;
}

export function getDicomStudyDescription(image: Image) {
  const value = image.data.string("x00081030");
  if (value === undefined) {
    return;
  }
  return value;
}

export function getDicomSeriesDate(image: Image) {
  const value = image.data.string("x00080021");
  if (value === undefined) {
    return;
  }
  return value;
}

export function getDicomSeriesTime(image: Image) {
  const value = image.data.string("x00080031");
  if (value === undefined) {
    return;
  }
  return value;
}

export function getDicomSeriesDescription(image: Image) {
  const value = image.data.string("x0008103e");
  if (value === undefined) {
    return;
  }
  return value;
}

export function getDicomSeriesNumber(image: Image) {
  const value = image.data.string("x00200011");
  if (value === undefined) {
    return;
  }
  return parseFloat(value);
}

export function getDicomModality(image: Image) {
  const value = image.data.string("x00080060");
  if (value === undefined) {
    return;
  }
  return value;
}

export function getDicomInstanceNumber(image: Image) {
  const value = image.data.string("x00200013");
  if (value === undefined) {
    return;
  }
  return value;
}

export function getDicomRows(image: Image) {
  const value = image.data.uint16("x00280010");
  if (value === undefined) {
    return;
  }
  return value;
}

export function getDicomColumns(image: Image) {
  const value = image.data.uint16("x00280011");
  if (value === undefined) {
    return;
  }
  return value;
}

export function dicomDateToLocale(dcmDate: string) {
  const date = new Date(
    dcmDate.substring(0, 4) +
      "-" +
      dcmDate.substring(4, 6) +
      "-" +
      dcmDate.substring(6)
  );
  const localeDate = date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  return localeDate;
}

export function getDicomSliceLocation(image: any) {
  const value = image.data.string("x00201041");
  if (value === undefined) {
    return;
  }
  return parseFloat(value);
}

export function getDicomEchoNumber(image: any) {
  const value = image.data.string("x00180086");
  if (value === undefined) {
    return;
  }
  return parseFloat(value);
}

export function getDicomSliceDistance(image: any) {
  try {
    const ipp = image.data.string("x00200032").split("\\"); // Image Position Patient
    //console.log("imagePosition: ", ipp)
    const topLeftCorner = new Array(3).fill(0);
    topLeftCorner[0] = parseFloat(ipp[0]); // X pos of frame (Top left) in real space
    topLeftCorner[1] = parseFloat(ipp[1]); // Y pos of frame (Top left) in real space
    topLeftCorner[2] = parseFloat(ipp[2]); // Z pos of frame (Top left) in real space
    //console.log("topLeftCorner: ", topLeftCorner)

    const iop = image.data.string("x00200037").split("\\"); // Image Orientation Patient
    //console.log("values: ", iop)
    const v = new Array(3).fill(0).map(() => new Array(3).fill(0));

    v[0][0] = parseFloat(iop[0]); // the x direction cosines of the first row X
    v[0][1] = parseFloat(iop[1]); // the y direction cosines of the first row X
    v[0][2] = parseFloat(iop[2]); // the z direction cosines of the first row X
    v[1][0] = parseFloat(iop[3]); // the x direction cosines of the first column Y
    v[1][1] = parseFloat(iop[4]); // the y direction cosines of the first column Y
    v[1][2] = parseFloat(iop[5]); // the z direction cosines of the first column Y

    // calculate the slice normal from IOP
    v[2][0] = v[0][1] * v[1][2] - v[0][2] * v[1][1];
    v[2][1] = v[0][2] * v[1][0] - v[0][0] * v[1][2];
    v[2][2] = v[0][0] * v[1][1] - v[0][1] * v[1][0];

    //console.log("slice normal from IOP: ", v[2])

    let dist = 0;
    for (let i = 0; i < 3; ++i) dist += v[2][i] * topLeftCorner[i];

    return dist;
  } catch (error) {
    return 0;
  }
}

export function dicomDateTimeToLocale(dateTime: string) {
  const date = new Date(
    dateTime.substring(0, 4) +
      "-" +
      dateTime.substring(4, 6) +
      "-" +
      dateTime.substring(6, 8)
  );
  const time =
    dateTime.substring(9, 11) +
    ":" +
    dateTime.substring(11, 13) +
    ":" +
    dateTime.substring(13, 15);
  const localeDate = date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  return `${localeDate} - ${time}`;
}

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
