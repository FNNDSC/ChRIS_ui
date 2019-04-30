declare module "@fnndsc/chrisapi" {
  /**
   * Collection+Json utility object.
   */
  export class Collection {
    /**
     * Get the error message from the collection object.
     *
     * @param {Object} collection - Collection+Json collection object
     * @return {string} - error message
     */
    static getErrorMessage: (collection: object) => string; // collection type may need to be declared

    /**
     * Get the list of urls for a link relation from a collection or item object.
     *
     * @param {Object} obj - Collection+Json collection or item object
     * @param {string} relationName - name of the link relation
     * @return {string[]} - list of urls
     */
    static getLinkRelationUrls: (obj: object, relationName: string) => string[]; // obj may need to be declared

    /**
     * Get an item's data (descriptors).
     *
     * @param {Object} item - Collection+Json item object
     * @return {Object} - object whose properties and values are the item's descriptor names and values respectively
     */
    static getItemDescriptors: (item: object) => void;

    /**
     * Get the url of the representation given by a collection obj.
     *
     * @param {Object} collection - Collection+Json collection object
     * @return {string} - url of the resource representation
     */
    static getUrl: (collection: object) => string;

    /**
     * Get the list of descriptor names within a collection's template object.
     *
     * @param {Object} template - Collection+Json template object
     * @return {string[]} - list of descriptor names
     */
    static getTemplateDescriptorNames: (template: object) => string[];

    /**
     * Get the list of descriptor names within a Collection+Json query array.
     *
     * @param {Object[]} queryArr - Collection+Json query array
     * @return {string[]} - list of query parameter names
     */
    static getQueryParameters: (queryArr: object) => string[];

    /**
     * Make a Collection+Json template object from a regular object whose properties are
     * the item descriptors.
     *
     * @param {Object} descriptorsObj - item descriptors object
     * @return {Object} - template object
     */
    static makeTemplate(descriptorsObj: object): object;
  }

  /**
   * API client object.
   */
  export default class Client {
    /**
     * Constructor
     *
     * @param {string} url - url of the ChRIS service
     * @param {Object} auth - authentication object
     * @param {string} auth.token - authentication token
     */
    constructor(url: string, auth: IAuth)

    /**
     * Fetch a list of currently authenticated user's feeds from the REST API.
     *
     * @param {Object} [params=null] - page parameters
     * @param {number} [params.limit] - page limit
     * @param {number} [params.offset] - page offset
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to a ``FeedList`` object
     */
    getFeeds: (params: IParams, timeout?: number) => void;

    /**
     * Create a new user account.
     *
     * @param {string} usersUrl - url of the user accounts service
     * @param {string} username - username
     * @param {string} password - password
     * @param {string} email - user email
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to a ``User`` object
     */
    static createUser: (usersUrl: string, username: string, password: string, email: string, timeout?: number) => void;

    /**
     * Fetch a user's login authorization token from the REST API.
     * @param {string} authUrl - url of the authorization service
     * @param {string} username - username
     * @param {string} password - password
     * @param {number} [timeout=30000] - request timeout
     *
     * @return {Object} - JS Promise, resolves to a ``string`` value
     */
    static getAuthToken: (usersUrl: string, username: string, password: string, timeout?: number) => void;

    /**
     * Helper method to run an asynchronous task defined by a task generator function.
     *
     * @param {function*()} taskGenerator - generator function
     */
    static runAsyncTask(taskGenerator: function);
  }

  /**
   * Comment item resource object representing a feed comment.
   */
  export declare class Comment extends ItemResource {

    /**
     * Constructor
     *
     * @param {string} url - url of the resource
     * @param {Object} auth - authentication object
     * @param {string} auth.token - authentication token
     */
    constructor(url: string, auth: IAuth): string

    /**
     * Fetch the feed associated to the comment item from the REST API.
     *
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to a ``Feed`` object
     */
    getFeed: (timeout?: number) => void;

    /**
     * Make a PUT request to modify this comment item resource through the REST API.
     *
     * @param {Object} data - request JSON data object
     * @param {string} data.title - title of the comment
     * @param {string} data.content - content of the comment
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to ``this`` object
     */
    put: (data: IData, timeout?: number) => void;

    /**
     * Make a DELETE request to delete this comment item resource through the REST API.
     *
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to ``null``
     */
    delete: (timeout?: number) => void;
  }

  /**
   * Comment list resource object representing a list of feed comments.
   */
  export declare class CommentList extends ListResource {
    /**
     * Constructor
     *
     * @param {string} url - url of the resource
     * @param {Object} auth - authentication object
     * @param {string} auth.token - authentication token
     */
    constructor(url: string, auth: IAuth): string

    /**
     * Fetch the feed associated to the comment list from the REST API.
     *
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to a ``Feed`` object
     */
    getFeed: (timeout?: number) => void;

    /**
     * Make a POST request to this comment list resource to create a new comment item
     * resource through the REST API.
     *
     * @param {Object} data - request JSON data object
     * @param {string} data.title - title of the comment
     * @param {string} data.content - content of the comment
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to ``this`` object
     */
    post: (data: IData, timeout?: number) => void;
  }

  /**
   * Custom exception object.
   */
  export declare class RequestException extends Error {
    /**
     * Constructor
     *
     * @param {...string} args
     */
    constructor(...args: string)
  }

  /**
   * Feed item resource object representing a feed.
   */
  export declare class Feed extends ItemResource {
    /**
     * Constructor
     *
     * @param {string} url - url of the resource
     * @param {Object} auth - authentication object
     * @param {string} auth.token - authentication token
     */
    constructor(url: string, auth: IAuth): string

    /**
     * Fetch the note associated to this feed from the REST API.
     *
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to a ``Note`` object
     */
    getNote: (timeout?: number) => void;

    /**
     * Fetch a list of tags associated to this feed from the REST API.
     *
     * @param {Object} [params=null] - page parameters
     * @param {number} [params.limit] - page limit
     * @param {number} [params.offset] - page offset
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to a ``TagList`` object
     */
    getTags: (params: IParams, timeout?: number) => void;

    /**
     * Fetch a list of comments associated to this feed from the REST API.
     *
     * @param {Object} [params=null] - page parameters
     * @param {number} [params.limit] - page limit
     * @param {number} [params.offset] - page offset
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to a ``CommentList`` object
     */
    getComments: (params: IParams, timeout?: number) => void;

    /**
     * Fetch a list of files associated to this feed from the REST API.
     *
     * @param {Object} [params=null] - page parameters
     * @param {number} [params.limit] - page limit
     * @param {number} [params.offset] - page offset
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to a ``FeedFileList`` object
     */
    getFiles: (params: IParams, timeout?: number) => void;

    /**
     * Fetch the plugin instance that created this feed from the REST API.
     *
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to a ``PluginInstance`` object
     */
    getPluginInstance: (timeout?: number) => void;

    /**
     * Make a PUT request to modify this feed item resource through the REST API.
     *
     * @param {Object} data - request JSON data object
     * @param {string} data.name - name of the feed
     * @param {string} data.owner - username to be added to the list of this feed's owners
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to ``this`` object
     */
    put: (data: IData, timeout?: number) => void;

    /**
     * Make a DELETE request to delete this feed item resource through the REST API.
     *
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to ``null``
     */
    delete: (timeout?: number) => void;
  }

  /**
   * Feed list resource object representing a list of user's feeds.
   */
  export declare class FeedList extends ListResource {
    /**
     * Constructor
     *
     * @param {string} url - url of the resource
     * @param {Object} auth - authentication object
     * @param {string} auth.token - authentication token
     */
    constructor(url: string, auth: IAuth): string

    /**
     * Fetch currently authenticated user's information from the REST API.
     *
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to a ``User`` object
     */
    getUser: (timeout?: number) => void;

    /**
     * Fetch a list of plugins from the REST API.
     *
     * @param {Object} [params=null] - page parameters
     * @param {number} [params.limit] - page limit
     * @param {number} [params.offset] - page offset
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to a ``PluginList`` object
     */
    getPlugins: (params: IParams, timeout?: number) => void;

    /**
     * Fetch a list of tags from the REST API.
     *
     * @param {Object} [params=null] - page parameters
     * @param {number} [params.limit] - page limit
     * @param {number} [params.offset] - page offset
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to a ``TagList`` object
     */
    getTags: (params: IParams, timeout?: number) => void;

    /**
     * Fetch a list of uploaded files from the REST API.
     *
     * @param {Object} [params=null] - page parameters
     * @param {number} [params.limit] - page limit
     * @param {number} [params.offset] - page offset
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to a ``UploadedFileList`` object
     */
    getUploadedFiles: (params: IParams, timeout?: number) => void;
  }

  /**
   * Feed file item resource object representing a file written to a feed.
   */
  export declare class FeedFile extends ItemResource {
    /**
     * Constructor
     *
     * @param {string} url - url of the resource
     * @param {Object} auth - authentication object
     * @param {string} auth.token - authentication token
     */
    constructor(url: string, auth: IAuth): string

    /**
     * Fetch the file blob associated to this file item from the REST API.
     *
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to a ``Blob`` object
     */
    getFileBlob: (timeout?: number) => void;

    /**
     * Fetch the feed associated to this file item from the REST API.
     *
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to a ``Feed`` object
     */
    getFeed: (timeout?: number) => void;

    /**
     * Fetch the plugin instance that created this file item from the REST API.
     *
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to a ``PluginInstance`` object
     */
    getPluginInstance: (timeout?: number) => void;
  }

  /**
   * Feed file list resource object representing a list of files written to a feed.
   */
  export declare class FeedFileList extends ListResource {
    /**
     * Constructor
     *
     * @param {string} url - url of the resource
     * @param {Object} auth - authentication object
     * @param {string} auth.token - authentication token
     */
    constructor(url: string, auth: IAuth): string

    /**
     * Fetch the feed associated to this file list from the REST API.
     *
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to a ``Feed`` object
     */
    getFeed: (timeout?: number) => void;
  }

  /**
   * Note item resource object representing a feed's note.
   */
  export declare class Note extends ItemResource {
    /**
     * Constructor
     *
     * @param {string} url - url of the resource
     * @param {Object} auth - authentication object
     * @param {string} auth.token - authentication token
     */
    constructor(url: string, auth: IAuth): string

    /**
     * Make a PUT request to modify this note item resource through the REST API.
     *
     * @param {Object} data - request JSON data object
     * @param {string} data.title - title of the comment
     * @param {string} data.content - content of the comment
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to ``this`` object
     */
    put: (data: IData, timeout?: number) => void;
  }

  /**
   * Plugin item resource object representing a plugin.
   */
  export declare class Plugin extends ItemResource {
    /**
     * Constructor
     *
     * @param {string} url - url of the resource
     * @param {Object} auth - authentication object
     * @param {string} auth.token - authentication token
     */
    constructor(url: string, auth: IAuth): string

    /**
     * Fetch a list of plugin parameters associated to this plugin from the REST API.
     *
     * @param {Object} [params=null] - page parameters
     * @param {number} [params.limit] - page limit
     * @param {number} [params.offset] - page offset
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to a ``PluginParameterList`` object
     */
    getPluginParameters: (params: IParams, timeout?: number) => void;

    /**
     * Fetch a list of plugin instances associated to this plugin from the REST API.
     *
     * @param {Object} [params=null] - page parameters
     * @param {number} [params.limit] - page limit
     * @param {number} [params.offset] - page offset
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to a ``PluginInstanceList`` object
     */
    getPluginInstances: (params: IParams, timeout?: number) => void;
  }

  /**
   * Plugin list resource object representing a list of plugins.
   */
  export class PluginList extends ListResource {
    /**
     * Constructor
     *
     * @param {string} url - url of the resource
     * @param {Object} auth - authentication object
     * @param {string} auth.token - authentication token
     */
    constructor(url: string, auth: IAuth);

    /**
     * Fetch a list of feeds from the REST API.
     *
     * @param {Object} [params=null] - page parameters
     * @param {number} [params.limit] - page limit
     * @param {number} [params.offset] - page offset
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to a ``FeedList`` object
     */
    getFeeds: (params: IParams, timeout?: number) => void; // Promise<IFeedList>
  }

  /**
   * Plugin instance item resource object representing a plugin instance.
   */
  export class PluginInstance extends ItemResource {
    /**
     * Constructor
     *
     * @param {string} url - url of the resource
     * @param {Object} auth - authentication object
     * @param {string} auth.token - authentication token
     */
    constructor(url: string, auth: IAuth);

    /**
     * Fetch the feed created by this plugin instance from the REST API
     * (only for fs plugins, 'ds' plugins pass null to the resultant Promise).
     *
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to a ``Feed`` object or ``null``
     */
    getFeed: (timeout?: number) => void; // Promise<IFeed>

    /**
     * Fetch the plugin associated to this plugin instance item from the REST API.
     *
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to a ``Plugin`` object
     */
    getPlugin: (timeout?: number) => void; // Promise<IPlugin>

    /**
     * Fetch the parent plugin instance of this plugin instance from the REST API
     * (only for 'ds' plugins, 'fs' plugins pass null to the resultant Promise).
     *
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to a ``PluginInstance`` object or ``null``
     */
    getPreviousPluginInstance: (timeout?: number) => void; // Promise<IPluginInstance>

    /**
     * Fetch a list of plugin instances that are descendents of this plugin instance from the
     * REST API.
     *
     * @param {Object} [params=null] - page parameters
     * @param {number} [params.limit] - page limit
     * @param {number} [params.offset] - page offset
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to a ``PluginInstanceDescendantList`` object
     */
    getDescendantPluginInstances: (params: IParams, timeout?: number) => void; // Promise<IPluginInstanceDescendantList>

    /**
     * Fetch a list of plugin instance parameters associated to this plugin instance from
     * the REST API.
     *
     * @param {Object} [params=null] - page parameters
     * @param {number} [params.limit] - page limit
     * @param {number} [params.offset] - page offset
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to a ``PluginInstanceParameterList`` object
     */
    getParameters: (params: IParams, timeout?: number) => void; // Promise<IPluginInstanceDescendantList>
  }

  /**
   * Plugin instance list resource object representing a list of plugin instances.
   */
  export class PluginInstanceList extends ListResource {
    /**
     * Constructor
     *
     * @param {string} url - url of the resource
     * @param {Object} auth - authentication object
     * @param {string} auth.token - authentication token
     */
    constructor(url: string, auth: IAuth);

    /**
     * Fetch the plugin associated to this plugin instance list from the REST API.
     *
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to a ``Plugin`` object
     */
    getPlugin: (timeout?: number) => void; // Promise<IPlugin>

    /**
     * Make a POST request to this plugin instance list resource to create a new plugin
     * instance item resource through the REST API.
     *
     * @param {Object} data - request JSON data object which is plugin-specific and it's
     * properties can be determined by calling the ``getPOSTDataParameters`` method on this
     * resource object
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to ``this`` object
     */
    post: (data: object, timeout?: number) => void; // Promise<IThis>
  }

  /**
   * Plugin instance descendant list resource object. This is a list of all plugin
   * instances that have this plugin instance as an ancestor in a pipeline tree.
   */
  export class PluginInstanceDescendantList extends ListResource {
    /**
     * Constructor
     *
     * @param {string} url - url of the resource
     * @param {Object} auth - authentication object
     * @param {string} auth.token - authentication token
     */
    constructor(url: string, auth: IAuth);
  }

  /**
   * Plugin instance parameter item resource object representing a parameter that the
   * plugin instance was run with.
   */
  export class PluginInstanceParameter extends ItemResource {
    /**
     * Constructor
     *
     * @param {string} url - url of the resource
     * @param {Object} auth - authentication object
     * @param {string} auth.token - authentication token
     */
    constructor(url: string, auth: IAuth);

    /**
     * Fetch the plugin instance associated to this parameter item from the REST API.
     *
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to a ``PluginInstance`` object
     */
    getPluginInstance: (timeout?: number) => void; // Promise<IPluginInstance>

    /**
     * Fetch the plugin parameter definition associated to this plugin instance item
     * from the REST API.
     *
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to a ``PluginParameter`` object
     */
    getPluginParameter: (timeout?: number) => void;  // Promise<IPluginParameter>
  }

  /**
   * Plugin instance parameter list resource object representing a list of parameters that
   * the plugin instance was run with.
   */
  export class PluginInstanceParameterList extends ListResource {
      /**
       * Constructor
       *
       * @param {string} url - url of the resource
       * @param {Object} auth - authentication object
       * @param {string} auth.token - authentication token
       */
      constructor(url: string, auth: IAuth);
  }

  /**
   * Plugin parameter item resource object representing a plugin parameter.
   */
  export class PluginParameter extends ItemResource {
    /**
     * Constructor
     *
     * @param {string} url - url of the resource
     * @param {Object} auth - authentication object
     * @param {string} auth.token - authentication token
     */
    constructor(url: string, auth: IAuth);

    /**
     * Fetch the plugin associated to this parameter item from the REST API.
     *
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to a ``Plugin`` object
     */
    getPlugin: (timeout?: number) => void; // Promise<IPlugin>
  }

  /**
   * Plugin parameter list resource object representing a list of plugin parameters.
   */
  export class PluginParameterList extends ListResource {
    /**
     * Constructor
     *
     * @param {string} url - url of the resource
     * @param {Object} auth - authentication object
     * @param {string} auth.token - authentication token
     */
    constructor(url: string, auth: IAuth);
    /**
     * Fetch the plugin associated to this list of parameters from the REST API.
     *
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to a ``Plugin`` object
     */
    getPlugin: (timeout?: number) => void; // Promise<IPlugin>
  }

  /**
   * Http request object.
   */
  export class Request {
    /**
     * Constructor
     *
     * @param {Object} auth - authentication object
     * @param {string} auth.token - authentication token
     * @param {string} contentType - request content type
     * @param {number} [timeout=30000] - request timeout
     */
    constructor(auth: IAuth, contentType: string, timeout?: number);

    /**
     * Perform a GET request.
     *
     * @param {string} url - url of the resource
     * @param {?Object} params - search parameters
     * @return {Object} - JS Promise, resolves to an ``axios reponse`` object
     */
    get: (url: string, params?: object) => Promise<any>; // Promise<IAxiosReponse>

    /**
     * Perform a POST request.
     *
     * @param {string} url - url of the resource
     * @param {Object} data - JSON data object
     * @param {?Object} uploadFileObj - custom file object
     * @param {Object} uploadFileObj.fname - file blob
     * @return {Object} - JS Promise, resolves to an ``axios reponse`` object
     */
    post: (url: string, data: object, uploadFileObj?: object) => void; // Promise<IAxiosReponse>

    /**
     * Perform a PUT request.
     *
     * @param {string} url - url of the resource
     * @param {Object} data - JSON data object
     * @param {?Object} uploadFileObj - custom file object
     * @param {Object} uploadFileObj.fname - file blob
     * @return {Object} - JS Promise, resolves to an ``axios reponse`` object
     */
    put: (url: string, data: object, uploadFileObj?: object) => void; // Promise<IAxiosReponse>

    /**
     * Perform a DELETE request.
     *
     * @param {string} url - url of the resource
     * @return {Object} - JS Promise, resolves to an ``axios reponse`` object
     */
    delete: (url: string) => void; // Promise<IAxiosReponse>

    /**
     * Internal method to make either a POST or PUT request.
     *
     * @param {string} requestMethod - either 'post' or 'put'
     * @param {string} url - url of the resource
     * @param {Object} data - JSON data object
     * @param {?Object} uploadFileObj - custom file object
     * @param {Object} uploadFileObj.fname - file blob
     * @return {Object} - JS Promise, resolves to an ``axios reponse`` object
     */
    _postOrPut: (requestMethod: string, url: string, data: object, uploadFileObj?: IUploadFileObj) => void; // Promise<IAxiosReponse>

    /**
     * Internal method to create a config file for axios.
     *
     * @param {string} url - url of the resource
     * @param {string} method - request verb
     * @return {Object} - axios configuration object
     */
    _getConfig: (url: string, method: string) => void; // Config

    /**
     * Internal method to make an axios request.
     *
     * @param {Object} config - axios configuration object
     * @return {Object} - JS Promise, resolves to an ``axios reponse`` object
     */
    static _callAxios: (config: object) => void; // Promise<IAxiosReponse>

    /**
     * Internal method to handle errors produced by HTTP requests.
     *
     * @param {Object} error - axios error object
     * @throws {RequestException} throw error
     */
    static _handleRequestError(error: object);

    /**
     * Helper method to run an asynchronous task defined by a task generator function.
     *
     * @param {function*()} taskGenerator - generator function
     */
    static runAsyncTask(taskGenerator: function);
  }

  /**
   * API abstract item resource class.
   */
  export class ItemResource extends Resource {
    /**
     * Constructor
     *
     * @param {string} itemUrl - url of the resource
     * @param {Object} auth - authentication object
     * @param {string} auth.token - authentication token
     */
    constructor(itemUrl: string, auth: IAuth);

    /**
     * Fetch this item resource from the REST API.
     *
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to ``this`` object
     */
    get: (timeout?: number) => void; // Promise<IThis>

    /**
     * Get the item's data object (REST API descriptors).
     *
     * @type {?Object}
     */
    get data()

    /**
     * Return true if the item resource object contains any item data.
     *
     * @type {boolean}
     */
    get isEmpty()

    /**
     * Get an array of parameter names that can be used as properties of the data
     * object in PUT requests.
     *
     * @return {?string[]} - array of PUT data property name or null if this list
     * resource's data has not been fetched from the API yet or it doesn't support
     * PUT requests.
     */
    getPUTDataParameters(): ?string[];

    /**
     * Internal method to fetch a related resource from the REST API that is referenced
     * by a link relation within the item object.
     *
     * @param {string} linkRelation
     * @param {Object} ResourceClass
     * @param {Object} [params=null] - page parameters
     * @param {number} [params.limit] - page limit
     * @param {number} [params.offset] - page offset
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to a ``ResourceClass`` object
     * @throws {RequestException} throw error when the link relation is not found
     * @throws {RequestException} throw error if this item resource has not yet been
     * fetched from the REST API
     */
    _getResource: (linkRelation: string, ResourceClass: object, params: IParams, timeout?: number) => void; // Promise<IResourceClass>

    /**
     * Internal helper method to make a PUT request to this item resource through
     * the REST API.
     *
     * @param {Object} data - request JSON data object
     * @param {?Object} uploadFileObj - custom file object
     * @param {Object} uploadFileObj.fname - file blob
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to ``this`` object
     */
    _put: (data: object, uploadFileObj?: IUploadFileObj, timeout?: number) => void; // Promise<IThis>

    /**
     * Internal helper method to make a DELETE request to this item resource through
     * the REST API.
     *
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to ``null``
     */
    _delete: (timeout?: number) => void;
  }

  /**
   * API abstract list resource class.
   */
  export class ListResource extends Resource {
    /**
     * Constructor
     *
     * @param {string} listUrl - url of the resource
     * @param {Object} auth - authentication object
     * @param {string} auth.token - authentication token
     */
    constructor(listUrl: string, auth: IAuth);

    /**
     * Fetch this list resource from the REST API using limit and offset as optional
     * parameters.
     *
     * @param {Object} [params=null] - page parameters
     * @param {number} [params.limit] - page limit
     * @param {number} [params.offset] - page offset
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to ``this`` object
     */
    get: (params: IParams, timeout?: number) => void;

    /**
     * Get an array of search parameter names that can be used as properties of the
     * ``params`` argument to the ``getSearch`` method.
     *
     * @return {?string[]} - array of search parameter names or null if this list
     * resource's data has not been fetched from the API yet.
     */
    getSearchParameters(): ?string[];

    /**
     * Fetch this list resource from the REST API based on search parameters.
     *
     * @param {Object} params - search parameters, the ``getSearchParameters``
     * method can be used to get a list of possible search parameters
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to ``this`` object
     */
    getSearch: (params: object, timeout?: number) => void;

    /**
     * Return true if the list resource object contains any data.
     *
     * @type {boolean}
     */
    get isEmpty();

    /**
     * Return true if the list resource object has a next list page in the
     * paginated REST API.
     *
     * @type {boolean}
     */
    get hasNextPage()

    /**
     * Return true if the list resource object has a previous list page in the
     * paginated REST API.
     *
     * @type {boolean}
     */
    get hasPreviousPage(): boolean;

    /**
     * Get an array of item resource objects corresponding to the items in this
     * list resource object.
     *
     * @return {?Object[]}
     */
    getItems(): ?string[];

    /**
     * Get an array of parameter names that can be used as properties of the data
     * object in POST requests.
     *
     * @return {?string[]} - array of POST data properties or null if this list
     * resource's data has not been fetched from the API yet or it doesn't support
     * POST requests.
     */
    getPOSTDataParameters(): ?string[];

    /**
     * Fetch the next resource page from the paginated REST API.
     *
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to ``this`` object
     */
    getNextPage: (timeout?: number) => void;

    /**
     * Fetch the previous resource page from the paginated REST API.
     *
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to ``this`` object
     */
    getPreviousPage: (timeout?: number) => void;

    /**
     * Internal method to fetch the next or previous page from the paginated REST API.
     *
     * @param {string} linkRelation - either the string 'previous' or 'next'
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to ``this`` object
     */
    _getNextOrPreviousPage: (linkRelation: string, timeout?: number) => void;

    /**
     * Internal method to fetch a related resource from the REST API that is referenced by
     * a link relation within this list resource's collection object.
     *
     * @param {string} linkRelation
     * @param {Object} ResourceClass
     * @param {Object} [params=null] - page parameters
     * @param {number} [params.limit] - page limit
     * @param {number} [params.offset] - page offset
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to a ``ResourceClass`` object
     * @throws {RequestException} throw error when the link relation is not found
     * @throws {RequestException} throw error if this list resource has not yet been fetched from the REST API
     */
    _getResource: (linkRelation: string, ResourceClass: object, params: IParams, timeout?: number) => void; // Promise<IResourceClass>

    /**
     * Internal helper method to make a POST request to this list resource through
     * the REST API.
     *
     * @param {Object} data - request JSON data object
     * @param {?Object} uploadFileObj - custom file object
     * @param {Object} uploadFileObj.fname - file blob
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to ``this`` object
     */
    _post: (data: object, uploadFileObj?: IUploadFileObj, timeout?: number) => void;

  }

  /**
   * API abstract resource class.
   */
  export class Resource {
    /**
     * Constructor
     *
     * @param {string} resourceUrl - url of the resource
     * @param {Object} auth - authentication object
     * @param {string} auth.token - authentication token
     */
    constructor(resourceUrl: string, auth: IAuth);

    /**
     * Make a deep copy clone of this object resource.
     *
     * @return {Object} - clone object
     */
    clone: () => void ;
  }

  /**
   * Feed-specific tag list resource object representing a list of tags that an specific
   * feed is tagged with.
   */
  export class FeedTagList extends ListResource {
      /**
     * Constructor
     *
     * @param {string} url - url of the resource
     * @param {Object} auth - authentication object
     * @param {string} auth.token - authentication token
     */
    constructor(url: string, auth: IAuth);
    /**
     * Fetch the feed associated to this feed-specific list of tags from the REST API.
     *
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to a ``Feed`` object
     */
    getFeed: (timeout?: number) => void;
  }

  /**
   * Feed-specific tagging list resource object representing a list of taggings applied to
   * an specific feed.
   */
  export class FeedTaggingList extends ListResource {
      /**
     * Constructor
     *
     * @param {string} url - url of the resource
     * @param {Object} auth - authentication object
     * @param {string} auth.token - authentication token
     */
    constructor(url: string, auth: IAuth);
    /**
     * Fetch the feed associated to this feed-specific list of taggings from the REST API.
     *
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to a ``Feed`` object
     */
    getFeed: (timeout?: number) => void;
    /**
     * Make a POST request to this feed-specific tagging list resource to create a new
     * tagging item resource through the REST API.
     *
     * @param {Object} data - request JSON data object
     * @param {string} data.tag_id - id of the tag to be used to tag the feed
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to ``this`` object
     */
    post: (data: FeedTaggingListPostData, timeout?: number) => void;
  }

  /**
   * Tag item resource object representing a feed tag.
   */
  export class Tag extends ItemResource {
    /**
    * Constructor
    *
    * @param {string} url - url of the resource
    * @param {Object} auth - authentication object
    * @param {string} auth.token - authentication token
    */
    constructor(url: string, auth: IAuth);

    /**
     * Fetch a list of feeds that are tagged with this tag from the REST API.
     *
     * @param {Object} [params=null] - page parameters
     * @param {number} [params.limit] - page limit
     * @param {number} [params.offset] - page offset
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to a ``TagFeedList`` object
     */
    getTaggedFeeds: (params: IParams, timeout?: number) => void;

    /**
     * Fetch a list of taggings made with this tag from the REST API.
     *
     * @param {Object} [params=null] - page parameters
     * @param {number} [params.limit] - page limit
     * @param {number} [params.offset] - page offset
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to a ``TaggingList`` object
     */
    getTaggings: (params: IParams, timeout?: number) => void;

    /**
     * Make a PUT request to modify this tag item resource through the REST API.
     *
     * @param {Object} data - request JSON data object
     * @param {string} data.name - tag name
     * @param {string} data.color - tag color
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to ``this`` object
     */

    put: (timeout?: number) => void;
    /**
     * Make a DELETE request to delete this tag item resource through the REST API.
     *
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to ``null``
     */
    delete: (timeout?: number) => void;

  }

  /**
   * Tag-specific feed list resource object representing a list of feeds that are tagged
   * with an specific tag.
   */
  export class TagFeedList extends ListResource {
    /**
     * Constructor
     *
     * @param {string} url - url of the resource
     * @param {Object} auth - authentication object
     * @param {string} auth.token - authentication token
     */
    constructor(url: string, auth: IAuth);

    /**
     * Fetch the tag associated to this tag-specific list of feeds from the REST API.
     *
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to a ``Tag`` object
     */
    getTag: (timeout?: timeout) => void;
  }

  /**
   * Tag list resource object representing a list of a feed's tags.
   */
  export class TagList extends ListResource {
    /**
     * Constructor
     *
     * @param {string} url - url of the resource
     * @param {Object} auth - authentication object
     * @param {string} auth.token - authentication token
     */
    constructor(url: string, auth: IAuth);

    /**
     * Fetch a list of feeds from the REST API.
     *
     * @param {Object} [params=null] - page parameters
     * @param {number} [params.limit] - page limit
     * @param {number} [params.offset] - page offset
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to a ``FeedList`` object
     */
    getFeeds: (params: IParams, timeout: number) => void;

    /**
     * Make a POST request to this tag list resource to create a new tag item resource
     * through the REST API.
     *
     * @param {Object} data - request JSON data object
     * @param {string} data.name - tag name
     * @param {string} data.color - tag color
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to ``this`` object
     */
    post: (data: TagListPostData, timeout: number) => void;
  }

  /**
   * Tagging item resource object representing a tagging of an specific feed with an
   * specific tag.
   */
  export class Tagging extends ItemResource {
    /**
     * Constructor
     *
     * @param {string} url - url of the resource
     * @param {Object} auth - authentication object
     * @param {string} auth.token - authentication token
     */
    constructor(url: string, auth: IAuth);
    /**
     * Fetch the tag associated to this tagging from the REST API.
     *
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to a ``Tag`` object
     */
    getTag: (timeout?: number) => void;

    /**
     * Fetch the feed associated to this tagging from the REST API.
     *
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to a ``Feed`` object
     */
    getFeed: (timeout?: number) => void;

    /**
     * Make a DELETE request to delete this tagging item resource through the REST API.
     *
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to ``null``
     */
    delete: (timeout?: number) => void;

  }

  /**
   * Tag-specific tagging list resource object representing a list of taggings made with an
   * specific tag.
   */
  export class TagTaggingList extends ListResource {
    /**
     * Constructor
     *
     * @param {string} url - url of the resource
     * @param {Object} auth - authentication object
     * @param {string} auth.token - authentication token
     */

    constructor(url: string, auth: IAuth);
    /**
     * Fetch the tag associated to this tag-specific list of taggings from the REST API.
     *
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to a ``Tag`` object
     */
    getTag: (timeout?: number) => void;

    /**
     * Make a POST request to this tag-specific tagging list resource to create a new
     * tagging item resource through the REST API.
     *
     * @param {Object} data - request JSON data object
     * @param {string} data.feed_id - id of the feed to be tagged
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to ``this`` object
     */
    post: (data: TagTaggingListPostData, timeout?: number) => void;
  }

  /**
   * Uploaded file item resource object representing a user's uploaded file.
   */
  export class UploadedFile extends ItemResource {
    /**
     * Constructor
     *
     * @param {string} url - url of the resource
     * @param {Object} auth - authentication object
     * @param {string} auth.token - authentication token
     */
    constructor(url: string, auth: IAuth);
    /**
     * Fetch the file blob associated to this file item from the REST API.
     *
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to a ``Blob`` object
     */
    getFileBlob: (timeout?: number) => void;

    /**
     * Make a PUT request to modify this uploaded file item resource through the REST API.
     *
     * @param {Object} data - request JSON data object
     * @param {string} data.upload_path - absolute path including file name where the file
     * will be uploaded on the storage service
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to ``this`` object
     */
    put: (data: UploadedFilePutData, timeout?: number) => void;

    /**
     * Make a DELETE request to delete this uploaded file item resource through the REST API.
     *
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to ``null``
     */
    delete: (timeout?: number) => void;
  }

  /**
   * Uploaded file list resource object representing a list of a user's uploaded files.
   */
  export class UploadedFileList extends ListResource {
    /**
     * Constructor
     *
     * @param {string} url - url of the resource
     * @param {Object} auth - authentication object
     * @param {string} auth.token - authentication token
     */
    constructor(url: string, auth: IAuth);
    /**
     * Make a POST request to this uploaded file list resource to create a new uploaded file
     * item resource through the REST API.
     *
     * @param {Object} data - request JSON data object
     * @param {string} data.upload_path - absolute path including file name where the file
     * will be uploaded on the storage service
     * @param {?Object} uploadFileObj - custom file object
     * @param {Object} uploadFileObj.fname - file blob
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to ``this`` object
     */
    post: ( data: UploadedFileListPostData, uploadFileObj: UploadedFileListPostuploadFileObj, timeout?: number) => void;
  }

  /**
   * User item resource object representing a user of the system.
   */
  export class User extends ItemResource {
      /**
     * Constructor
     *
     * @param {string} url - url of the resource
     * @param {Object} auth - authentication object
     * @param {string} auth.token - authentication token
     */
    constructor(url: string, auth: IAuth);
    /**
     * Make a PUT request to modify this user item resource through the REST API.
     *
     * @param {Object} data - request JSON data object
     * @param {string} data.password - user password
     * @param {string} data.email - user email
     * @param {number} [timeout=30000] - request timeout
     * @return {Object} - JS Promise, resolves to ``this`` object
     */
    put: (data: IUserParams, timeout?: number) => void;
  }

  // Interfaces
  export interface IAuth { token: string; }
  export interface IParams { limit: number; offset: number; }
  export interface IUserParams {password: string; email: string; }
  export interface IData { title: string; content: string; }
  export interface IUploadFileObj { fname: object; }
  export interface TagTaggingListPostData { feed_id: string; }
  export interface FeedTaggingListPostData { tag_id: string; }
  export interface TagListPostData { name: string; color: string; }
  export interface UploadedFileListPostData { upload_path: string; }
  export interface UploadedFileListPostuploadFileObj { fname: object; }
  export interface UploadedFilePutData { upload_path: string; }
}

