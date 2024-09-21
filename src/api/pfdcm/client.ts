/**
 * Wrapper for the OpenAPI-generated client, providing better typing
 * and a fp-ts API.
 */

import * as TE from "fp-ts/TaskEither";
import * as E from "fp-ts/Either";
import {
  Configuration,
  PACSPypxApiV1PACSSyncPypxPostRequest,
  PACSQRServicesApi,
  PACSSetupServicesApi,
  PACSqueryCore,
  PACSServiceHandlerApiV1PACSThreadPypxPostRequest,
  PACSasync,
} from "./generated";
import { flow, pipe } from "fp-ts/function";
import { PypxFind, PypxTag, Series, StudyAndSeries } from "./models.ts";
import { parse as parseDate } from "date-fns";
import {
  ReadonlyNonEmptyArray,
  fromArray as readonlyNonEmptyArrayFromArray,
} from "fp-ts/ReadonlyNonEmptyArray";

const validateNonEmptyStringArray = flow(
  readonlyNonEmptyArrayFromArray<string>,
  TE.fromOption(() => new Error("PFDCM returned an empty list for services")),
);

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
  public getPacsServices(): TE.TaskEither<
    Error,
    ReadonlyNonEmptyArray<string>
  > {
    return pipe(
      TE.tryCatch(
        () => this.servicesClient.serviceListGetApiV1PACSserviceListGet(),
        E.toError,
      ),
      TE.flatMap(validateNonEmptyStringArray),
    );
  }

  private find(
    service: string,
    query: PACSqueryCore,
  ): TE.TaskEither<Error, PypxFind> {
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
    return pipe(
      TE.tryCatch(
        () => this.qrClient.pACSPypxApiV1PACSSyncPypxPost(params),
        E.toError,
      ),
      TE.flatMap(validateFindResponseData),
      TE.flatMap(validateStatusIsTrue),
    );
  }

  /**
   * Search for PACS data.
   * @param service which PACS service to search for. See {@link PfdcmClient.getPacsServices}
   * @param query PACS query
   */
  public query(
    service: string,
    query: PACSqueryCore,
  ): TE.TaskEither<Error, ReadonlyArray<StudyAndSeries>> {
    return pipe(this.find(service, query), TE.map(simplifyResponse));
  }

  public retrieve(
    service: string,
    query: PACSqueryCore,
  ): TE.TaskEither<Error, PACSasync> {
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
    return pipe(
      TE.tryCatch(
        () => this.qrClient.pACSServiceHandlerApiV1PACSThreadPypxPost(params),
        E.toError,
      ),
      TE.flatMap((data) => {
        // @ts-ignore OpenAPI spec of PFDCM is incomplete
        if (data.response.job.status) {
          return TE.right(data);
        }
        const error = new Error("PYPX job status is missing or false");
        return TE.left(error);
      }),
    );
  }
}

function validateFindResponseData(data: any): TE.TaskEither<Error, PypxFind> {
  if (isFindResponseData(data)) {
    return TE.right(data);
  }
  const error = new Error("Invalid response from PFDCM");
  return TE.left(error);
}

function isFindResponseData(data: any): data is PypxFind {
  return (
    typeof data.status === "boolean" && "message" in data && "pypx" in data
  );
}

/**
 * Validate that all the "status" fields are `true`
 * (this is a convention that Rudolph uses for error handling
 * instead of HTTP status codes, exceptions, and/or monads).
 */
function validateStatusIsTrue(data: PypxFind): TE.TaskEither<Error, PypxFind> {
  if (!data.status) {
    const error = new Error("PFDCM response status=false");
    return TE.left(error);
  }
  if (data.pypx.status !== "success") {
    const error = new Error("PFDCM response pypx.status=false");
    return TE.left(error);
  }
  for (const study of data.pypx.data) {
    if (!Array.isArray(study.series)) {
      continue;
    }
    for (const series of study.series) {
      if (series.status.value !== "success") {
        const error = new Error(
          `PFDCM response pypx...status is false for SeriesInstanceUID=${series?.SeriesInstanceUID?.value}`,
        );
        return TE.left(error);
      }
    }
  }
  return TE.right(data);
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
    StudyDate: getValue(data, "StudyDate"),
    AccessionNumber: getValue(data, "AccessionNumber"),
    RetrieveAETitle: getValue(data, "RetrieveAETitle"),
    ModalitiesInStudy: getValue(data, "ModalitiesInStudy"),
    StudyDescription: getValue(data, "StudyDescription"),
    PatientName: getValue(data, "PatientName"),
    PatientID: getValue(data, "PatientID"),
    PatientBirthDate:
      "value" in data.PatientBirthDate
        ? parseDicomDate(data.PatientBirthDate)
        : null,
    PatientSex: getValue(data, "PatientSex"),
    PatientAge: parseFloat(getValue(data, "PatientAge")),
    ProtocolName: getValue(data, "ProtocolName"),
    AcquisitionProtocolName: getValue(data, "AcquisitionProtocolName"),
    AcquisitionProtocolDescription: getValue(
      data,
      "AcquisitionProtocolDescription",
    ),
    StudyInstanceUID: getValue(data, "StudyInstanceUID"),
    NumberOfStudyRelatedSeries: getValue(data, "NumberOfStudyRelatedSeries"),
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
  if ("value" in data[name]) {
    return "" + data[name].value;
  }
  return "";
}

function simplifyPypxSeriesData(data: { [key: string]: PypxTag }): Series {
  return {
    SpecificCharacterSet: "" + data.SpecificCharacterSet.value,
    StudyDate: "" + data.StudyDate.value,
    SeriesDate: "" + data.SeriesDate.value,
    AccessionNumber: "" + data.AccessionNumber.value,
    RetrieveAETitle: "" + data.RetrieveAETitle.value,
    Modality: "" + data.Modality.value,
    StudyDescription: "" + data.StudyDescription.value,
    SeriesDescription: "" + data.SeriesDescription.value,
    PatientName: "" + data.PatientName.value,
    PatientID: "" + data.PatientID.value,
    PatientBirthDate: parseDicomDate(data.PatientBirthDate),
    PatientSex: "" + data.PatientSex.value,
    PatientAge: parseFloat("" + data.PatientAge.value),
    ProtocolName: "" + data.ProtocolName.value,
    AcquisitionProtocolName: "" + data.AcquisitionProtocolName.value,
    AcquisitionProtocolDescription:
      "" + data.AcquisitionProtocolDescription.value,
    StudyInstanceUID: "" + data.StudyInstanceUID.value,
    SeriesInstanceUID: "" + data.SeriesInstanceUID.value,
    NumberOfSeriesRelatedInstances:
      "" + data.NumberOfSeriesRelatedInstances.value,
    PerformedStationAETitle: "" + data.PerformedStationAETitle.value,
  };
}

/**
 * Parse a DICOM DateString (DS), which is in YYYYMMDD format.
 *
 * https://dicom.nema.org/medical/dicom/current/output/chtml/part05/sect_6.2.html
 */
function parseDicomDate(tag: PypxTag): Date {
  return parseDate("" + tag.value, "yyyyMMdd", new Date());
}

export { PfdcmClient };
