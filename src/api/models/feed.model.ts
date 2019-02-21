import axios, { AxiosRequestConfig } from 'axios';
import Client, { Feed, FeedList, PluginInstance } from '@fnndsc/chrisapi';

export default class FeedModel {
  // Description: gets all feeds
  static getFeeds() {
    const url = `${process.env.REACT_APP_CHRIS_UI_URL}`;
    const auth = { token: window.sessionStorage.getItem('AUTH_TOKEN') };
    const client = new Client(url, auth);
    const params = { limit: 10, offset: 0 };
    return client.getFeeds(params);
  }

  // Description: gets Feed information
  static getFeed(id: string) {
    const url = `${process.env.REACT_APP_CHRIS_UI_URL}${id}/`;
    const auth = { token: window.sessionStorage.getItem('AUTH_TOKEN') };
    // const feedlist = new FeedList(url, auth);
    // return feedlist.get();
    const feed = new Feed(url, auth);
    return feed.get();
  }

  // Description: get list of plugin instances ***** working call ***** will be converted to @fnndsc/chrisapi need login and token first
  static getPluginInstance(id: string) {
    const url = `${process.env.REACT_APP_CHRIS_UI_URL}${id}/plugininstances`;
    const auth = { token: window.sessionStorage.getItem('AUTH_TOKEN') };
    const feed = new Feed(url, auth);
    return feed.get();
    // const url = `${process.env.REACT_APP_CHRIS_UI_URL}${id}/plugininstances/`;
    // const auth = { token: window.sessionStorage.getItem('AUTH_TOKEN') };
    // const feedlist = new FeedList(url, auth);
    // return feedlist.get();
  }
}
