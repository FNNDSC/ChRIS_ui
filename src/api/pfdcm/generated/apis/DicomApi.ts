/* tslint:disable */
/* eslint-disable */
/**
 * pfdcm
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 3.1.2
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


import * as runtime from '../runtime';
import type {
  Dicom,
  HTTPValidationError,
} from '../models/index';
import {
    DicomFromJSON,
    DicomToJSON,
    HTTPValidationErrorFromJSON,
    HTTPValidationErrorToJSON,
} from '../models/index';

export interface ReadDicomApiV1DicomGetRequest {
    mrn: number;
}

/**
 * 
 */
export class DicomApi extends runtime.BaseAPI {

    /**
     * Fake meaningless response
     * Get dicom images for a patient.
     */
    async readDicomApiV1DicomGetRaw(requestParameters: ReadDicomApiV1DicomGetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Dicom>> {
        if (requestParameters['mrn'] == null) {
            throw new runtime.RequiredError(
                'mrn',
                'Required parameter "mrn" was null or undefined when calling readDicomApiV1DicomGet().'
            );
        }

        const queryParameters: any = {};

        if (requestParameters['mrn'] != null) {
            queryParameters['mrn'] = requestParameters['mrn'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/api/v1/dicom/`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => DicomFromJSON(jsonValue));
    }

    /**
     * Fake meaningless response
     * Get dicom images for a patient.
     */
    async readDicomApiV1DicomGet(requestParameters: ReadDicomApiV1DicomGetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Dicom> {
        const response = await this.readDicomApiV1DicomGetRaw(requestParameters, initOverrides);
        return await response.value();
    }

}
