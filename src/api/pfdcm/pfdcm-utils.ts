import { PACSStudy } from ".";

/**
 * Parse Raw DCM Data
 */

interface RawDcmData {
  status: string;
  command: string;
  data: RawDcmObject[];
  args: {
    [argument: string]: string | number | boolean;
  }
}

interface RawDcmObject {
  [label: string]: RawDcmItem | RawDcmObject[];
}

interface RawDcmItem {
  tag: number | string;
  value: number | string;
  label: string;
}

const isRawDcmItem = (item: RawDcmItem | RawDcmObject[]): item is RawDcmItem => (
  (item as RawDcmObject[]).length === undefined
);

function parseRawDcmValue(label: string, item: RawDcmItem) {
  const { value } = item;

  // treat as dates (typescript forbids fallthrough switches)
  const dateLabels = [
    'studyDate',
    'patientBirthDate'
  ]

  // treat as numbers
  const numberLabels = [
    'numberOfStudyRelatedInstances', 
    'numberOfStudyRelatedSeries',
    'numberOfSeriesRelatedInstances',
  ];

  if (typeof value === 'string') {
    if (dateLabels.includes(label)) {
      const date = new Date();
      date.setFullYear(parseInt(value.slice(0, 4)));
      date.setMonth(parseInt(value.slice(4, 6)));
      date.setDate(parseInt(value.slice(6)));
      return date;
    }
    if (numberLabels.includes(label)) {
      return parseInt(value);
    }
  }

  return value;
}


export function flattenDcmArray(dcmArray: RawDcmObject[]) {
  return dcmArray.map((dcmObject) => {
    const flatObject: any = {};
    const labels = Object.keys(dcmObject);

    for (const label of labels) {
      const item = dcmObject[label];

      // DCM labels are in PascalCase; converts to camelCase for typescript convention
      const camelCaseLabel = `${label[0].toLowerCase()}${label.slice(1)}`;

      if (isRawDcmItem(item)) {
        flatObject[camelCaseLabel] = parseRawDcmValue(camelCaseLabel, item);
      } else {
        flatObject[label] = flattenDcmArray(item);
      }
    }

    return flatObject as PACSStudy;
  });
}

// Parses raw DCM object returned by PFDCM, transforms to more usable `PACSStudy[]` structure
export function parseRawDcmData(rawData: RawDcmData): PACSStudy[] {
  return flattenDcmArray(rawData.data);
}
