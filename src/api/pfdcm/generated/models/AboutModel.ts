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
 * @interface AboutModel
 */
export interface AboutModel {
    /**
     * 
     * @type {string}
     * @memberof AboutModel
     */
    name?: string;
    /**
     * 
     * @type {string}
     * @memberof AboutModel
     */
    about?: string;
    /**
     * 
     * @type {string}
     * @memberof AboutModel
     */
    version?: string;
}

/**
 * Check if a given object implements the AboutModel interface.
 */
export function instanceOfAboutModel(value: object): value is AboutModel {
    return true;
}

export function AboutModelFromJSON(json: any): AboutModel {
    return AboutModelFromJSONTyped(json, false);
}

export function AboutModelFromJSONTyped(json: any, ignoreDiscriminator: boolean): AboutModel {
    if (json == null) {
        return json;
    }
    return {
        
        'name': json['name'] == null ? undefined : json['name'],
        'about': json['about'] == null ? undefined : json['about'],
        'version': json['version'] == null ? undefined : json['version'],
    };
}

export function AboutModelToJSON(value?: AboutModel | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'name': value['name'],
        'about': value['about'],
        'version': value['version'],
    };
}

