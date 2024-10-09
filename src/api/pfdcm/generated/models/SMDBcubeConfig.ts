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
import type { ModelsSmdbSetupModelValueStr } from './ModelsSmdbSetupModelValueStr';
import {
    ModelsSmdbSetupModelValueStrFromJSON,
    ModelsSmdbSetupModelValueStrFromJSONTyped,
    ModelsSmdbSetupModelValueStrToJSON,
} from './ModelsSmdbSetupModelValueStr';
import type { SMDBcubeCore } from './SMDBcubeCore';
import {
    SMDBcubeCoreFromJSON,
    SMDBcubeCoreFromJSONTyped,
    SMDBcubeCoreToJSON,
} from './SMDBcubeCore';

/**
 * The SMDB cube key config model
 * @export
 * @interface SMDBcubeConfig
 */
export interface SMDBcubeConfig {
    /**
     * 
     * @type {ModelsSmdbSetupModelValueStr}
     * @memberof SMDBcubeConfig
     */
    cubeKeyName: ModelsSmdbSetupModelValueStr;
    /**
     * 
     * @type {SMDBcubeCore}
     * @memberof SMDBcubeConfig
     */
    cubeInfo: SMDBcubeCore;
}

/**
 * Check if a given object implements the SMDBcubeConfig interface.
 */
export function instanceOfSMDBcubeConfig(value: object): value is SMDBcubeConfig {
    if (!('cubeKeyName' in value) || value['cubeKeyName'] === undefined) return false;
    if (!('cubeInfo' in value) || value['cubeInfo'] === undefined) return false;
    return true;
}

export function SMDBcubeConfigFromJSON(json: any): SMDBcubeConfig {
    return SMDBcubeConfigFromJSONTyped(json, false);
}

export function SMDBcubeConfigFromJSONTyped(json: any, ignoreDiscriminator: boolean): SMDBcubeConfig {
    if (json == null) {
        return json;
    }
    return {
        
        'cubeKeyName': ModelsSmdbSetupModelValueStrFromJSON(json['cubeKeyName']),
        'cubeInfo': SMDBcubeCoreFromJSON(json['cubeInfo']),
    };
}

export function SMDBcubeConfigToJSON(value?: SMDBcubeConfig | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'cubeKeyName': ModelsSmdbSetupModelValueStrToJSON(value['cubeKeyName']),
        'cubeInfo': SMDBcubeCoreToJSON(value['cubeInfo']),
    };
}
