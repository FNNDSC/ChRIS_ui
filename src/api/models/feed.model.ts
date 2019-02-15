import axios, { AxiosRequestConfig } from 'axios';

const url = `${process.env.REACT_APP_CHRIS_UI_URL}`;
const header = {
    'Content-Type': 'application/vnd.collection+json'
}
export default class FeedModel {

    // Description: get list of plugin instances ***** working call ***** will be converted to @fnndsc/chrisapi need login and token first
    static getPluginInstance(id: string) {
        const config: AxiosRequestConfig = {
            method: 'get',
            url: url+id+"/plugininstances/", //TEMP  ***** working *****
            headers: header,
            auth: { // NOTES: need authorization and authentication steps   ***** working *****
                username: 'chris',
                password: 'chris1234'
            }
        }
        return axios(config); //config: AxiosRequestConfig
    }
}