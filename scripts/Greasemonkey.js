/**
 * Created by azu.
 * Date: 10/11/28
 * Updated by fuzzykiller (2015/08/28)
 * License: MIT License
 */

/**
 * An object that exposes various information about Greasemonkey and the running User Script.
 */
GM_info = {
  /**
   * An object containing data about the currently running script.
   */
  'script': {
    /**
     * Possibly empty string.
     * @type {String}
     */
    'description': '',

    /**
     * Possibly empty array of strings.
     * @type {String[]}
     */
    'excludes': [],

    /**
     * Possibly empty array of strings.
     * @type {String[]}
     */
    'includes': [],

    /**
     * Possibly empty array of strings. (Bug in 0.9.16.)
     * @type {String[]}
     */
    'matches': [],

    /**
     * @type {String}
     */
    'name': '',

    /**
     * Possibly empty string.
     * @type {String}
     */
    'namespace': '',

    /**
     * An object whose keys are resource names and values are the corresponding URLs. (As of Greasemonkey 1.2.)
     * @type {Object.<String, Number>}
     */
    'resources': {},

    /**
     * @type {String}
     */
    'run-at': '',

    /**
     * @type {Boolean}
     */
    'unwrap': false,

    /**
     * Possibly empty string.
     * @type {String}
     */
    'version': '0.1'
  },

  /**
   * A string, the entire literal Metadata Block (without the delimiters) for the currently running script.
   * @type {String}
   */
  'scriptMetaStr': '',

  /**
   * A boolean; when true Greasemonkey will attempt to auto-update the script.
   * @type {Boolean}
   */
  'scriptWillUpdate': true,

  /**
   * The version of Greasemonkey
   * @type {String}
   */
  'version': '1.2'
}

/**
 * This method deletes an existing name / value pair from storage.
 * See {@link GM_setValue} for details regarding the storage of these values.
 * @param {String} name Property name to delete.
 */
function GM_deleteValue (name) {
}

/**
 * This method retrieves a value that was set with {@link GM_setValue}.
 * See {@link GM_setValue} for details on the storage of these values.
 * @param {String} name The property name to get. See {@link GM_setValue} for details.
 * @param {String|Number|Boolean} [defaultValue] Any value to be returned, when no value has previously been set.
 * @returns {String|Number|Boolean} When this name has been set, value as previously set. Otherwise <code>defaultValue</code>, if provided, or <code>undefined</code>.
 */
function GM_getValue (name, defaultValue) {
}

/**
 * This method retrieves an array of preference names that this script has stored. See {@link GM_setValue} for details on the storage of these values.
 * @return {String[]}
 */
function GM_listValues () {
}

/**
 * This method allows user script authors to persist simple values across page-loads.
 * <code>String</code>, <code>Boolean</code> and <code>Number</code> are currently the only allowed data types.
 * @param {String} name The unique (within this script) name for this value. Should be restricted to valid Javascript identifier characters.
 * @param {String|Number|Boolean} value Any valid value of these types. Any other type may cause undefined behavior, including crashes.
 */
function GM_setValue (name, value) {
}

/**
 * Given a defined @resource, this method returns it as a string.
 * @param {String} resourceName The name provided when the @resource was defined
 * @return {String}
 * @throws {Error} Throws an Error when the named resource does not exist.
 */
function GM_getResourceText (resourceName) {
  let xmlHttpObject = new XMLHttpRequest()
  const port = document.documentURI.match(/localhost:(\d*)/)[1]
  let resources = {
    'assetMap': `http://localhost:${port}/json/assetMap.json`,
    'city_entities': `http://localhost:${port}/json/city_entities.json`,
    'idle_game': `http://localhost:${port}/json/idle_game.json`,
    'gb_data': `http://localhost:${port}/json/gb_data.json`,
    'portraits': `http://localhost:${port}/xml/portraits.xml`,
    'response_1': `http://localhost:${port}/responses/response_1.json`,
    'response_2': `http://localhost:${port}/responses/response_2.json`,
    'response_3': `http://localhost:${port}/responses/response_3.json`,
    'response_4': `http://localhost:${port}/responses/response_4.json`,
    'response_5': `http://localhost:${port}/responses/response_5.json`,
    'response_6': `http://localhost:${port}/responses/response_6.json`,
    'response_7': `http://localhost:${port}/responses/response_7.json`,
    'forgeCSS': `http://localhost:${port}/css/SuperForge.css`
  }
  xmlHttpObject.open('GET', resources[resourceName], false)
  xmlHttpObject.send()
  return xmlHttpObject.responseText
}

/**
 * Given a defined @resource, this method returns it as a URL.
 * @param {String} resourceName The name provided when the @resource was defined
 * @return {String} <code>greasemonkey-script:[script uuid]/[resource name]</code>
 */
function GM_getResourceURL (resourceName) {
  let dataUrl = window.btoa(encodeURIComponent(GM_getResourceText(resourceName)))
  console.log(dataUrl)
  return dataUrl
}

/**
 * This method adds a string of CSS to the document. It creates a new <code>&lt;style&gt;</code> element, adds the given CSS to it, and inserts it into the <code>&lt;head&gt;</code>.
 * @param {String} css A string of CSS.
 */
function GM_addStyle (css) {
}

/**
 * This method provides a very simple logging facility. The output is displayed in the error console, and includes the namespace and name of the script before and the provided string value.
 * @deprecated <b>This feature is deprecated.</b> Script authors are advised to use console logging instead.
 * @param {String} message String (or any object with a <code>.toString()</code> method) to display in the console.
 */
function GM_log (message) {
}

/**
 * This method opens the specified URL in a new tab.
 * @param {String} url The URL to navigate the new tab to.
 * @param {Boolean} [open_in_background] Force tab to/to not open in a background tab. Default (unspecified) behavior honors Firefox configuration.
 */
function GM_openInTab (url, open_in_background) {
}

/**
 * This method allows user scripts to add an item to the User Script Commands menu.
 * @param {String} caption The caption to display on the menu item.
 * @param {Function} commandFunc The function to call when this menu item is selected by the user.
 * @param {String} accessKey A single character that can be used to select command when the menu is open. It should be a letter in the caption.
 */
function GM_registerMenuCommand (caption, commandFunc, accessKey) {
}

/**
 * Sets the current contents of the operating system's clipboard.
 * @param {String} text Any text.
 */
function GM_setClipboard (text) {
}

/**
 * Response object for {@link GM_xmlhttpRequest}. The data available will vary slightly, depending on the type of callback.
 * @typedef {Object} GM_xmlhttpRequest_response
 * @property [Number] readyState The state of the underlying <code>XMLHttpRequest</code>.
 * @property [String] responseHeaders All the response headers as a string, or <code>null</code> if no response has been received.
 * @property [String] responseText Returns a string that contains the response to the request as text, or <code>null</code> if the request was unsuccessful or has not yet been sent.
 * @property [Number] status The HTTP result code (for example, status is 200 for a successful request).
 * @property [String] statusText Returns a string containing the response string returned by the HTTP server. This includes the entire text of the response message ("200 OK", for example).
 * @property [Object] context The same object passed into the original request.
 * @property [String] finalUrl The final URL requested, if Location redirects were followed.
 * @property [Boolean] lengthComputable (Available while in progress) Specifies whether the total size of the transfer is known.
 * @property [Number] loaded (Available while in progress) The number of bytes transferred since the beginning of the operation. This doesn't include headers and other overhead, but only the content itself.
 * @property [Number] total (Available while in progress) The total number of bytes of content that will be transferred during the operation. If the total size is unknown, this value is zero.
 */

/**
 * Callback signature for {@link GM_xmlhttpRequest}.
 * @callback GM_xmlhttpRequest_callback
 * @param {GM_xmlhttpRequest_response} response Response object
 */

/**
 * Object containing optional function callbacks to monitor the upload of data.
 * @typedef {Object} GM_xmlhttpRequest_details_upload
 * @property {GM_xmlhttpRequest_callback} onabort Optional. Will be called when the request is aborted.
 * @property {GM_xmlhttpRequest_callback} onerror Optional. Will be called if an error occurs while processing the request.
 * @property {GM_xmlhttpRequest_callback} onload Optional. Will be called when the request has completed successfully.
 * @property {GM_xmlhttpRequest_callback} onprogress Optional. Will be called when the request progress changes.
 */

/**
 * Request options for {@link GM_xmlhttpRequest}.
 * @typedef {Object} GM_xmlhttpRequest_details
 * @property {Boolean} binary Optional, default false. When true, use the underlying <code>.sendAsBinary()</code> method.
 * @property {Object} context Optional, any object. This object will also be the context property of the {@link GM_xmlhttpRequest_response} Object.
 * @property {String} data Optional. Data to send in the request body. Usually for POST method requests.
 * @property {Object.<String, String>} headers Optional. A set of headers to include in the request.
 * @property {String} method Type of HTTP request to make (E.G. "GET", "POST")
 * @property {GM_xmlhttpRequest_callback} onabort Optional. Will be called when the request is aborted.
 * @property {GM_xmlhttpRequest_callback} onerror Optional. Will be called if an error occurs while processing the request.
 * @property {GM_xmlhttpRequest_callback} onload Optional. Will be called when the request has completed successfully.
 * @property {GM_xmlhttpRequest_callback} onprogress Optional. Will be called when the request progress changes.
 * @property {GM_xmlhttpRequest_callback} onreadystatechange Optional. Will be called repeatedly while the request is in progress.
 * @property {GM_xmlhttpRequest_callback} ontimeout Optional. Will be called if/when the request times out.
 * @property {String} overrideMimeType Optional. A MIME type to specify with the request (E.G. "text/html; charset=ISO-8859-1").
 * @property {String} password Optional. Password to use for authentication purposes.
 * @property {Boolean} synchronous When true, this is a synchronous request. Be careful: The entire Firefox UI will be locked and frozen until the request completes. In this mode, more data will be available in the return value.
 * @property {Number} timeout The number of milliseconds to wait before terminating the call; zero (the default) means wait forever.
 * @property {GM_xmlhttpRequest_details_upload} upload Object containing optional function callbacks to monitor the upload of data.
 * @property {String} url The URL to make the request to. Must be an absolute URL, beginning with the scheme. As of version 0.8.6, the URL may be relative to the current page.
 * @property {String} user Optional. Username to use for authentication purposes.
 */

/**
 * Return object for {@link GM_xmlhttpRequest}.
 * @typedef {Object} GM_xmlhttpRequest_async
 * @property [String] finalUrl The final URL requested, if Location redirects were followed.
 * @property [Number] readyState The state of the underlying <code>XMLHttpRequest</code>.
 * @property [String] responseHeaders All the response headers as a string, or <code>null</code> if no response has been received.
 * @property [String] responseText Returns a string that contains the response to the request as text, or <code>null</code> if the request was unsuccessful or has not yet been sent.
 * @property [Number] status The HTTP result code (for example, status is 200 for a successful request).
 * @property [String] statusText Returns a string containing the response string returned by the HTTP server. This includes the entire text of the response message ("200 OK", for example).
 * @method abort Abort request.
 */

/**
 * This method performs a similar function to the standard XMLHttpRequest object, but allows these requests to cross the same origin policy boundaries.
 * @param {GM_xmlhttpRequest_details} details Request options.
 * @returns {GM_xmlhttpRequest_async} In the normal (asynchronous) case, an object with one method: <code>abort()</code>. In the synchronous case, an object with the <code>abort()</code> method, and properties describing the response.
 */
function GM_xmlhttpRequest (details) {
}

/**
 * This object provides access to the raw JavaScript window scope of the content page. It is most commonly used to access JavaScript variables on the page.
 */
var unsafeWindow = window
