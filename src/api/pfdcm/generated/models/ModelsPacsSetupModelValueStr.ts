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

import { mapValues } from '../runtime';
/**
 * 
 * @export
 * @interface ModelsPacsSetupModelValueStr
 */
export interface ModelsPacsSetupModelValueStr {
    /**
     * 
     * @type {string}
     * @memberof ModelsPacsSetupModelValueStr
     */
    value?: string;
}

/**
 * Check if a given object implements the ModelsPacsSetupModelValueStr interface.
 */
export function instanceOfModelsPacsSetupModelValueStr(value: object): value is ModelsPacsSetupModelValueStr {
    return true;
}

export function ModelsPacsSetupModelValueStrFromJSON(json: any): ModelsPacsSetupModelValueStr {
    return ModelsPacsSetupModelValueStrFromJSONTyped(json, false);
}

export function ModelsPacsSetupModelValueStrFromJSONTyped(json: any, ignoreDiscriminator: boolean): ModelsPacsSetupModelValueStr {
    if (json == null) {
        return json;
    }
    return {
        
        'value': json['value'] == null ? undefined : json['value'],
    };
}

export function ModelsPacsSetupModelValueStrToJSON(value?: ModelsPacsSetupModelValueStr | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'value': value['value'],
    };
}

