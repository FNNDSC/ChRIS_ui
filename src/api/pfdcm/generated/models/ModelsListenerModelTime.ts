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
 * A simple model that has a time string field
 * @export
 * @interface ModelsListenerModelTime
 */
export interface ModelsListenerModelTime {
    /**
     * 
     * @type {string}
     * @memberof ModelsListenerModelTime
     */
    time: string;
}

/**
 * Check if a given object implements the ModelsListenerModelTime interface.
 */
export function instanceOfModelsListenerModelTime(value: object): value is ModelsListenerModelTime {
    if (!('time' in value) || value['time'] === undefined) return false;
    return true;
}

export function ModelsListenerModelTimeFromJSON(json: any): ModelsListenerModelTime {
    return ModelsListenerModelTimeFromJSONTyped(json, false);
}

export function ModelsListenerModelTimeFromJSONTyped(json: any, ignoreDiscriminator: boolean): ModelsListenerModelTime {
    if (json == null) {
        return json;
    }
    return {
        
        'time': json['time'],
    };
}

export function ModelsListenerModelTimeToJSON(value?: ModelsListenerModelTime | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'time': value['time'],
    };
}

