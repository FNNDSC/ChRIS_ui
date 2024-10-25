/**
 * Wrapper for the OpenAPI-generated client, providing better typing.
 *
 * Note to developers: we want to use some types from fp-ts such as
 * `ReadonlyNonEmptyArray` but we don't use `TaskEither` because
 * traditional promises and `throw` are more compatible with TanStack
 * Query.
 */

import {
  Configuration,
  PACSPypxApiV1PACSSyncPypxPostRequest,
  PACSQRServicesApi,
  PACSSetupServicesApi,
  PACSqueryCore,
  PACSServiceHandlerApiV1PACSThreadPypxPostRequest,
  PACSasync,
} from "./generated";
import { pipe } from "fp-ts/function";
import { PypxFind, PypxTag, Series, StudyAndSeries } from "./models.ts";
import { parse as parseDate } from "date-fns";
import {
  ReadonlyNonEmptyArray,
  fromArray as readonlyNonEmptyArrayFromArray,
} from "fp-ts/ReadonlyNonEmptyArray";
import { match as matchOption } from "fp-ts/Option";

/**
 * PFDCM client.
 */
class PfdcmClient {
  private readonly servicesClient: PACSSetupServicesApi;
  private readonly qrClient: PACSQRServicesApi;
  constructor(configuration?: Configuration) {
    this.servicesClient = new PACSSetupServicesApi(configuration);
    this.qrClient = new PACSQRServicesApi(configuration);
  }

  /**
   * Get list of PACS services which this PFDCM is configured to speak with.
   */
  public async getPacsServices(): Promise<ReadonlyNonEmptyArray<string>> {
    const services =
      await this.servicesClient.serviceListGetApiV1PACSserviceListGet();
    return pipe(
      // default service is a useless option added by pfdcm
      services.filter((s) => s !== "default"),
      readonlyNonEmptyArrayFromArray,
      matchOption(
        () => {
          throw new Error(
            `PFDCM is not configured with any services (besides "default")`,
          );
        },
        (some) => some,
      ),
    );
  }

  private async find(service: string, query: PACSqueryCore): Promise<PypxFind> {
    const params: PACSPypxApiV1PACSSyncPypxPostRequest = {
      bodyPACSPypxApiV1PACSSyncPypxPost: {
        pACSservice: {
          value: service,
        },
        listenerService: {
          value: "default",
        },
        pACSdirective: query,
      },
    };
    const data = await this.qrClient.pACSPypxApiV1PACSSyncPypxPost(params);
    if (!isFindResponseData(data)) {
      throw new Error("Unrecognizable response from PFDCM");
    }
    raiseForBadStatus(data);
    return data;
  }

  /**
   * Search for PACS data.
   * @param service which PACS service to search for. See {@link PfdcmClient.getPacsServices}
   * @param query PACS query
   */
  public async query(
    service: string,
    query: PACSqueryCore,
  ): Promise<ReadonlyArray<StudyAndSeries>> {
    const data = await this.find(service, query);
    return simplifyResponse(data);
  }

  public async retrieve(
    service: string,
    query: PACSqueryCore,
  ): Promise<PACSasync> {
    const params: PACSServiceHandlerApiV1PACSThreadPypxPostRequest = {
      bodyPACSServiceHandlerApiV1PACSThreadPypxPost: {
        pACSservice: {
          value: service,
        },
        listenerService: {
          value: "default",
        },
        pACSdirective: {
          ...query,
          withFeedBack: true,
          then: "retrieve",
        },
      },
    };
    const res =
      await this.qrClient.pACSServiceHandlerApiV1PACSThreadPypxPost(params);
    // @ts-expect-error PFDCM OpenAPI spec is incomplete
    if (!res.response?.job?.status) {
      throw new Error("PYPX job status is missing or false");
    }
    return res;
  }
}

function isFindResponseData(data: any): data is PypxFind {
  return (
    typeof data.status === "boolean" && "message" in data && "pypx" in data
  );
}

/**
 * Throw an error for any "status" field that is not `true`
 * (this is a convention that Rudolph uses for error handling
 * instead of HTTP status codes, exceptions, and/or monads).
 */
function raiseForBadStatus(data: PypxFind): PypxFind {
  if (!data.status) {
    throw new Error("PFDCM response status=false");
  }
  if (data.pypx.status !== "success") {
    throw new Error("PFDCM response pypx.status=false");
  }
  for (const study of data.pypx.data) {
    if (!Array.isArray(study.series)) {
      continue;
    }
    for (const series of study.series) {
      if (series.status.value !== "success") {
        throw new Error(
          `PFDCM response pypx...status is false for SeriesInstanceUID=${series?.SeriesInstanceUID?.value}`,
        );
      }
    }
  }
  return data;
}

/**
 * Re-organizes the data from pypx's response.
 */
function simplifyResponse(data: PypxFind): ReadonlyArray<StudyAndSeries> {
  return data.pypx.data.map(simplifyPypxStudyData);
}

function simplifyPypxStudyData(data: {
  [key: string]: PypxTag | ReadonlyArray<{ [key: string]: PypxTag }>;
}): StudyAndSeries {
  const study = {
    SpecificCharacterSet: getValue(data, "SpecificCharacterSet"),
    StudyDate: parsePypxDicomDate(data.StudyDate),
    AccessionNumber: getValue(data, "AccessionNumber"),
    RetrieveAETitle: getValue(data, "RetrieveAETitle"),
    ModalitiesInStudy: getValue(data, "ModalitiesInStudy"),
    StudyDescription: getValue(data, "StudyDescription"),
    PatientName: getValue(data, "PatientName"),
    PatientID: getValue(data, "PatientID"),
    PatientBirthDate: parsePypxDicomDate(data.PatientBirthDate),
    PatientSex: getValue(data, "PatientSex"),
    PatientAge: getValue(data, "PatientAge"),
    ProtocolName: getValue(data, "ProtocolName"),
    AcquisitionProtocolName: getValue(data, "AcquisitionProtocolName"),
    AcquisitionProtocolDescription: getValue(
      data,
      "AcquisitionProtocolDescription",
    ),
    StudyInstanceUID: getValue(data, "StudyInstanceUID"),
    NumberOfStudyRelatedSeries:
      "value" in data.NumberOfStudyRelatedSeries &&
      data.NumberOfStudyRelatedSeries.value !== 0
        ? parseInt(data.NumberOfStudyRelatedSeries.value)
        : NaN,
    PerformedStationAETitle: getValue(data, "PerformedStationAETitle"),
  };
  const series = Array.isArray(data.series)
    ? data.series.map(simplifyPypxSeriesData)
    : [];
  return { study, series };
}

function getValue(
  data: { [key: string]: PypxTag | ReadonlyArray<{ [key: string]: PypxTag }> },
  name: string,
): string {
  if (!(name in data)) {
    return "";
  }
  if ("value" in data[name]) {
    return "" + data[name].value;
  }
  return "";
}

function simplifyPypxSeriesData(data: { [key: string]: PypxTag }): Series {
  const numInstances = parseInt(
    getValue(data, "NumberOfSeriesRelatedInstances"),
  );
  const NumberOfSeriesRelatedInstances = Number.isNaN(numInstances)
    ? null
    : numInstances;
  return {
    SpecificCharacterSet: getValue(data, "SpecificCharacterSet"),
    StudyDate: parsePypxDicomDate(data.StudyDate),
    SeriesDate: parsePypxDicomDate(data.SeriesDate),
    AccessionNumber: getValue(data, "AccessionNumber"),
    RetrieveAETitle: getValue(data, "RetrieveAETitle"),
    Modality: getValue(data, "Modality"),
    StudyDescription: getValue(data, "StudyDescription"),
    SeriesDescription: getValue(data, "SeriesDescription"),
    PatientName: getValue(data, "PatientName"),
    PatientID: getValue(data, "PatientID"),
    PatientBirthDate: parsePypxDicomDate(data.PatientBirthDate),
    PatientSex: getValue(data, "PatientSex"),
    PatientAge: getValue(data, "PatientAge"),
    ProtocolName: getValue(data, "ProtocolName"),
    AcquisitionProtocolName: getValue(data, "AcquisitionProtocolName"),
    AcquisitionProtocolDescription: getValue(
      data,
      "AcquisitionProtocolDescription",
    ),
    StudyInstanceUID: getValue(data, "StudyInstanceUID"),
    SeriesInstanceUID: getValue(data, "SeriesInstanceUID"),
    NumberOfSeriesRelatedInstances,
    PerformedStationAETitle: getValue(data, "PerformedStationAETitle"),
  };
}

/**
 * Parse a DICOM DateString (DS), which is in YYYYMMDD format.
 *
 * The invalid format "YYYY-MM-DD" is also accepted.
 *
 * https://dicom.nema.org/medical/dicom/current/output/chtml/part05/sect_6.2.html
 */
function parsePypxDicomDate(tag: PypxTag | object | undefined): Date | null {
  if (!tag || !("value" in tag) || tag.value === 0) {
    return null;
  }
  const parsed = parseDate("" + tag.value, "yyyyMMdd", new Date());
  if (!Number.isNaN(parsed.getFullYear())) {
    return parsed;
  }
  return parseDate("" + tag.value, "yyyy-MM-dd", new Date());
}

export { PfdcmClient, parsePypxDicomDate };
