/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "../../api/node_modules/axios/index.js":
/*!*********************************************!*\
  !*** ../../api/node_modules/axios/index.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! ./lib/axios */ "../../api/node_modules/axios/lib/axios.js");

/***/ }),

/***/ "../../api/node_modules/axios/lib/adapters/xhr.js":
/*!********************************************************!*\
  !*** ../../api/node_modules/axios/lib/adapters/xhr.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../../api/node_modules/axios/lib/utils.js");
var settle = __webpack_require__(/*! ./../core/settle */ "../../api/node_modules/axios/lib/core/settle.js");
var cookies = __webpack_require__(/*! ./../helpers/cookies */ "../../api/node_modules/axios/lib/helpers/cookies.js");
var buildURL = __webpack_require__(/*! ./../helpers/buildURL */ "../../api/node_modules/axios/lib/helpers/buildURL.js");
var buildFullPath = __webpack_require__(/*! ../core/buildFullPath */ "../../api/node_modules/axios/lib/core/buildFullPath.js");
var parseHeaders = __webpack_require__(/*! ./../helpers/parseHeaders */ "../../api/node_modules/axios/lib/helpers/parseHeaders.js");
var isURLSameOrigin = __webpack_require__(/*! ./../helpers/isURLSameOrigin */ "../../api/node_modules/axios/lib/helpers/isURLSameOrigin.js");
var createError = __webpack_require__(/*! ../core/createError */ "../../api/node_modules/axios/lib/core/createError.js");
var defaults = __webpack_require__(/*! ../defaults */ "../../api/node_modules/axios/lib/defaults.js");
var Cancel = __webpack_require__(/*! ../cancel/Cancel */ "../../api/node_modules/axios/lib/cancel/Cancel.js");

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;
    var responseType = config.responseType;
    var onCanceled;
    function done() {
      if (config.cancelToken) {
        config.cancelToken.unsubscribe(onCanceled);
      }

      if (config.signal) {
        config.signal.removeEventListener('abort', onCanceled);
      }
    }

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    var fullPath = buildFullPath(config.baseURL, config.url);
    request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    function onloadend() {
      if (!request) {
        return;
      }
      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !responseType || responseType === 'text' ||  responseType === 'json' ?
        request.responseText : request.response;
      var response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(function _resolve(value) {
        resolve(value);
        done();
      }, function _reject(err) {
        reject(err);
        done();
      }, response);

      // Clean up request
      request = null;
    }

    if ('onloadend' in request) {
      // Use onloadend if available
      request.onloadend = onloadend;
    } else {
      // Listen for ready state to emulate onloadend
      request.onreadystatechange = function handleLoad() {
        if (!request || request.readyState !== 4) {
          return;
        }

        // The request errored out and we didn't get a response, this will be
        // handled by onerror instead
        // With one exception: request that using file: protocol, most browsers
        // will return status as 0 even though it's a successful request
        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
          return;
        }
        // readystate handler is calling before onerror or ontimeout handlers,
        // so we should call onloadend on the next 'tick'
        setTimeout(onloadend);
      };
    }

    // Handle browser request cancellation (as opposed to a manual cancellation)
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }

      reject(createError('Request aborted', config, 'ECONNABORTED', request));

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      var timeoutErrorMessage = config.timeout ? 'timeout of ' + config.timeout + 'ms exceeded' : 'timeout exceeded';
      var transitional = config.transitional || defaults.transitional;
      if (config.timeoutErrorMessage) {
        timeoutErrorMessage = config.timeoutErrorMessage;
      }
      reject(createError(
        timeoutErrorMessage,
        config,
        transitional.clarifyTimeoutError ? 'ETIMEDOUT' : 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
        cookies.read(config.xsrfCookieName) :
        undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (!utils.isUndefined(config.withCredentials)) {
      request.withCredentials = !!config.withCredentials;
    }

    // Add responseType to request if needed
    if (responseType && responseType !== 'json') {
      request.responseType = config.responseType;
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken || config.signal) {
      // Handle cancellation
      // eslint-disable-next-line func-names
      onCanceled = function(cancel) {
        if (!request) {
          return;
        }
        reject(!cancel || (cancel && cancel.type) ? new Cancel('canceled') : cancel);
        request.abort();
        request = null;
      };

      config.cancelToken && config.cancelToken.subscribe(onCanceled);
      if (config.signal) {
        config.signal.aborted ? onCanceled() : config.signal.addEventListener('abort', onCanceled);
      }
    }

    if (!requestData) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};


/***/ }),

/***/ "../../api/node_modules/axios/lib/axios.js":
/*!*************************************************!*\
  !*** ../../api/node_modules/axios/lib/axios.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./utils */ "../../api/node_modules/axios/lib/utils.js");
var bind = __webpack_require__(/*! ./helpers/bind */ "../../api/node_modules/axios/lib/helpers/bind.js");
var Axios = __webpack_require__(/*! ./core/Axios */ "../../api/node_modules/axios/lib/core/Axios.js");
var mergeConfig = __webpack_require__(/*! ./core/mergeConfig */ "../../api/node_modules/axios/lib/core/mergeConfig.js");
var defaults = __webpack_require__(/*! ./defaults */ "../../api/node_modules/axios/lib/defaults.js");

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  // Factory for creating new instances
  instance.create = function create(instanceConfig) {
    return createInstance(mergeConfig(defaultConfig, instanceConfig));
  };

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Expose Cancel & CancelToken
axios.Cancel = __webpack_require__(/*! ./cancel/Cancel */ "../../api/node_modules/axios/lib/cancel/Cancel.js");
axios.CancelToken = __webpack_require__(/*! ./cancel/CancelToken */ "../../api/node_modules/axios/lib/cancel/CancelToken.js");
axios.isCancel = __webpack_require__(/*! ./cancel/isCancel */ "../../api/node_modules/axios/lib/cancel/isCancel.js");
axios.VERSION = (__webpack_require__(/*! ./env/data */ "../../api/node_modules/axios/lib/env/data.js").version);

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = __webpack_require__(/*! ./helpers/spread */ "../../api/node_modules/axios/lib/helpers/spread.js");

// Expose isAxiosError
axios.isAxiosError = __webpack_require__(/*! ./helpers/isAxiosError */ "../../api/node_modules/axios/lib/helpers/isAxiosError.js");

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports["default"] = axios;


/***/ }),

/***/ "../../api/node_modules/axios/lib/cancel/Cancel.js":
/*!*********************************************************!*\
  !*** ../../api/node_modules/axios/lib/cancel/Cancel.js ***!
  \*********************************************************/
/***/ ((module) => {

"use strict";


/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;


/***/ }),

/***/ "../../api/node_modules/axios/lib/cancel/CancelToken.js":
/*!**************************************************************!*\
  !*** ../../api/node_modules/axios/lib/cancel/CancelToken.js ***!
  \**************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Cancel = __webpack_require__(/*! ./Cancel */ "../../api/node_modules/axios/lib/cancel/Cancel.js");

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;

  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;

  // eslint-disable-next-line func-names
  this.promise.then(function(cancel) {
    if (!token._listeners) return;

    var i;
    var l = token._listeners.length;

    for (i = 0; i < l; i++) {
      token._listeners[i](cancel);
    }
    token._listeners = null;
  });

  // eslint-disable-next-line func-names
  this.promise.then = function(onfulfilled) {
    var _resolve;
    // eslint-disable-next-line func-names
    var promise = new Promise(function(resolve) {
      token.subscribe(resolve);
      _resolve = resolve;
    }).then(onfulfilled);

    promise.cancel = function reject() {
      token.unsubscribe(_resolve);
    };

    return promise;
  };

  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Subscribe to the cancel signal
 */

CancelToken.prototype.subscribe = function subscribe(listener) {
  if (this.reason) {
    listener(this.reason);
    return;
  }

  if (this._listeners) {
    this._listeners.push(listener);
  } else {
    this._listeners = [listener];
  }
};

/**
 * Unsubscribe from the cancel signal
 */

CancelToken.prototype.unsubscribe = function unsubscribe(listener) {
  if (!this._listeners) {
    return;
  }
  var index = this._listeners.indexOf(listener);
  if (index !== -1) {
    this._listeners.splice(index, 1);
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;


/***/ }),

/***/ "../../api/node_modules/axios/lib/cancel/isCancel.js":
/*!***********************************************************!*\
  !*** ../../api/node_modules/axios/lib/cancel/isCancel.js ***!
  \***********************************************************/
/***/ ((module) => {

"use strict";


module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};


/***/ }),

/***/ "../../api/node_modules/axios/lib/core/Axios.js":
/*!******************************************************!*\
  !*** ../../api/node_modules/axios/lib/core/Axios.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../../api/node_modules/axios/lib/utils.js");
var buildURL = __webpack_require__(/*! ../helpers/buildURL */ "../../api/node_modules/axios/lib/helpers/buildURL.js");
var InterceptorManager = __webpack_require__(/*! ./InterceptorManager */ "../../api/node_modules/axios/lib/core/InterceptorManager.js");
var dispatchRequest = __webpack_require__(/*! ./dispatchRequest */ "../../api/node_modules/axios/lib/core/dispatchRequest.js");
var mergeConfig = __webpack_require__(/*! ./mergeConfig */ "../../api/node_modules/axios/lib/core/mergeConfig.js");
var validator = __webpack_require__(/*! ../helpers/validator */ "../../api/node_modules/axios/lib/helpers/validator.js");

var validators = validator.validators;
/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof config === 'string') {
    config = arguments[1] || {};
    config.url = arguments[0];
  } else {
    config = config || {};
  }

  config = mergeConfig(this.defaults, config);

  // Set config.method
  if (config.method) {
    config.method = config.method.toLowerCase();
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase();
  } else {
    config.method = 'get';
  }

  var transitional = config.transitional;

  if (transitional !== undefined) {
    validator.assertOptions(transitional, {
      silentJSONParsing: validators.transitional(validators.boolean),
      forcedJSONParsing: validators.transitional(validators.boolean),
      clarifyTimeoutError: validators.transitional(validators.boolean)
    }, false);
  }

  // filter out skipped interceptors
  var requestInterceptorChain = [];
  var synchronousRequestInterceptors = true;
  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
      return;
    }

    synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

    requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  var responseInterceptorChain = [];
  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
  });

  var promise;

  if (!synchronousRequestInterceptors) {
    var chain = [dispatchRequest, undefined];

    Array.prototype.unshift.apply(chain, requestInterceptorChain);
    chain = chain.concat(responseInterceptorChain);

    promise = Promise.resolve(config);
    while (chain.length) {
      promise = promise.then(chain.shift(), chain.shift());
    }

    return promise;
  }


  var newConfig = config;
  while (requestInterceptorChain.length) {
    var onFulfilled = requestInterceptorChain.shift();
    var onRejected = requestInterceptorChain.shift();
    try {
      newConfig = onFulfilled(newConfig);
    } catch (error) {
      onRejected(error);
      break;
    }
  }

  try {
    promise = dispatchRequest(newConfig);
  } catch (error) {
    return Promise.reject(error);
  }

  while (responseInterceptorChain.length) {
    promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
  }

  return promise;
};

Axios.prototype.getUri = function getUri(config) {
  config = mergeConfig(this.defaults, config);
  return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: (config || {}).data
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;


/***/ }),

/***/ "../../api/node_modules/axios/lib/core/InterceptorManager.js":
/*!*******************************************************************!*\
  !*** ../../api/node_modules/axios/lib/core/InterceptorManager.js ***!
  \*******************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../../api/node_modules/axios/lib/utils.js");

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected, options) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected,
    synchronous: options ? options.synchronous : false,
    runWhen: options ? options.runWhen : null
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;


/***/ }),

/***/ "../../api/node_modules/axios/lib/core/buildFullPath.js":
/*!**************************************************************!*\
  !*** ../../api/node_modules/axios/lib/core/buildFullPath.js ***!
  \**************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var isAbsoluteURL = __webpack_require__(/*! ../helpers/isAbsoluteURL */ "../../api/node_modules/axios/lib/helpers/isAbsoluteURL.js");
var combineURLs = __webpack_require__(/*! ../helpers/combineURLs */ "../../api/node_modules/axios/lib/helpers/combineURLs.js");

/**
 * Creates a new URL by combining the baseURL with the requestedURL,
 * only when the requestedURL is not already an absolute URL.
 * If the requestURL is absolute, this function returns the requestedURL untouched.
 *
 * @param {string} baseURL The base URL
 * @param {string} requestedURL Absolute or relative URL to combine
 * @returns {string} The combined full path
 */
module.exports = function buildFullPath(baseURL, requestedURL) {
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
};


/***/ }),

/***/ "../../api/node_modules/axios/lib/core/createError.js":
/*!************************************************************!*\
  !*** ../../api/node_modules/axios/lib/core/createError.js ***!
  \************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var enhanceError = __webpack_require__(/*! ./enhanceError */ "../../api/node_modules/axios/lib/core/enhanceError.js");

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};


/***/ }),

/***/ "../../api/node_modules/axios/lib/core/dispatchRequest.js":
/*!****************************************************************!*\
  !*** ../../api/node_modules/axios/lib/core/dispatchRequest.js ***!
  \****************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../../api/node_modules/axios/lib/utils.js");
var transformData = __webpack_require__(/*! ./transformData */ "../../api/node_modules/axios/lib/core/transformData.js");
var isCancel = __webpack_require__(/*! ../cancel/isCancel */ "../../api/node_modules/axios/lib/cancel/isCancel.js");
var defaults = __webpack_require__(/*! ../defaults */ "../../api/node_modules/axios/lib/defaults.js");
var Cancel = __webpack_require__(/*! ../cancel/Cancel */ "../../api/node_modules/axios/lib/cancel/Cancel.js");

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }

  if (config.signal && config.signal.aborted) {
    throw new Cancel('canceled');
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData.call(
    config,
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData.call(
      config,
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData.call(
          config,
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};


/***/ }),

/***/ "../../api/node_modules/axios/lib/core/enhanceError.js":
/*!*************************************************************!*\
  !*** ../../api/node_modules/axios/lib/core/enhanceError.js ***!
  \*************************************************************/
/***/ ((module) => {

"use strict";


/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
module.exports = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }

  error.request = request;
  error.response = response;
  error.isAxiosError = true;

  error.toJSON = function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: this.config,
      code: this.code,
      status: this.response && this.response.status ? this.response.status : null
    };
  };
  return error;
};


/***/ }),

/***/ "../../api/node_modules/axios/lib/core/mergeConfig.js":
/*!************************************************************!*\
  !*** ../../api/node_modules/axios/lib/core/mergeConfig.js ***!
  \************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "../../api/node_modules/axios/lib/utils.js");

/**
 * Config-specific merge-function which creates a new config-object
 * by merging two configuration objects together.
 *
 * @param {Object} config1
 * @param {Object} config2
 * @returns {Object} New object resulting from merging config2 to config1
 */
module.exports = function mergeConfig(config1, config2) {
  // eslint-disable-next-line no-param-reassign
  config2 = config2 || {};
  var config = {};

  function getMergedValue(target, source) {
    if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
      return utils.merge(target, source);
    } else if (utils.isPlainObject(source)) {
      return utils.merge({}, source);
    } else if (utils.isArray(source)) {
      return source.slice();
    }
    return source;
  }

  // eslint-disable-next-line consistent-return
  function mergeDeepProperties(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(config1[prop], config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function valueFromConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(undefined, config2[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function defaultToConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(undefined, config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function mergeDirectKeys(prop) {
    if (prop in config2) {
      return getMergedValue(config1[prop], config2[prop]);
    } else if (prop in config1) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  var mergeMap = {
    'url': valueFromConfig2,
    'method': valueFromConfig2,
    'data': valueFromConfig2,
    'baseURL': defaultToConfig2,
    'transformRequest': defaultToConfig2,
    'transformResponse': defaultToConfig2,
    'paramsSerializer': defaultToConfig2,
    'timeout': defaultToConfig2,
    'timeoutMessage': defaultToConfig2,
    'withCredentials': defaultToConfig2,
    'adapter': defaultToConfig2,
    'responseType': defaultToConfig2,
    'xsrfCookieName': defaultToConfig2,
    'xsrfHeaderName': defaultToConfig2,
    'onUploadProgress': defaultToConfig2,
    'onDownloadProgress': defaultToConfig2,
    'decompress': defaultToConfig2,
    'maxContentLength': defaultToConfig2,
    'maxBodyLength': defaultToConfig2,
    'transport': defaultToConfig2,
    'httpAgent': defaultToConfig2,
    'httpsAgent': defaultToConfig2,
    'cancelToken': defaultToConfig2,
    'socketPath': defaultToConfig2,
    'responseEncoding': defaultToConfig2,
    'validateStatus': mergeDirectKeys
  };

  utils.forEach(Object.keys(config1).concat(Object.keys(config2)), function computeConfigValue(prop) {
    var merge = mergeMap[prop] || mergeDeepProperties;
    var configValue = merge(prop);
    (utils.isUndefined(configValue) && merge !== mergeDirectKeys) || (config[prop] = configValue);
  });

  return config;
};


/***/ }),

/***/ "../../api/node_modules/axios/lib/core/settle.js":
/*!*******************************************************!*\
  !*** ../../api/node_modules/axios/lib/core/settle.js ***!
  \*******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var createError = __webpack_require__(/*! ./createError */ "../../api/node_modules/axios/lib/core/createError.js");

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};


/***/ }),

/***/ "../../api/node_modules/axios/lib/core/transformData.js":
/*!**************************************************************!*\
  !*** ../../api/node_modules/axios/lib/core/transformData.js ***!
  \**************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../../api/node_modules/axios/lib/utils.js");
var defaults = __webpack_require__(/*! ./../defaults */ "../../api/node_modules/axios/lib/defaults.js");

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  var context = this || defaults;
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn.call(context, data, headers);
  });

  return data;
};


/***/ }),

/***/ "../../api/node_modules/axios/lib/defaults.js":
/*!****************************************************!*\
  !*** ../../api/node_modules/axios/lib/defaults.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./utils */ "../../api/node_modules/axios/lib/utils.js");
var normalizeHeaderName = __webpack_require__(/*! ./helpers/normalizeHeaderName */ "../../api/node_modules/axios/lib/helpers/normalizeHeaderName.js");
var enhanceError = __webpack_require__(/*! ./core/enhanceError */ "../../api/node_modules/axios/lib/core/enhanceError.js");

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = __webpack_require__(/*! ./adapters/xhr */ "../../api/node_modules/axios/lib/adapters/xhr.js");
  } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
    // For node use HTTP adapter
    adapter = __webpack_require__(/*! ./adapters/http */ "../../api/node_modules/axios/lib/adapters/xhr.js");
  }
  return adapter;
}

function stringifySafely(rawValue, parser, encoder) {
  if (utils.isString(rawValue)) {
    try {
      (parser || JSON.parse)(rawValue);
      return utils.trim(rawValue);
    } catch (e) {
      if (e.name !== 'SyntaxError') {
        throw e;
      }
    }
  }

  return (encoder || JSON.stringify)(rawValue);
}

var defaults = {

  transitional: {
    silentJSONParsing: true,
    forcedJSONParsing: true,
    clarifyTimeoutError: false
  },

  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Accept');
    normalizeHeaderName(headers, 'Content-Type');

    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data) || (headers && headers['Content-Type'] === 'application/json')) {
      setContentTypeIfUnset(headers, 'application/json');
      return stringifySafely(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    var transitional = this.transitional || defaults.transitional;
    var silentJSONParsing = transitional && transitional.silentJSONParsing;
    var forcedJSONParsing = transitional && transitional.forcedJSONParsing;
    var strictJSONParsing = !silentJSONParsing && this.responseType === 'json';

    if (strictJSONParsing || (forcedJSONParsing && utils.isString(data) && data.length)) {
      try {
        return JSON.parse(data);
      } catch (e) {
        if (strictJSONParsing) {
          if (e.name === 'SyntaxError') {
            throw enhanceError(e, this, 'E_JSON_PARSE');
          }
          throw e;
        }
      }
    }

    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,
  maxBodyLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  },

  headers: {
    common: {
      'Accept': 'application/json, text/plain, */*'
    }
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;


/***/ }),

/***/ "../../api/node_modules/axios/lib/env/data.js":
/*!****************************************************!*\
  !*** ../../api/node_modules/axios/lib/env/data.js ***!
  \****************************************************/
/***/ ((module) => {

module.exports = {
  "version": "0.24.0"
};

/***/ }),

/***/ "../../api/node_modules/axios/lib/helpers/bind.js":
/*!********************************************************!*\
  !*** ../../api/node_modules/axios/lib/helpers/bind.js ***!
  \********************************************************/
/***/ ((module) => {

"use strict";


module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};


/***/ }),

/***/ "../../api/node_modules/axios/lib/helpers/buildURL.js":
/*!************************************************************!*\
  !*** ../../api/node_modules/axios/lib/helpers/buildURL.js ***!
  \************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../../api/node_modules/axios/lib/utils.js");

function encode(val) {
  return encodeURIComponent(val).
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    var hashmarkIndex = url.indexOf('#');
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }

    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};


/***/ }),

/***/ "../../api/node_modules/axios/lib/helpers/combineURLs.js":
/*!***************************************************************!*\
  !*** ../../api/node_modules/axios/lib/helpers/combineURLs.js ***!
  \***************************************************************/
/***/ ((module) => {

"use strict";


/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};


/***/ }),

/***/ "../../api/node_modules/axios/lib/helpers/cookies.js":
/*!***********************************************************!*\
  !*** ../../api/node_modules/axios/lib/helpers/cookies.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../../api/node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
    (function standardBrowserEnv() {
      return {
        write: function write(name, value, expires, path, domain, secure) {
          var cookie = [];
          cookie.push(name + '=' + encodeURIComponent(value));

          if (utils.isNumber(expires)) {
            cookie.push('expires=' + new Date(expires).toGMTString());
          }

          if (utils.isString(path)) {
            cookie.push('path=' + path);
          }

          if (utils.isString(domain)) {
            cookie.push('domain=' + domain);
          }

          if (secure === true) {
            cookie.push('secure');
          }

          document.cookie = cookie.join('; ');
        },

        read: function read(name) {
          var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
          return (match ? decodeURIComponent(match[3]) : null);
        },

        remove: function remove(name) {
          this.write(name, '', Date.now() - 86400000);
        }
      };
    })() :

  // Non standard browser env (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return {
        write: function write() {},
        read: function read() { return null; },
        remove: function remove() {}
      };
    })()
);


/***/ }),

/***/ "../../api/node_modules/axios/lib/helpers/isAbsoluteURL.js":
/*!*****************************************************************!*\
  !*** ../../api/node_modules/axios/lib/helpers/isAbsoluteURL.js ***!
  \*****************************************************************/
/***/ ((module) => {

"use strict";


/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
};


/***/ }),

/***/ "../../api/node_modules/axios/lib/helpers/isAxiosError.js":
/*!****************************************************************!*\
  !*** ../../api/node_modules/axios/lib/helpers/isAxiosError.js ***!
  \****************************************************************/
/***/ ((module) => {

"use strict";


/**
 * Determines whether the payload is an error thrown by Axios
 *
 * @param {*} payload The value to test
 * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
 */
module.exports = function isAxiosError(payload) {
  return (typeof payload === 'object') && (payload.isAxiosError === true);
};


/***/ }),

/***/ "../../api/node_modules/axios/lib/helpers/isURLSameOrigin.js":
/*!*******************************************************************!*\
  !*** ../../api/node_modules/axios/lib/helpers/isURLSameOrigin.js ***!
  \*******************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../../api/node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
    (function standardBrowserEnv() {
      var msie = /(msie|trident)/i.test(navigator.userAgent);
      var urlParsingNode = document.createElement('a');
      var originURL;

      /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
      function resolveURL(url) {
        var href = url;

        if (msie) {
        // IE needs attribute set twice to normalize properties
          urlParsingNode.setAttribute('href', href);
          href = urlParsingNode.href;
        }

        urlParsingNode.setAttribute('href', href);

        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
        return {
          href: urlParsingNode.href,
          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
          host: urlParsingNode.host,
          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
          hostname: urlParsingNode.hostname,
          port: urlParsingNode.port,
          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
            urlParsingNode.pathname :
            '/' + urlParsingNode.pathname
        };
      }

      originURL = resolveURL(window.location.href);

      /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
      return function isURLSameOrigin(requestURL) {
        var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
        return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
      };
    })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return function isURLSameOrigin() {
        return true;
      };
    })()
);


/***/ }),

/***/ "../../api/node_modules/axios/lib/helpers/normalizeHeaderName.js":
/*!***********************************************************************!*\
  !*** ../../api/node_modules/axios/lib/helpers/normalizeHeaderName.js ***!
  \***********************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "../../api/node_modules/axios/lib/utils.js");

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};


/***/ }),

/***/ "../../api/node_modules/axios/lib/helpers/parseHeaders.js":
/*!****************************************************************!*\
  !*** ../../api/node_modules/axios/lib/helpers/parseHeaders.js ***!
  \****************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../../api/node_modules/axios/lib/utils.js");

// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });

  return parsed;
};


/***/ }),

/***/ "../../api/node_modules/axios/lib/helpers/spread.js":
/*!**********************************************************!*\
  !*** ../../api/node_modules/axios/lib/helpers/spread.js ***!
  \**********************************************************/
/***/ ((module) => {

"use strict";


/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};


/***/ }),

/***/ "../../api/node_modules/axios/lib/helpers/validator.js":
/*!*************************************************************!*\
  !*** ../../api/node_modules/axios/lib/helpers/validator.js ***!
  \*************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var VERSION = (__webpack_require__(/*! ../env/data */ "../../api/node_modules/axios/lib/env/data.js").version);

var validators = {};

// eslint-disable-next-line func-names
['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach(function(type, i) {
  validators[type] = function validator(thing) {
    return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
  };
});

var deprecatedWarnings = {};

/**
 * Transitional option validator
 * @param {function|boolean?} validator - set to false if the transitional option has been removed
 * @param {string?} version - deprecated version / removed since version
 * @param {string?} message - some message with additional info
 * @returns {function}
 */
validators.transitional = function transitional(validator, version, message) {
  function formatMessage(opt, desc) {
    return '[Axios v' + VERSION + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
  }

  // eslint-disable-next-line func-names
  return function(value, opt, opts) {
    if (validator === false) {
      throw new Error(formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')));
    }

    if (version && !deprecatedWarnings[opt]) {
      deprecatedWarnings[opt] = true;
      // eslint-disable-next-line no-console
      console.warn(
        formatMessage(
          opt,
          ' has been deprecated since v' + version + ' and will be removed in the near future'
        )
      );
    }

    return validator ? validator(value, opt, opts) : true;
  };
};

/**
 * Assert object's properties type
 * @param {object} options
 * @param {object} schema
 * @param {boolean?} allowUnknown
 */

function assertOptions(options, schema, allowUnknown) {
  if (typeof options !== 'object') {
    throw new TypeError('options must be an object');
  }
  var keys = Object.keys(options);
  var i = keys.length;
  while (i-- > 0) {
    var opt = keys[i];
    var validator = schema[opt];
    if (validator) {
      var value = options[opt];
      var result = value === undefined || validator(value, opt, options);
      if (result !== true) {
        throw new TypeError('option ' + opt + ' must be ' + result);
      }
      continue;
    }
    if (allowUnknown !== true) {
      throw Error('Unknown option ' + opt);
    }
  }
}

module.exports = {
  assertOptions: assertOptions,
  validators: validators
};


/***/ }),

/***/ "../../api/node_modules/axios/lib/utils.js":
/*!*************************************************!*\
  !*** ../../api/node_modules/axios/lib/utils.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var bind = __webpack_require__(/*! ./helpers/bind */ "../../api/node_modules/axios/lib/helpers/bind.js");

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return toString.call(val) === '[object Array]';
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is a Buffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Buffer, otherwise false
 */
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
    && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return (typeof FormData !== 'undefined') && (val instanceof FormData);
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a plain Object
 *
 * @param {Object} val The value to test
 * @return {boolean} True if value is a plain Object, otherwise false
 */
function isPlainObject(val) {
  if (toString.call(val) !== '[object Object]') {
    return false;
  }

  var prototype = Object.getPrototypeOf(val);
  return prototype === null || prototype === Object.prototype;
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 * nativescript
 *  navigator.product -> 'NativeScript' or 'NS'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                           navigator.product === 'NativeScript' ||
                                           navigator.product === 'NS')) {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (isPlainObject(result[key]) && isPlainObject(val)) {
      result[key] = merge(result[key], val);
    } else if (isPlainObject(val)) {
      result[key] = merge({}, val);
    } else if (isArray(val)) {
      result[key] = val.slice();
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

/**
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 *
 * @param {string} content with BOM
 * @return {string} content value without BOM
 */
function stripBOM(content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isPlainObject: isPlainObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim,
  stripBOM: stripBOM
};


/***/ }),

/***/ "../../api/node_modules/utf8-buffer-size/main.js":
/*!*******************************************************!*\
  !*** ../../api/node_modules/utf8-buffer-size/main.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ utf8BufferSize)
/* harmony export */ });
/*
 * Copyright (c) 2018 Rafael da Silva Rocha.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

/**
 * @fileoverview The utf8-buffer-size API.
 * @see https://github.com/rochars/utf8-buffer-size
 */

/** @module utf8BufferSize */

/**
 * Returns how many bytes are needed to serialize a UTF-8 string.
 * @see https://encoding.spec.whatwg.org/#utf-8-encoder
 * @param {string} str The string to pack.
 * @return {number} The number of bytes needed to serialize the string.
 */
function utf8BufferSize(str) {
  /** @type {number} */
  let bytes = 0;
  for (let i = 0, len = str.length; i < len; i++) {
    /** @type {number} */
    let codePoint = str.codePointAt(i);
    if (codePoint < 128) {
      bytes++;
    } else {
      if (codePoint <= 2047) {
        bytes++;
      } else if(codePoint <= 65535) {
        bytes+=2;
      } else if(codePoint <= 1114111) {
        i++;
        bytes+=3;
      }
      bytes++;
    }
  }
  return bytes;
}


/***/ }),

/***/ "../.hathora/node_modules/@hathora/client-sdk/node_modules/isomorphic-ws/browser.js":
/*!******************************************************************************************!*\
  !*** ../.hathora/node_modules/@hathora/client-sdk/node_modules/isomorphic-ws/browser.js ***!
  \******************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// https://github.com/maxogden/websocket-stream/blob/48dc3ddf943e5ada668c31ccd94e9186f02fafbd/ws-fallback.js

var ws = null

if (typeof WebSocket !== 'undefined') {
  ws = WebSocket
} else if (typeof MozWebSocket !== 'undefined') {
  ws = MozWebSocket
} else if (typeof __webpack_require__.g !== 'undefined') {
  ws = __webpack_require__.g.WebSocket || __webpack_require__.g.MozWebSocket
} else if (typeof window !== 'undefined') {
  ws = window.WebSocket || window.MozWebSocket
} else if (typeof self !== 'undefined') {
  ws = self.WebSocket || self.MozWebSocket
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ws);


/***/ }),

/***/ "../.hathora/node_modules/axios/index.js":
/*!***********************************************!*\
  !*** ../.hathora/node_modules/axios/index.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! ./lib/axios */ "../.hathora/node_modules/axios/lib/axios.js");

/***/ }),

/***/ "../.hathora/node_modules/axios/lib/adapters/xhr.js":
/*!**********************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/adapters/xhr.js ***!
  \**********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../.hathora/node_modules/axios/lib/utils.js");
var settle = __webpack_require__(/*! ./../core/settle */ "../.hathora/node_modules/axios/lib/core/settle.js");
var cookies = __webpack_require__(/*! ./../helpers/cookies */ "../.hathora/node_modules/axios/lib/helpers/cookies.js");
var buildURL = __webpack_require__(/*! ./../helpers/buildURL */ "../.hathora/node_modules/axios/lib/helpers/buildURL.js");
var buildFullPath = __webpack_require__(/*! ../core/buildFullPath */ "../.hathora/node_modules/axios/lib/core/buildFullPath.js");
var parseHeaders = __webpack_require__(/*! ./../helpers/parseHeaders */ "../.hathora/node_modules/axios/lib/helpers/parseHeaders.js");
var isURLSameOrigin = __webpack_require__(/*! ./../helpers/isURLSameOrigin */ "../.hathora/node_modules/axios/lib/helpers/isURLSameOrigin.js");
var transitionalDefaults = __webpack_require__(/*! ../defaults/transitional */ "../.hathora/node_modules/axios/lib/defaults/transitional.js");
var AxiosError = __webpack_require__(/*! ../core/AxiosError */ "../.hathora/node_modules/axios/lib/core/AxiosError.js");
var CanceledError = __webpack_require__(/*! ../cancel/CanceledError */ "../.hathora/node_modules/axios/lib/cancel/CanceledError.js");
var parseProtocol = __webpack_require__(/*! ../helpers/parseProtocol */ "../.hathora/node_modules/axios/lib/helpers/parseProtocol.js");

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;
    var responseType = config.responseType;
    var onCanceled;
    function done() {
      if (config.cancelToken) {
        config.cancelToken.unsubscribe(onCanceled);
      }

      if (config.signal) {
        config.signal.removeEventListener('abort', onCanceled);
      }
    }

    if (utils.isFormData(requestData) && utils.isStandardBrowserEnv()) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    var fullPath = buildFullPath(config.baseURL, config.url);

    request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    function onloadend() {
      if (!request) {
        return;
      }
      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !responseType || responseType === 'text' ||  responseType === 'json' ?
        request.responseText : request.response;
      var response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(function _resolve(value) {
        resolve(value);
        done();
      }, function _reject(err) {
        reject(err);
        done();
      }, response);

      // Clean up request
      request = null;
    }

    if ('onloadend' in request) {
      // Use onloadend if available
      request.onloadend = onloadend;
    } else {
      // Listen for ready state to emulate onloadend
      request.onreadystatechange = function handleLoad() {
        if (!request || request.readyState !== 4) {
          return;
        }

        // The request errored out and we didn't get a response, this will be
        // handled by onerror instead
        // With one exception: request that using file: protocol, most browsers
        // will return status as 0 even though it's a successful request
        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
          return;
        }
        // readystate handler is calling before onerror or ontimeout handlers,
        // so we should call onloadend on the next 'tick'
        setTimeout(onloadend);
      };
    }

    // Handle browser request cancellation (as opposed to a manual cancellation)
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }

      reject(new AxiosError('Request aborted', AxiosError.ECONNABORTED, config, request));

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(new AxiosError('Network Error', AxiosError.ERR_NETWORK, config, request, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      var timeoutErrorMessage = config.timeout ? 'timeout of ' + config.timeout + 'ms exceeded' : 'timeout exceeded';
      var transitional = config.transitional || transitionalDefaults;
      if (config.timeoutErrorMessage) {
        timeoutErrorMessage = config.timeoutErrorMessage;
      }
      reject(new AxiosError(
        timeoutErrorMessage,
        transitional.clarifyTimeoutError ? AxiosError.ETIMEDOUT : AxiosError.ECONNABORTED,
        config,
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
        cookies.read(config.xsrfCookieName) :
        undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (!utils.isUndefined(config.withCredentials)) {
      request.withCredentials = !!config.withCredentials;
    }

    // Add responseType to request if needed
    if (responseType && responseType !== 'json') {
      request.responseType = config.responseType;
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken || config.signal) {
      // Handle cancellation
      // eslint-disable-next-line func-names
      onCanceled = function(cancel) {
        if (!request) {
          return;
        }
        reject(!cancel || (cancel && cancel.type) ? new CanceledError() : cancel);
        request.abort();
        request = null;
      };

      config.cancelToken && config.cancelToken.subscribe(onCanceled);
      if (config.signal) {
        config.signal.aborted ? onCanceled() : config.signal.addEventListener('abort', onCanceled);
      }
    }

    if (!requestData) {
      requestData = null;
    }

    var protocol = parseProtocol(fullPath);

    if (protocol && [ 'http', 'https', 'file' ].indexOf(protocol) === -1) {
      reject(new AxiosError('Unsupported protocol ' + protocol + ':', AxiosError.ERR_BAD_REQUEST, config));
      return;
    }


    // Send the request
    request.send(requestData);
  });
};


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/axios.js":
/*!***************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/axios.js ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./utils */ "../.hathora/node_modules/axios/lib/utils.js");
var bind = __webpack_require__(/*! ./helpers/bind */ "../.hathora/node_modules/axios/lib/helpers/bind.js");
var Axios = __webpack_require__(/*! ./core/Axios */ "../.hathora/node_modules/axios/lib/core/Axios.js");
var mergeConfig = __webpack_require__(/*! ./core/mergeConfig */ "../.hathora/node_modules/axios/lib/core/mergeConfig.js");
var defaults = __webpack_require__(/*! ./defaults */ "../.hathora/node_modules/axios/lib/defaults/index.js");

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  // Factory for creating new instances
  instance.create = function create(instanceConfig) {
    return createInstance(mergeConfig(defaultConfig, instanceConfig));
  };

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Expose Cancel & CancelToken
axios.CanceledError = __webpack_require__(/*! ./cancel/CanceledError */ "../.hathora/node_modules/axios/lib/cancel/CanceledError.js");
axios.CancelToken = __webpack_require__(/*! ./cancel/CancelToken */ "../.hathora/node_modules/axios/lib/cancel/CancelToken.js");
axios.isCancel = __webpack_require__(/*! ./cancel/isCancel */ "../.hathora/node_modules/axios/lib/cancel/isCancel.js");
axios.VERSION = (__webpack_require__(/*! ./env/data */ "../.hathora/node_modules/axios/lib/env/data.js").version);
axios.toFormData = __webpack_require__(/*! ./helpers/toFormData */ "../.hathora/node_modules/axios/lib/helpers/toFormData.js");

// Expose AxiosError class
axios.AxiosError = __webpack_require__(/*! ../lib/core/AxiosError */ "../.hathora/node_modules/axios/lib/core/AxiosError.js");

// alias for CanceledError for backward compatibility
axios.Cancel = axios.CanceledError;

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = __webpack_require__(/*! ./helpers/spread */ "../.hathora/node_modules/axios/lib/helpers/spread.js");

// Expose isAxiosError
axios.isAxiosError = __webpack_require__(/*! ./helpers/isAxiosError */ "../.hathora/node_modules/axios/lib/helpers/isAxiosError.js");

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports["default"] = axios;


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/cancel/CancelToken.js":
/*!****************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/cancel/CancelToken.js ***!
  \****************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var CanceledError = __webpack_require__(/*! ./CanceledError */ "../.hathora/node_modules/axios/lib/cancel/CanceledError.js");

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;

  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;

  // eslint-disable-next-line func-names
  this.promise.then(function(cancel) {
    if (!token._listeners) return;

    var i;
    var l = token._listeners.length;

    for (i = 0; i < l; i++) {
      token._listeners[i](cancel);
    }
    token._listeners = null;
  });

  // eslint-disable-next-line func-names
  this.promise.then = function(onfulfilled) {
    var _resolve;
    // eslint-disable-next-line func-names
    var promise = new Promise(function(resolve) {
      token.subscribe(resolve);
      _resolve = resolve;
    }).then(onfulfilled);

    promise.cancel = function reject() {
      token.unsubscribe(_resolve);
    };

    return promise;
  };

  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new CanceledError(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `CanceledError` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Subscribe to the cancel signal
 */

CancelToken.prototype.subscribe = function subscribe(listener) {
  if (this.reason) {
    listener(this.reason);
    return;
  }

  if (this._listeners) {
    this._listeners.push(listener);
  } else {
    this._listeners = [listener];
  }
};

/**
 * Unsubscribe from the cancel signal
 */

CancelToken.prototype.unsubscribe = function unsubscribe(listener) {
  if (!this._listeners) {
    return;
  }
  var index = this._listeners.indexOf(listener);
  if (index !== -1) {
    this._listeners.splice(index, 1);
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/cancel/CanceledError.js":
/*!******************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/cancel/CanceledError.js ***!
  \******************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var AxiosError = __webpack_require__(/*! ../core/AxiosError */ "../.hathora/node_modules/axios/lib/core/AxiosError.js");
var utils = __webpack_require__(/*! ../utils */ "../.hathora/node_modules/axios/lib/utils.js");

/**
 * A `CanceledError` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function CanceledError(message) {
  // eslint-disable-next-line no-eq-null,eqeqeq
  AxiosError.call(this, message == null ? 'canceled' : message, AxiosError.ERR_CANCELED);
  this.name = 'CanceledError';
}

utils.inherits(CanceledError, AxiosError, {
  __CANCEL__: true
});

module.exports = CanceledError;


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/cancel/isCancel.js":
/*!*************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/cancel/isCancel.js ***!
  \*************************************************************/
/***/ ((module) => {

"use strict";


module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/core/Axios.js":
/*!********************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/core/Axios.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../.hathora/node_modules/axios/lib/utils.js");
var buildURL = __webpack_require__(/*! ../helpers/buildURL */ "../.hathora/node_modules/axios/lib/helpers/buildURL.js");
var InterceptorManager = __webpack_require__(/*! ./InterceptorManager */ "../.hathora/node_modules/axios/lib/core/InterceptorManager.js");
var dispatchRequest = __webpack_require__(/*! ./dispatchRequest */ "../.hathora/node_modules/axios/lib/core/dispatchRequest.js");
var mergeConfig = __webpack_require__(/*! ./mergeConfig */ "../.hathora/node_modules/axios/lib/core/mergeConfig.js");
var buildFullPath = __webpack_require__(/*! ./buildFullPath */ "../.hathora/node_modules/axios/lib/core/buildFullPath.js");
var validator = __webpack_require__(/*! ../helpers/validator */ "../.hathora/node_modules/axios/lib/helpers/validator.js");

var validators = validator.validators;
/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(configOrUrl, config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof configOrUrl === 'string') {
    config = config || {};
    config.url = configOrUrl;
  } else {
    config = configOrUrl || {};
  }

  config = mergeConfig(this.defaults, config);

  // Set config.method
  if (config.method) {
    config.method = config.method.toLowerCase();
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase();
  } else {
    config.method = 'get';
  }

  var transitional = config.transitional;

  if (transitional !== undefined) {
    validator.assertOptions(transitional, {
      silentJSONParsing: validators.transitional(validators.boolean),
      forcedJSONParsing: validators.transitional(validators.boolean),
      clarifyTimeoutError: validators.transitional(validators.boolean)
    }, false);
  }

  // filter out skipped interceptors
  var requestInterceptorChain = [];
  var synchronousRequestInterceptors = true;
  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
      return;
    }

    synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

    requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  var responseInterceptorChain = [];
  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
  });

  var promise;

  if (!synchronousRequestInterceptors) {
    var chain = [dispatchRequest, undefined];

    Array.prototype.unshift.apply(chain, requestInterceptorChain);
    chain = chain.concat(responseInterceptorChain);

    promise = Promise.resolve(config);
    while (chain.length) {
      promise = promise.then(chain.shift(), chain.shift());
    }

    return promise;
  }


  var newConfig = config;
  while (requestInterceptorChain.length) {
    var onFulfilled = requestInterceptorChain.shift();
    var onRejected = requestInterceptorChain.shift();
    try {
      newConfig = onFulfilled(newConfig);
    } catch (error) {
      onRejected(error);
      break;
    }
  }

  try {
    promise = dispatchRequest(newConfig);
  } catch (error) {
    return Promise.reject(error);
  }

  while (responseInterceptorChain.length) {
    promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
  }

  return promise;
};

Axios.prototype.getUri = function getUri(config) {
  config = mergeConfig(this.defaults, config);
  var fullPath = buildFullPath(config.baseURL, config.url);
  return buildURL(fullPath, config.params, config.paramsSerializer);
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: (config || {}).data
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/

  function generateHTTPMethod(isForm) {
    return function httpMethod(url, data, config) {
      return this.request(mergeConfig(config || {}, {
        method: method,
        headers: isForm ? {
          'Content-Type': 'multipart/form-data'
        } : {},
        url: url,
        data: data
      }));
    };
  }

  Axios.prototype[method] = generateHTTPMethod();

  Axios.prototype[method + 'Form'] = generateHTTPMethod(true);
});

module.exports = Axios;


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/core/AxiosError.js":
/*!*************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/core/AxiosError.js ***!
  \*************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "../.hathora/node_modules/axios/lib/utils.js");

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [config] The config.
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
function AxiosError(message, code, config, request, response) {
  Error.call(this);
  this.message = message;
  this.name = 'AxiosError';
  code && (this.code = code);
  config && (this.config = config);
  request && (this.request = request);
  response && (this.response = response);
}

utils.inherits(AxiosError, Error, {
  toJSON: function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: this.config,
      code: this.code,
      status: this.response && this.response.status ? this.response.status : null
    };
  }
});

var prototype = AxiosError.prototype;
var descriptors = {};

[
  'ERR_BAD_OPTION_VALUE',
  'ERR_BAD_OPTION',
  'ECONNABORTED',
  'ETIMEDOUT',
  'ERR_NETWORK',
  'ERR_FR_TOO_MANY_REDIRECTS',
  'ERR_DEPRECATED',
  'ERR_BAD_RESPONSE',
  'ERR_BAD_REQUEST',
  'ERR_CANCELED'
// eslint-disable-next-line func-names
].forEach(function(code) {
  descriptors[code] = {value: code};
});

Object.defineProperties(AxiosError, descriptors);
Object.defineProperty(prototype, 'isAxiosError', {value: true});

// eslint-disable-next-line func-names
AxiosError.from = function(error, code, config, request, response, customProps) {
  var axiosError = Object.create(prototype);

  utils.toFlatObject(error, axiosError, function filter(obj) {
    return obj !== Error.prototype;
  });

  AxiosError.call(axiosError, error.message, code, config, request, response);

  axiosError.name = error.name;

  customProps && Object.assign(axiosError, customProps);

  return axiosError;
};

module.exports = AxiosError;


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/core/InterceptorManager.js":
/*!*********************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/core/InterceptorManager.js ***!
  \*********************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../.hathora/node_modules/axios/lib/utils.js");

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected, options) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected,
    synchronous: options ? options.synchronous : false,
    runWhen: options ? options.runWhen : null
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/core/buildFullPath.js":
/*!****************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/core/buildFullPath.js ***!
  \****************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var isAbsoluteURL = __webpack_require__(/*! ../helpers/isAbsoluteURL */ "../.hathora/node_modules/axios/lib/helpers/isAbsoluteURL.js");
var combineURLs = __webpack_require__(/*! ../helpers/combineURLs */ "../.hathora/node_modules/axios/lib/helpers/combineURLs.js");

/**
 * Creates a new URL by combining the baseURL with the requestedURL,
 * only when the requestedURL is not already an absolute URL.
 * If the requestURL is absolute, this function returns the requestedURL untouched.
 *
 * @param {string} baseURL The base URL
 * @param {string} requestedURL Absolute or relative URL to combine
 * @returns {string} The combined full path
 */
module.exports = function buildFullPath(baseURL, requestedURL) {
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
};


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/core/dispatchRequest.js":
/*!******************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/core/dispatchRequest.js ***!
  \******************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../.hathora/node_modules/axios/lib/utils.js");
var transformData = __webpack_require__(/*! ./transformData */ "../.hathora/node_modules/axios/lib/core/transformData.js");
var isCancel = __webpack_require__(/*! ../cancel/isCancel */ "../.hathora/node_modules/axios/lib/cancel/isCancel.js");
var defaults = __webpack_require__(/*! ../defaults */ "../.hathora/node_modules/axios/lib/defaults/index.js");
var CanceledError = __webpack_require__(/*! ../cancel/CanceledError */ "../.hathora/node_modules/axios/lib/cancel/CanceledError.js");

/**
 * Throws a `CanceledError` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }

  if (config.signal && config.signal.aborted) {
    throw new CanceledError();
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData.call(
    config,
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData.call(
      config,
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData.call(
          config,
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/core/mergeConfig.js":
/*!**************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/core/mergeConfig.js ***!
  \**************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "../.hathora/node_modules/axios/lib/utils.js");

/**
 * Config-specific merge-function which creates a new config-object
 * by merging two configuration objects together.
 *
 * @param {Object} config1
 * @param {Object} config2
 * @returns {Object} New object resulting from merging config2 to config1
 */
module.exports = function mergeConfig(config1, config2) {
  // eslint-disable-next-line no-param-reassign
  config2 = config2 || {};
  var config = {};

  function getMergedValue(target, source) {
    if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
      return utils.merge(target, source);
    } else if (utils.isPlainObject(source)) {
      return utils.merge({}, source);
    } else if (utils.isArray(source)) {
      return source.slice();
    }
    return source;
  }

  // eslint-disable-next-line consistent-return
  function mergeDeepProperties(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(config1[prop], config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function valueFromConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(undefined, config2[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function defaultToConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(undefined, config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function mergeDirectKeys(prop) {
    if (prop in config2) {
      return getMergedValue(config1[prop], config2[prop]);
    } else if (prop in config1) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  var mergeMap = {
    'url': valueFromConfig2,
    'method': valueFromConfig2,
    'data': valueFromConfig2,
    'baseURL': defaultToConfig2,
    'transformRequest': defaultToConfig2,
    'transformResponse': defaultToConfig2,
    'paramsSerializer': defaultToConfig2,
    'timeout': defaultToConfig2,
    'timeoutMessage': defaultToConfig2,
    'withCredentials': defaultToConfig2,
    'adapter': defaultToConfig2,
    'responseType': defaultToConfig2,
    'xsrfCookieName': defaultToConfig2,
    'xsrfHeaderName': defaultToConfig2,
    'onUploadProgress': defaultToConfig2,
    'onDownloadProgress': defaultToConfig2,
    'decompress': defaultToConfig2,
    'maxContentLength': defaultToConfig2,
    'maxBodyLength': defaultToConfig2,
    'beforeRedirect': defaultToConfig2,
    'transport': defaultToConfig2,
    'httpAgent': defaultToConfig2,
    'httpsAgent': defaultToConfig2,
    'cancelToken': defaultToConfig2,
    'socketPath': defaultToConfig2,
    'responseEncoding': defaultToConfig2,
    'validateStatus': mergeDirectKeys
  };

  utils.forEach(Object.keys(config1).concat(Object.keys(config2)), function computeConfigValue(prop) {
    var merge = mergeMap[prop] || mergeDeepProperties;
    var configValue = merge(prop);
    (utils.isUndefined(configValue) && merge !== mergeDirectKeys) || (config[prop] = configValue);
  });

  return config;
};


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/core/settle.js":
/*!*********************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/core/settle.js ***!
  \*********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var AxiosError = __webpack_require__(/*! ./AxiosError */ "../.hathora/node_modules/axios/lib/core/AxiosError.js");

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(new AxiosError(
      'Request failed with status code ' + response.status,
      [AxiosError.ERR_BAD_REQUEST, AxiosError.ERR_BAD_RESPONSE][Math.floor(response.status / 100) - 4],
      response.config,
      response.request,
      response
    ));
  }
};


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/core/transformData.js":
/*!****************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/core/transformData.js ***!
  \****************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../.hathora/node_modules/axios/lib/utils.js");
var defaults = __webpack_require__(/*! ../defaults */ "../.hathora/node_modules/axios/lib/defaults/index.js");

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  var context = this || defaults;
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn.call(context, data, headers);
  });

  return data;
};


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/defaults/index.js":
/*!************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/defaults/index.js ***!
  \************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "../.hathora/node_modules/axios/lib/utils.js");
var normalizeHeaderName = __webpack_require__(/*! ../helpers/normalizeHeaderName */ "../.hathora/node_modules/axios/lib/helpers/normalizeHeaderName.js");
var AxiosError = __webpack_require__(/*! ../core/AxiosError */ "../.hathora/node_modules/axios/lib/core/AxiosError.js");
var transitionalDefaults = __webpack_require__(/*! ./transitional */ "../.hathora/node_modules/axios/lib/defaults/transitional.js");
var toFormData = __webpack_require__(/*! ../helpers/toFormData */ "../.hathora/node_modules/axios/lib/helpers/toFormData.js");

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = __webpack_require__(/*! ../adapters/xhr */ "../.hathora/node_modules/axios/lib/adapters/xhr.js");
  } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
    // For node use HTTP adapter
    adapter = __webpack_require__(/*! ../adapters/http */ "../.hathora/node_modules/axios/lib/adapters/xhr.js");
  }
  return adapter;
}

function stringifySafely(rawValue, parser, encoder) {
  if (utils.isString(rawValue)) {
    try {
      (parser || JSON.parse)(rawValue);
      return utils.trim(rawValue);
    } catch (e) {
      if (e.name !== 'SyntaxError') {
        throw e;
      }
    }
  }

  return (encoder || JSON.stringify)(rawValue);
}

var defaults = {

  transitional: transitionalDefaults,

  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Accept');
    normalizeHeaderName(headers, 'Content-Type');

    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }

    var isObjectPayload = utils.isObject(data);
    var contentType = headers && headers['Content-Type'];

    var isFileList;

    if ((isFileList = utils.isFileList(data)) || (isObjectPayload && contentType === 'multipart/form-data')) {
      var _FormData = this.env && this.env.FormData;
      return toFormData(isFileList ? {'files[]': data} : data, _FormData && new _FormData());
    } else if (isObjectPayload || contentType === 'application/json') {
      setContentTypeIfUnset(headers, 'application/json');
      return stringifySafely(data);
    }

    return data;
  }],

  transformResponse: [function transformResponse(data) {
    var transitional = this.transitional || defaults.transitional;
    var silentJSONParsing = transitional && transitional.silentJSONParsing;
    var forcedJSONParsing = transitional && transitional.forcedJSONParsing;
    var strictJSONParsing = !silentJSONParsing && this.responseType === 'json';

    if (strictJSONParsing || (forcedJSONParsing && utils.isString(data) && data.length)) {
      try {
        return JSON.parse(data);
      } catch (e) {
        if (strictJSONParsing) {
          if (e.name === 'SyntaxError') {
            throw AxiosError.from(e, AxiosError.ERR_BAD_RESPONSE, this, null, this.response);
          }
          throw e;
        }
      }
    }

    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,
  maxBodyLength: -1,

  env: {
    FormData: __webpack_require__(/*! ./env/FormData */ "../.hathora/node_modules/axios/lib/helpers/null.js")
  },

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  },

  headers: {
    common: {
      'Accept': 'application/json, text/plain, */*'
    }
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/defaults/transitional.js":
/*!*******************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/defaults/transitional.js ***!
  \*******************************************************************/
/***/ ((module) => {

"use strict";


module.exports = {
  silentJSONParsing: true,
  forcedJSONParsing: true,
  clarifyTimeoutError: false
};


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/env/data.js":
/*!******************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/env/data.js ***!
  \******************************************************/
/***/ ((module) => {

module.exports = {
  "version": "0.27.2"
};

/***/ }),

/***/ "../.hathora/node_modules/axios/lib/helpers/bind.js":
/*!**********************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/helpers/bind.js ***!
  \**********************************************************/
/***/ ((module) => {

"use strict";


module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/helpers/buildURL.js":
/*!**************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/helpers/buildURL.js ***!
  \**************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../.hathora/node_modules/axios/lib/utils.js");

function encode(val) {
  return encodeURIComponent(val).
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    var hashmarkIndex = url.indexOf('#');
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }

    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/helpers/combineURLs.js":
/*!*****************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/helpers/combineURLs.js ***!
  \*****************************************************************/
/***/ ((module) => {

"use strict";


/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/helpers/cookies.js":
/*!*************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/helpers/cookies.js ***!
  \*************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../.hathora/node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
    (function standardBrowserEnv() {
      return {
        write: function write(name, value, expires, path, domain, secure) {
          var cookie = [];
          cookie.push(name + '=' + encodeURIComponent(value));

          if (utils.isNumber(expires)) {
            cookie.push('expires=' + new Date(expires).toGMTString());
          }

          if (utils.isString(path)) {
            cookie.push('path=' + path);
          }

          if (utils.isString(domain)) {
            cookie.push('domain=' + domain);
          }

          if (secure === true) {
            cookie.push('secure');
          }

          document.cookie = cookie.join('; ');
        },

        read: function read(name) {
          var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
          return (match ? decodeURIComponent(match[3]) : null);
        },

        remove: function remove(name) {
          this.write(name, '', Date.now() - 86400000);
        }
      };
    })() :

  // Non standard browser env (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return {
        write: function write() {},
        read: function read() { return null; },
        remove: function remove() {}
      };
    })()
);


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/helpers/isAbsoluteURL.js":
/*!*******************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/helpers/isAbsoluteURL.js ***!
  \*******************************************************************/
/***/ ((module) => {

"use strict";


/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
};


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/helpers/isAxiosError.js":
/*!******************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/helpers/isAxiosError.js ***!
  \******************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../.hathora/node_modules/axios/lib/utils.js");

/**
 * Determines whether the payload is an error thrown by Axios
 *
 * @param {*} payload The value to test
 * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
 */
module.exports = function isAxiosError(payload) {
  return utils.isObject(payload) && (payload.isAxiosError === true);
};


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/helpers/isURLSameOrigin.js":
/*!*********************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/helpers/isURLSameOrigin.js ***!
  \*********************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../.hathora/node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
    (function standardBrowserEnv() {
      var msie = /(msie|trident)/i.test(navigator.userAgent);
      var urlParsingNode = document.createElement('a');
      var originURL;

      /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
      function resolveURL(url) {
        var href = url;

        if (msie) {
        // IE needs attribute set twice to normalize properties
          urlParsingNode.setAttribute('href', href);
          href = urlParsingNode.href;
        }

        urlParsingNode.setAttribute('href', href);

        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
        return {
          href: urlParsingNode.href,
          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
          host: urlParsingNode.host,
          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
          hostname: urlParsingNode.hostname,
          port: urlParsingNode.port,
          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
            urlParsingNode.pathname :
            '/' + urlParsingNode.pathname
        };
      }

      originURL = resolveURL(window.location.href);

      /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
      return function isURLSameOrigin(requestURL) {
        var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
        return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
      };
    })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return function isURLSameOrigin() {
        return true;
      };
    })()
);


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/helpers/normalizeHeaderName.js":
/*!*************************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/helpers/normalizeHeaderName.js ***!
  \*************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "../.hathora/node_modules/axios/lib/utils.js");

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/helpers/null.js":
/*!**********************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/helpers/null.js ***!
  \**********************************************************/
/***/ ((module) => {

// eslint-disable-next-line strict
module.exports = null;


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/helpers/parseHeaders.js":
/*!******************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/helpers/parseHeaders.js ***!
  \******************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../.hathora/node_modules/axios/lib/utils.js");

// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });

  return parsed;
};


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/helpers/parseProtocol.js":
/*!*******************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/helpers/parseProtocol.js ***!
  \*******************************************************************/
/***/ ((module) => {

"use strict";


module.exports = function parseProtocol(url) {
  var match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url);
  return match && match[1] || '';
};


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/helpers/spread.js":
/*!************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/helpers/spread.js ***!
  \************************************************************/
/***/ ((module) => {

"use strict";


/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/helpers/toFormData.js":
/*!****************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/helpers/toFormData.js ***!
  \****************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "../.hathora/node_modules/axios/lib/utils.js");

/**
 * Convert a data object to FormData
 * @param {Object} obj
 * @param {?Object} [formData]
 * @returns {Object}
 **/

function toFormData(obj, formData) {
  // eslint-disable-next-line no-param-reassign
  formData = formData || new FormData();

  var stack = [];

  function convertValue(value) {
    if (value === null) return '';

    if (utils.isDate(value)) {
      return value.toISOString();
    }

    if (utils.isArrayBuffer(value) || utils.isTypedArray(value)) {
      return typeof Blob === 'function' ? new Blob([value]) : Buffer.from(value);
    }

    return value;
  }

  function build(data, parentKey) {
    if (utils.isPlainObject(data) || utils.isArray(data)) {
      if (stack.indexOf(data) !== -1) {
        throw Error('Circular reference detected in ' + parentKey);
      }

      stack.push(data);

      utils.forEach(data, function each(value, key) {
        if (utils.isUndefined(value)) return;
        var fullKey = parentKey ? parentKey + '.' + key : key;
        var arr;

        if (value && !parentKey && typeof value === 'object') {
          if (utils.endsWith(key, '{}')) {
            // eslint-disable-next-line no-param-reassign
            value = JSON.stringify(value);
          } else if (utils.endsWith(key, '[]') && (arr = utils.toArray(value))) {
            // eslint-disable-next-line func-names
            arr.forEach(function(el) {
              !utils.isUndefined(el) && formData.append(fullKey, convertValue(el));
            });
            return;
          }
        }

        build(value, fullKey);
      });

      stack.pop();
    } else {
      formData.append(parentKey, convertValue(data));
    }
  }

  build(obj);

  return formData;
}

module.exports = toFormData;


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/helpers/validator.js":
/*!***************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/helpers/validator.js ***!
  \***************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var VERSION = (__webpack_require__(/*! ../env/data */ "../.hathora/node_modules/axios/lib/env/data.js").version);
var AxiosError = __webpack_require__(/*! ../core/AxiosError */ "../.hathora/node_modules/axios/lib/core/AxiosError.js");

var validators = {};

// eslint-disable-next-line func-names
['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach(function(type, i) {
  validators[type] = function validator(thing) {
    return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
  };
});

var deprecatedWarnings = {};

/**
 * Transitional option validator
 * @param {function|boolean?} validator - set to false if the transitional option has been removed
 * @param {string?} version - deprecated version / removed since version
 * @param {string?} message - some message with additional info
 * @returns {function}
 */
validators.transitional = function transitional(validator, version, message) {
  function formatMessage(opt, desc) {
    return '[Axios v' + VERSION + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
  }

  // eslint-disable-next-line func-names
  return function(value, opt, opts) {
    if (validator === false) {
      throw new AxiosError(
        formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')),
        AxiosError.ERR_DEPRECATED
      );
    }

    if (version && !deprecatedWarnings[opt]) {
      deprecatedWarnings[opt] = true;
      // eslint-disable-next-line no-console
      console.warn(
        formatMessage(
          opt,
          ' has been deprecated since v' + version + ' and will be removed in the near future'
        )
      );
    }

    return validator ? validator(value, opt, opts) : true;
  };
};

/**
 * Assert object's properties type
 * @param {object} options
 * @param {object} schema
 * @param {boolean?} allowUnknown
 */

function assertOptions(options, schema, allowUnknown) {
  if (typeof options !== 'object') {
    throw new AxiosError('options must be an object', AxiosError.ERR_BAD_OPTION_VALUE);
  }
  var keys = Object.keys(options);
  var i = keys.length;
  while (i-- > 0) {
    var opt = keys[i];
    var validator = schema[opt];
    if (validator) {
      var value = options[opt];
      var result = value === undefined || validator(value, opt, options);
      if (result !== true) {
        throw new AxiosError('option ' + opt + ' must be ' + result, AxiosError.ERR_BAD_OPTION_VALUE);
      }
      continue;
    }
    if (allowUnknown !== true) {
      throw new AxiosError('Unknown option ' + opt, AxiosError.ERR_BAD_OPTION);
    }
  }
}

module.exports = {
  assertOptions: assertOptions,
  validators: validators
};


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/utils.js":
/*!***************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/utils.js ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var bind = __webpack_require__(/*! ./helpers/bind */ "../.hathora/node_modules/axios/lib/helpers/bind.js");

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

// eslint-disable-next-line func-names
var kindOf = (function(cache) {
  // eslint-disable-next-line func-names
  return function(thing) {
    var str = toString.call(thing);
    return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
  };
})(Object.create(null));

function kindOfTest(type) {
  type = type.toLowerCase();
  return function isKindOf(thing) {
    return kindOf(thing) === type;
  };
}

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return Array.isArray(val);
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is a Buffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Buffer, otherwise false
 */
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
    && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @function
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
var isArrayBuffer = kindOfTest('ArrayBuffer');


/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (isArrayBuffer(val.buffer));
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a plain Object
 *
 * @param {Object} val The value to test
 * @return {boolean} True if value is a plain Object, otherwise false
 */
function isPlainObject(val) {
  if (kindOf(val) !== 'object') {
    return false;
  }

  var prototype = Object.getPrototypeOf(val);
  return prototype === null || prototype === Object.prototype;
}

/**
 * Determine if a value is a Date
 *
 * @function
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
var isDate = kindOfTest('Date');

/**
 * Determine if a value is a File
 *
 * @function
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
var isFile = kindOfTest('File');

/**
 * Determine if a value is a Blob
 *
 * @function
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
var isBlob = kindOfTest('Blob');

/**
 * Determine if a value is a FileList
 *
 * @function
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
var isFileList = kindOfTest('FileList');

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} thing The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(thing) {
  var pattern = '[object FormData]';
  return thing && (
    (typeof FormData === 'function' && thing instanceof FormData) ||
    toString.call(thing) === pattern ||
    (isFunction(thing.toString) && thing.toString() === pattern)
  );
}

/**
 * Determine if a value is a URLSearchParams object
 * @function
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
var isURLSearchParams = kindOfTest('URLSearchParams');

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 * nativescript
 *  navigator.product -> 'NativeScript' or 'NS'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                           navigator.product === 'NativeScript' ||
                                           navigator.product === 'NS')) {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (isPlainObject(result[key]) && isPlainObject(val)) {
      result[key] = merge(result[key], val);
    } else if (isPlainObject(val)) {
      result[key] = merge({}, val);
    } else if (isArray(val)) {
      result[key] = val.slice();
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

/**
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 *
 * @param {string} content with BOM
 * @return {string} content value without BOM
 */
function stripBOM(content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

/**
 * Inherit the prototype methods from one constructor into another
 * @param {function} constructor
 * @param {function} superConstructor
 * @param {object} [props]
 * @param {object} [descriptors]
 */

function inherits(constructor, superConstructor, props, descriptors) {
  constructor.prototype = Object.create(superConstructor.prototype, descriptors);
  constructor.prototype.constructor = constructor;
  props && Object.assign(constructor.prototype, props);
}

/**
 * Resolve object with deep prototype chain to a flat object
 * @param {Object} sourceObj source object
 * @param {Object} [destObj]
 * @param {Function} [filter]
 * @returns {Object}
 */

function toFlatObject(sourceObj, destObj, filter) {
  var props;
  var i;
  var prop;
  var merged = {};

  destObj = destObj || {};

  do {
    props = Object.getOwnPropertyNames(sourceObj);
    i = props.length;
    while (i-- > 0) {
      prop = props[i];
      if (!merged[prop]) {
        destObj[prop] = sourceObj[prop];
        merged[prop] = true;
      }
    }
    sourceObj = Object.getPrototypeOf(sourceObj);
  } while (sourceObj && (!filter || filter(sourceObj, destObj)) && sourceObj !== Object.prototype);

  return destObj;
}

/*
 * determines whether a string ends with the characters of a specified string
 * @param {String} str
 * @param {String} searchString
 * @param {Number} [position= 0]
 * @returns {boolean}
 */
function endsWith(str, searchString, position) {
  str = String(str);
  if (position === undefined || position > str.length) {
    position = str.length;
  }
  position -= searchString.length;
  var lastIndex = str.indexOf(searchString, position);
  return lastIndex !== -1 && lastIndex === position;
}


/**
 * Returns new array from array like object
 * @param {*} [thing]
 * @returns {Array}
 */
function toArray(thing) {
  if (!thing) return null;
  var i = thing.length;
  if (isUndefined(i)) return null;
  var arr = new Array(i);
  while (i-- > 0) {
    arr[i] = thing[i];
  }
  return arr;
}

// eslint-disable-next-line func-names
var isTypedArray = (function(TypedArray) {
  // eslint-disable-next-line func-names
  return function(thing) {
    return TypedArray && thing instanceof TypedArray;
  };
})(typeof Uint8Array !== 'undefined' && Object.getPrototypeOf(Uint8Array));

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isPlainObject: isPlainObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim,
  stripBOM: stripBOM,
  inherits: inherits,
  toFlatObject: toFlatObject,
  kindOf: kindOf,
  kindOfTest: kindOfTest,
  endsWith: endsWith,
  toArray: toArray,
  isTypedArray: isTypedArray,
  isFileList: isFileList
};


/***/ }),

/***/ "../.hathora/node_modules/get-random-values/index.js":
/*!***********************************************************!*\
  !*** ../.hathora/node_modules/get-random-values/index.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var window = __webpack_require__(/*! global/window */ "../.hathora/node_modules/global/window.js");
var nodeCrypto = __webpack_require__(/*! crypto */ "?5d12");

function getRandomValues(buf) {
  if (window.crypto && window.crypto.getRandomValues) {
    return window.crypto.getRandomValues(buf);
  }
  if (typeof window.msCrypto === 'object' && typeof window.msCrypto.getRandomValues === 'function') {
    return window.msCrypto.getRandomValues(buf);
  }
  if (nodeCrypto.randomBytes) {
    if (!(buf instanceof Uint8Array)) {
      throw new TypeError('expected Uint8Array');
    }
    if (buf.length > 65536) {
      var e = new Error();
      e.code = 22;
      e.message = 'Failed to execute \'getRandomValues\' on \'Crypto\': The ' +
        'ArrayBufferView\'s byte length (' + buf.length + ') exceeds the ' +
        'number of bytes of entropy available via this API (65536).';
      e.name = 'QuotaExceededError';
      throw e;
    }
    var bytes = nodeCrypto.randomBytes(buf.length);
    buf.set(bytes);
    return buf;
  }
  else {
    throw new Error('No secure random number generator available.');
  }
}

module.exports = getRandomValues;


/***/ }),

/***/ "../.hathora/node_modules/global/window.js":
/*!*************************************************!*\
  !*** ../.hathora/node_modules/global/window.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var win;

if (typeof window !== "undefined") {
    win = window;
} else if (typeof __webpack_require__.g !== "undefined") {
    win = __webpack_require__.g;
} else if (typeof self !== "undefined"){
    win = self;
} else {
    win = {};
}

module.exports = win;


/***/ }),

/***/ "../.hathora/node_modules/jwt-decode/build/jwt-decode.esm.js":
/*!*******************************************************************!*\
  !*** ../.hathora/node_modules/jwt-decode/build/jwt-decode.esm.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "InvalidTokenError": () => (/* binding */ n),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
function e(e){this.message=e}e.prototype=new Error,e.prototype.name="InvalidCharacterError";var r="undefined"!=typeof window&&window.atob&&window.atob.bind(window)||function(r){var t=String(r).replace(/=+$/,"");if(t.length%4==1)throw new e("'atob' failed: The string to be decoded is not correctly encoded.");for(var n,o,a=0,i=0,c="";o=t.charAt(i++);~o&&(n=a%4?64*n+o:o,a++%4)?c+=String.fromCharCode(255&n>>(-2*a&6)):0)o="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(o);return c};function t(e){var t=e.replace(/-/g,"+").replace(/_/g,"/");switch(t.length%4){case 0:break;case 2:t+="==";break;case 3:t+="=";break;default:throw"Illegal base64url string!"}try{return function(e){return decodeURIComponent(r(e).replace(/(.)/g,(function(e,r){var t=r.charCodeAt(0).toString(16).toUpperCase();return t.length<2&&(t="0"+t),"%"+t})))}(t)}catch(e){return r(t)}}function n(e){this.message=e}function o(e,r){if("string"!=typeof e)throw new n("Invalid token specified");var o=!0===(r=r||{}).header?0:1;try{return JSON.parse(t(e.split(".")[o]))}catch(e){throw new n("Invalid token specified: "+e.message)}}n.prototype=new Error,n.prototype.name="InvalidTokenError";/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (o);
//# sourceMappingURL=jwt-decode.esm.js.map


/***/ }),

/***/ "../.hathora/node_modules/net/index.js":
/*!*********************************************!*\
  !*** ../.hathora/node_modules/net/index.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

/*
Copyright 2013 Sleepless Software Inc. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE. 
*/

// yes, I know this seems stupid, but I have my reasons.

var net = __webpack_require__(/*! net */ "../.hathora/node_modules/net/index.js")
for(k in net)
	__webpack_require__.g[k] = net[k]



/***/ }),

/***/ "../.hathora/node_modules/utf8-buffer-size/main.js":
/*!*********************************************************!*\
  !*** ../.hathora/node_modules/utf8-buffer-size/main.js ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ utf8BufferSize)
/* harmony export */ });
/*
 * Copyright (c) 2018 Rafael da Silva Rocha.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

/**
 * @fileoverview The utf8-buffer-size API.
 * @see https://github.com/rochars/utf8-buffer-size
 */

/** @module utf8BufferSize */

/**
 * Returns how many bytes are needed to serialize a UTF-8 string.
 * @see https://encoding.spec.whatwg.org/#utf-8-encoder
 * @param {string} str The string to pack.
 * @return {number} The number of bytes needed to serialize the string.
 */
function utf8BufferSize(str) {
  /** @type {number} */
  let bytes = 0;
  for (let i = 0, len = str.length; i < len; i++) {
    /** @type {number} */
    let codePoint = str.codePointAt(i);
    if (codePoint < 128) {
      bytes++;
    } else {
      if (codePoint <= 2047) {
        bytes++;
      } else if(codePoint <= 65535) {
        bytes+=2;
      } else if(codePoint <= 1114111) {
        i++;
        bytes+=3;
      }
      bytes++;
    }
  }
  return bytes;
}


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./src/styles/StatusEffect.css":
/*!***************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/styles/StatusEffect.css ***!
  \***************************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, ".SE_container {\r\n  position: absolute;\r\n  top: -40px;\r\n  left: -40px;\r\n  width: 280px;\r\n  height: 280px;\r\n  border: 1px solid transparent;\r\n  border-radius: 50%;\r\n}\r\n\r\n.SE_rel {\r\n  width: 100%;\r\n  height: 100%;\r\n  position: relative;\r\n}\r\n\r\n.SE_status_effect {\r\n  position: absolute;\r\n  right: 0;\r\n  width: 25px;\r\n  height: 25px;\r\n  border-radius: 50%;\r\n}\r\n\r\n.SE_status_effect_img {\r\n  width: 25px;\r\n  height: 25px;\r\n  animation: pulse 1.1s linear infinite;\r\n  border: 1px solid transparent;\r\n  border-radius: 50%;\r\n  object-fit: contain;\r\n}\r\n\r\n@keyframes pulse {\r\n  0% {\r\n    box-shadow: 0px 0px 8px 3px white;\r\n  }\r\n  50% {\r\n    box-shadow: 0px 0px 9px 4px white;\r\n  }\r\n  100% {\r\n    box-shadow: 0px 0px 8px 3px white;\r\n  }\r\n}\r\n\r\n.SE_status_effect_img + .tooltip {\r\n  visibility: hidden;\r\n  width: 150px;\r\n  background-color: black;\r\n  color: #fff;\r\n  text-align: center;\r\n  border-radius: 6px;\r\n  padding: 5px 0;\r\n  pointer-events: none;\r\n\r\n  /* Position the tooltip */\r\n  position: absolute;\r\n  font-size: medium;\r\n  z-index: 2;\r\n  top: -70px;\r\n  left: -50px;\r\n}\r\n\r\n.SE_status_effect_img:hover + .tooltip {\r\n  visibility: visible;\r\n}\r\n\r\n.SE_status_effect_cont {\r\n  position: absolute;\r\n  height: 28px;\r\n  transform-origin: 0 50%;\r\n  width: 110px;\r\n  transform: rotate(0deg);\r\n  top: 126px;\r\n  left: 140px;\r\n  z-index: 3;\r\n}\r\n", "",{"version":3,"sources":["webpack://./src/styles/StatusEffect.css"],"names":[],"mappings":"AAAA;EACE,kBAAkB;EAClB,UAAU;EACV,WAAW;EACX,YAAY;EACZ,aAAa;EACb,6BAA6B;EAC7B,kBAAkB;AACpB;;AAEA;EACE,WAAW;EACX,YAAY;EACZ,kBAAkB;AACpB;;AAEA;EACE,kBAAkB;EAClB,QAAQ;EACR,WAAW;EACX,YAAY;EACZ,kBAAkB;AACpB;;AAEA;EACE,WAAW;EACX,YAAY;EACZ,qCAAqC;EACrC,6BAA6B;EAC7B,kBAAkB;EAClB,mBAAmB;AACrB;;AAEA;EACE;IACE,iCAAiC;EACnC;EACA;IACE,iCAAiC;EACnC;EACA;IACE,iCAAiC;EACnC;AACF;;AAEA;EACE,kBAAkB;EAClB,YAAY;EACZ,uBAAuB;EACvB,WAAW;EACX,kBAAkB;EAClB,kBAAkB;EAClB,cAAc;EACd,oBAAoB;;EAEpB,yBAAyB;EACzB,kBAAkB;EAClB,iBAAiB;EACjB,UAAU;EACV,UAAU;EACV,WAAW;AACb;;AAEA;EACE,mBAAmB;AACrB;;AAEA;EACE,kBAAkB;EAClB,YAAY;EACZ,uBAAuB;EACvB,YAAY;EACZ,uBAAuB;EACvB,UAAU;EACV,WAAW;EACX,UAAU;AACZ","sourcesContent":[".SE_container {\r\n  position: absolute;\r\n  top: -40px;\r\n  left: -40px;\r\n  width: 280px;\r\n  height: 280px;\r\n  border: 1px solid transparent;\r\n  border-radius: 50%;\r\n}\r\n\r\n.SE_rel {\r\n  width: 100%;\r\n  height: 100%;\r\n  position: relative;\r\n}\r\n\r\n.SE_status_effect {\r\n  position: absolute;\r\n  right: 0;\r\n  width: 25px;\r\n  height: 25px;\r\n  border-radius: 50%;\r\n}\r\n\r\n.SE_status_effect_img {\r\n  width: 25px;\r\n  height: 25px;\r\n  animation: pulse 1.1s linear infinite;\r\n  border: 1px solid transparent;\r\n  border-radius: 50%;\r\n  object-fit: contain;\r\n}\r\n\r\n@keyframes pulse {\r\n  0% {\r\n    box-shadow: 0px 0px 8px 3px white;\r\n  }\r\n  50% {\r\n    box-shadow: 0px 0px 9px 4px white;\r\n  }\r\n  100% {\r\n    box-shadow: 0px 0px 8px 3px white;\r\n  }\r\n}\r\n\r\n.SE_status_effect_img + .tooltip {\r\n  visibility: hidden;\r\n  width: 150px;\r\n  background-color: black;\r\n  color: #fff;\r\n  text-align: center;\r\n  border-radius: 6px;\r\n  padding: 5px 0;\r\n  pointer-events: none;\r\n\r\n  /* Position the tooltip */\r\n  position: absolute;\r\n  font-size: medium;\r\n  z-index: 2;\r\n  top: -70px;\r\n  left: -50px;\r\n}\r\n\r\n.SE_status_effect_img:hover + .tooltip {\r\n  visibility: visible;\r\n}\r\n\r\n.SE_status_effect_cont {\r\n  position: absolute;\r\n  height: 28px;\r\n  transform-origin: 0 50%;\r\n  width: 110px;\r\n  transform: rotate(0deg);\r\n  top: 126px;\r\n  left: 140px;\r\n  z-index: 3;\r\n}\r\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./src/styles/card.css":
/*!*******************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/styles/card.css ***!
  \*******************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, ".card_container {\r\n  aspect-ratio: 1/1.5;\r\n  width: 115px;\r\n\r\n  border: 1px solid white;\r\n  border-radius: 5px;\r\n  box-shadow: 5px 5px 4px 1px rgba(0, 0, 0, 0.5);\r\n  background-color: #fbfaf5;\r\n  margin-right: 10px;\r\n  color: #101f6b;\r\n  font-size: small;\r\n  position: relative;\r\n  opacity: 1;\r\n  transition: opacity 0.5s ease-in-out;\r\n}\r\n\r\n.card_container.pui-adding {\r\n  opacity: 0;\r\n}\r\n\r\n.card_container.pui-removing {\r\n  opacity: 0;\r\n}\r\n\r\n.card_title {\r\n  position: absolute;\r\n  top: 10px;\r\n  left: 10px;\r\n  color: #101f6b;\r\n}\r\n\r\n.card_level {\r\n  position: absolute;\r\n  bottom: 10px;\r\n  right: 10px;\r\n  color: #101f6b;\r\n}\r\n\r\n.card_desc {\r\n  position: absolute;\r\n  top: 50%;\r\n  left: 50%;\r\n  width: 100%;\r\n  text-align: center;\r\n  transform: translate(-50%, -50%);\r\n  font-size: small;\r\n  color: #101f6b;\r\n}\r\n\r\n.card_cost {\r\n  position: absolute;\r\n  bottom: 25px;\r\n  right: 10px;\r\n  color: #101f6b;\r\n}\r\n\r\n.smallCard {\r\n  font-size: small;\r\n}\r\n", "",{"version":3,"sources":["webpack://./src/styles/card.css"],"names":[],"mappings":"AAAA;EACE,mBAAmB;EACnB,YAAY;;EAEZ,uBAAuB;EACvB,kBAAkB;EAClB,8CAA8C;EAC9C,yBAAyB;EACzB,kBAAkB;EAClB,cAAc;EACd,gBAAgB;EAChB,kBAAkB;EAClB,UAAU;EACV,oCAAoC;AACtC;;AAEA;EACE,UAAU;AACZ;;AAEA;EACE,UAAU;AACZ;;AAEA;EACE,kBAAkB;EAClB,SAAS;EACT,UAAU;EACV,cAAc;AAChB;;AAEA;EACE,kBAAkB;EAClB,YAAY;EACZ,WAAW;EACX,cAAc;AAChB;;AAEA;EACE,kBAAkB;EAClB,QAAQ;EACR,SAAS;EACT,WAAW;EACX,kBAAkB;EAClB,gCAAgC;EAChC,gBAAgB;EAChB,cAAc;AAChB;;AAEA;EACE,kBAAkB;EAClB,YAAY;EACZ,WAAW;EACX,cAAc;AAChB;;AAEA;EACE,gBAAgB;AAClB","sourcesContent":[".card_container {\r\n  aspect-ratio: 1/1.5;\r\n  width: 115px;\r\n\r\n  border: 1px solid white;\r\n  border-radius: 5px;\r\n  box-shadow: 5px 5px 4px 1px rgba(0, 0, 0, 0.5);\r\n  background-color: #fbfaf5;\r\n  margin-right: 10px;\r\n  color: #101f6b;\r\n  font-size: small;\r\n  position: relative;\r\n  opacity: 1;\r\n  transition: opacity 0.5s ease-in-out;\r\n}\r\n\r\n.card_container.pui-adding {\r\n  opacity: 0;\r\n}\r\n\r\n.card_container.pui-removing {\r\n  opacity: 0;\r\n}\r\n\r\n.card_title {\r\n  position: absolute;\r\n  top: 10px;\r\n  left: 10px;\r\n  color: #101f6b;\r\n}\r\n\r\n.card_level {\r\n  position: absolute;\r\n  bottom: 10px;\r\n  right: 10px;\r\n  color: #101f6b;\r\n}\r\n\r\n.card_desc {\r\n  position: absolute;\r\n  top: 50%;\r\n  left: 50%;\r\n  width: 100%;\r\n  text-align: center;\r\n  transform: translate(-50%, -50%);\r\n  font-size: small;\r\n  color: #101f6b;\r\n}\r\n\r\n.card_cost {\r\n  position: absolute;\r\n  bottom: 25px;\r\n  right: 10px;\r\n  color: #101f6b;\r\n}\r\n\r\n.smallCard {\r\n  font-size: small;\r\n}\r\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./src/styles/cardPool.css":
/*!***********************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/styles/cardPool.css ***!
  \***********************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/getUrl.js */ "./node_modules/css-loader/dist/runtime/getUrl.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__);
// Imports



var ___CSS_LOADER_URL_IMPORT_0___ = new URL(/* asset import */ __webpack_require__(/*! ../assets/border.svg */ "./src/assets/border.svg"), __webpack_require__.b);
var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
var ___CSS_LOADER_URL_REPLACEMENT_0___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_0___);
// Module
___CSS_LOADER_EXPORT___.push([module.id, ".CP_container {\r\n  position: relative;\r\n  top: 0%;\r\n  left: 0%;\r\n  width: var(--game-width);\r\n  height: var(--game-height);\r\n  display: block;\r\n  z-index: 18;\r\n}\r\n\r\n.CP_CardModal {\r\n  position: fixed;\r\n  border: 15px solid;\r\n  border-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_0___ + ");\r\n  border-image-slice: 15;\r\n  background-image: linear-gradient(to bottom right, var(--background-start), var(--background-end));\r\n  border-radius: 20px;\r\n\r\n  top: 50%;\r\n  left: 50%;\r\n  transform: translate(-50%, -50%);\r\n\r\n  width: 750px;\r\n  height: 525px;\r\n  display: grid;\r\n  grid-template-rows: 10px 1fr 10px 1fr 10px;\r\n  grid-template-columns: 10px 1fr 10px 1fr 10px 1fr 10px;\r\n  box-shadow: 5px 5px black;\r\n  animation: 0.75s ease-in-out 0s 1 slideInFromLeft;\r\n}\r\n\r\n.exit {\r\n  animation: 0.75s ease-in-out 0s 1 slideOutToLeft;\r\n}\r\n\r\n@keyframes slideInFromLeft {\r\n  0% {\r\n    transform: translate(-150%, -50%);\r\n    opacity: 0;\r\n  }\r\n  100% {\r\n    transform: translateX(-50%, -50%);\r\n    opacity: 1;\r\n  }\r\n}\r\n\r\n@keyframes slideOutToLeft {\r\n  0% {\r\n    transform: translateX(-50%, -50%);\r\n    opacity: 1;\r\n  }\r\n  100% {\r\n    transform: translate(-150%, -50%);\r\n    opacity: 0;\r\n  }\r\n}\r\n\r\n.CP_cardspot {\r\n  width: 150px;\r\n  aspect-ratio: 1/1.5;\r\n  border: 1px solid rgb(211, 211, 211);\r\n  background-color: white;\r\n  border-radius: 5px;\r\n  position: relative;\r\n  top: 50%;\r\n  left: 50%;\r\n  transform: translate(-50%, -50%);\r\n  box-shadow: 8px 3px rgba(0, 0, 0, 125);\r\n  transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;\r\n}\r\n\r\n.CP_cardspot:hover {\r\n  transform: translate(-52%, -52%);\r\n  box-shadow: 15px 10px rgba(0, 0, 0, 125);\r\n}\r\n\r\n.CPspot1 {\r\n  grid-column-start: 2;\r\n  grid-column-end: span 1;\r\n  grid-row-start: 2;\r\n  grid-row-end: span 1;\r\n}\r\n\r\n.CPspot2 {\r\n  grid-column-start: 4;\r\n  grid-column-end: span 1;\r\n  grid-row-start: 2;\r\n  grid-row-end: span 1;\r\n}\r\n\r\n.CPspot3 {\r\n  grid-column-start: 6;\r\n  grid-column-end: span 1;\r\n  grid-row-start: 2;\r\n  grid-row-end: span 1;\r\n}\r\n\r\n.CPspot4 {\r\n  grid-column-start: 2;\r\n  grid-column-end: span 1;\r\n  grid-row-start: 4;\r\n  grid-row-end: span 1;\r\n}\r\n\r\n.CPspot5 {\r\n  grid-column-start: 4;\r\n  grid-column-end: span 1;\r\n  grid-row-start: 4;\r\n  grid-row-end: span 1;\r\n}\r\n\r\n.CPspot6 {\r\n  grid-column-start: 6;\r\n  grid-column-end: span 1;\r\n  grid-row-start: 4;\r\n  grid-row-end: span 1;\r\n}\r\n\r\n/* Modal Stylings */\r\n\r\n.CP_modal_ack {\r\n  position: fixed;\r\n  top: 0;\r\n  left: 0;\r\n  width: var(--game-width);\r\n  height: var(--game-height);\r\n  z-index: 3;\r\n}\r\n\r\n.CP_Modal_Inner {\r\n  position: fixed;\r\n  top: 50%;\r\n  left: 50%;\r\n  transform: translate(-50%, -50%);\r\n  width: 500px;\r\n  height: 450px;\r\n  background-image: linear-gradient(to bottom right, var(--background-start), var(--background-end));\r\n  border: 15px solid;\r\n  border-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_0___ + ");\r\n  border-image-slice: 15;\r\n  background-image: linear-gradient(to bottom right, var(--background-start), var(--background-end));\r\n  border-radius: 20px;\r\n}\r\n\r\n.CP_Modaltitle {\r\n  position: fixed;\r\n  top: 10%;\r\n  left: 50%;\r\n  transform: translateX(-50%);\r\n  width: 400px;\r\n  text-align: center;\r\n}\r\n\r\n.CP_buttonflex {\r\n  position: fixed;\r\n  top: 80%;\r\n  left: 50%;\r\n  transform: translateX(-50%);\r\n  display: flex;\r\n  width: 350px;\r\n  height: 50px;\r\n  justify-content: space-evenly;\r\n  align-content: center;\r\n}\r\n\r\n.CP_backgroundtint {\r\n  position: fixed;\r\n  top: 0;\r\n  left: 0;\r\n  width: var(--game-width);\r\n  height: var(--game-height);\r\n  background-color: rgb(211, 211, 211);\r\n  opacity: 0.6;\r\n}\r\n", "",{"version":3,"sources":["webpack://./src/styles/cardPool.css"],"names":[],"mappings":"AAAA;EACE,kBAAkB;EAClB,OAAO;EACP,QAAQ;EACR,wBAAwB;EACxB,0BAA0B;EAC1B,cAAc;EACd,WAAW;AACb;;AAEA;EACE,eAAe;EACf,kBAAkB;EAClB,qDAAyC;EACzC,sBAAsB;EACtB,kGAAkG;EAClG,mBAAmB;;EAEnB,QAAQ;EACR,SAAS;EACT,gCAAgC;;EAEhC,YAAY;EACZ,aAAa;EACb,aAAa;EACb,0CAA0C;EAC1C,sDAAsD;EACtD,yBAAyB;EACzB,iDAAiD;AACnD;;AAEA;EACE,gDAAgD;AAClD;;AAEA;EACE;IACE,iCAAiC;IACjC,UAAU;EACZ;EACA;IACE,iCAAiC;IACjC,UAAU;EACZ;AACF;;AAEA;EACE;IACE,iCAAiC;IACjC,UAAU;EACZ;EACA;IACE,iCAAiC;IACjC,UAAU;EACZ;AACF;;AAEA;EACE,YAAY;EACZ,mBAAmB;EACnB,oCAAoC;EACpC,uBAAuB;EACvB,kBAAkB;EAClB,kBAAkB;EAClB,QAAQ;EACR,SAAS;EACT,gCAAgC;EAChC,sCAAsC;EACtC,mEAAmE;AACrE;;AAEA;EACE,gCAAgC;EAChC,wCAAwC;AAC1C;;AAEA;EACE,oBAAoB;EACpB,uBAAuB;EACvB,iBAAiB;EACjB,oBAAoB;AACtB;;AAEA;EACE,oBAAoB;EACpB,uBAAuB;EACvB,iBAAiB;EACjB,oBAAoB;AACtB;;AAEA;EACE,oBAAoB;EACpB,uBAAuB;EACvB,iBAAiB;EACjB,oBAAoB;AACtB;;AAEA;EACE,oBAAoB;EACpB,uBAAuB;EACvB,iBAAiB;EACjB,oBAAoB;AACtB;;AAEA;EACE,oBAAoB;EACpB,uBAAuB;EACvB,iBAAiB;EACjB,oBAAoB;AACtB;;AAEA;EACE,oBAAoB;EACpB,uBAAuB;EACvB,iBAAiB;EACjB,oBAAoB;AACtB;;AAEA,mBAAmB;;AAEnB;EACE,eAAe;EACf,MAAM;EACN,OAAO;EACP,wBAAwB;EACxB,0BAA0B;EAC1B,UAAU;AACZ;;AAEA;EACE,eAAe;EACf,QAAQ;EACR,SAAS;EACT,gCAAgC;EAChC,YAAY;EACZ,aAAa;EACb,kGAAkG;EAClG,kBAAkB;EAClB,qDAAyC;EACzC,sBAAsB;EACtB,kGAAkG;EAClG,mBAAmB;AACrB;;AAEA;EACE,eAAe;EACf,QAAQ;EACR,SAAS;EACT,2BAA2B;EAC3B,YAAY;EACZ,kBAAkB;AACpB;;AAEA;EACE,eAAe;EACf,QAAQ;EACR,SAAS;EACT,2BAA2B;EAC3B,aAAa;EACb,YAAY;EACZ,YAAY;EACZ,6BAA6B;EAC7B,qBAAqB;AACvB;;AAEA;EACE,eAAe;EACf,MAAM;EACN,OAAO;EACP,wBAAwB;EACxB,0BAA0B;EAC1B,oCAAoC;EACpC,YAAY;AACd","sourcesContent":[".CP_container {\r\n  position: relative;\r\n  top: 0%;\r\n  left: 0%;\r\n  width: var(--game-width);\r\n  height: var(--game-height);\r\n  display: block;\r\n  z-index: 18;\r\n}\r\n\r\n.CP_CardModal {\r\n  position: fixed;\r\n  border: 15px solid;\r\n  border-image: url(\"../assets/border.svg\");\r\n  border-image-slice: 15;\r\n  background-image: linear-gradient(to bottom right, var(--background-start), var(--background-end));\r\n  border-radius: 20px;\r\n\r\n  top: 50%;\r\n  left: 50%;\r\n  transform: translate(-50%, -50%);\r\n\r\n  width: 750px;\r\n  height: 525px;\r\n  display: grid;\r\n  grid-template-rows: 10px 1fr 10px 1fr 10px;\r\n  grid-template-columns: 10px 1fr 10px 1fr 10px 1fr 10px;\r\n  box-shadow: 5px 5px black;\r\n  animation: 0.75s ease-in-out 0s 1 slideInFromLeft;\r\n}\r\n\r\n.exit {\r\n  animation: 0.75s ease-in-out 0s 1 slideOutToLeft;\r\n}\r\n\r\n@keyframes slideInFromLeft {\r\n  0% {\r\n    transform: translate(-150%, -50%);\r\n    opacity: 0;\r\n  }\r\n  100% {\r\n    transform: translateX(-50%, -50%);\r\n    opacity: 1;\r\n  }\r\n}\r\n\r\n@keyframes slideOutToLeft {\r\n  0% {\r\n    transform: translateX(-50%, -50%);\r\n    opacity: 1;\r\n  }\r\n  100% {\r\n    transform: translate(-150%, -50%);\r\n    opacity: 0;\r\n  }\r\n}\r\n\r\n.CP_cardspot {\r\n  width: 150px;\r\n  aspect-ratio: 1/1.5;\r\n  border: 1px solid rgb(211, 211, 211);\r\n  background-color: white;\r\n  border-radius: 5px;\r\n  position: relative;\r\n  top: 50%;\r\n  left: 50%;\r\n  transform: translate(-50%, -50%);\r\n  box-shadow: 8px 3px rgba(0, 0, 0, 125);\r\n  transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;\r\n}\r\n\r\n.CP_cardspot:hover {\r\n  transform: translate(-52%, -52%);\r\n  box-shadow: 15px 10px rgba(0, 0, 0, 125);\r\n}\r\n\r\n.CPspot1 {\r\n  grid-column-start: 2;\r\n  grid-column-end: span 1;\r\n  grid-row-start: 2;\r\n  grid-row-end: span 1;\r\n}\r\n\r\n.CPspot2 {\r\n  grid-column-start: 4;\r\n  grid-column-end: span 1;\r\n  grid-row-start: 2;\r\n  grid-row-end: span 1;\r\n}\r\n\r\n.CPspot3 {\r\n  grid-column-start: 6;\r\n  grid-column-end: span 1;\r\n  grid-row-start: 2;\r\n  grid-row-end: span 1;\r\n}\r\n\r\n.CPspot4 {\r\n  grid-column-start: 2;\r\n  grid-column-end: span 1;\r\n  grid-row-start: 4;\r\n  grid-row-end: span 1;\r\n}\r\n\r\n.CPspot5 {\r\n  grid-column-start: 4;\r\n  grid-column-end: span 1;\r\n  grid-row-start: 4;\r\n  grid-row-end: span 1;\r\n}\r\n\r\n.CPspot6 {\r\n  grid-column-start: 6;\r\n  grid-column-end: span 1;\r\n  grid-row-start: 4;\r\n  grid-row-end: span 1;\r\n}\r\n\r\n/* Modal Stylings */\r\n\r\n.CP_modal_ack {\r\n  position: fixed;\r\n  top: 0;\r\n  left: 0;\r\n  width: var(--game-width);\r\n  height: var(--game-height);\r\n  z-index: 3;\r\n}\r\n\r\n.CP_Modal_Inner {\r\n  position: fixed;\r\n  top: 50%;\r\n  left: 50%;\r\n  transform: translate(-50%, -50%);\r\n  width: 500px;\r\n  height: 450px;\r\n  background-image: linear-gradient(to bottom right, var(--background-start), var(--background-end));\r\n  border: 15px solid;\r\n  border-image: url(\"../assets/border.svg\");\r\n  border-image-slice: 15;\r\n  background-image: linear-gradient(to bottom right, var(--background-start), var(--background-end));\r\n  border-radius: 20px;\r\n}\r\n\r\n.CP_Modaltitle {\r\n  position: fixed;\r\n  top: 10%;\r\n  left: 50%;\r\n  transform: translateX(-50%);\r\n  width: 400px;\r\n  text-align: center;\r\n}\r\n\r\n.CP_buttonflex {\r\n  position: fixed;\r\n  top: 80%;\r\n  left: 50%;\r\n  transform: translateX(-50%);\r\n  display: flex;\r\n  width: 350px;\r\n  height: 50px;\r\n  justify-content: space-evenly;\r\n  align-content: center;\r\n}\r\n\r\n.CP_backgroundtint {\r\n  position: fixed;\r\n  top: 0;\r\n  left: 0;\r\n  width: var(--game-width);\r\n  height: var(--game-height);\r\n  background-color: rgb(211, 211, 211);\r\n  opacity: 0.6;\r\n}\r\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./src/styles/charscreen.css":
/*!*************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/styles/charscreen.css ***!
  \*************************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/getUrl.js */ "./node_modules/css-loader/dist/runtime/getUrl.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__);
// Imports



var ___CSS_LOADER_URL_IMPORT_0___ = new URL(/* asset import */ __webpack_require__(/*! ../assets/border.svg */ "./src/assets/border.svg"), __webpack_require__.b);
var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
var ___CSS_LOADER_URL_REPLACEMENT_0___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_0___);
// Module
___CSS_LOADER_EXPORT___.push([module.id, ".charscreentitle {\r\n  position: relative;\r\n  top: 100px;\r\n  margin: 0 auto;\r\n  bottom: 600px;\r\n  text-align: center;\r\n  text-shadow: 2px 2px black;\r\n}\r\n\r\n.charscreenContainer {\r\n  position: relative;\r\n  top: 110px;\r\n  left: 300px;\r\n  width: 640px;\r\n  height: 400px;\r\n  border: 20px solid;\r\n  border-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_0___ + ");\r\n  border-image-slice: 20;\r\n  border-radius: 20px;\r\n}\r\n\r\n.cs_modaldiv {\r\n  width: 640px;\r\n  height: 400px;\r\n  display: grid;\r\n  grid-template-rows: 30px 40px 20px 150px 5px 150px 30px;\r\n  grid-template-columns: 60px 150px 20px 60px 60px 150px 20px 60px 60px;\r\n}\r\n\r\n.cs_modaldiv2 {\r\n  width: 640px;\r\n  height: 400px;\r\n  display: grid;\r\n  grid-template-rows: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;\r\n  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;\r\n}\r\n\r\n.cs_letter {\r\n  text-align: center;\r\n  color: rgb(211, 211, 211);\r\n  width: 40px;\r\n  margin: 0;\r\n  padding: 0;\r\n  text-shadow: 2px 2px black;\r\n}\r\n\r\n.cs_inputsdiv {\r\n  grid-column-start: 2;\r\n  grid-column-end: span 8;\r\n  grid-row-start: 2;\r\n  grid-row-end: span 1;\r\n  display: flex;\r\n  justify-content: space-between;\r\n  align-content: center;\r\n}\r\n\r\n.cs_inputname {\r\n  width: 300px;\r\n  height: 35px;\r\n  border-radius: 10px;\r\n  color: var(--background-start);\r\n  font-size: large;\r\n  text-align: center;\r\n  font-family: demonFont;\r\n  background-color: rgb(211, 211, 211);\r\n  text-transform: uppercase;\r\n}\r\n.switchcontainer {\r\n  width: 200px;\r\n  display: flex;\r\n  flex-wrap: nowrap;\r\n  justify-content: space-between;\r\n}\r\n.cs_MFselectordiv {\r\n  background-color: rgb(211, 211, 211);\r\n  width: 100px;\r\n  height: 40px;\r\n  border-radius: 20px;\r\n  display: flex;\r\n\r\n  align-content: center;\r\n  justify-content: left;\r\n}\r\n\r\n.cs_selectorButton {\r\n  margin-top: 1px;\r\n  margin-left: 5px;\r\n  margin-right: 5px;\r\n  background-image: linear-gradient(to bottom right, var(--background-start), var(--background-end));\r\n  width: 37px;\r\n  height: 37px;\r\n  border-radius: 50%;\r\n  z-index: 2;\r\n  box-shadow: 2px 2px 5px black;\r\n  pointer-events: none;\r\n}\r\n\r\n.barbutton {\r\n  grid-column-start: 2;\r\n  grid-column-end: span 1;\r\n  grid-row-start: 4;\r\n  grid-row-end: span 1;\r\n}\r\n\r\n.wizbutton {\r\n  grid-column-start: 2;\r\n  grid-column-end: span 1;\r\n  grid-row-start: 6;\r\n  grid-row-end: span 1;\r\n}\r\n\r\n.rogbutton {\r\n  grid-column-start: 6;\r\n  grid-column-end: span 1;\r\n  grid-row-start: 4;\r\n  grid-row-end: span 1;\r\n}\r\n\r\n.palbutton {\r\n  grid-column-start: 6;\r\n  grid-column-end: span 1;\r\n  grid-row-start: 6;\r\n  grid-row-end: span 1;\r\n}\r\n\r\n.cs_barbarian_sprite {\r\n  grid-column-start: 4;\r\n  grid-column-end: span 1;\r\n  grid-row-start: 4;\r\n  grid-row-end: span 1;\r\n}\r\n\r\n.cs_wizard_sprite {\r\n  grid-column-start: 4;\r\n  grid-column-end: span 1;\r\n  grid-row-start: 6;\r\n  grid-row-end: span 1;\r\n}\r\n\r\n.cs_rogue_sprite {\r\n  grid-column-start: 8;\r\n  grid-column-end: span 1;\r\n  grid-row-start: 4;\r\n  grid-row-end: span 1;\r\n}\r\n\r\n.cs_paladin_sprite {\r\n  grid-column-start: 8;\r\n  grid-column-end: span 1;\r\n  grid-row-start: 6;\r\n  grid-row-end: span 1;\r\n}\r\n\r\n.csbuttonflex {\r\n  position: relative;\r\n  top: 120px;\r\n  left: 50%;\r\n  transform: translateX(-50%);\r\n  width: 400px;\r\n  height: 60px;\r\n  display: flex;\r\n  justify-content: space-evenly;\r\n  align-content: center;\r\n}\r\n\r\n/* Confirmation Modal stylings*/\r\n\r\n.cs_modal2_title {\r\n  text-align: center;\r\n  font-size: x-large;\r\n  grid-column-start: 2;\r\n  grid-column-end: span 6;\r\n  grid-row-start: 1;\r\n  grid-row-end: span 1;\r\n  text-shadow: 2px 2px black;\r\n}\r\n.cs_modal2_prompt {\r\n  font-size: large;\r\n  text-align: center;\r\n  grid-column-start: 2;\r\n  grid-column-end: span 6;\r\n  grid-row-start: 3;\r\n  grid-row-end: span 1;\r\n  text-transform: uppercase;\r\n  text-shadow: 2px 2px black;\r\n}\r\n.cs_modal2_image {\r\n  grid-column-start: 4;\r\n  grid-column-end: span 2;\r\n  grid-row-start: 4;\r\n  grid-row-end: span 2;\r\n  display: flex;\r\n  justify-content: center;\r\n  align-items: center;\r\n}\r\n.cs_modal2_buttondiv {\r\n  display: flex;\r\n  justify-content: space-evenly;\r\n  align-content: center;\r\n  grid-column-start: 2;\r\n  grid-column-end: span 6;\r\n  grid-row-start: 7;\r\n  grid-row-end: span 1;\r\n  justify-items: center;\r\n}\r\n", "",{"version":3,"sources":["webpack://./src/styles/charscreen.css"],"names":[],"mappings":"AAAA;EACE,kBAAkB;EAClB,UAAU;EACV,cAAc;EACd,aAAa;EACb,kBAAkB;EAClB,0BAA0B;AAC5B;;AAEA;EACE,kBAAkB;EAClB,UAAU;EACV,WAAW;EACX,YAAY;EACZ,aAAa;EACb,kBAAkB;EAClB,qDAAyC;EACzC,sBAAsB;EACtB,mBAAmB;AACrB;;AAEA;EACE,YAAY;EACZ,aAAa;EACb,aAAa;EACb,uDAAuD;EACvD,qEAAqE;AACvE;;AAEA;EACE,YAAY;EACZ,aAAa;EACb,aAAa;EACb,mDAAmD;EACnD,sDAAsD;AACxD;;AAEA;EACE,kBAAkB;EAClB,yBAAyB;EACzB,WAAW;EACX,SAAS;EACT,UAAU;EACV,0BAA0B;AAC5B;;AAEA;EACE,oBAAoB;EACpB,uBAAuB;EACvB,iBAAiB;EACjB,oBAAoB;EACpB,aAAa;EACb,8BAA8B;EAC9B,qBAAqB;AACvB;;AAEA;EACE,YAAY;EACZ,YAAY;EACZ,mBAAmB;EACnB,8BAA8B;EAC9B,gBAAgB;EAChB,kBAAkB;EAClB,sBAAsB;EACtB,oCAAoC;EACpC,yBAAyB;AAC3B;AACA;EACE,YAAY;EACZ,aAAa;EACb,iBAAiB;EACjB,8BAA8B;AAChC;AACA;EACE,oCAAoC;EACpC,YAAY;EACZ,YAAY;EACZ,mBAAmB;EACnB,aAAa;;EAEb,qBAAqB;EACrB,qBAAqB;AACvB;;AAEA;EACE,eAAe;EACf,gBAAgB;EAChB,iBAAiB;EACjB,kGAAkG;EAClG,WAAW;EACX,YAAY;EACZ,kBAAkB;EAClB,UAAU;EACV,6BAA6B;EAC7B,oBAAoB;AACtB;;AAEA;EACE,oBAAoB;EACpB,uBAAuB;EACvB,iBAAiB;EACjB,oBAAoB;AACtB;;AAEA;EACE,oBAAoB;EACpB,uBAAuB;EACvB,iBAAiB;EACjB,oBAAoB;AACtB;;AAEA;EACE,oBAAoB;EACpB,uBAAuB;EACvB,iBAAiB;EACjB,oBAAoB;AACtB;;AAEA;EACE,oBAAoB;EACpB,uBAAuB;EACvB,iBAAiB;EACjB,oBAAoB;AACtB;;AAEA;EACE,oBAAoB;EACpB,uBAAuB;EACvB,iBAAiB;EACjB,oBAAoB;AACtB;;AAEA;EACE,oBAAoB;EACpB,uBAAuB;EACvB,iBAAiB;EACjB,oBAAoB;AACtB;;AAEA;EACE,oBAAoB;EACpB,uBAAuB;EACvB,iBAAiB;EACjB,oBAAoB;AACtB;;AAEA;EACE,oBAAoB;EACpB,uBAAuB;EACvB,iBAAiB;EACjB,oBAAoB;AACtB;;AAEA;EACE,kBAAkB;EAClB,UAAU;EACV,SAAS;EACT,2BAA2B;EAC3B,YAAY;EACZ,YAAY;EACZ,aAAa;EACb,6BAA6B;EAC7B,qBAAqB;AACvB;;AAEA,+BAA+B;;AAE/B;EACE,kBAAkB;EAClB,kBAAkB;EAClB,oBAAoB;EACpB,uBAAuB;EACvB,iBAAiB;EACjB,oBAAoB;EACpB,0BAA0B;AAC5B;AACA;EACE,gBAAgB;EAChB,kBAAkB;EAClB,oBAAoB;EACpB,uBAAuB;EACvB,iBAAiB;EACjB,oBAAoB;EACpB,yBAAyB;EACzB,0BAA0B;AAC5B;AACA;EACE,oBAAoB;EACpB,uBAAuB;EACvB,iBAAiB;EACjB,oBAAoB;EACpB,aAAa;EACb,uBAAuB;EACvB,mBAAmB;AACrB;AACA;EACE,aAAa;EACb,6BAA6B;EAC7B,qBAAqB;EACrB,oBAAoB;EACpB,uBAAuB;EACvB,iBAAiB;EACjB,oBAAoB;EACpB,qBAAqB;AACvB","sourcesContent":[".charscreentitle {\r\n  position: relative;\r\n  top: 100px;\r\n  margin: 0 auto;\r\n  bottom: 600px;\r\n  text-align: center;\r\n  text-shadow: 2px 2px black;\r\n}\r\n\r\n.charscreenContainer {\r\n  position: relative;\r\n  top: 110px;\r\n  left: 300px;\r\n  width: 640px;\r\n  height: 400px;\r\n  border: 20px solid;\r\n  border-image: url(\"../assets/border.svg\");\r\n  border-image-slice: 20;\r\n  border-radius: 20px;\r\n}\r\n\r\n.cs_modaldiv {\r\n  width: 640px;\r\n  height: 400px;\r\n  display: grid;\r\n  grid-template-rows: 30px 40px 20px 150px 5px 150px 30px;\r\n  grid-template-columns: 60px 150px 20px 60px 60px 150px 20px 60px 60px;\r\n}\r\n\r\n.cs_modaldiv2 {\r\n  width: 640px;\r\n  height: 400px;\r\n  display: grid;\r\n  grid-template-rows: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;\r\n  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;\r\n}\r\n\r\n.cs_letter {\r\n  text-align: center;\r\n  color: rgb(211, 211, 211);\r\n  width: 40px;\r\n  margin: 0;\r\n  padding: 0;\r\n  text-shadow: 2px 2px black;\r\n}\r\n\r\n.cs_inputsdiv {\r\n  grid-column-start: 2;\r\n  grid-column-end: span 8;\r\n  grid-row-start: 2;\r\n  grid-row-end: span 1;\r\n  display: flex;\r\n  justify-content: space-between;\r\n  align-content: center;\r\n}\r\n\r\n.cs_inputname {\r\n  width: 300px;\r\n  height: 35px;\r\n  border-radius: 10px;\r\n  color: var(--background-start);\r\n  font-size: large;\r\n  text-align: center;\r\n  font-family: demonFont;\r\n  background-color: rgb(211, 211, 211);\r\n  text-transform: uppercase;\r\n}\r\n.switchcontainer {\r\n  width: 200px;\r\n  display: flex;\r\n  flex-wrap: nowrap;\r\n  justify-content: space-between;\r\n}\r\n.cs_MFselectordiv {\r\n  background-color: rgb(211, 211, 211);\r\n  width: 100px;\r\n  height: 40px;\r\n  border-radius: 20px;\r\n  display: flex;\r\n\r\n  align-content: center;\r\n  justify-content: left;\r\n}\r\n\r\n.cs_selectorButton {\r\n  margin-top: 1px;\r\n  margin-left: 5px;\r\n  margin-right: 5px;\r\n  background-image: linear-gradient(to bottom right, var(--background-start), var(--background-end));\r\n  width: 37px;\r\n  height: 37px;\r\n  border-radius: 50%;\r\n  z-index: 2;\r\n  box-shadow: 2px 2px 5px black;\r\n  pointer-events: none;\r\n}\r\n\r\n.barbutton {\r\n  grid-column-start: 2;\r\n  grid-column-end: span 1;\r\n  grid-row-start: 4;\r\n  grid-row-end: span 1;\r\n}\r\n\r\n.wizbutton {\r\n  grid-column-start: 2;\r\n  grid-column-end: span 1;\r\n  grid-row-start: 6;\r\n  grid-row-end: span 1;\r\n}\r\n\r\n.rogbutton {\r\n  grid-column-start: 6;\r\n  grid-column-end: span 1;\r\n  grid-row-start: 4;\r\n  grid-row-end: span 1;\r\n}\r\n\r\n.palbutton {\r\n  grid-column-start: 6;\r\n  grid-column-end: span 1;\r\n  grid-row-start: 6;\r\n  grid-row-end: span 1;\r\n}\r\n\r\n.cs_barbarian_sprite {\r\n  grid-column-start: 4;\r\n  grid-column-end: span 1;\r\n  grid-row-start: 4;\r\n  grid-row-end: span 1;\r\n}\r\n\r\n.cs_wizard_sprite {\r\n  grid-column-start: 4;\r\n  grid-column-end: span 1;\r\n  grid-row-start: 6;\r\n  grid-row-end: span 1;\r\n}\r\n\r\n.cs_rogue_sprite {\r\n  grid-column-start: 8;\r\n  grid-column-end: span 1;\r\n  grid-row-start: 4;\r\n  grid-row-end: span 1;\r\n}\r\n\r\n.cs_paladin_sprite {\r\n  grid-column-start: 8;\r\n  grid-column-end: span 1;\r\n  grid-row-start: 6;\r\n  grid-row-end: span 1;\r\n}\r\n\r\n.csbuttonflex {\r\n  position: relative;\r\n  top: 120px;\r\n  left: 50%;\r\n  transform: translateX(-50%);\r\n  width: 400px;\r\n  height: 60px;\r\n  display: flex;\r\n  justify-content: space-evenly;\r\n  align-content: center;\r\n}\r\n\r\n/* Confirmation Modal stylings*/\r\n\r\n.cs_modal2_title {\r\n  text-align: center;\r\n  font-size: x-large;\r\n  grid-column-start: 2;\r\n  grid-column-end: span 6;\r\n  grid-row-start: 1;\r\n  grid-row-end: span 1;\r\n  text-shadow: 2px 2px black;\r\n}\r\n.cs_modal2_prompt {\r\n  font-size: large;\r\n  text-align: center;\r\n  grid-column-start: 2;\r\n  grid-column-end: span 6;\r\n  grid-row-start: 3;\r\n  grid-row-end: span 1;\r\n  text-transform: uppercase;\r\n  text-shadow: 2px 2px black;\r\n}\r\n.cs_modal2_image {\r\n  grid-column-start: 4;\r\n  grid-column-end: span 2;\r\n  grid-row-start: 4;\r\n  grid-row-end: span 2;\r\n  display: flex;\r\n  justify-content: center;\r\n  align-items: center;\r\n}\r\n.cs_modal2_buttondiv {\r\n  display: flex;\r\n  justify-content: space-evenly;\r\n  align-content: center;\r\n  grid-column-start: 2;\r\n  grid-column-end: span 6;\r\n  grid-row-start: 7;\r\n  grid-row-end: span 1;\r\n  justify-items: center;\r\n}\r\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./src/styles/chat.css":
/*!*******************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/styles/chat.css ***!
  \*******************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, ".chat_Component {\r\n  position: fixed;\r\n  top: 0;\r\n  left: 0;\r\n  width: 350px;\r\n  height: var(--game-height);\r\n  overflow: hidden;\r\n  pointer-events: all;\r\n  padding: 0;\r\n  z-index: 16;\r\n}\r\n\r\n.chat_messageContainer {\r\n  position: fixed;\r\n  left: 5px;\r\n  top: 5px;\r\n  bottom: 45px;\r\n  width: 350px;\r\n  overflow: hidden;\r\n  z-index: 16;\r\n  padding: 0;\r\n  background-color: var(--chatBG);\r\n  border: 1px solid rgb(221, 221, 221);\r\n  border-radius: 10px;\r\n  opacity: var(--chatOP);\r\n}\r\n\r\n.chat_message_innerContainer {\r\n  position: fixed;\r\n  display: flex;\r\n  overflow: auto;\r\n  flex-direction: column;\r\n  left: 5px;\r\n  top: 5px;\r\n  bottom: 110px;\r\n  width: 350px;\r\n  border-radius: 10px;\r\n  padding: 0;\r\n  z-index: 16;\r\n  scrollbar-color: #6969dd #e0e0e0;\r\n  scrollbar-width: thin;\r\n  scrollbar-gutter: stable;\r\n}\r\n\r\n.chat_message_innerContainer::-webkit-scrollbar-track {\r\n  background: #ddd;\r\n  border-radius: 16px;\r\n}\r\n\r\n.chat_message_innerContainer::-webkit-scrollbar-thumb {\r\n  background: #666;\r\n  border-radius: 16px;\r\n}\r\n\r\n.chat_message_innerContainer::-webkit-scrollbar {\r\n  width: 8px;\r\n}\r\n\r\n.chat_iconContainer {\r\n  position: fixed;\r\n  left: 15px;\r\n  bottom: 10px;\r\n  width: 30px;\r\n  height: 30px;\r\n  cursor: pointer;\r\n  pointer-events: all;\r\n}\r\n\r\n.chat_inputtext {\r\n  font-family: Arial, Helvetica, sans-serif;\r\n  font-weight: bolder;\r\n  font-size: medium;\r\n  border: 1px rgba(255, 255, 255, 0.5) solid;\r\n  text-align: center;\r\n  border-radius: 5px;\r\n  position: absolute;\r\n  left: 5px;\r\n  bottom: 10px;\r\n  width: 300px;\r\n  height: 35px;\r\n  z-index: 16;\r\n}\r\n\r\n.chat_input_icon {\r\n  position: absolute;\r\n  right: 6px;\r\n  bottom: 17px;\r\n  cursor: pointer;\r\n  z-index: 16;\r\n}\r\n\r\n.chat_unreadpill {\r\n  position: fixed;\r\n  left: 35px;\r\n  bottom: 28px;\r\n  width: 20px;\r\n  height: 20px;\r\n  border-radius: 50%;\r\n  background-color: red;\r\n  color: rgb(221, 221, 221);\r\n  font-size: small;\r\n  flex-direction: column;\r\n  display: flex;\r\n  align-content: center;\r\n  justify-content: center;\r\n  cursor: pointer;\r\n  pointer-events: all;\r\n}\r\n.chat_unreadpill > span {\r\n  text-align: center;\r\n}\r\n\r\n/* message type stylings*/\r\n\r\n.chat_system {\r\n  color: rgb(221, 221, 221);\r\n  align-self: center;\r\n  border: solid 1px rgb(221, 221, 221);\r\n  background-color: var(--chatSM);\r\n  border-radius: 10px;\r\n  margin: 3px;\r\n  width: 97%;\r\n  font-size: small;\r\n  font-family: Arial, Helvetica, sans-serif;\r\n  text-align: center;\r\n  z-index: 16;\r\n  text-shadow: 1px 1px black;\r\n}\r\n\r\n.chat_user {\r\n  align-self: flex-start;\r\n  padding-left: 5px;\r\n  color: rgb(221, 221, 221);\r\n  border: solid 1px rgb(221, 221, 221);\r\n  background-color: var(--chatUM);\r\n  border-radius: 10px;\r\n  margin: 3px;\r\n  width: 80%;\r\n  font-size: small;\r\n  font-family: Arial, Helvetica, sans-serif;\r\n  text-align: left;\r\n  z-index: 16;\r\n  text-shadow: 1px 1px black;\r\n}\r\n\r\n.chat_other {\r\n  align-self: flex-end;\r\n  color: rgb(221, 221, 221);\r\n  border: solid 1px rgb(221, 221, 221);\r\n  background-color: var(--chatOM);\r\n  border-radius: 10px;\r\n  margin: 3px;\r\n  width: 80%;\r\n  font-size: small;\r\n  font-family: Arial, Helvetica, sans-serif;\r\n  text-align: right;\r\n  padding-right: 5px;\r\n  z-index: 16;\r\n  text-shadow: 1px 1px black;\r\n}\r\n", "",{"version":3,"sources":["webpack://./src/styles/chat.css"],"names":[],"mappings":"AAAA;EACE,eAAe;EACf,MAAM;EACN,OAAO;EACP,YAAY;EACZ,0BAA0B;EAC1B,gBAAgB;EAChB,mBAAmB;EACnB,UAAU;EACV,WAAW;AACb;;AAEA;EACE,eAAe;EACf,SAAS;EACT,QAAQ;EACR,YAAY;EACZ,YAAY;EACZ,gBAAgB;EAChB,WAAW;EACX,UAAU;EACV,+BAA+B;EAC/B,oCAAoC;EACpC,mBAAmB;EACnB,sBAAsB;AACxB;;AAEA;EACE,eAAe;EACf,aAAa;EACb,cAAc;EACd,sBAAsB;EACtB,SAAS;EACT,QAAQ;EACR,aAAa;EACb,YAAY;EACZ,mBAAmB;EACnB,UAAU;EACV,WAAW;EACX,gCAAgC;EAChC,qBAAqB;EACrB,wBAAwB;AAC1B;;AAEA;EACE,gBAAgB;EAChB,mBAAmB;AACrB;;AAEA;EACE,gBAAgB;EAChB,mBAAmB;AACrB;;AAEA;EACE,UAAU;AACZ;;AAEA;EACE,eAAe;EACf,UAAU;EACV,YAAY;EACZ,WAAW;EACX,YAAY;EACZ,eAAe;EACf,mBAAmB;AACrB;;AAEA;EACE,yCAAyC;EACzC,mBAAmB;EACnB,iBAAiB;EACjB,0CAA0C;EAC1C,kBAAkB;EAClB,kBAAkB;EAClB,kBAAkB;EAClB,SAAS;EACT,YAAY;EACZ,YAAY;EACZ,YAAY;EACZ,WAAW;AACb;;AAEA;EACE,kBAAkB;EAClB,UAAU;EACV,YAAY;EACZ,eAAe;EACf,WAAW;AACb;;AAEA;EACE,eAAe;EACf,UAAU;EACV,YAAY;EACZ,WAAW;EACX,YAAY;EACZ,kBAAkB;EAClB,qBAAqB;EACrB,yBAAyB;EACzB,gBAAgB;EAChB,sBAAsB;EACtB,aAAa;EACb,qBAAqB;EACrB,uBAAuB;EACvB,eAAe;EACf,mBAAmB;AACrB;AACA;EACE,kBAAkB;AACpB;;AAEA,yBAAyB;;AAEzB;EACE,yBAAyB;EACzB,kBAAkB;EAClB,oCAAoC;EACpC,+BAA+B;EAC/B,mBAAmB;EACnB,WAAW;EACX,UAAU;EACV,gBAAgB;EAChB,yCAAyC;EACzC,kBAAkB;EAClB,WAAW;EACX,0BAA0B;AAC5B;;AAEA;EACE,sBAAsB;EACtB,iBAAiB;EACjB,yBAAyB;EACzB,oCAAoC;EACpC,+BAA+B;EAC/B,mBAAmB;EACnB,WAAW;EACX,UAAU;EACV,gBAAgB;EAChB,yCAAyC;EACzC,gBAAgB;EAChB,WAAW;EACX,0BAA0B;AAC5B;;AAEA;EACE,oBAAoB;EACpB,yBAAyB;EACzB,oCAAoC;EACpC,+BAA+B;EAC/B,mBAAmB;EACnB,WAAW;EACX,UAAU;EACV,gBAAgB;EAChB,yCAAyC;EACzC,iBAAiB;EACjB,kBAAkB;EAClB,WAAW;EACX,0BAA0B;AAC5B","sourcesContent":[".chat_Component {\r\n  position: fixed;\r\n  top: 0;\r\n  left: 0;\r\n  width: 350px;\r\n  height: var(--game-height);\r\n  overflow: hidden;\r\n  pointer-events: all;\r\n  padding: 0;\r\n  z-index: 16;\r\n}\r\n\r\n.chat_messageContainer {\r\n  position: fixed;\r\n  left: 5px;\r\n  top: 5px;\r\n  bottom: 45px;\r\n  width: 350px;\r\n  overflow: hidden;\r\n  z-index: 16;\r\n  padding: 0;\r\n  background-color: var(--chatBG);\r\n  border: 1px solid rgb(221, 221, 221);\r\n  border-radius: 10px;\r\n  opacity: var(--chatOP);\r\n}\r\n\r\n.chat_message_innerContainer {\r\n  position: fixed;\r\n  display: flex;\r\n  overflow: auto;\r\n  flex-direction: column;\r\n  left: 5px;\r\n  top: 5px;\r\n  bottom: 110px;\r\n  width: 350px;\r\n  border-radius: 10px;\r\n  padding: 0;\r\n  z-index: 16;\r\n  scrollbar-color: #6969dd #e0e0e0;\r\n  scrollbar-width: thin;\r\n  scrollbar-gutter: stable;\r\n}\r\n\r\n.chat_message_innerContainer::-webkit-scrollbar-track {\r\n  background: #ddd;\r\n  border-radius: 16px;\r\n}\r\n\r\n.chat_message_innerContainer::-webkit-scrollbar-thumb {\r\n  background: #666;\r\n  border-radius: 16px;\r\n}\r\n\r\n.chat_message_innerContainer::-webkit-scrollbar {\r\n  width: 8px;\r\n}\r\n\r\n.chat_iconContainer {\r\n  position: fixed;\r\n  left: 15px;\r\n  bottom: 10px;\r\n  width: 30px;\r\n  height: 30px;\r\n  cursor: pointer;\r\n  pointer-events: all;\r\n}\r\n\r\n.chat_inputtext {\r\n  font-family: Arial, Helvetica, sans-serif;\r\n  font-weight: bolder;\r\n  font-size: medium;\r\n  border: 1px rgba(255, 255, 255, 0.5) solid;\r\n  text-align: center;\r\n  border-radius: 5px;\r\n  position: absolute;\r\n  left: 5px;\r\n  bottom: 10px;\r\n  width: 300px;\r\n  height: 35px;\r\n  z-index: 16;\r\n}\r\n\r\n.chat_input_icon {\r\n  position: absolute;\r\n  right: 6px;\r\n  bottom: 17px;\r\n  cursor: pointer;\r\n  z-index: 16;\r\n}\r\n\r\n.chat_unreadpill {\r\n  position: fixed;\r\n  left: 35px;\r\n  bottom: 28px;\r\n  width: 20px;\r\n  height: 20px;\r\n  border-radius: 50%;\r\n  background-color: red;\r\n  color: rgb(221, 221, 221);\r\n  font-size: small;\r\n  flex-direction: column;\r\n  display: flex;\r\n  align-content: center;\r\n  justify-content: center;\r\n  cursor: pointer;\r\n  pointer-events: all;\r\n}\r\n.chat_unreadpill > span {\r\n  text-align: center;\r\n}\r\n\r\n/* message type stylings*/\r\n\r\n.chat_system {\r\n  color: rgb(221, 221, 221);\r\n  align-self: center;\r\n  border: solid 1px rgb(221, 221, 221);\r\n  background-color: var(--chatSM);\r\n  border-radius: 10px;\r\n  margin: 3px;\r\n  width: 97%;\r\n  font-size: small;\r\n  font-family: Arial, Helvetica, sans-serif;\r\n  text-align: center;\r\n  z-index: 16;\r\n  text-shadow: 1px 1px black;\r\n}\r\n\r\n.chat_user {\r\n  align-self: flex-start;\r\n  padding-left: 5px;\r\n  color: rgb(221, 221, 221);\r\n  border: solid 1px rgb(221, 221, 221);\r\n  background-color: var(--chatUM);\r\n  border-radius: 10px;\r\n  margin: 3px;\r\n  width: 80%;\r\n  font-size: small;\r\n  font-family: Arial, Helvetica, sans-serif;\r\n  text-align: left;\r\n  z-index: 16;\r\n  text-shadow: 1px 1px black;\r\n}\r\n\r\n.chat_other {\r\n  align-self: flex-end;\r\n  color: rgb(221, 221, 221);\r\n  border: solid 1px rgb(221, 221, 221);\r\n  background-color: var(--chatOM);\r\n  border-radius: 10px;\r\n  margin: 3px;\r\n  width: 80%;\r\n  font-size: small;\r\n  font-family: Arial, Helvetica, sans-serif;\r\n  text-align: right;\r\n  padding-right: 5px;\r\n  z-index: 16;\r\n  text-shadow: 1px 1px black;\r\n}\r\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./src/styles/game.css":
/*!*******************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/styles/game.css ***!
  \*******************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, ".game_menu_icon {\r\n  position: fixed;\r\n  top: 5px;\r\n  right: 5px;\r\n  width: 20px;\r\n  height: 20px;\r\n  cursor: pointer;\r\n}\r\n", "",{"version":3,"sources":["webpack://./src/styles/game.css"],"names":[],"mappings":"AAAA;EACE,eAAe;EACf,QAAQ;EACR,UAAU;EACV,WAAW;EACX,YAAY;EACZ,eAAe;AACjB","sourcesContent":[".game_menu_icon {\r\n  position: fixed;\r\n  top: 5px;\r\n  right: 5px;\r\n  width: 20px;\r\n  height: 20px;\r\n  cursor: pointer;\r\n}\r\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./src/styles/gameContainer.css":
/*!****************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/styles/gameContainer.css ***!
  \****************************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, ".lobbyscreen {\r\n  position: absolute;\r\n  top: 0;\r\n  left: 0;\r\n  width: var(--game-width);\r\n  height: var(--game-height);\r\n  font-family: demonFont;\r\n  font-size: xx-large;\r\n  color: white;\r\n}\r\n\r\n.titlescreen {\r\n  position: absolute;\r\n  top: 0;\r\n  left: 0;\r\n  width: var(--game-width);\r\n  height: var(--game-height);\r\n  font-family: demonFont;\r\n  font-size: xx-large;\r\n  color: white;\r\n}\r\n\r\n.charscreen {\r\n  position: absolute;\r\n  top: 0;\r\n  left: 0;\r\n  width: var(--game-width);\r\n  height: var(--game-height);\r\n  font-family: demonFont;\r\n  font-size: xx-large;\r\n  color: white;\r\n}\r\n\r\n.gamescreen {\r\n  position: absolute;\r\n  top: 0;\r\n  left: 0;\r\n  width: var(--game-width);\r\n  height: var(--game-height);\r\n  font-family: demonFont;\r\n  font-size: xx-large;\r\n  color: white;\r\n}\r\n\r\n.stagingScreen {\r\n  position: absolute;\r\n  top: 0;\r\n  left: 0;\r\n  width: var(--game-width);\r\n  height: var(--game-height);\r\n  font-family: demonFont;\r\n  font-size: xx-large;\r\n  color: white;\r\n}\r\n", "",{"version":3,"sources":["webpack://./src/styles/gameContainer.css"],"names":[],"mappings":"AAAA;EACE,kBAAkB;EAClB,MAAM;EACN,OAAO;EACP,wBAAwB;EACxB,0BAA0B;EAC1B,sBAAsB;EACtB,mBAAmB;EACnB,YAAY;AACd;;AAEA;EACE,kBAAkB;EAClB,MAAM;EACN,OAAO;EACP,wBAAwB;EACxB,0BAA0B;EAC1B,sBAAsB;EACtB,mBAAmB;EACnB,YAAY;AACd;;AAEA;EACE,kBAAkB;EAClB,MAAM;EACN,OAAO;EACP,wBAAwB;EACxB,0BAA0B;EAC1B,sBAAsB;EACtB,mBAAmB;EACnB,YAAY;AACd;;AAEA;EACE,kBAAkB;EAClB,MAAM;EACN,OAAO;EACP,wBAAwB;EACxB,0BAA0B;EAC1B,sBAAsB;EACtB,mBAAmB;EACnB,YAAY;AACd;;AAEA;EACE,kBAAkB;EAClB,MAAM;EACN,OAAO;EACP,wBAAwB;EACxB,0BAA0B;EAC1B,sBAAsB;EACtB,mBAAmB;EACnB,YAAY;AACd","sourcesContent":[".lobbyscreen {\r\n  position: absolute;\r\n  top: 0;\r\n  left: 0;\r\n  width: var(--game-width);\r\n  height: var(--game-height);\r\n  font-family: demonFont;\r\n  font-size: xx-large;\r\n  color: white;\r\n}\r\n\r\n.titlescreen {\r\n  position: absolute;\r\n  top: 0;\r\n  left: 0;\r\n  width: var(--game-width);\r\n  height: var(--game-height);\r\n  font-family: demonFont;\r\n  font-size: xx-large;\r\n  color: white;\r\n}\r\n\r\n.charscreen {\r\n  position: absolute;\r\n  top: 0;\r\n  left: 0;\r\n  width: var(--game-width);\r\n  height: var(--game-height);\r\n  font-family: demonFont;\r\n  font-size: xx-large;\r\n  color: white;\r\n}\r\n\r\n.gamescreen {\r\n  position: absolute;\r\n  top: 0;\r\n  left: 0;\r\n  width: var(--game-width);\r\n  height: var(--game-height);\r\n  font-family: demonFont;\r\n  font-size: xx-large;\r\n  color: white;\r\n}\r\n\r\n.stagingScreen {\r\n  position: absolute;\r\n  top: 0;\r\n  left: 0;\r\n  width: var(--game-width);\r\n  height: var(--game-height);\r\n  font-family: demonFont;\r\n  font-size: xx-large;\r\n  color: white;\r\n}\r\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./src/styles/globals.css":
/*!**********************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/styles/globals.css ***!
  \**********************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/getUrl.js */ "./node_modules/css-loader/dist/runtime/getUrl.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__);
// Imports



var ___CSS_LOADER_URL_IMPORT_0___ = new URL(/* asset import */ __webpack_require__(/*! ../assets/KELMSCOT.TTF */ "./src/assets/KELMSCOT.TTF"), __webpack_require__.b);
var ___CSS_LOADER_URL_IMPORT_1___ = new URL(/* asset import */ __webpack_require__(/*! ../assets/border.svg */ "./src/assets/border.svg"), __webpack_require__.b);
var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
var ___CSS_LOADER_URL_REPLACEMENT_0___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_0___);
var ___CSS_LOADER_URL_REPLACEMENT_1___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_1___);
// Module
___CSS_LOADER_EXPORT___.push([module.id, "@font-face {\r\n  font-family: demonFont;\r\n  src: url(" + ___CSS_LOADER_URL_REPLACEMENT_0___ + ");\r\n}\r\n\r\n:root {\r\n  --game-width: 1280px;\r\n  --game-height: 720px;\r\n  --background-start: #2c34d6;\r\n  --background-end: #101f6b;\r\n  --angle1: 0;\r\n  --angle2: 0;\r\n  --angle3: 0;\r\n  --angle4: 0;\r\n  --chatUM: #8bae1f;\r\n  --chatOM: #be53f3;\r\n  --chatSM: #008b8b;\r\n  --chatBG: #000000;\r\n  --chatOP: 0.5;\r\n}\r\n\r\nbody {\r\n  background-color: rgb(60, 69, 69);\r\n  box-sizing: border-box;\r\n  padding: 0;\r\n  margin: 0%;\r\n}\r\n\r\n.app {\r\n  width: var(--game-width);\r\n  height: var(--game-height);\r\n  margin: 0 auto;\r\n  border: 15px solid;\r\n  border-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_1___ + ");\r\n  border-image-slice: 15;\r\n  transform: translateY(10%);\r\n  padding: 0;\r\n  background-image: linear-gradient(to bottom right, var(--background-start), var(--background-end));\r\n  border-radius: 25px;\r\n  overflow: hidden;\r\n}\r\n\r\n.container {\r\n  width: var(--game-width);\r\n  height: var(--game-height);\r\n  padding: 0;\r\n}\r\n", "",{"version":3,"sources":["webpack://./src/styles/globals.css"],"names":[],"mappings":"AAAA;EACE,sBAAsB;EACtB,4CAAkC;AACpC;;AAEA;EACE,oBAAoB;EACpB,oBAAoB;EACpB,2BAA2B;EAC3B,yBAAyB;EACzB,WAAW;EACX,WAAW;EACX,WAAW;EACX,WAAW;EACX,iBAAiB;EACjB,iBAAiB;EACjB,iBAAiB;EACjB,iBAAiB;EACjB,aAAa;AACf;;AAEA;EACE,iCAAiC;EACjC,sBAAsB;EACtB,UAAU;EACV,UAAU;AACZ;;AAEA;EACE,wBAAwB;EACxB,0BAA0B;EAC1B,cAAc;EACd,kBAAkB;EAClB,qDAAyC;EACzC,sBAAsB;EACtB,0BAA0B;EAC1B,UAAU;EACV,kGAAkG;EAClG,mBAAmB;EACnB,gBAAgB;AAClB;;AAEA;EACE,wBAAwB;EACxB,0BAA0B;EAC1B,UAAU;AACZ","sourcesContent":["@font-face {\r\n  font-family: demonFont;\r\n  src: url(\"../assets/KELMSCOT.TTF\");\r\n}\r\n\r\n:root {\r\n  --game-width: 1280px;\r\n  --game-height: 720px;\r\n  --background-start: #2c34d6;\r\n  --background-end: #101f6b;\r\n  --angle1: 0;\r\n  --angle2: 0;\r\n  --angle3: 0;\r\n  --angle4: 0;\r\n  --chatUM: #8bae1f;\r\n  --chatOM: #be53f3;\r\n  --chatSM: #008b8b;\r\n  --chatBG: #000000;\r\n  --chatOP: 0.5;\r\n}\r\n\r\nbody {\r\n  background-color: rgb(60, 69, 69);\r\n  box-sizing: border-box;\r\n  padding: 0;\r\n  margin: 0%;\r\n}\r\n\r\n.app {\r\n  width: var(--game-width);\r\n  height: var(--game-height);\r\n  margin: 0 auto;\r\n  border: 15px solid;\r\n  border-image: url(\"../assets/border.svg\");\r\n  border-image-slice: 15;\r\n  transform: translateY(10%);\r\n  padding: 0;\r\n  background-image: linear-gradient(to bottom right, var(--background-start), var(--background-end));\r\n  border-radius: 25px;\r\n  overflow: hidden;\r\n}\r\n\r\n.container {\r\n  width: var(--game-width);\r\n  height: var(--game-height);\r\n  padding: 0;\r\n}\r\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./src/styles/hand.css":
/*!*******************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/styles/hand.css ***!
  \*******************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/getUrl.js */ "./node_modules/css-loader/dist/runtime/getUrl.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__);
// Imports



var ___CSS_LOADER_URL_IMPORT_0___ = new URL(/* asset import */ __webpack_require__(/*! ../assets/border.svg */ "./src/assets/border.svg"), __webpack_require__.b);
var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
var ___CSS_LOADER_URL_REPLACEMENT_0___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_0___);
// Module
___CSS_LOADER_EXPORT___.push([module.id, ".hand_blurdiv {\r\n  min-width: var(--game-width);\r\n  min-height: var(--game-height);\r\n  position: absolute;\r\n  top: 0%;\r\n  left: 0%;\r\n  backdrop-filter: blur(4px);\r\n  z-index: 16;\r\n  background-color: rgba(0, 0, 0, 0.8);\r\n}\r\n\r\n.hand_container {\r\n  min-width: 100%;\r\n  min-height: 230px;\r\n  position: fixed;\r\n  top: 59%;\r\n  left: 50%;\r\n  transform: translate(-50%, -50%);\r\n  z-index: 16;\r\n}\r\n\r\n.hand {\r\n  position: absolute;\r\n  width: 800px;\r\n  height: 150%;\r\n  display: flex;\r\n  justify-content: center;\r\n  align-items: baseline;\r\n  flex-wrap: wrap-reverse;\r\n  row-gap: 10px;\r\n  column-gap: 5px;\r\n  bottom: 32%;\r\n  left: 50%;\r\n  transform: translateX(-50%);\r\n}\r\n\r\n.footer {\r\n  position: absolute;\r\n  width: 800px;\r\n  height: 8%;\r\n  bottom: 40px;\r\n  left: 50%;\r\n  transform: translateX(-50%);\r\n  border: 5px solid;\r\n  border-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_0___ + ");\r\n  border-image-slice: 25;\r\n  border-radius: 25px;\r\n  box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.5);\r\n  text-align: center;\r\n  font-size: medium;\r\n  text-shadow: 1px 1px black;\r\n}\r\n\r\n.card_done_button {\r\n  position: absolute;\r\n  top: 40%;\r\n  right: -20%;\r\n  transform: translateY(-50%);\r\n}\r\n", "",{"version":3,"sources":["webpack://./src/styles/hand.css"],"names":[],"mappings":"AAAA;EACE,4BAA4B;EAC5B,8BAA8B;EAC9B,kBAAkB;EAClB,OAAO;EACP,QAAQ;EACR,0BAA0B;EAC1B,WAAW;EACX,oCAAoC;AACtC;;AAEA;EACE,eAAe;EACf,iBAAiB;EACjB,eAAe;EACf,QAAQ;EACR,SAAS;EACT,gCAAgC;EAChC,WAAW;AACb;;AAEA;EACE,kBAAkB;EAClB,YAAY;EACZ,YAAY;EACZ,aAAa;EACb,uBAAuB;EACvB,qBAAqB;EACrB,uBAAuB;EACvB,aAAa;EACb,eAAe;EACf,WAAW;EACX,SAAS;EACT,2BAA2B;AAC7B;;AAEA;EACE,kBAAkB;EAClB,YAAY;EACZ,UAAU;EACV,YAAY;EACZ,SAAS;EACT,2BAA2B;EAC3B,iBAAiB;EACjB,qDAAyC;EACzC,sBAAsB;EACtB,mBAAmB;EACnB,0CAA0C;EAC1C,kBAAkB;EAClB,iBAAiB;EACjB,0BAA0B;AAC5B;;AAEA;EACE,kBAAkB;EAClB,QAAQ;EACR,WAAW;EACX,2BAA2B;AAC7B","sourcesContent":[".hand_blurdiv {\r\n  min-width: var(--game-width);\r\n  min-height: var(--game-height);\r\n  position: absolute;\r\n  top: 0%;\r\n  left: 0%;\r\n  backdrop-filter: blur(4px);\r\n  z-index: 16;\r\n  background-color: rgba(0, 0, 0, 0.8);\r\n}\r\n\r\n.hand_container {\r\n  min-width: 100%;\r\n  min-height: 230px;\r\n  position: fixed;\r\n  top: 59%;\r\n  left: 50%;\r\n  transform: translate(-50%, -50%);\r\n  z-index: 16;\r\n}\r\n\r\n.hand {\r\n  position: absolute;\r\n  width: 800px;\r\n  height: 150%;\r\n  display: flex;\r\n  justify-content: center;\r\n  align-items: baseline;\r\n  flex-wrap: wrap-reverse;\r\n  row-gap: 10px;\r\n  column-gap: 5px;\r\n  bottom: 32%;\r\n  left: 50%;\r\n  transform: translateX(-50%);\r\n}\r\n\r\n.footer {\r\n  position: absolute;\r\n  width: 800px;\r\n  height: 8%;\r\n  bottom: 40px;\r\n  left: 50%;\r\n  transform: translateX(-50%);\r\n  border: 5px solid;\r\n  border-image: url(\"../assets/border.svg\");\r\n  border-image-slice: 25;\r\n  border-radius: 25px;\r\n  box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.5);\r\n  text-align: center;\r\n  font-size: medium;\r\n  text-shadow: 1px 1px black;\r\n}\r\n\r\n.card_done_button {\r\n  position: absolute;\r\n  top: 40%;\r\n  right: -20%;\r\n  transform: translateY(-50%);\r\n}\r\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./src/styles/help.css":
/*!*******************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/styles/help.css ***!
  \*******************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/getUrl.js */ "./node_modules/css-loader/dist/runtime/getUrl.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__);
// Imports



var ___CSS_LOADER_URL_IMPORT_0___ = new URL(/* asset import */ __webpack_require__(/*! ../assets/border.svg */ "./src/assets/border.svg"), __webpack_require__.b);
var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
var ___CSS_LOADER_URL_REPLACEMENT_0___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_0___);
// Module
___CSS_LOADER_EXPORT___.push([module.id, ".help_inner_container {\r\n  position: absolute;\r\n  top: 50%;\r\n  left: 50%;\r\n  transform: translate(-50%, -50%);\r\n  width: 800px;\r\n  height: 560px;\r\n  border: 15px solid;\r\n  border-radius: 5px;\r\n  border-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_0___ + ");\r\n  border-image-slice: 15;\r\n  background-image: linear-gradient(to bottom right, var(--background-start), var(--background-end));\r\n  background-size: cover;\r\n  background-repeat: no-repeat;\r\n}\r\n\r\n.help_title {\r\n  position: fixed;\r\n  top: 25px;\r\n  left: 50%;\r\n  transform: translateX(-50%);\r\n  text-shadow: 2px 2px black;\r\n}\r\n\r\n.help_pagenum {\r\n  position: fixed;\r\n  top: 15px;\r\n  right: 10px;\r\n  font-size: medium;\r\n  text-shadow: 1px 1px black;\r\n}\r\n\r\n.help_text {\r\n  position: fixed;\r\n  font-size: large;\r\n  top: 55px;\r\n  left: 25px;\r\n  height: 400px;\r\n  width: 750px;\r\n  word-wrap: normal;\r\n  text-shadow: 1px 1px black;\r\n}\r\n\r\n.help_nav_left {\r\n  position: fixed;\r\n  bottom: 5px;\r\n  left: 5px;\r\n  width: 40px;\r\n  height: 40px;\r\n  border-radius: 50%;\r\n  border: 1px solid transparent;\r\n}\r\n\r\n.help_nav_right {\r\n  position: fixed;\r\n  bottom: 5px;\r\n  right: 5px;\r\n  width: 40px;\r\n  height: 40px;\r\n  transform: rotate(180deg);\r\n  border-radius: 50%;\r\n  border: 1px solid transparent;\r\n}\r\n\r\n.help_nav_left:hover,\r\n.help_nav_right:hover {\r\n  box-shadow: 0px 0px 8px 3px white;\r\n}\r\n", "",{"version":3,"sources":["webpack://./src/styles/help.css"],"names":[],"mappings":"AAAA;EACE,kBAAkB;EAClB,QAAQ;EACR,SAAS;EACT,gCAAgC;EAChC,YAAY;EACZ,aAAa;EACb,kBAAkB;EAClB,kBAAkB;EAClB,qDAAyC;EACzC,sBAAsB;EACtB,kGAAkG;EAClG,sBAAsB;EACtB,4BAA4B;AAC9B;;AAEA;EACE,eAAe;EACf,SAAS;EACT,SAAS;EACT,2BAA2B;EAC3B,0BAA0B;AAC5B;;AAEA;EACE,eAAe;EACf,SAAS;EACT,WAAW;EACX,iBAAiB;EACjB,0BAA0B;AAC5B;;AAEA;EACE,eAAe;EACf,gBAAgB;EAChB,SAAS;EACT,UAAU;EACV,aAAa;EACb,YAAY;EACZ,iBAAiB;EACjB,0BAA0B;AAC5B;;AAEA;EACE,eAAe;EACf,WAAW;EACX,SAAS;EACT,WAAW;EACX,YAAY;EACZ,kBAAkB;EAClB,6BAA6B;AAC/B;;AAEA;EACE,eAAe;EACf,WAAW;EACX,UAAU;EACV,WAAW;EACX,YAAY;EACZ,yBAAyB;EACzB,kBAAkB;EAClB,6BAA6B;AAC/B;;AAEA;;EAEE,iCAAiC;AACnC","sourcesContent":[".help_inner_container {\r\n  position: absolute;\r\n  top: 50%;\r\n  left: 50%;\r\n  transform: translate(-50%, -50%);\r\n  width: 800px;\r\n  height: 560px;\r\n  border: 15px solid;\r\n  border-radius: 5px;\r\n  border-image: url(\"../assets/border.svg\");\r\n  border-image-slice: 15;\r\n  background-image: linear-gradient(to bottom right, var(--background-start), var(--background-end));\r\n  background-size: cover;\r\n  background-repeat: no-repeat;\r\n}\r\n\r\n.help_title {\r\n  position: fixed;\r\n  top: 25px;\r\n  left: 50%;\r\n  transform: translateX(-50%);\r\n  text-shadow: 2px 2px black;\r\n}\r\n\r\n.help_pagenum {\r\n  position: fixed;\r\n  top: 15px;\r\n  right: 10px;\r\n  font-size: medium;\r\n  text-shadow: 1px 1px black;\r\n}\r\n\r\n.help_text {\r\n  position: fixed;\r\n  font-size: large;\r\n  top: 55px;\r\n  left: 25px;\r\n  height: 400px;\r\n  width: 750px;\r\n  word-wrap: normal;\r\n  text-shadow: 1px 1px black;\r\n}\r\n\r\n.help_nav_left {\r\n  position: fixed;\r\n  bottom: 5px;\r\n  left: 5px;\r\n  width: 40px;\r\n  height: 40px;\r\n  border-radius: 50%;\r\n  border: 1px solid transparent;\r\n}\r\n\r\n.help_nav_right {\r\n  position: fixed;\r\n  bottom: 5px;\r\n  right: 5px;\r\n  width: 40px;\r\n  height: 40px;\r\n  transform: rotate(180deg);\r\n  border-radius: 50%;\r\n  border: 1px solid transparent;\r\n}\r\n\r\n.help_nav_left:hover,\r\n.help_nav_right:hover {\r\n  box-shadow: 0px 0px 8px 3px white;\r\n}\r\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./src/styles/lobby.css":
/*!********************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/styles/lobby.css ***!
  \********************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/getUrl.js */ "./node_modules/css-loader/dist/runtime/getUrl.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__);
// Imports



var ___CSS_LOADER_URL_IMPORT_0___ = new URL(/* asset import */ __webpack_require__(/*! ../assets/border.svg */ "./src/assets/border.svg"), __webpack_require__.b);
var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
var ___CSS_LOADER_URL_REPLACEMENT_0___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_0___);
// Module
___CSS_LOADER_EXPORT___.push([module.id, ".mainLobby {\r\n  position: relative;\r\n  width: 300px;\r\n  height: 200px;\r\n  border: 25px solid;\r\n  border-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_0___ + ");\r\n  border-image-slice: 25;\r\n  margin: 0 auto;\r\n  transform: translateY(50%);\r\n  display: flex;\r\n  justify-content: center;\r\n  flex-direction: column;\r\n  align-content: center;\r\n}\r\n\r\n.mainLobby > span {\r\n  text-align: center;\r\n  text-shadow: 2px 2px black;\r\n}\r\n\r\n.sLobby {\r\n  position: absolute;\r\n  bottom: 20px;\r\n  left: 50%;\r\n  transform: translateX(-50%);\r\n  width: 600px;\r\n  height: 30px;\r\n  border: 25px solid;\r\n  border-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_0___ + ");\r\n  border-image-slice: 25;\r\n  margin: 0 auto;\r\n  display: flex;\r\n  justify-content: center;\r\n  flex-direction: column;\r\n  align-content: center;\r\n  animation: blink 1.5s infinite;\r\n}\r\n\r\n.sLobby > span {\r\n  text-align: center;\r\n  font-size: large;\r\n  text-shadow: 2px 2px black;\r\n}\r\n\r\n.lobbyButton {\r\n  font-family: demonFont;\r\n  border: 5px rgb(211, 211, 211) solid;\r\n  border-radius: 5px;\r\n  background-color: #00000000;\r\n  color: rgb(211, 211, 211);\r\n  font-size: medium;\r\n  width: 150px;\r\n  height: 60px;\r\n  padding: 10px 10px;\r\n  cursor: pointer;\r\n  box-shadow: 2px 2px 1px 1px black;\r\n  text-shadow: 1px 1px black;\r\n}\r\n\r\n.lobbyButton:disabled {\r\n  border: 5px rgb(211, 211, 211) solid;\r\n  background-color: rgb(211, 211, 211);\r\n  color: black;\r\n  opacity: 0.5;\r\n}\r\n\r\n.buttonflex {\r\n  display: flex;\r\n  position: absolute;\r\n  top: 50%;\r\n  left: 50%;\r\n  width: 600px;\r\n  height: 100px;\r\n  justify-content: space-between;\r\n  transform: translate(-50%, 30%);\r\n}\r\n\r\n.loginText {\r\n  top: 10px;\r\n  left: 10px;\r\n  position: fixed;\r\n  margin-left: 5px;\r\n  font-size: medium;\r\n  text-shadow: 1px 1px black;\r\n}\r\n\r\n.joinflex {\r\n  width: 700px;\r\n  position: relative;\r\n  display: flex;\r\n  justify-content: space-evenly;\r\n  align-content: center;\r\n  display: fixed;\r\n  top: 50%;\r\n  left: 50%;\r\n  transform: translate(-50%, -170%);\r\n}\r\n\r\n.b4 {\r\n  transform: translateY(-25%);\r\n}\r\n\r\n.joinGameText {\r\n  height: 25px;\r\n  font-weight: bolder;\r\n}\r\n\r\n.goodData {\r\n  border: 4px solid lime;\r\n}\r\n\r\n.badData {\r\n  border: 4px solid red;\r\n}\r\n\r\n.lobbyButton:hover {\r\n  background-color: rgb(211, 211, 211);\r\n  color: var(--background-start);\r\n}\r\n", "",{"version":3,"sources":["webpack://./src/styles/lobby.css"],"names":[],"mappings":"AAAA;EACE,kBAAkB;EAClB,YAAY;EACZ,aAAa;EACb,kBAAkB;EAClB,qDAAyC;EACzC,sBAAsB;EACtB,cAAc;EACd,0BAA0B;EAC1B,aAAa;EACb,uBAAuB;EACvB,sBAAsB;EACtB,qBAAqB;AACvB;;AAEA;EACE,kBAAkB;EAClB,0BAA0B;AAC5B;;AAEA;EACE,kBAAkB;EAClB,YAAY;EACZ,SAAS;EACT,2BAA2B;EAC3B,YAAY;EACZ,YAAY;EACZ,kBAAkB;EAClB,qDAAyC;EACzC,sBAAsB;EACtB,cAAc;EACd,aAAa;EACb,uBAAuB;EACvB,sBAAsB;EACtB,qBAAqB;EACrB,8BAA8B;AAChC;;AAEA;EACE,kBAAkB;EAClB,gBAAgB;EAChB,0BAA0B;AAC5B;;AAEA;EACE,sBAAsB;EACtB,oCAAoC;EACpC,kBAAkB;EAClB,2BAA2B;EAC3B,yBAAyB;EACzB,iBAAiB;EACjB,YAAY;EACZ,YAAY;EACZ,kBAAkB;EAClB,eAAe;EACf,iCAAiC;EACjC,0BAA0B;AAC5B;;AAEA;EACE,oCAAoC;EACpC,oCAAoC;EACpC,YAAY;EACZ,YAAY;AACd;;AAEA;EACE,aAAa;EACb,kBAAkB;EAClB,QAAQ;EACR,SAAS;EACT,YAAY;EACZ,aAAa;EACb,8BAA8B;EAC9B,+BAA+B;AACjC;;AAEA;EACE,SAAS;EACT,UAAU;EACV,eAAe;EACf,gBAAgB;EAChB,iBAAiB;EACjB,0BAA0B;AAC5B;;AAEA;EACE,YAAY;EACZ,kBAAkB;EAClB,aAAa;EACb,6BAA6B;EAC7B,qBAAqB;EACrB,cAAc;EACd,QAAQ;EACR,SAAS;EACT,iCAAiC;AACnC;;AAEA;EACE,2BAA2B;AAC7B;;AAEA;EACE,YAAY;EACZ,mBAAmB;AACrB;;AAEA;EACE,sBAAsB;AACxB;;AAEA;EACE,qBAAqB;AACvB;;AAEA;EACE,oCAAoC;EACpC,8BAA8B;AAChC","sourcesContent":[".mainLobby {\r\n  position: relative;\r\n  width: 300px;\r\n  height: 200px;\r\n  border: 25px solid;\r\n  border-image: url(\"../assets/border.svg\");\r\n  border-image-slice: 25;\r\n  margin: 0 auto;\r\n  transform: translateY(50%);\r\n  display: flex;\r\n  justify-content: center;\r\n  flex-direction: column;\r\n  align-content: center;\r\n}\r\n\r\n.mainLobby > span {\r\n  text-align: center;\r\n  text-shadow: 2px 2px black;\r\n}\r\n\r\n.sLobby {\r\n  position: absolute;\r\n  bottom: 20px;\r\n  left: 50%;\r\n  transform: translateX(-50%);\r\n  width: 600px;\r\n  height: 30px;\r\n  border: 25px solid;\r\n  border-image: url(\"../assets/border.svg\");\r\n  border-image-slice: 25;\r\n  margin: 0 auto;\r\n  display: flex;\r\n  justify-content: center;\r\n  flex-direction: column;\r\n  align-content: center;\r\n  animation: blink 1.5s infinite;\r\n}\r\n\r\n.sLobby > span {\r\n  text-align: center;\r\n  font-size: large;\r\n  text-shadow: 2px 2px black;\r\n}\r\n\r\n.lobbyButton {\r\n  font-family: demonFont;\r\n  border: 5px rgb(211, 211, 211) solid;\r\n  border-radius: 5px;\r\n  background-color: #00000000;\r\n  color: rgb(211, 211, 211);\r\n  font-size: medium;\r\n  width: 150px;\r\n  height: 60px;\r\n  padding: 10px 10px;\r\n  cursor: pointer;\r\n  box-shadow: 2px 2px 1px 1px black;\r\n  text-shadow: 1px 1px black;\r\n}\r\n\r\n.lobbyButton:disabled {\r\n  border: 5px rgb(211, 211, 211) solid;\r\n  background-color: rgb(211, 211, 211);\r\n  color: black;\r\n  opacity: 0.5;\r\n}\r\n\r\n.buttonflex {\r\n  display: flex;\r\n  position: absolute;\r\n  top: 50%;\r\n  left: 50%;\r\n  width: 600px;\r\n  height: 100px;\r\n  justify-content: space-between;\r\n  transform: translate(-50%, 30%);\r\n}\r\n\r\n.loginText {\r\n  top: 10px;\r\n  left: 10px;\r\n  position: fixed;\r\n  margin-left: 5px;\r\n  font-size: medium;\r\n  text-shadow: 1px 1px black;\r\n}\r\n\r\n.joinflex {\r\n  width: 700px;\r\n  position: relative;\r\n  display: flex;\r\n  justify-content: space-evenly;\r\n  align-content: center;\r\n  display: fixed;\r\n  top: 50%;\r\n  left: 50%;\r\n  transform: translate(-50%, -170%);\r\n}\r\n\r\n.b4 {\r\n  transform: translateY(-25%);\r\n}\r\n\r\n.joinGameText {\r\n  height: 25px;\r\n  font-weight: bolder;\r\n}\r\n\r\n.goodData {\r\n  border: 4px solid lime;\r\n}\r\n\r\n.badData {\r\n  border: 4px solid red;\r\n}\r\n\r\n.lobbyButton:hover {\r\n  background-color: rgb(211, 211, 211);\r\n  color: var(--background-start);\r\n}\r\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./src/styles/location.css":
/*!***********************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/styles/location.css ***!
  \***********************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/getUrl.js */ "./node_modules/css-loader/dist/runtime/getUrl.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__);
// Imports



var ___CSS_LOADER_URL_IMPORT_0___ = new URL(/* asset import */ __webpack_require__(/*! ../assets/border.svg */ "./src/assets/border.svg"), __webpack_require__.b);
var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
var ___CSS_LOADER_URL_REPLACEMENT_0___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_0___);
// Module
___CSS_LOADER_EXPORT___.push([module.id, ".loc_container {\r\n  position: absolute;\r\n  border: 25px solid;\r\n  border-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_0___ + ");\r\n  border-image-slice: 25;\r\n  width: 210px;\r\n  aspect-ratio: 3/2;\r\n  top: 140px;\r\n  left: 50px;\r\n}\r\n\r\n.loc_rel_container {\r\n  width: 100%;\r\n  height: 100%;\r\n  position: relative;\r\n}\r\n\r\n.loc_title {\r\n  font-size: small;\r\n  position: absolute;\r\n  top: 50%;\r\n  left: 50%;\r\n  transform: translate(-50%, -50%);\r\n}\r\n\r\n.loc_card {\r\n  position: absolute;\r\n  border: 1px solid white;\r\n  border-radius: 10px;\r\n  width: 200px;\r\n  aspect-ratio: 3/2;\r\n  top: 50%;\r\n  left: 50%;\r\n  transform: translate(-50%, -50%);\r\n  background-color: #fbfaf5;\r\n  color: #101f6b;\r\n  font-size: small;\r\n  transition: width 0.3s ease-in-out;\r\n  box-shadow: 5px 5px 8px 3px #00000080;\r\n  opacity: 1;\r\n  transition: opacity 1s ease-in-out;\r\n}\r\n\r\n.loc_card.pui-adding {\r\n  opacity: 0;\r\n}\r\n.loc_card.pui-removing {\r\n  opacity: 0;\r\n}\r\n\r\n.loc_card_title {\r\n  position: absolute;\r\n  top: 50%;\r\n  left: 50%;\r\n  transform: translate(-50%, -50%);\r\n  font-size: xx-large;\r\n  text-align: center;\r\n}\r\n\r\n.loc_card_level {\r\n  position: absolute;\r\n  top: 10px;\r\n  right: 10px;\r\n  font-size: small;\r\n  text-align: center;\r\n}\r\n\r\n.loc_card_sequence {\r\n  position: absolute;\r\n  top: 10px;\r\n  left: 10px;\r\n  font-size: small;\r\n  text-align: center;\r\n}\r\n\r\n.loc_card_health {\r\n  position: absolute;\r\n  bottom: 10px;\r\n  left: 50%;\r\n  transform: translateX(-50%);\r\n  font-size: small;\r\n  width: 200px;\r\n  text-align: center;\r\n}\r\n\r\n.locationdamage {\r\n  animation: locshake 0.5s;\r\n  animation-iteration-count: 1;\r\n}\r\n\r\n.locationHeal {\r\n  animation: locheal 0.5s;\r\n  animation-iteration-count: 1;\r\n}\r\n\r\n@keyframes locshake {\r\n  0% {\r\n    transform: translate(1%, 1%) rotate(0deg);\r\n    background-color: rgb(235, 14, 14);\r\n  }\r\n  10% {\r\n    transform: translate(-1%, -2%) rotate(-1deg);\r\n    background-color: rgba(235, 14, 14, 0.9);\r\n  }\r\n  20% {\r\n    transform: translate(-3%, 0%) rotate(1deg);\r\n    background-color: rgba(235, 14, 14, 0.8);\r\n  }\r\n  30% {\r\n    transform: translate(3%, 2%) rotate(0deg);\r\n    background-color: rgba(235, 14, 14, 0.7);\r\n  }\r\n  40% {\r\n    transform: translate(1%, -1%) rotate(1deg);\r\n    background-color: rgba(235, 14, 14, 0.6);\r\n  }\r\n  50% {\r\n    transform: translate(-1%, 2%) rotate(-1deg);\r\n    background-color: rgba(235, 14, 14, 0.5);\r\n  }\r\n  60% {\r\n    transform: translate(-3%, 1%) rotate(0deg);\r\n    background-color: rgba(235, 14, 14, 0.4);\r\n  }\r\n  70% {\r\n    transform: translate(3%, 1%) rotate(-1deg);\r\n    background-color: rgba(235, 14, 14, 0.3);\r\n  }\r\n  80% {\r\n    transform: translate(-1%, -1%) rotate(1deg);\r\n    background-color: rgba(235, 14, 14, 0.2);\r\n  }\r\n  90% {\r\n    transform: translate(1%, 2%) rotate(0deg);\r\n    background-color: rgba(235, 14, 14, 0.1);\r\n  }\r\n  100% {\r\n    transform: translate(0%, 0%) rotate(-1deg);\r\n    background-color: rgba(235, 14, 14, 0);\r\n  }\r\n}\r\n\r\n@keyframes locheal {\r\n  0% {\r\n    background-color: rgb(14, 235, 14);\r\n  }\r\n  10% {\r\n    background-color: rgba(14, 235, 14, 0.9);\r\n  }\r\n  20% {\r\n    background-color: rgba(14, 235, 14, 0.8);\r\n  }\r\n  30% {\r\n    background-color: rgba(14, 235, 14, 0.7);\r\n  }\r\n  40% {\r\n    background-color: rgba(14, 235, 14, 0.6);\r\n  }\r\n  50% {\r\n    background-color: rgba(14, 235, 14, 0.5);\r\n  }\r\n  60% {\r\n    background-color: rgba(14, 235, 14, 0.4);\r\n  }\r\n  70% {\r\n    background-color: rgba(14, 235, 14, 0.3);\r\n  }\r\n  80% {\r\n    background-color: rgba(14, 235, 14, 0.2);\r\n  }\r\n  90% {\r\n    background-color: rgba(14, 235, 14, 0.1);\r\n  }\r\n  100% {\r\n    background-color: rgba(14, 235, 14, 0);\r\n  }\r\n}\r\n", "",{"version":3,"sources":["webpack://./src/styles/location.css"],"names":[],"mappings":"AAAA;EACE,kBAAkB;EAClB,kBAAkB;EAClB,qDAAyC;EACzC,sBAAsB;EACtB,YAAY;EACZ,iBAAiB;EACjB,UAAU;EACV,UAAU;AACZ;;AAEA;EACE,WAAW;EACX,YAAY;EACZ,kBAAkB;AACpB;;AAEA;EACE,gBAAgB;EAChB,kBAAkB;EAClB,QAAQ;EACR,SAAS;EACT,gCAAgC;AAClC;;AAEA;EACE,kBAAkB;EAClB,uBAAuB;EACvB,mBAAmB;EACnB,YAAY;EACZ,iBAAiB;EACjB,QAAQ;EACR,SAAS;EACT,gCAAgC;EAChC,yBAAyB;EACzB,cAAc;EACd,gBAAgB;EAChB,kCAAkC;EAClC,qCAAqC;EACrC,UAAU;EACV,kCAAkC;AACpC;;AAEA;EACE,UAAU;AACZ;AACA;EACE,UAAU;AACZ;;AAEA;EACE,kBAAkB;EAClB,QAAQ;EACR,SAAS;EACT,gCAAgC;EAChC,mBAAmB;EACnB,kBAAkB;AACpB;;AAEA;EACE,kBAAkB;EAClB,SAAS;EACT,WAAW;EACX,gBAAgB;EAChB,kBAAkB;AACpB;;AAEA;EACE,kBAAkB;EAClB,SAAS;EACT,UAAU;EACV,gBAAgB;EAChB,kBAAkB;AACpB;;AAEA;EACE,kBAAkB;EAClB,YAAY;EACZ,SAAS;EACT,2BAA2B;EAC3B,gBAAgB;EAChB,YAAY;EACZ,kBAAkB;AACpB;;AAEA;EACE,wBAAwB;EACxB,4BAA4B;AAC9B;;AAEA;EACE,uBAAuB;EACvB,4BAA4B;AAC9B;;AAEA;EACE;IACE,yCAAyC;IACzC,kCAAkC;EACpC;EACA;IACE,4CAA4C;IAC5C,wCAAwC;EAC1C;EACA;IACE,0CAA0C;IAC1C,wCAAwC;EAC1C;EACA;IACE,yCAAyC;IACzC,wCAAwC;EAC1C;EACA;IACE,0CAA0C;IAC1C,wCAAwC;EAC1C;EACA;IACE,2CAA2C;IAC3C,wCAAwC;EAC1C;EACA;IACE,0CAA0C;IAC1C,wCAAwC;EAC1C;EACA;IACE,0CAA0C;IAC1C,wCAAwC;EAC1C;EACA;IACE,2CAA2C;IAC3C,wCAAwC;EAC1C;EACA;IACE,yCAAyC;IACzC,wCAAwC;EAC1C;EACA;IACE,0CAA0C;IAC1C,sCAAsC;EACxC;AACF;;AAEA;EACE;IACE,kCAAkC;EACpC;EACA;IACE,wCAAwC;EAC1C;EACA;IACE,wCAAwC;EAC1C;EACA;IACE,wCAAwC;EAC1C;EACA;IACE,wCAAwC;EAC1C;EACA;IACE,wCAAwC;EAC1C;EACA;IACE,wCAAwC;EAC1C;EACA;IACE,wCAAwC;EAC1C;EACA;IACE,wCAAwC;EAC1C;EACA;IACE,wCAAwC;EAC1C;EACA;IACE,sCAAsC;EACxC;AACF","sourcesContent":[".loc_container {\r\n  position: absolute;\r\n  border: 25px solid;\r\n  border-image: url(\"../assets/border.svg\");\r\n  border-image-slice: 25;\r\n  width: 210px;\r\n  aspect-ratio: 3/2;\r\n  top: 140px;\r\n  left: 50px;\r\n}\r\n\r\n.loc_rel_container {\r\n  width: 100%;\r\n  height: 100%;\r\n  position: relative;\r\n}\r\n\r\n.loc_title {\r\n  font-size: small;\r\n  position: absolute;\r\n  top: 50%;\r\n  left: 50%;\r\n  transform: translate(-50%, -50%);\r\n}\r\n\r\n.loc_card {\r\n  position: absolute;\r\n  border: 1px solid white;\r\n  border-radius: 10px;\r\n  width: 200px;\r\n  aspect-ratio: 3/2;\r\n  top: 50%;\r\n  left: 50%;\r\n  transform: translate(-50%, -50%);\r\n  background-color: #fbfaf5;\r\n  color: #101f6b;\r\n  font-size: small;\r\n  transition: width 0.3s ease-in-out;\r\n  box-shadow: 5px 5px 8px 3px #00000080;\r\n  opacity: 1;\r\n  transition: opacity 1s ease-in-out;\r\n}\r\n\r\n.loc_card.pui-adding {\r\n  opacity: 0;\r\n}\r\n.loc_card.pui-removing {\r\n  opacity: 0;\r\n}\r\n\r\n.loc_card_title {\r\n  position: absolute;\r\n  top: 50%;\r\n  left: 50%;\r\n  transform: translate(-50%, -50%);\r\n  font-size: xx-large;\r\n  text-align: center;\r\n}\r\n\r\n.loc_card_level {\r\n  position: absolute;\r\n  top: 10px;\r\n  right: 10px;\r\n  font-size: small;\r\n  text-align: center;\r\n}\r\n\r\n.loc_card_sequence {\r\n  position: absolute;\r\n  top: 10px;\r\n  left: 10px;\r\n  font-size: small;\r\n  text-align: center;\r\n}\r\n\r\n.loc_card_health {\r\n  position: absolute;\r\n  bottom: 10px;\r\n  left: 50%;\r\n  transform: translateX(-50%);\r\n  font-size: small;\r\n  width: 200px;\r\n  text-align: center;\r\n}\r\n\r\n.locationdamage {\r\n  animation: locshake 0.5s;\r\n  animation-iteration-count: 1;\r\n}\r\n\r\n.locationHeal {\r\n  animation: locheal 0.5s;\r\n  animation-iteration-count: 1;\r\n}\r\n\r\n@keyframes locshake {\r\n  0% {\r\n    transform: translate(1%, 1%) rotate(0deg);\r\n    background-color: rgb(235, 14, 14);\r\n  }\r\n  10% {\r\n    transform: translate(-1%, -2%) rotate(-1deg);\r\n    background-color: rgba(235, 14, 14, 0.9);\r\n  }\r\n  20% {\r\n    transform: translate(-3%, 0%) rotate(1deg);\r\n    background-color: rgba(235, 14, 14, 0.8);\r\n  }\r\n  30% {\r\n    transform: translate(3%, 2%) rotate(0deg);\r\n    background-color: rgba(235, 14, 14, 0.7);\r\n  }\r\n  40% {\r\n    transform: translate(1%, -1%) rotate(1deg);\r\n    background-color: rgba(235, 14, 14, 0.6);\r\n  }\r\n  50% {\r\n    transform: translate(-1%, 2%) rotate(-1deg);\r\n    background-color: rgba(235, 14, 14, 0.5);\r\n  }\r\n  60% {\r\n    transform: translate(-3%, 1%) rotate(0deg);\r\n    background-color: rgba(235, 14, 14, 0.4);\r\n  }\r\n  70% {\r\n    transform: translate(3%, 1%) rotate(-1deg);\r\n    background-color: rgba(235, 14, 14, 0.3);\r\n  }\r\n  80% {\r\n    transform: translate(-1%, -1%) rotate(1deg);\r\n    background-color: rgba(235, 14, 14, 0.2);\r\n  }\r\n  90% {\r\n    transform: translate(1%, 2%) rotate(0deg);\r\n    background-color: rgba(235, 14, 14, 0.1);\r\n  }\r\n  100% {\r\n    transform: translate(0%, 0%) rotate(-1deg);\r\n    background-color: rgba(235, 14, 14, 0);\r\n  }\r\n}\r\n\r\n@keyframes locheal {\r\n  0% {\r\n    background-color: rgb(14, 235, 14);\r\n  }\r\n  10% {\r\n    background-color: rgba(14, 235, 14, 0.9);\r\n  }\r\n  20% {\r\n    background-color: rgba(14, 235, 14, 0.8);\r\n  }\r\n  30% {\r\n    background-color: rgba(14, 235, 14, 0.7);\r\n  }\r\n  40% {\r\n    background-color: rgba(14, 235, 14, 0.6);\r\n  }\r\n  50% {\r\n    background-color: rgba(14, 235, 14, 0.5);\r\n  }\r\n  60% {\r\n    background-color: rgba(14, 235, 14, 0.4);\r\n  }\r\n  70% {\r\n    background-color: rgba(14, 235, 14, 0.3);\r\n  }\r\n  80% {\r\n    background-color: rgba(14, 235, 14, 0.2);\r\n  }\r\n  90% {\r\n    background-color: rgba(14, 235, 14, 0.1);\r\n  }\r\n  100% {\r\n    background-color: rgba(14, 235, 14, 0);\r\n  }\r\n}\r\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./src/styles/messageOverlay.css":
/*!*****************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/styles/messageOverlay.css ***!
  \*****************************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, ".MO_container {\r\n  position: absolute;\r\n  top: 0;\r\n  left: 0;\r\n  width: var(--game-width);\r\n  height: var(--game-height);\r\n  opacity: 1;\r\n  transition: opacity 1s ease-in-out;\r\n  z-index: 12;\r\n}\r\n\r\n.MO_relative {\r\n  position: relative;\r\n  top: 0;\r\n  left: 0;\r\n  width: var(--game-width);\r\n  height: var(--game-height);\r\n  background-color: rgba(0, 0, 0, 0.7);\r\n}\r\n\r\n.MO_container.pui-adding {\r\n  opacity: 0;\r\n}\r\n\r\n.MO_container.pui-removing {\r\n  opacity: 0;\r\n}\r\n\r\n.MO_main {\r\n  font-size: xx-large;\r\n  font-family: demonFont;\r\n  color: white;\r\n  font-weight: bolder;\r\n  text-align: center;\r\n  width: var(--game-width);\r\n  height: 100px;\r\n  position: absolute;\r\n  top: 50%;\r\n  transform: translateY(-25%);\r\n}\r\n\r\n.MO_sub {\r\n  font-size: large;\r\n  font-family: demonFont;\r\n  color: white;\r\n  font-weight: bold;\r\n  text-align: center;\r\n  width: var(--game-width);\r\n  height: 75px;\r\n  position: absolute;\r\n  top: 50%;\r\n  transform: translateY(20%);\r\n}\r\n", "",{"version":3,"sources":["webpack://./src/styles/messageOverlay.css"],"names":[],"mappings":"AAAA;EACE,kBAAkB;EAClB,MAAM;EACN,OAAO;EACP,wBAAwB;EACxB,0BAA0B;EAC1B,UAAU;EACV,kCAAkC;EAClC,WAAW;AACb;;AAEA;EACE,kBAAkB;EAClB,MAAM;EACN,OAAO;EACP,wBAAwB;EACxB,0BAA0B;EAC1B,oCAAoC;AACtC;;AAEA;EACE,UAAU;AACZ;;AAEA;EACE,UAAU;AACZ;;AAEA;EACE,mBAAmB;EACnB,sBAAsB;EACtB,YAAY;EACZ,mBAAmB;EACnB,kBAAkB;EAClB,wBAAwB;EACxB,aAAa;EACb,kBAAkB;EAClB,QAAQ;EACR,2BAA2B;AAC7B;;AAEA;EACE,gBAAgB;EAChB,sBAAsB;EACtB,YAAY;EACZ,iBAAiB;EACjB,kBAAkB;EAClB,wBAAwB;EACxB,YAAY;EACZ,kBAAkB;EAClB,QAAQ;EACR,0BAA0B;AAC5B","sourcesContent":[".MO_container {\r\n  position: absolute;\r\n  top: 0;\r\n  left: 0;\r\n  width: var(--game-width);\r\n  height: var(--game-height);\r\n  opacity: 1;\r\n  transition: opacity 1s ease-in-out;\r\n  z-index: 12;\r\n}\r\n\r\n.MO_relative {\r\n  position: relative;\r\n  top: 0;\r\n  left: 0;\r\n  width: var(--game-width);\r\n  height: var(--game-height);\r\n  background-color: rgba(0, 0, 0, 0.7);\r\n}\r\n\r\n.MO_container.pui-adding {\r\n  opacity: 0;\r\n}\r\n\r\n.MO_container.pui-removing {\r\n  opacity: 0;\r\n}\r\n\r\n.MO_main {\r\n  font-size: xx-large;\r\n  font-family: demonFont;\r\n  color: white;\r\n  font-weight: bolder;\r\n  text-align: center;\r\n  width: var(--game-width);\r\n  height: 100px;\r\n  position: absolute;\r\n  top: 50%;\r\n  transform: translateY(-25%);\r\n}\r\n\r\n.MO_sub {\r\n  font-size: large;\r\n  font-family: demonFont;\r\n  color: white;\r\n  font-weight: bold;\r\n  text-align: center;\r\n  width: var(--game-width);\r\n  height: 75px;\r\n  position: absolute;\r\n  top: 50%;\r\n  transform: translateY(20%);\r\n}\r\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./src/styles/monster.css":
/*!**********************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/styles/monster.css ***!
  \**********************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/getUrl.js */ "./node_modules/css-loader/dist/runtime/getUrl.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__);
// Imports



var ___CSS_LOADER_URL_IMPORT_0___ = new URL(/* asset import */ __webpack_require__(/*! ../assets/border.svg */ "./src/assets/border.svg"), __webpack_require__.b);
var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
var ___CSS_LOADER_URL_REPLACEMENT_0___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_0___);
// Module
___CSS_LOADER_EXPORT___.push([module.id, ".monster_container {\r\n  position: fixed;\r\n  top: 140px;\r\n  left: 50%;\r\n  transform: translateX(-50%);\r\n  border: 25px solid;\r\n  border-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_0___ + ");\r\n  border-image-slice: 25;\r\n  display: flex;\r\n  justify-content: center;\r\n  align-items: center;\r\n  width: 210px;\r\n  aspect-ratio: 3/2;\r\n  pointer-events: none;\r\n}\r\n\r\n.monster_rel_container {\r\n  pointer-events: none;\r\n}\r\n\r\n.monster_title {\r\n  font-size: small;\r\n  position: absolute;\r\n  top: 50%;\r\n  left: 50%;\r\n  transform: translate(-50%, -50%);\r\n  width: 100%;\r\n  text-align: center;\r\n}\r\n\r\n.monster_card_outer {\r\n  position: absolute;\r\n  pointer-events: none;\r\n  width: 200px;\r\n  aspect-ratio: 3/2;\r\n  top: 50%;\r\n  left: 50%;\r\n  transform: translate(-50%, -50%);\r\n  background-color: transparent;\r\n  perspective: 1000px;\r\n  opacity: 1;\r\n  transition: opacity 1s ease-in-out;\r\n}\r\n\r\n.monster_card {\r\n  pointer-events: auto;\r\n  width: 200px;\r\n  aspect-ratio: 3/2;\r\n  background-color: #fbfaf5;\r\n  border: 1px solid white;\r\n  border-radius: 10px;\r\n  color: #101f6b;\r\n  font-size: small;\r\n  transition: transform 0.8s ease-in-out;\r\n  transform-style: preserve-3d;\r\n  box-shadow: 5px 5px 8px 3px #00000080;\r\n}\r\n\r\n.monster_card_outer.pui-adding {\r\n  opacity: 0;\r\n}\r\n.monster_card_outer.pui-removing {\r\n  opacity: 0;\r\n}\r\n\r\n.topside {\r\n  transform: rotateX(0deg);\r\n}\r\n\r\n.topside,\r\n.bottomside {\r\n  position: absolute;\r\n  width: 100%;\r\n  height: 100%;\r\n  -webkit-backface-visibility: hidden; /* Safari */\r\n  backface-visibility: hidden;\r\n}\r\n\r\n.bottomside {\r\n  transform: rotateY(180deg);\r\n}\r\n\r\n.monster_card_outer:not(.nohover):hover .monster_card {\r\n  transform: rotateY(180deg);\r\n}\r\n\r\n.monster_card_title {\r\n  position: absolute;\r\n  top: 50%;\r\n  left: 50%;\r\n\r\n  transform: translate(-50%, -50%);\r\n  font-size: xx-large;\r\n  text-align: center;\r\n}\r\n\r\n.monster_card_reward {\r\n  position: absolute;\r\n  top: 50%;\r\n  left: 50%;\r\n  width: 95%;\r\n  transform: translate(-50%, -50%);\r\n  font-size: large;\r\n  text-align: center;\r\n}\r\n\r\n.monster_card_subtitle {\r\n  position: absolute;\r\n  top: 10px;\r\n  left: 50%;\r\n  transform: translate(-50%, -50%);\r\n  font-size: large;\r\n  text-align: center;\r\n}\r\n\r\n.monster_card_level {\r\n  position: absolute;\r\n  top: 10px;\r\n  right: 10px;\r\n  font-size: small;\r\n  text-align: center;\r\n}\r\n\r\n.monster_card_health {\r\n  position: absolute;\r\n  top: 10px;\r\n  left: 10px;\r\n  font-size: small;\r\n  text-align: center;\r\n}\r\n\r\n.monster_card_description {\r\n  position: absolute;\r\n  bottom: 10px;\r\n  width: 95%;\r\n  left: 10px;\r\n  font-size: small;\r\n  text-align: center;\r\n}\r\n", "",{"version":3,"sources":["webpack://./src/styles/monster.css"],"names":[],"mappings":"AAAA;EACE,eAAe;EACf,UAAU;EACV,SAAS;EACT,2BAA2B;EAC3B,kBAAkB;EAClB,qDAAyC;EACzC,sBAAsB;EACtB,aAAa;EACb,uBAAuB;EACvB,mBAAmB;EACnB,YAAY;EACZ,iBAAiB;EACjB,oBAAoB;AACtB;;AAEA;EACE,oBAAoB;AACtB;;AAEA;EACE,gBAAgB;EAChB,kBAAkB;EAClB,QAAQ;EACR,SAAS;EACT,gCAAgC;EAChC,WAAW;EACX,kBAAkB;AACpB;;AAEA;EACE,kBAAkB;EAClB,oBAAoB;EACpB,YAAY;EACZ,iBAAiB;EACjB,QAAQ;EACR,SAAS;EACT,gCAAgC;EAChC,6BAA6B;EAC7B,mBAAmB;EACnB,UAAU;EACV,kCAAkC;AACpC;;AAEA;EACE,oBAAoB;EACpB,YAAY;EACZ,iBAAiB;EACjB,yBAAyB;EACzB,uBAAuB;EACvB,mBAAmB;EACnB,cAAc;EACd,gBAAgB;EAChB,sCAAsC;EACtC,4BAA4B;EAC5B,qCAAqC;AACvC;;AAEA;EACE,UAAU;AACZ;AACA;EACE,UAAU;AACZ;;AAEA;EACE,wBAAwB;AAC1B;;AAEA;;EAEE,kBAAkB;EAClB,WAAW;EACX,YAAY;EACZ,mCAAmC,EAAE,WAAW;EAChD,2BAA2B;AAC7B;;AAEA;EACE,0BAA0B;AAC5B;;AAEA;EACE,0BAA0B;AAC5B;;AAEA;EACE,kBAAkB;EAClB,QAAQ;EACR,SAAS;;EAET,gCAAgC;EAChC,mBAAmB;EACnB,kBAAkB;AACpB;;AAEA;EACE,kBAAkB;EAClB,QAAQ;EACR,SAAS;EACT,UAAU;EACV,gCAAgC;EAChC,gBAAgB;EAChB,kBAAkB;AACpB;;AAEA;EACE,kBAAkB;EAClB,SAAS;EACT,SAAS;EACT,gCAAgC;EAChC,gBAAgB;EAChB,kBAAkB;AACpB;;AAEA;EACE,kBAAkB;EAClB,SAAS;EACT,WAAW;EACX,gBAAgB;EAChB,kBAAkB;AACpB;;AAEA;EACE,kBAAkB;EAClB,SAAS;EACT,UAAU;EACV,gBAAgB;EAChB,kBAAkB;AACpB;;AAEA;EACE,kBAAkB;EAClB,YAAY;EACZ,UAAU;EACV,UAAU;EACV,gBAAgB;EAChB,kBAAkB;AACpB","sourcesContent":[".monster_container {\r\n  position: fixed;\r\n  top: 140px;\r\n  left: 50%;\r\n  transform: translateX(-50%);\r\n  border: 25px solid;\r\n  border-image: url(\"../assets/border.svg\");\r\n  border-image-slice: 25;\r\n  display: flex;\r\n  justify-content: center;\r\n  align-items: center;\r\n  width: 210px;\r\n  aspect-ratio: 3/2;\r\n  pointer-events: none;\r\n}\r\n\r\n.monster_rel_container {\r\n  pointer-events: none;\r\n}\r\n\r\n.monster_title {\r\n  font-size: small;\r\n  position: absolute;\r\n  top: 50%;\r\n  left: 50%;\r\n  transform: translate(-50%, -50%);\r\n  width: 100%;\r\n  text-align: center;\r\n}\r\n\r\n.monster_card_outer {\r\n  position: absolute;\r\n  pointer-events: none;\r\n  width: 200px;\r\n  aspect-ratio: 3/2;\r\n  top: 50%;\r\n  left: 50%;\r\n  transform: translate(-50%, -50%);\r\n  background-color: transparent;\r\n  perspective: 1000px;\r\n  opacity: 1;\r\n  transition: opacity 1s ease-in-out;\r\n}\r\n\r\n.monster_card {\r\n  pointer-events: auto;\r\n  width: 200px;\r\n  aspect-ratio: 3/2;\r\n  background-color: #fbfaf5;\r\n  border: 1px solid white;\r\n  border-radius: 10px;\r\n  color: #101f6b;\r\n  font-size: small;\r\n  transition: transform 0.8s ease-in-out;\r\n  transform-style: preserve-3d;\r\n  box-shadow: 5px 5px 8px 3px #00000080;\r\n}\r\n\r\n.monster_card_outer.pui-adding {\r\n  opacity: 0;\r\n}\r\n.monster_card_outer.pui-removing {\r\n  opacity: 0;\r\n}\r\n\r\n.topside {\r\n  transform: rotateX(0deg);\r\n}\r\n\r\n.topside,\r\n.bottomside {\r\n  position: absolute;\r\n  width: 100%;\r\n  height: 100%;\r\n  -webkit-backface-visibility: hidden; /* Safari */\r\n  backface-visibility: hidden;\r\n}\r\n\r\n.bottomside {\r\n  transform: rotateY(180deg);\r\n}\r\n\r\n.monster_card_outer:not(.nohover):hover .monster_card {\r\n  transform: rotateY(180deg);\r\n}\r\n\r\n.monster_card_title {\r\n  position: absolute;\r\n  top: 50%;\r\n  left: 50%;\r\n\r\n  transform: translate(-50%, -50%);\r\n  font-size: xx-large;\r\n  text-align: center;\r\n}\r\n\r\n.monster_card_reward {\r\n  position: absolute;\r\n  top: 50%;\r\n  left: 50%;\r\n  width: 95%;\r\n  transform: translate(-50%, -50%);\r\n  font-size: large;\r\n  text-align: center;\r\n}\r\n\r\n.monster_card_subtitle {\r\n  position: absolute;\r\n  top: 10px;\r\n  left: 50%;\r\n  transform: translate(-50%, -50%);\r\n  font-size: large;\r\n  text-align: center;\r\n}\r\n\r\n.monster_card_level {\r\n  position: absolute;\r\n  top: 10px;\r\n  right: 10px;\r\n  font-size: small;\r\n  text-align: center;\r\n}\r\n\r\n.monster_card_health {\r\n  position: absolute;\r\n  top: 10px;\r\n  left: 10px;\r\n  font-size: small;\r\n  text-align: center;\r\n}\r\n\r\n.monster_card_description {\r\n  position: absolute;\r\n  bottom: 10px;\r\n  width: 95%;\r\n  left: 10px;\r\n  font-size: small;\r\n  text-align: center;\r\n}\r\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./src/styles/navInput.css":
/*!***********************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/styles/navInput.css ***!
  \***********************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/getUrl.js */ "./node_modules/css-loader/dist/runtime/getUrl.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__);
// Imports



var ___CSS_LOADER_URL_IMPORT_0___ = new URL(/* asset import */ __webpack_require__(/*! ../assets/border.svg */ "./src/assets/border.svg"), __webpack_require__.b);
var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
var ___CSS_LOADER_URL_REPLACEMENT_0___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_0___);
// Module
___CSS_LOADER_EXPORT___.push([module.id, ".NIcontainer {\r\n  position: absolute;\r\n  top: var(--component-top);\r\n  left: 50%;\r\n  transform: translateX(-50%);\r\n\r\n  background-image: linear-gradient(to bottom right, var(--background-start), var(--background-end));\r\n  background-repeat: no-repeat;\r\n  background-size: contain;\r\n  border: 10px solid;\r\n  border-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_0___ + ");\r\n  border-image-slice: 15;\r\n  border-radius: 10px;\r\n  width: var(--component-width);\r\n  height: 70px;\r\n  display: flex;\r\n  justify-content: center;\r\n  align-items: center;\r\n  gap: 15px;\r\n  opacity: 1;\r\n  transition: opacity 1s ease-in-out;\r\n  z-index: var(--component-zh);\r\n}\r\n\r\n.NIcontainer.pui-adding {\r\n  opacity: 0;\r\n}\r\n\r\n.NIcontainer.pui-removing {\r\n  opacity: 0;\r\n}\r\n\r\n.NIbutton {\r\n  border: 5px rgb(211, 211, 211) solid;\r\n  border-radius: 5px;\r\n  background-color: #00000000;\r\n  color: rgb(211, 211, 211);\r\n  font-size: medium;\r\n  width: 150px;\r\n  height: 60px;\r\n  padding: 10px 10px;\r\n  cursor: pointer;\r\n  box-shadow: 2px 2px 1px 1px var(--background-end);\r\n  text-shadow: 1px 1px black;\r\n}\r\n\r\n.NIbutton:hover {\r\n  background-color: rgb(211, 211, 211);\r\n  color: var(--background-end);\r\n}\r\n\r\n.NIclicked {\r\n  box-shadow: 2px 2px 2px 2px var(--background-end);\r\n  transform: translate(2px, 2px);\r\n  text-shadow: 1px 1px var(--background-end);\r\n}\r\n", "",{"version":3,"sources":["webpack://./src/styles/navInput.css"],"names":[],"mappings":"AAAA;EACE,kBAAkB;EAClB,yBAAyB;EACzB,SAAS;EACT,2BAA2B;;EAE3B,kGAAkG;EAClG,4BAA4B;EAC5B,wBAAwB;EACxB,kBAAkB;EAClB,qDAAyC;EACzC,sBAAsB;EACtB,mBAAmB;EACnB,6BAA6B;EAC7B,YAAY;EACZ,aAAa;EACb,uBAAuB;EACvB,mBAAmB;EACnB,SAAS;EACT,UAAU;EACV,kCAAkC;EAClC,4BAA4B;AAC9B;;AAEA;EACE,UAAU;AACZ;;AAEA;EACE,UAAU;AACZ;;AAEA;EACE,oCAAoC;EACpC,kBAAkB;EAClB,2BAA2B;EAC3B,yBAAyB;EACzB,iBAAiB;EACjB,YAAY;EACZ,YAAY;EACZ,kBAAkB;EAClB,eAAe;EACf,iDAAiD;EACjD,0BAA0B;AAC5B;;AAEA;EACE,oCAAoC;EACpC,4BAA4B;AAC9B;;AAEA;EACE,iDAAiD;EACjD,8BAA8B;EAC9B,0CAA0C;AAC5C","sourcesContent":[".NIcontainer {\r\n  position: absolute;\r\n  top: var(--component-top);\r\n  left: 50%;\r\n  transform: translateX(-50%);\r\n\r\n  background-image: linear-gradient(to bottom right, var(--background-start), var(--background-end));\r\n  background-repeat: no-repeat;\r\n  background-size: contain;\r\n  border: 10px solid;\r\n  border-image: url(\"../assets/border.svg\");\r\n  border-image-slice: 15;\r\n  border-radius: 10px;\r\n  width: var(--component-width);\r\n  height: 70px;\r\n  display: flex;\r\n  justify-content: center;\r\n  align-items: center;\r\n  gap: 15px;\r\n  opacity: 1;\r\n  transition: opacity 1s ease-in-out;\r\n  z-index: var(--component-zh);\r\n}\r\n\r\n.NIcontainer.pui-adding {\r\n  opacity: 0;\r\n}\r\n\r\n.NIcontainer.pui-removing {\r\n  opacity: 0;\r\n}\r\n\r\n.NIbutton {\r\n  border: 5px rgb(211, 211, 211) solid;\r\n  border-radius: 5px;\r\n  background-color: #00000000;\r\n  color: rgb(211, 211, 211);\r\n  font-size: medium;\r\n  width: 150px;\r\n  height: 60px;\r\n  padding: 10px 10px;\r\n  cursor: pointer;\r\n  box-shadow: 2px 2px 1px 1px var(--background-end);\r\n  text-shadow: 1px 1px black;\r\n}\r\n\r\n.NIbutton:hover {\r\n  background-color: rgb(211, 211, 211);\r\n  color: var(--background-end);\r\n}\r\n\r\n.NIclicked {\r\n  box-shadow: 2px 2px 2px 2px var(--background-end);\r\n  transform: translate(2px, 2px);\r\n  text-shadow: 1px 1px var(--background-end);\r\n}\r\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./src/styles/navbar.css":
/*!*********************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/styles/navbar.css ***!
  \*********************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, ".NBcontainer {\r\n  border: 10px solid #ccc;\r\n  width: 1200px;\r\n  aspect-ratio: 5/3;\r\n  background-image: linear-gradient(to bottom right, #2c34d6, #101f6b);\r\n  border-radius: 25px;\r\n  position: relative;\r\n}\r\n\r\n.NBtimeline.pui-adding {\r\n  opacity: 0;\r\n}\r\n\r\n.NBtimeline.pui-removing {\r\n  opacity: 0;\r\n}\r\n\r\n.NBtimeline {\r\n  position: absolute;\r\n  width: 800px;\r\n  height: 40px;\r\n  left: 50%;\r\n  top: 40px;\r\n  transform: translatex(-50%);\r\n  display: flex;\r\n  justify-content: center;\r\n  align-items: center;\r\n  gap: 100px;\r\n  opacity: 1;\r\n  transition: opacity 1s ease-in-out;\r\n}\r\n\r\n.NBtimestamp {\r\n  border: 3px solid #ccc;\r\n  border-radius: 50%;\r\n  width: 25px;\r\n  height: 25px;\r\n  transition: background-color 0.5s ease-in-out;\r\n  background-color: #ffffff00;\r\n  color: #ccc;\r\n  z-index: 0;\r\n}\r\n\r\n.NBtimestap_rel {\r\n  width: 100%;\r\n  height: 80px;\r\n  position: relative;\r\n  display: flex;\r\n  flex-direction: column;\r\n  align-items: center;\r\n  justify-content: flex-start;\r\n  transform: translatey(-50%);\r\n}\r\n\r\n.NBtimestap_rel > p {\r\n  position: absolute;\r\n  width: 200px;\r\n  height: 20px;\r\n  text-align: center;\r\n  font-size: x-small;\r\n  text-transform: uppercase;\r\n}\r\n\r\n.NBdone {\r\n  position: absolute;\r\n  top: 80px;\r\n  display: block;\r\n  width: 100px;\r\n  height: 20px;\r\n  text-align: center;\r\n  font-size: small;\r\n  text-transform: uppercase;\r\n}\r\n\r\n.NBhidden {\r\n  display: none;\r\n}\r\n\r\n.NBconnector {\r\n  position: absolute;\r\n  border: 1px solid #ccc;\r\n  top: 50px;\r\n  left: 26px;\r\n  width: 100px;\r\n  height: 0px;\r\n  background-color: #ccc;\r\n  z-index: -1;\r\n}\r\n\r\n.NBcomplete {\r\n  background-color: #ccc;\r\n}\r\n\r\n.NBglow {\r\n  animation: glow-animation 2s linear infinite;\r\n}\r\n\r\n.NBpulse {\r\n  animation: pulse-animation 1.5s linear infinite;\r\n}\r\n\r\n@keyframes pulse-animation {\r\n  0% {\r\n    box-shadow: 0 0 0 0px rgba(255, 255, 255, 0.5);\r\n  }\r\n  100% {\r\n    box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);\r\n  }\r\n}\r\n\r\n@keyframes glow-animation {\r\n  0% {\r\n    box-shadow: 0 0 3px 1px rgba(255, 255, 255);\r\n  }\r\n  50% {\r\n    box-shadow: 0 0 3px 3px rgba(255, 255, 255);\r\n  }\r\n  100% {\r\n    box-shadow: 0 0 3px 1px rgba(255, 255, 255);\r\n  }\r\n}\r\n", "",{"version":3,"sources":["webpack://./src/styles/navbar.css"],"names":[],"mappings":"AAAA;EACE,uBAAuB;EACvB,aAAa;EACb,iBAAiB;EACjB,oEAAoE;EACpE,mBAAmB;EACnB,kBAAkB;AACpB;;AAEA;EACE,UAAU;AACZ;;AAEA;EACE,UAAU;AACZ;;AAEA;EACE,kBAAkB;EAClB,YAAY;EACZ,YAAY;EACZ,SAAS;EACT,SAAS;EACT,2BAA2B;EAC3B,aAAa;EACb,uBAAuB;EACvB,mBAAmB;EACnB,UAAU;EACV,UAAU;EACV,kCAAkC;AACpC;;AAEA;EACE,sBAAsB;EACtB,kBAAkB;EAClB,WAAW;EACX,YAAY;EACZ,6CAA6C;EAC7C,2BAA2B;EAC3B,WAAW;EACX,UAAU;AACZ;;AAEA;EACE,WAAW;EACX,YAAY;EACZ,kBAAkB;EAClB,aAAa;EACb,sBAAsB;EACtB,mBAAmB;EACnB,2BAA2B;EAC3B,2BAA2B;AAC7B;;AAEA;EACE,kBAAkB;EAClB,YAAY;EACZ,YAAY;EACZ,kBAAkB;EAClB,kBAAkB;EAClB,yBAAyB;AAC3B;;AAEA;EACE,kBAAkB;EAClB,SAAS;EACT,cAAc;EACd,YAAY;EACZ,YAAY;EACZ,kBAAkB;EAClB,gBAAgB;EAChB,yBAAyB;AAC3B;;AAEA;EACE,aAAa;AACf;;AAEA;EACE,kBAAkB;EAClB,sBAAsB;EACtB,SAAS;EACT,UAAU;EACV,YAAY;EACZ,WAAW;EACX,sBAAsB;EACtB,WAAW;AACb;;AAEA;EACE,sBAAsB;AACxB;;AAEA;EACE,4CAA4C;AAC9C;;AAEA;EACE,+CAA+C;AACjD;;AAEA;EACE;IACE,8CAA8C;EAChD;EACA;IACE,6CAA6C;EAC/C;AACF;;AAEA;EACE;IACE,2CAA2C;EAC7C;EACA;IACE,2CAA2C;EAC7C;EACA;IACE,2CAA2C;EAC7C;AACF","sourcesContent":[".NBcontainer {\r\n  border: 10px solid #ccc;\r\n  width: 1200px;\r\n  aspect-ratio: 5/3;\r\n  background-image: linear-gradient(to bottom right, #2c34d6, #101f6b);\r\n  border-radius: 25px;\r\n  position: relative;\r\n}\r\n\r\n.NBtimeline.pui-adding {\r\n  opacity: 0;\r\n}\r\n\r\n.NBtimeline.pui-removing {\r\n  opacity: 0;\r\n}\r\n\r\n.NBtimeline {\r\n  position: absolute;\r\n  width: 800px;\r\n  height: 40px;\r\n  left: 50%;\r\n  top: 40px;\r\n  transform: translatex(-50%);\r\n  display: flex;\r\n  justify-content: center;\r\n  align-items: center;\r\n  gap: 100px;\r\n  opacity: 1;\r\n  transition: opacity 1s ease-in-out;\r\n}\r\n\r\n.NBtimestamp {\r\n  border: 3px solid #ccc;\r\n  border-radius: 50%;\r\n  width: 25px;\r\n  height: 25px;\r\n  transition: background-color 0.5s ease-in-out;\r\n  background-color: #ffffff00;\r\n  color: #ccc;\r\n  z-index: 0;\r\n}\r\n\r\n.NBtimestap_rel {\r\n  width: 100%;\r\n  height: 80px;\r\n  position: relative;\r\n  display: flex;\r\n  flex-direction: column;\r\n  align-items: center;\r\n  justify-content: flex-start;\r\n  transform: translatey(-50%);\r\n}\r\n\r\n.NBtimestap_rel > p {\r\n  position: absolute;\r\n  width: 200px;\r\n  height: 20px;\r\n  text-align: center;\r\n  font-size: x-small;\r\n  text-transform: uppercase;\r\n}\r\n\r\n.NBdone {\r\n  position: absolute;\r\n  top: 80px;\r\n  display: block;\r\n  width: 100px;\r\n  height: 20px;\r\n  text-align: center;\r\n  font-size: small;\r\n  text-transform: uppercase;\r\n}\r\n\r\n.NBhidden {\r\n  display: none;\r\n}\r\n\r\n.NBconnector {\r\n  position: absolute;\r\n  border: 1px solid #ccc;\r\n  top: 50px;\r\n  left: 26px;\r\n  width: 100px;\r\n  height: 0px;\r\n  background-color: #ccc;\r\n  z-index: -1;\r\n}\r\n\r\n.NBcomplete {\r\n  background-color: #ccc;\r\n}\r\n\r\n.NBglow {\r\n  animation: glow-animation 2s linear infinite;\r\n}\r\n\r\n.NBpulse {\r\n  animation: pulse-animation 1.5s linear infinite;\r\n}\r\n\r\n@keyframes pulse-animation {\r\n  0% {\r\n    box-shadow: 0 0 0 0px rgba(255, 255, 255, 0.5);\r\n  }\r\n  100% {\r\n    box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);\r\n  }\r\n}\r\n\r\n@keyframes glow-animation {\r\n  0% {\r\n    box-shadow: 0 0 3px 1px rgba(255, 255, 255);\r\n  }\r\n  50% {\r\n    box-shadow: 0 0 3px 3px rgba(255, 255, 255);\r\n  }\r\n  100% {\r\n    box-shadow: 0 0 3px 1px rgba(255, 255, 255);\r\n  }\r\n}\r\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./src/styles/playerUI.css":
/*!***********************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/styles/playerUI.css ***!
  \***********************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, ".pui_Container {\r\n  position: fixed;\r\n  bottom: 0;\r\n  left: 50%;\r\n  transform: translateX(-50%);\r\n\r\n  height: 200px;\r\n  width: 900px;\r\n\r\n  display: flex;\r\n  justify-content: center;\r\n  gap: 25px;\r\n  align-content: center;\r\n  z-index: 17;\r\n}\r\n\r\n.pui_playerContainer {\r\n  height: 200px;\r\n  width: 200px;\r\n  position: relative;\r\n}\r\n\r\n.pui_svg {\r\n  width: 140px;\r\n  height: 140px;\r\n  position: absolute;\r\n  top: 50%;\r\n  left: 50%;\r\n  transform: translate(-50%, -50%);\r\n  border: 1px solid transparent;\r\n  border-radius: 50%;\r\n}\r\n\r\n.pui_bg {\r\n  fill: none;\r\n  stroke-width: 10px;\r\n  stroke: #1a2c34;\r\n}\r\n\r\n.pui_meter-1 {\r\n  fill: none;\r\n  stroke-width: 10px;\r\n  stroke-linecap: round;\r\n  transform: rotate(-90deg);\r\n  transform-origin: 50% 50%;\r\n  stroke-dasharray: 405;\r\n  stroke-dashoffset: calc(65 * 0.01745 * var(--angle1));\r\n  stroke: lime;\r\n  transition: stroke-dashoffset 0.2s ease-in-out;\r\n}\r\n\r\n.pui_meter-2 {\r\n  fill: none;\r\n  stroke-width: 10px;\r\n  stroke-linecap: round;\r\n  transform: rotate(-90deg);\r\n  transform-origin: 50% 50%;\r\n  stroke-dasharray: 405;\r\n  stroke-dashoffset: calc(65 * 0.01745 * var(--angle2));\r\n  stroke: lime;\r\n  transition: stroke-dashoffset 0.2s ease-in-out;\r\n}\r\n\r\n.pui_meter-3 {\r\n  fill: none;\r\n  stroke-width: 10px;\r\n  stroke-linecap: round;\r\n  transform: rotate(-90deg);\r\n  transform-origin: 50% 50%;\r\n  stroke-dasharray: 405;\r\n  stroke-dashoffset: calc(65 * 0.01745 * var(--angle3));\r\n  stroke: lime;\r\n  transition: stroke-dashoffset 0.2s ease-in-out;\r\n}\r\n\r\n.pui_meter-4 {\r\n  fill: none;\r\n  stroke-width: 10px;\r\n  stroke-linecap: round;\r\n  transform: rotate(-90deg);\r\n  transform-origin: 50% 50%;\r\n  stroke-dasharray: 405;\r\n  stroke-dashoffset: calc(65 * 0.01745 * var(--angle4));\r\n  stroke: lime;\r\n  transition: stroke-dashoffset 0.2s ease-in-out;\r\n}\r\n\r\n.pui_atkIMG {\r\n  position: absolute;\r\n  bottom: 5px;\r\n  left: 5px;\r\n  width: 30px;\r\n  height: 30px;\r\n}\r\n\r\n.pui_coinIMG {\r\n  position: absolute;\r\n  bottom: 5px;\r\n  right: 5px;\r\n  width: 30px;\r\n  height: 30px;\r\n}\r\n\r\n.pui_character {\r\n  position: absolute;\r\n  top: 50%;\r\n  left: 50%;\r\n  transform: translate(-50%, -50%);\r\n  z-index: 3;\r\n}\r\n\r\n.pui_coin_text {\r\n  position: absolute;\r\n  bottom: 20px;\r\n  right: 10px;\r\n  width: 20px;\r\n  height: 20px;\r\n  text-shadow: 2px 2px black;\r\n}\r\n\r\n.pui_atk_text {\r\n  position: absolute;\r\n  bottom: 20px;\r\n  left: 10px;\r\n  width: 20px;\r\n  height: 20px;\r\n  text-shadow: 2px 2px black;\r\n}\r\n\r\n.playerBloom {\r\n  box-shadow: 0px 0px 15px 0px white;\r\n}\r\n\r\n.playerdamage {\r\n  animation: shake 0.5s;\r\n  animation-iteration-count: 1;\r\n}\r\n\r\n.playerHeal {\r\n  animation: heal 0.5s;\r\n  animation-iteration-count: 1;\r\n}\r\n\r\n@keyframes heal {\r\n  0% {\r\n    background-color: rgba(14, 232, 14, 1);\r\n  }\r\n  10% {\r\n    background-color: rgba(14, 232, 14, 0.9);\r\n  }\r\n  20% {\r\n    background-color: rgba(14, 232, 14, 0.8);\r\n  }\r\n  30% {\r\n    background-color: rgba(14, 232, 14, 0.7);\r\n  }\r\n  40% {\r\n    background-color: rgba(14, 232, 14, 0.6);\r\n  }\r\n  50% {\r\n    background-color: rgba(14, 232, 14, 0.5);\r\n  }\r\n  60% {\r\n    background-color: rgba(14, 232, 14, 0.4);\r\n  }\r\n  70% {\r\n    background-color: rgba(14, 232, 14, 0.3);\r\n  }\r\n  80% {\r\n    background-color: rgba(14, 232, 14, 0.2);\r\n  }\r\n  90% {\r\n    background-color: rgba(14, 232, 14, 0.1);\r\n  }\r\n  100% {\r\n    background-color: rgba(14, 232, 14, 0);\r\n  }\r\n}\r\n\r\n@keyframes shake {\r\n  0% {\r\n    transform: translate(-49%, -49%) rotate(0deg);\r\n    background-color: rgba(230, 14, 14, 1);\r\n  }\r\n  10% {\r\n    transform: translate(-51%, -52%) rotate(-1deg);\r\n    background-color: rgba(230, 14, 14, 0.9);\r\n  }\r\n  20% {\r\n    transform: translate(-53%, -50%) rotate(1deg);\r\n    background-color: rgba(230, 14, 14, 0.8);\r\n  }\r\n  30% {\r\n    transform: translate(-47%, -48%) rotate(0deg);\r\n    background-color: rgba(230, 14, 14, 0.7);\r\n  }\r\n  40% {\r\n    transform: translate(-49%, -51%) rotate(1deg);\r\n    background-color: rgba(230, 14, 14, 0.6);\r\n  }\r\n  50% {\r\n    transform: translate(-51%, -48%) rotate(-1deg);\r\n    background-color: rgba(230, 14, 14, 0.5);\r\n  }\r\n  60% {\r\n    transform: translate(-53%, -49%) rotate(0deg);\r\n    background-color: rgba(230, 14, 14, 0.4);\r\n  }\r\n  70% {\r\n    transform: translate(-47%, -49%) rotate(-1deg);\r\n    background-color: rgba(230, 14, 14, 0.3);\r\n  }\r\n  80% {\r\n    transform: translate(-51%, -51%) rotate(1deg);\r\n    background-color: rgba(230, 14, 14, 0.2);\r\n  }\r\n  90% {\r\n    transform: translate(-49%, -48%) rotate(0deg);\r\n    background-color: rgba(230, 14, 14, 0.1);\r\n  }\r\n  100% {\r\n    transform: translate(-50%, -50%) rotate(-1deg);\r\n    background-color: rgba(230, 14, 14, 0);\r\n  }\r\n}\r\n", "",{"version":3,"sources":["webpack://./src/styles/playerUI.css"],"names":[],"mappings":"AAAA;EACE,eAAe;EACf,SAAS;EACT,SAAS;EACT,2BAA2B;;EAE3B,aAAa;EACb,YAAY;;EAEZ,aAAa;EACb,uBAAuB;EACvB,SAAS;EACT,qBAAqB;EACrB,WAAW;AACb;;AAEA;EACE,aAAa;EACb,YAAY;EACZ,kBAAkB;AACpB;;AAEA;EACE,YAAY;EACZ,aAAa;EACb,kBAAkB;EAClB,QAAQ;EACR,SAAS;EACT,gCAAgC;EAChC,6BAA6B;EAC7B,kBAAkB;AACpB;;AAEA;EACE,UAAU;EACV,kBAAkB;EAClB,eAAe;AACjB;;AAEA;EACE,UAAU;EACV,kBAAkB;EAClB,qBAAqB;EACrB,yBAAyB;EACzB,yBAAyB;EACzB,qBAAqB;EACrB,qDAAqD;EACrD,YAAY;EACZ,8CAA8C;AAChD;;AAEA;EACE,UAAU;EACV,kBAAkB;EAClB,qBAAqB;EACrB,yBAAyB;EACzB,yBAAyB;EACzB,qBAAqB;EACrB,qDAAqD;EACrD,YAAY;EACZ,8CAA8C;AAChD;;AAEA;EACE,UAAU;EACV,kBAAkB;EAClB,qBAAqB;EACrB,yBAAyB;EACzB,yBAAyB;EACzB,qBAAqB;EACrB,qDAAqD;EACrD,YAAY;EACZ,8CAA8C;AAChD;;AAEA;EACE,UAAU;EACV,kBAAkB;EAClB,qBAAqB;EACrB,yBAAyB;EACzB,yBAAyB;EACzB,qBAAqB;EACrB,qDAAqD;EACrD,YAAY;EACZ,8CAA8C;AAChD;;AAEA;EACE,kBAAkB;EAClB,WAAW;EACX,SAAS;EACT,WAAW;EACX,YAAY;AACd;;AAEA;EACE,kBAAkB;EAClB,WAAW;EACX,UAAU;EACV,WAAW;EACX,YAAY;AACd;;AAEA;EACE,kBAAkB;EAClB,QAAQ;EACR,SAAS;EACT,gCAAgC;EAChC,UAAU;AACZ;;AAEA;EACE,kBAAkB;EAClB,YAAY;EACZ,WAAW;EACX,WAAW;EACX,YAAY;EACZ,0BAA0B;AAC5B;;AAEA;EACE,kBAAkB;EAClB,YAAY;EACZ,UAAU;EACV,WAAW;EACX,YAAY;EACZ,0BAA0B;AAC5B;;AAEA;EACE,kCAAkC;AACpC;;AAEA;EACE,qBAAqB;EACrB,4BAA4B;AAC9B;;AAEA;EACE,oBAAoB;EACpB,4BAA4B;AAC9B;;AAEA;EACE;IACE,sCAAsC;EACxC;EACA;IACE,wCAAwC;EAC1C;EACA;IACE,wCAAwC;EAC1C;EACA;IACE,wCAAwC;EAC1C;EACA;IACE,wCAAwC;EAC1C;EACA;IACE,wCAAwC;EAC1C;EACA;IACE,wCAAwC;EAC1C;EACA;IACE,wCAAwC;EAC1C;EACA;IACE,wCAAwC;EAC1C;EACA;IACE,wCAAwC;EAC1C;EACA;IACE,sCAAsC;EACxC;AACF;;AAEA;EACE;IACE,6CAA6C;IAC7C,sCAAsC;EACxC;EACA;IACE,8CAA8C;IAC9C,wCAAwC;EAC1C;EACA;IACE,6CAA6C;IAC7C,wCAAwC;EAC1C;EACA;IACE,6CAA6C;IAC7C,wCAAwC;EAC1C;EACA;IACE,6CAA6C;IAC7C,wCAAwC;EAC1C;EACA;IACE,8CAA8C;IAC9C,wCAAwC;EAC1C;EACA;IACE,6CAA6C;IAC7C,wCAAwC;EAC1C;EACA;IACE,8CAA8C;IAC9C,wCAAwC;EAC1C;EACA;IACE,6CAA6C;IAC7C,wCAAwC;EAC1C;EACA;IACE,6CAA6C;IAC7C,wCAAwC;EAC1C;EACA;IACE,8CAA8C;IAC9C,sCAAsC;EACxC;AACF","sourcesContent":[".pui_Container {\r\n  position: fixed;\r\n  bottom: 0;\r\n  left: 50%;\r\n  transform: translateX(-50%);\r\n\r\n  height: 200px;\r\n  width: 900px;\r\n\r\n  display: flex;\r\n  justify-content: center;\r\n  gap: 25px;\r\n  align-content: center;\r\n  z-index: 17;\r\n}\r\n\r\n.pui_playerContainer {\r\n  height: 200px;\r\n  width: 200px;\r\n  position: relative;\r\n}\r\n\r\n.pui_svg {\r\n  width: 140px;\r\n  height: 140px;\r\n  position: absolute;\r\n  top: 50%;\r\n  left: 50%;\r\n  transform: translate(-50%, -50%);\r\n  border: 1px solid transparent;\r\n  border-radius: 50%;\r\n}\r\n\r\n.pui_bg {\r\n  fill: none;\r\n  stroke-width: 10px;\r\n  stroke: #1a2c34;\r\n}\r\n\r\n.pui_meter-1 {\r\n  fill: none;\r\n  stroke-width: 10px;\r\n  stroke-linecap: round;\r\n  transform: rotate(-90deg);\r\n  transform-origin: 50% 50%;\r\n  stroke-dasharray: 405;\r\n  stroke-dashoffset: calc(65 * 0.01745 * var(--angle1));\r\n  stroke: lime;\r\n  transition: stroke-dashoffset 0.2s ease-in-out;\r\n}\r\n\r\n.pui_meter-2 {\r\n  fill: none;\r\n  stroke-width: 10px;\r\n  stroke-linecap: round;\r\n  transform: rotate(-90deg);\r\n  transform-origin: 50% 50%;\r\n  stroke-dasharray: 405;\r\n  stroke-dashoffset: calc(65 * 0.01745 * var(--angle2));\r\n  stroke: lime;\r\n  transition: stroke-dashoffset 0.2s ease-in-out;\r\n}\r\n\r\n.pui_meter-3 {\r\n  fill: none;\r\n  stroke-width: 10px;\r\n  stroke-linecap: round;\r\n  transform: rotate(-90deg);\r\n  transform-origin: 50% 50%;\r\n  stroke-dasharray: 405;\r\n  stroke-dashoffset: calc(65 * 0.01745 * var(--angle3));\r\n  stroke: lime;\r\n  transition: stroke-dashoffset 0.2s ease-in-out;\r\n}\r\n\r\n.pui_meter-4 {\r\n  fill: none;\r\n  stroke-width: 10px;\r\n  stroke-linecap: round;\r\n  transform: rotate(-90deg);\r\n  transform-origin: 50% 50%;\r\n  stroke-dasharray: 405;\r\n  stroke-dashoffset: calc(65 * 0.01745 * var(--angle4));\r\n  stroke: lime;\r\n  transition: stroke-dashoffset 0.2s ease-in-out;\r\n}\r\n\r\n.pui_atkIMG {\r\n  position: absolute;\r\n  bottom: 5px;\r\n  left: 5px;\r\n  width: 30px;\r\n  height: 30px;\r\n}\r\n\r\n.pui_coinIMG {\r\n  position: absolute;\r\n  bottom: 5px;\r\n  right: 5px;\r\n  width: 30px;\r\n  height: 30px;\r\n}\r\n\r\n.pui_character {\r\n  position: absolute;\r\n  top: 50%;\r\n  left: 50%;\r\n  transform: translate(-50%, -50%);\r\n  z-index: 3;\r\n}\r\n\r\n.pui_coin_text {\r\n  position: absolute;\r\n  bottom: 20px;\r\n  right: 10px;\r\n  width: 20px;\r\n  height: 20px;\r\n  text-shadow: 2px 2px black;\r\n}\r\n\r\n.pui_atk_text {\r\n  position: absolute;\r\n  bottom: 20px;\r\n  left: 10px;\r\n  width: 20px;\r\n  height: 20px;\r\n  text-shadow: 2px 2px black;\r\n}\r\n\r\n.playerBloom {\r\n  box-shadow: 0px 0px 15px 0px white;\r\n}\r\n\r\n.playerdamage {\r\n  animation: shake 0.5s;\r\n  animation-iteration-count: 1;\r\n}\r\n\r\n.playerHeal {\r\n  animation: heal 0.5s;\r\n  animation-iteration-count: 1;\r\n}\r\n\r\n@keyframes heal {\r\n  0% {\r\n    background-color: rgba(14, 232, 14, 1);\r\n  }\r\n  10% {\r\n    background-color: rgba(14, 232, 14, 0.9);\r\n  }\r\n  20% {\r\n    background-color: rgba(14, 232, 14, 0.8);\r\n  }\r\n  30% {\r\n    background-color: rgba(14, 232, 14, 0.7);\r\n  }\r\n  40% {\r\n    background-color: rgba(14, 232, 14, 0.6);\r\n  }\r\n  50% {\r\n    background-color: rgba(14, 232, 14, 0.5);\r\n  }\r\n  60% {\r\n    background-color: rgba(14, 232, 14, 0.4);\r\n  }\r\n  70% {\r\n    background-color: rgba(14, 232, 14, 0.3);\r\n  }\r\n  80% {\r\n    background-color: rgba(14, 232, 14, 0.2);\r\n  }\r\n  90% {\r\n    background-color: rgba(14, 232, 14, 0.1);\r\n  }\r\n  100% {\r\n    background-color: rgba(14, 232, 14, 0);\r\n  }\r\n}\r\n\r\n@keyframes shake {\r\n  0% {\r\n    transform: translate(-49%, -49%) rotate(0deg);\r\n    background-color: rgba(230, 14, 14, 1);\r\n  }\r\n  10% {\r\n    transform: translate(-51%, -52%) rotate(-1deg);\r\n    background-color: rgba(230, 14, 14, 0.9);\r\n  }\r\n  20% {\r\n    transform: translate(-53%, -50%) rotate(1deg);\r\n    background-color: rgba(230, 14, 14, 0.8);\r\n  }\r\n  30% {\r\n    transform: translate(-47%, -48%) rotate(0deg);\r\n    background-color: rgba(230, 14, 14, 0.7);\r\n  }\r\n  40% {\r\n    transform: translate(-49%, -51%) rotate(1deg);\r\n    background-color: rgba(230, 14, 14, 0.6);\r\n  }\r\n  50% {\r\n    transform: translate(-51%, -48%) rotate(-1deg);\r\n    background-color: rgba(230, 14, 14, 0.5);\r\n  }\r\n  60% {\r\n    transform: translate(-53%, -49%) rotate(0deg);\r\n    background-color: rgba(230, 14, 14, 0.4);\r\n  }\r\n  70% {\r\n    transform: translate(-47%, -49%) rotate(-1deg);\r\n    background-color: rgba(230, 14, 14, 0.3);\r\n  }\r\n  80% {\r\n    transform: translate(-51%, -51%) rotate(1deg);\r\n    background-color: rgba(230, 14, 14, 0.2);\r\n  }\r\n  90% {\r\n    transform: translate(-49%, -48%) rotate(0deg);\r\n    background-color: rgba(230, 14, 14, 0.1);\r\n  }\r\n  100% {\r\n    transform: translate(-50%, -50%) rotate(-1deg);\r\n    background-color: rgba(230, 14, 14, 0);\r\n  }\r\n}\r\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./src/styles/pointPlacard.css":
/*!***************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/styles/pointPlacard.css ***!
  \***************************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, ".Plac_container {\r\n  position: absolute;\r\n  width: 30px;\r\n  height: 30px;\r\n}\r\n\r\n.Plac_txt {\r\n  font-size: larger;\r\n  font-family: fantasy;\r\n  width: 100%;\r\n  height: 100%;\r\n  text-align: center;\r\n  z-index: 25;\r\n}\r\n\r\n.Plac_atk {\r\n  left: -10px;\r\n  top: 95px;\r\n}\r\n\r\n.Plac_coin {\r\n  right: -5px;\r\n  top: 95px;\r\n}\r\n", "",{"version":3,"sources":["webpack://./src/styles/pointPlacard.css"],"names":[],"mappings":"AAAA;EACE,kBAAkB;EAClB,WAAW;EACX,YAAY;AACd;;AAEA;EACE,iBAAiB;EACjB,oBAAoB;EACpB,WAAW;EACX,YAAY;EACZ,kBAAkB;EAClB,WAAW;AACb;;AAEA;EACE,WAAW;EACX,SAAS;AACX;;AAEA;EACE,WAAW;EACX,SAAS;AACX","sourcesContent":[".Plac_container {\r\n  position: absolute;\r\n  width: 30px;\r\n  height: 30px;\r\n}\r\n\r\n.Plac_txt {\r\n  font-size: larger;\r\n  font-family: fantasy;\r\n  width: 100%;\r\n  height: 100%;\r\n  text-align: center;\r\n  z-index: 25;\r\n}\r\n\r\n.Plac_atk {\r\n  left: -10px;\r\n  top: 95px;\r\n}\r\n\r\n.Plac_coin {\r\n  right: -5px;\r\n  top: 95px;\r\n}\r\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./src/styles/sceneTransition.css":
/*!******************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/styles/sceneTransition.css ***!
  \******************************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, ".sceneTransition {\r\n  background-color: #ffffff;\r\n  opacity: 0;\r\n  z-index: 9999999;\r\n  animation: scene-transition-fade-in 0.8s forwards;\r\n}\r\n\r\n.normal {\r\n  position: absolute;\r\n  top: 0;\r\n  left: 0;\r\n  width: var(--game-width);\r\n  height: var(--game-height);\r\n}\r\n\r\n.sceneTransition.fade-out {\r\n  animation: scene-transition-fade-out 0.8s forwards;\r\n}\r\n\r\n@keyframes scene-transition-fade-in {\r\n  from {\r\n    opacity: 0;\r\n  }\r\n  to {\r\n    opacity: 1;\r\n  }\r\n}\r\n@keyframes scene-transition-fade-out {\r\n  from {\r\n    opacity: 1;\r\n  }\r\n  to {\r\n    opacity: 0;\r\n  }\r\n}\r\n", "",{"version":3,"sources":["webpack://./src/styles/sceneTransition.css"],"names":[],"mappings":"AAAA;EACE,yBAAyB;EACzB,UAAU;EACV,gBAAgB;EAChB,iDAAiD;AACnD;;AAEA;EACE,kBAAkB;EAClB,MAAM;EACN,OAAO;EACP,wBAAwB;EACxB,0BAA0B;AAC5B;;AAEA;EACE,kDAAkD;AACpD;;AAEA;EACE;IACE,UAAU;EACZ;EACA;IACE,UAAU;EACZ;AACF;AACA;EACE;IACE,UAAU;EACZ;EACA;IACE,UAAU;EACZ;AACF","sourcesContent":[".sceneTransition {\r\n  background-color: #ffffff;\r\n  opacity: 0;\r\n  z-index: 9999999;\r\n  animation: scene-transition-fade-in 0.8s forwards;\r\n}\r\n\r\n.normal {\r\n  position: absolute;\r\n  top: 0;\r\n  left: 0;\r\n  width: var(--game-width);\r\n  height: var(--game-height);\r\n}\r\n\r\n.sceneTransition.fade-out {\r\n  animation: scene-transition-fade-out 0.8s forwards;\r\n}\r\n\r\n@keyframes scene-transition-fade-in {\r\n  from {\r\n    opacity: 0;\r\n  }\r\n  to {\r\n    opacity: 1;\r\n  }\r\n}\r\n@keyframes scene-transition-fade-out {\r\n  from {\r\n    opacity: 1;\r\n  }\r\n  to {\r\n    opacity: 0;\r\n  }\r\n}\r\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./src/styles/settings.css":
/*!***********************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/styles/settings.css ***!
  \***********************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/getUrl.js */ "./node_modules/css-loader/dist/runtime/getUrl.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__);
// Imports



var ___CSS_LOADER_URL_IMPORT_0___ = new URL(/* asset import */ __webpack_require__(/*! ../assets/border.svg */ "./src/assets/border.svg"), __webpack_require__.b);
var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
var ___CSS_LOADER_URL_REPLACEMENT_0___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_0___);
// Module
___CSS_LOADER_EXPORT___.push([module.id, ".settings_container {\r\n  position: fixed;\r\n  top: 0;\r\n  left: 0;\r\n  width: var(--game-width);\r\n  height: var(--game-height);\r\n  z-index: 999999;\r\n}\r\n\r\n.setting_relative_container {\r\n  position: relative;\r\n  top: 0;\r\n  left: 0;\r\n  width: var(--game-width);\r\n  height: var(--game-height);\r\n}\r\n\r\n.settings_inner_container {\r\n  position: absolute;\r\n  top: 50%;\r\n  left: 50%;\r\n  transform: translate(-50%, -50%);\r\n  width: 500px;\r\n  height: 560px;\r\n  border: 15px solid;\r\n  border-radius: 5px;\r\n  border-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_0___ + ");\r\n  border-image-slice: 15;\r\n  background-image: linear-gradient(to bottom right, var(--background-start), var(--background-end));\r\n  background-size: cover;\r\n  background-repeat: no-repeat;\r\n}\r\n\r\n.settings_inner_cont_rel {\r\n  position: relative;\r\n  width: 100%;\r\n  height: 100%;\r\n}\r\n\r\n.settings_background_mask {\r\n  position: absolute;\r\n  top: 0;\r\n  left: 0;\r\n  width: var(--game-width);\r\n  height: var(--game-height);\r\n  background-color: rgba(0, 0, 0, 0.6);\r\n  backdrop-filter: blur(4px);\r\n}\r\n\r\n.setting_title {\r\n  position: absolute;\r\n  top: 10px;\r\n  left: 0;\r\n  height: 30px;\r\n  text-align: center;\r\n  width: 100%;\r\n  text-shadow: 2px 2px black;\r\n}\r\n\r\n.settings_chat_cont {\r\n  position: absolute;\r\n  min-width: 475px;\r\n  min-height: 50px;\r\n  top: 50px;\r\n}\r\n\r\n.settings_chat_rel {\r\n  position: relative;\r\n  width: 100%;\r\n  height: 100%;\r\n}\r\n\r\n.settings_chat_label {\r\n  position: absolute;\r\n  color: #ddddff;\r\n  top: 20px;\r\n  left: 25px;\r\n  font-size: large;\r\n  text-shadow: 2px 2px black;\r\n}\r\n\r\n.settings_chat_um_label {\r\n  position: absolute;\r\n  top: 30px;\r\n  left: 150px;\r\n  width: 100px;\r\n  height: 25px;\r\n  font-size: small;\r\n  text-shadow: 2px 2px black;\r\n  color: #ddddff;\r\n}\r\n\r\n.settings_chat_um_color {\r\n  position: absolute;\r\n  top: 25px;\r\n  left: 275px;\r\n  width: 50px;\r\n  height: 25px;\r\n  font-size: small;\r\n}\r\n\r\n.settings_chat_sys_label {\r\n  position: absolute;\r\n  top: 65px;\r\n  left: 150px;\r\n  width: 110px;\r\n  height: 25px;\r\n  font-size: small;\r\n  text-shadow: 2px 2px black;\r\n  color: #ddddff;\r\n}\r\n\r\n.settings_chat_sys_color {\r\n  position: absolute;\r\n  top: 60px;\r\n  left: 275px;\r\n  width: 50px;\r\n  height: 25px;\r\n  font-size: small;\r\n}\r\n\r\n.settings_chat_om_label {\r\n  position: absolute;\r\n  top: 100px;\r\n  left: 150px;\r\n  width: 100px;\r\n  height: 25px;\r\n  font-size: small;\r\n  text-shadow: 2px 2px black;\r\n  color: #ddddff;\r\n}\r\n\r\n.settings_chat_om_color {\r\n  position: absolute;\r\n  top: 95px;\r\n  left: 275px;\r\n  width: 50px;\r\n  height: 25px;\r\n  font-size: small;\r\n}\r\n\r\n.settings_chat_bg_label {\r\n  position: absolute;\r\n  top: 135px;\r\n  left: 150px;\r\n  width: 50px;\r\n  height: 25px;\r\n  font-size: small;\r\n  text-shadow: 2px 2px black;\r\n  color: #ddddff;\r\n}\r\n\r\n.settings_chat_bg_color {\r\n  position: absolute;\r\n  top: 130px;\r\n  left: 275px;\r\n  width: 50px;\r\n  height: 25px;\r\n  font-size: small;\r\n}\r\n\r\n.settings_chat_op_label {\r\n  position: absolute;\r\n  top: 170px;\r\n  left: 150px;\r\n  width: 100px;\r\n  height: 25px;\r\n  font-size: small;\r\n  text-shadow: 2px 2px black;\r\n  color: #ddddff;\r\n}\r\n\r\n.settings_chat_op_color {\r\n  position: absolute;\r\n  top: 160px;\r\n  left: 275px;\r\n  width: 180px;\r\n  height: 25px;\r\n  font-size: small;\r\n}\r\n\r\n.settings_screen_color_cont {\r\n  position: absolute;\r\n  top: 260px;\r\n  left: 20px;\r\n}\r\n\r\n.settings_screen_color_label {\r\n  position: absolute;\r\n  color: #ddddff;\r\n  top: 20px;\r\n  left: 0px;\r\n  width: 130px;\r\n  font-size: large;\r\n  text-shadow: 2px 2px black;\r\n}\r\n\r\n.settings_screen_color_label_end {\r\n  position: absolute;\r\n  color: #ddddff;\r\n  top: 25px;\r\n  left: 270px;\r\n  font-size: small;\r\n  text-shadow: 2px 2px black;\r\n}\r\n\r\n.settings_screen_color_label_beg {\r\n  position: absolute;\r\n  color: #ddddff;\r\n  top: 25px;\r\n  left: 130px;\r\n  font-size: small;\r\n  text-shadow: 2px 2px black;\r\n}\r\n\r\n.settings_screen_color_color_end {\r\n  position: absolute;\r\n  color: #ddddff;\r\n  top: 20px;\r\n  left: 330px;\r\n  font-size: small;\r\n}\r\n\r\n.settings_screen_color_color_beg {\r\n  position: absolute;\r\n  color: #ddddff;\r\n  top: 20px;\r\n  left: 210px;\r\n  font-size: small;\r\n}\r\n\r\n.settings_gamespeed_cont {\r\n  position: absolute;\r\n  top: 320px;\r\n  left: 20px;\r\n}\r\n\r\n.settings_gamespeed_label {\r\n  position: absolute;\r\n  color: #ddddff;\r\n  top: 20px;\r\n  left: 0px;\r\n  width: 120px;\r\n  font-size: large;\r\n  text-shadow: 2px 2px black;\r\n}\r\n\r\n.settings_gamespeed_label_low {\r\n  position: absolute;\r\n  color: #ddddff;\r\n  top: 20px;\r\n  left: 130px;\r\n  font-size: small;\r\n  text-shadow: 2px 2px black;\r\n}\r\n\r\n.settings_gamespeed_slider {\r\n  position: absolute;\r\n  color: #ddddff;\r\n  top: 20px;\r\n  left: 180px;\r\n  width: 200px;\r\n  font-size: small;\r\n}\r\n\r\n.settings_gamespeed_label_high {\r\n  position: absolute;\r\n  color: #ddddff;\r\n  top: 20px;\r\n  left: 400px;\r\n  font-size: small;\r\n  text-shadow: 2px 2px black;\r\n}\r\n\r\n.settings_sfx_cont {\r\n  position: absolute;\r\n  top: 380px;\r\n  left: 0px;\r\n}\r\n\r\n.settings_sfx_label {\r\n  position: absolute;\r\n  color: #ddddff;\r\n  top: 20px;\r\n  left: 20px;\r\n  width: 110px;\r\n  font-size: large;\r\n  text-shadow: 2px 2px black;\r\n}\r\n\r\n.settings_sfx_slider {\r\n  position: absolute;\r\n  color: #ddddff;\r\n  top: 17px;\r\n  left: 240px;\r\n  width: 160px;\r\n  font-size: small;\r\n}\r\n\r\n.settings_sfx_icon {\r\n  position: absolute;\r\n  top: 15px;\r\n  left: 155px;\r\n  width: 25px;\r\n  height: 25px;\r\n}\r\n\r\n.settings_sfx_label_low {\r\n  position: absolute;\r\n  color: #ddddff;\r\n  top: 20px;\r\n  left: 200px;\r\n  font-size: small;\r\n  text-shadow: 2px 2px black;\r\n}\r\n\r\n.settings_sfx_label_high {\r\n  position: absolute;\r\n  color: #ddddff;\r\n  top: 20px;\r\n  left: 420px;\r\n  font-size: small;\r\n  text-shadow: 2px 2px black;\r\n}\r\n\r\n.settings_bgm_cont {\r\n  position: absolute;\r\n  top: 435px;\r\n  left: 0px;\r\n}\r\n\r\n.settings_bgm_label {\r\n  position: absolute;\r\n  color: #ddddff;\r\n  top: 20px;\r\n  left: 20px;\r\n  width: 120px;\r\n  font-size: large;\r\n  text-shadow: 2px 2px black;\r\n}\r\n\r\n.settings_bgm_label_low {\r\n  position: absolute;\r\n  color: #ddddff;\r\n  top: 20px;\r\n  left: 200px;\r\n  font-size: small;\r\n  text-shadow: 2px 2px black;\r\n}\r\n.settings_bgm_range_slider {\r\n  position: absolute;\r\n  color: #ddddff;\r\n  top: 17px;\r\n  left: 240px;\r\n  width: 160px;\r\n  font-size: small;\r\n}\r\n\r\n.settings_bgm_label_high {\r\n  position: absolute;\r\n  color: #ddddff;\r\n  top: 20px;\r\n  left: 420px;\r\n  font-size: small;\r\n  text-shadow: 2px 2px black;\r\n}\r\n\r\n.settings_bgm_icon {\r\n  position: absolute;\r\n  top: 15px;\r\n  left: 155px;\r\n  width: 25px;\r\n  height: 25px;\r\n}\r\n\r\n.settings_ok {\r\n  position: absolute;\r\n  bottom: 10px;\r\n  left: 50%;\r\n  transform: translateX(-50%);\r\n  width: 110px;\r\n  height: 50px;\r\n  padding: 10px 10px;\r\n}\r\n", "",{"version":3,"sources":["webpack://./src/styles/settings.css"],"names":[],"mappings":"AAAA;EACE,eAAe;EACf,MAAM;EACN,OAAO;EACP,wBAAwB;EACxB,0BAA0B;EAC1B,eAAe;AACjB;;AAEA;EACE,kBAAkB;EAClB,MAAM;EACN,OAAO;EACP,wBAAwB;EACxB,0BAA0B;AAC5B;;AAEA;EACE,kBAAkB;EAClB,QAAQ;EACR,SAAS;EACT,gCAAgC;EAChC,YAAY;EACZ,aAAa;EACb,kBAAkB;EAClB,kBAAkB;EAClB,qDAAyC;EACzC,sBAAsB;EACtB,kGAAkG;EAClG,sBAAsB;EACtB,4BAA4B;AAC9B;;AAEA;EACE,kBAAkB;EAClB,WAAW;EACX,YAAY;AACd;;AAEA;EACE,kBAAkB;EAClB,MAAM;EACN,OAAO;EACP,wBAAwB;EACxB,0BAA0B;EAC1B,oCAAoC;EACpC,0BAA0B;AAC5B;;AAEA;EACE,kBAAkB;EAClB,SAAS;EACT,OAAO;EACP,YAAY;EACZ,kBAAkB;EAClB,WAAW;EACX,0BAA0B;AAC5B;;AAEA;EACE,kBAAkB;EAClB,gBAAgB;EAChB,gBAAgB;EAChB,SAAS;AACX;;AAEA;EACE,kBAAkB;EAClB,WAAW;EACX,YAAY;AACd;;AAEA;EACE,kBAAkB;EAClB,cAAc;EACd,SAAS;EACT,UAAU;EACV,gBAAgB;EAChB,0BAA0B;AAC5B;;AAEA;EACE,kBAAkB;EAClB,SAAS;EACT,WAAW;EACX,YAAY;EACZ,YAAY;EACZ,gBAAgB;EAChB,0BAA0B;EAC1B,cAAc;AAChB;;AAEA;EACE,kBAAkB;EAClB,SAAS;EACT,WAAW;EACX,WAAW;EACX,YAAY;EACZ,gBAAgB;AAClB;;AAEA;EACE,kBAAkB;EAClB,SAAS;EACT,WAAW;EACX,YAAY;EACZ,YAAY;EACZ,gBAAgB;EAChB,0BAA0B;EAC1B,cAAc;AAChB;;AAEA;EACE,kBAAkB;EAClB,SAAS;EACT,WAAW;EACX,WAAW;EACX,YAAY;EACZ,gBAAgB;AAClB;;AAEA;EACE,kBAAkB;EAClB,UAAU;EACV,WAAW;EACX,YAAY;EACZ,YAAY;EACZ,gBAAgB;EAChB,0BAA0B;EAC1B,cAAc;AAChB;;AAEA;EACE,kBAAkB;EAClB,SAAS;EACT,WAAW;EACX,WAAW;EACX,YAAY;EACZ,gBAAgB;AAClB;;AAEA;EACE,kBAAkB;EAClB,UAAU;EACV,WAAW;EACX,WAAW;EACX,YAAY;EACZ,gBAAgB;EAChB,0BAA0B;EAC1B,cAAc;AAChB;;AAEA;EACE,kBAAkB;EAClB,UAAU;EACV,WAAW;EACX,WAAW;EACX,YAAY;EACZ,gBAAgB;AAClB;;AAEA;EACE,kBAAkB;EAClB,UAAU;EACV,WAAW;EACX,YAAY;EACZ,YAAY;EACZ,gBAAgB;EAChB,0BAA0B;EAC1B,cAAc;AAChB;;AAEA;EACE,kBAAkB;EAClB,UAAU;EACV,WAAW;EACX,YAAY;EACZ,YAAY;EACZ,gBAAgB;AAClB;;AAEA;EACE,kBAAkB;EAClB,UAAU;EACV,UAAU;AACZ;;AAEA;EACE,kBAAkB;EAClB,cAAc;EACd,SAAS;EACT,SAAS;EACT,YAAY;EACZ,gBAAgB;EAChB,0BAA0B;AAC5B;;AAEA;EACE,kBAAkB;EAClB,cAAc;EACd,SAAS;EACT,WAAW;EACX,gBAAgB;EAChB,0BAA0B;AAC5B;;AAEA;EACE,kBAAkB;EAClB,cAAc;EACd,SAAS;EACT,WAAW;EACX,gBAAgB;EAChB,0BAA0B;AAC5B;;AAEA;EACE,kBAAkB;EAClB,cAAc;EACd,SAAS;EACT,WAAW;EACX,gBAAgB;AAClB;;AAEA;EACE,kBAAkB;EAClB,cAAc;EACd,SAAS;EACT,WAAW;EACX,gBAAgB;AAClB;;AAEA;EACE,kBAAkB;EAClB,UAAU;EACV,UAAU;AACZ;;AAEA;EACE,kBAAkB;EAClB,cAAc;EACd,SAAS;EACT,SAAS;EACT,YAAY;EACZ,gBAAgB;EAChB,0BAA0B;AAC5B;;AAEA;EACE,kBAAkB;EAClB,cAAc;EACd,SAAS;EACT,WAAW;EACX,gBAAgB;EAChB,0BAA0B;AAC5B;;AAEA;EACE,kBAAkB;EAClB,cAAc;EACd,SAAS;EACT,WAAW;EACX,YAAY;EACZ,gBAAgB;AAClB;;AAEA;EACE,kBAAkB;EAClB,cAAc;EACd,SAAS;EACT,WAAW;EACX,gBAAgB;EAChB,0BAA0B;AAC5B;;AAEA;EACE,kBAAkB;EAClB,UAAU;EACV,SAAS;AACX;;AAEA;EACE,kBAAkB;EAClB,cAAc;EACd,SAAS;EACT,UAAU;EACV,YAAY;EACZ,gBAAgB;EAChB,0BAA0B;AAC5B;;AAEA;EACE,kBAAkB;EAClB,cAAc;EACd,SAAS;EACT,WAAW;EACX,YAAY;EACZ,gBAAgB;AAClB;;AAEA;EACE,kBAAkB;EAClB,SAAS;EACT,WAAW;EACX,WAAW;EACX,YAAY;AACd;;AAEA;EACE,kBAAkB;EAClB,cAAc;EACd,SAAS;EACT,WAAW;EACX,gBAAgB;EAChB,0BAA0B;AAC5B;;AAEA;EACE,kBAAkB;EAClB,cAAc;EACd,SAAS;EACT,WAAW;EACX,gBAAgB;EAChB,0BAA0B;AAC5B;;AAEA;EACE,kBAAkB;EAClB,UAAU;EACV,SAAS;AACX;;AAEA;EACE,kBAAkB;EAClB,cAAc;EACd,SAAS;EACT,UAAU;EACV,YAAY;EACZ,gBAAgB;EAChB,0BAA0B;AAC5B;;AAEA;EACE,kBAAkB;EAClB,cAAc;EACd,SAAS;EACT,WAAW;EACX,gBAAgB;EAChB,0BAA0B;AAC5B;AACA;EACE,kBAAkB;EAClB,cAAc;EACd,SAAS;EACT,WAAW;EACX,YAAY;EACZ,gBAAgB;AAClB;;AAEA;EACE,kBAAkB;EAClB,cAAc;EACd,SAAS;EACT,WAAW;EACX,gBAAgB;EAChB,0BAA0B;AAC5B;;AAEA;EACE,kBAAkB;EAClB,SAAS;EACT,WAAW;EACX,WAAW;EACX,YAAY;AACd;;AAEA;EACE,kBAAkB;EAClB,YAAY;EACZ,SAAS;EACT,2BAA2B;EAC3B,YAAY;EACZ,YAAY;EACZ,kBAAkB;AACpB","sourcesContent":[".settings_container {\r\n  position: fixed;\r\n  top: 0;\r\n  left: 0;\r\n  width: var(--game-width);\r\n  height: var(--game-height);\r\n  z-index: 999999;\r\n}\r\n\r\n.setting_relative_container {\r\n  position: relative;\r\n  top: 0;\r\n  left: 0;\r\n  width: var(--game-width);\r\n  height: var(--game-height);\r\n}\r\n\r\n.settings_inner_container {\r\n  position: absolute;\r\n  top: 50%;\r\n  left: 50%;\r\n  transform: translate(-50%, -50%);\r\n  width: 500px;\r\n  height: 560px;\r\n  border: 15px solid;\r\n  border-radius: 5px;\r\n  border-image: url(\"../assets/border.svg\");\r\n  border-image-slice: 15;\r\n  background-image: linear-gradient(to bottom right, var(--background-start), var(--background-end));\r\n  background-size: cover;\r\n  background-repeat: no-repeat;\r\n}\r\n\r\n.settings_inner_cont_rel {\r\n  position: relative;\r\n  width: 100%;\r\n  height: 100%;\r\n}\r\n\r\n.settings_background_mask {\r\n  position: absolute;\r\n  top: 0;\r\n  left: 0;\r\n  width: var(--game-width);\r\n  height: var(--game-height);\r\n  background-color: rgba(0, 0, 0, 0.6);\r\n  backdrop-filter: blur(4px);\r\n}\r\n\r\n.setting_title {\r\n  position: absolute;\r\n  top: 10px;\r\n  left: 0;\r\n  height: 30px;\r\n  text-align: center;\r\n  width: 100%;\r\n  text-shadow: 2px 2px black;\r\n}\r\n\r\n.settings_chat_cont {\r\n  position: absolute;\r\n  min-width: 475px;\r\n  min-height: 50px;\r\n  top: 50px;\r\n}\r\n\r\n.settings_chat_rel {\r\n  position: relative;\r\n  width: 100%;\r\n  height: 100%;\r\n}\r\n\r\n.settings_chat_label {\r\n  position: absolute;\r\n  color: #ddddff;\r\n  top: 20px;\r\n  left: 25px;\r\n  font-size: large;\r\n  text-shadow: 2px 2px black;\r\n}\r\n\r\n.settings_chat_um_label {\r\n  position: absolute;\r\n  top: 30px;\r\n  left: 150px;\r\n  width: 100px;\r\n  height: 25px;\r\n  font-size: small;\r\n  text-shadow: 2px 2px black;\r\n  color: #ddddff;\r\n}\r\n\r\n.settings_chat_um_color {\r\n  position: absolute;\r\n  top: 25px;\r\n  left: 275px;\r\n  width: 50px;\r\n  height: 25px;\r\n  font-size: small;\r\n}\r\n\r\n.settings_chat_sys_label {\r\n  position: absolute;\r\n  top: 65px;\r\n  left: 150px;\r\n  width: 110px;\r\n  height: 25px;\r\n  font-size: small;\r\n  text-shadow: 2px 2px black;\r\n  color: #ddddff;\r\n}\r\n\r\n.settings_chat_sys_color {\r\n  position: absolute;\r\n  top: 60px;\r\n  left: 275px;\r\n  width: 50px;\r\n  height: 25px;\r\n  font-size: small;\r\n}\r\n\r\n.settings_chat_om_label {\r\n  position: absolute;\r\n  top: 100px;\r\n  left: 150px;\r\n  width: 100px;\r\n  height: 25px;\r\n  font-size: small;\r\n  text-shadow: 2px 2px black;\r\n  color: #ddddff;\r\n}\r\n\r\n.settings_chat_om_color {\r\n  position: absolute;\r\n  top: 95px;\r\n  left: 275px;\r\n  width: 50px;\r\n  height: 25px;\r\n  font-size: small;\r\n}\r\n\r\n.settings_chat_bg_label {\r\n  position: absolute;\r\n  top: 135px;\r\n  left: 150px;\r\n  width: 50px;\r\n  height: 25px;\r\n  font-size: small;\r\n  text-shadow: 2px 2px black;\r\n  color: #ddddff;\r\n}\r\n\r\n.settings_chat_bg_color {\r\n  position: absolute;\r\n  top: 130px;\r\n  left: 275px;\r\n  width: 50px;\r\n  height: 25px;\r\n  font-size: small;\r\n}\r\n\r\n.settings_chat_op_label {\r\n  position: absolute;\r\n  top: 170px;\r\n  left: 150px;\r\n  width: 100px;\r\n  height: 25px;\r\n  font-size: small;\r\n  text-shadow: 2px 2px black;\r\n  color: #ddddff;\r\n}\r\n\r\n.settings_chat_op_color {\r\n  position: absolute;\r\n  top: 160px;\r\n  left: 275px;\r\n  width: 180px;\r\n  height: 25px;\r\n  font-size: small;\r\n}\r\n\r\n.settings_screen_color_cont {\r\n  position: absolute;\r\n  top: 260px;\r\n  left: 20px;\r\n}\r\n\r\n.settings_screen_color_label {\r\n  position: absolute;\r\n  color: #ddddff;\r\n  top: 20px;\r\n  left: 0px;\r\n  width: 130px;\r\n  font-size: large;\r\n  text-shadow: 2px 2px black;\r\n}\r\n\r\n.settings_screen_color_label_end {\r\n  position: absolute;\r\n  color: #ddddff;\r\n  top: 25px;\r\n  left: 270px;\r\n  font-size: small;\r\n  text-shadow: 2px 2px black;\r\n}\r\n\r\n.settings_screen_color_label_beg {\r\n  position: absolute;\r\n  color: #ddddff;\r\n  top: 25px;\r\n  left: 130px;\r\n  font-size: small;\r\n  text-shadow: 2px 2px black;\r\n}\r\n\r\n.settings_screen_color_color_end {\r\n  position: absolute;\r\n  color: #ddddff;\r\n  top: 20px;\r\n  left: 330px;\r\n  font-size: small;\r\n}\r\n\r\n.settings_screen_color_color_beg {\r\n  position: absolute;\r\n  color: #ddddff;\r\n  top: 20px;\r\n  left: 210px;\r\n  font-size: small;\r\n}\r\n\r\n.settings_gamespeed_cont {\r\n  position: absolute;\r\n  top: 320px;\r\n  left: 20px;\r\n}\r\n\r\n.settings_gamespeed_label {\r\n  position: absolute;\r\n  color: #ddddff;\r\n  top: 20px;\r\n  left: 0px;\r\n  width: 120px;\r\n  font-size: large;\r\n  text-shadow: 2px 2px black;\r\n}\r\n\r\n.settings_gamespeed_label_low {\r\n  position: absolute;\r\n  color: #ddddff;\r\n  top: 20px;\r\n  left: 130px;\r\n  font-size: small;\r\n  text-shadow: 2px 2px black;\r\n}\r\n\r\n.settings_gamespeed_slider {\r\n  position: absolute;\r\n  color: #ddddff;\r\n  top: 20px;\r\n  left: 180px;\r\n  width: 200px;\r\n  font-size: small;\r\n}\r\n\r\n.settings_gamespeed_label_high {\r\n  position: absolute;\r\n  color: #ddddff;\r\n  top: 20px;\r\n  left: 400px;\r\n  font-size: small;\r\n  text-shadow: 2px 2px black;\r\n}\r\n\r\n.settings_sfx_cont {\r\n  position: absolute;\r\n  top: 380px;\r\n  left: 0px;\r\n}\r\n\r\n.settings_sfx_label {\r\n  position: absolute;\r\n  color: #ddddff;\r\n  top: 20px;\r\n  left: 20px;\r\n  width: 110px;\r\n  font-size: large;\r\n  text-shadow: 2px 2px black;\r\n}\r\n\r\n.settings_sfx_slider {\r\n  position: absolute;\r\n  color: #ddddff;\r\n  top: 17px;\r\n  left: 240px;\r\n  width: 160px;\r\n  font-size: small;\r\n}\r\n\r\n.settings_sfx_icon {\r\n  position: absolute;\r\n  top: 15px;\r\n  left: 155px;\r\n  width: 25px;\r\n  height: 25px;\r\n}\r\n\r\n.settings_sfx_label_low {\r\n  position: absolute;\r\n  color: #ddddff;\r\n  top: 20px;\r\n  left: 200px;\r\n  font-size: small;\r\n  text-shadow: 2px 2px black;\r\n}\r\n\r\n.settings_sfx_label_high {\r\n  position: absolute;\r\n  color: #ddddff;\r\n  top: 20px;\r\n  left: 420px;\r\n  font-size: small;\r\n  text-shadow: 2px 2px black;\r\n}\r\n\r\n.settings_bgm_cont {\r\n  position: absolute;\r\n  top: 435px;\r\n  left: 0px;\r\n}\r\n\r\n.settings_bgm_label {\r\n  position: absolute;\r\n  color: #ddddff;\r\n  top: 20px;\r\n  left: 20px;\r\n  width: 120px;\r\n  font-size: large;\r\n  text-shadow: 2px 2px black;\r\n}\r\n\r\n.settings_bgm_label_low {\r\n  position: absolute;\r\n  color: #ddddff;\r\n  top: 20px;\r\n  left: 200px;\r\n  font-size: small;\r\n  text-shadow: 2px 2px black;\r\n}\r\n.settings_bgm_range_slider {\r\n  position: absolute;\r\n  color: #ddddff;\r\n  top: 17px;\r\n  left: 240px;\r\n  width: 160px;\r\n  font-size: small;\r\n}\r\n\r\n.settings_bgm_label_high {\r\n  position: absolute;\r\n  color: #ddddff;\r\n  top: 20px;\r\n  left: 420px;\r\n  font-size: small;\r\n  text-shadow: 2px 2px black;\r\n}\r\n\r\n.settings_bgm_icon {\r\n  position: absolute;\r\n  top: 15px;\r\n  left: 155px;\r\n  width: 25px;\r\n  height: 25px;\r\n}\r\n\r\n.settings_ok {\r\n  position: absolute;\r\n  bottom: 10px;\r\n  left: 50%;\r\n  transform: translateX(-50%);\r\n  width: 110px;\r\n  height: 50px;\r\n  padding: 10px 10px;\r\n}\r\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./src/styles/staging.css":
/*!**********************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/styles/staging.css ***!
  \**********************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/getUrl.js */ "./node_modules/css-loader/dist/runtime/getUrl.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__);
// Imports



var ___CSS_LOADER_URL_IMPORT_0___ = new URL(/* asset import */ __webpack_require__(/*! ../assets/border.svg */ "./src/assets/border.svg"), __webpack_require__.b);
var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
var ___CSS_LOADER_URL_REPLACEMENT_0___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_0___);
// Module
___CSS_LOADER_EXPORT___.push([module.id, ".stg_Screentitle {\r\n  position: relative;\r\n  top: 20px;\r\n  margin: 0 auto;\r\n  bottom: 650px;\r\n  text-align: center;\r\n}\r\n\r\n.stg_Container {\r\n  position: relative;\r\n  top: 30px;\r\n  left: 300px;\r\n  width: 640px;\r\n  height: 520px;\r\n  border: 20px solid;\r\n  border-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_0___ + ");\r\n  border-image-slice: 20;\r\n  border-radius: 20px;\r\n  display: flex;\r\n  justify-content: space-evenly;\r\n  align-content: center;\r\n  flex-direction: column;\r\n}\r\n\r\n.stg_buttonflex {\r\n  position: relative;\r\n  top: 60px;\r\n  left: 50%;\r\n  transform: translateX(-50%);\r\n  width: 500px;\r\n  height: 60px;\r\n  display: flex;\r\n  justify-content: space-evenly;\r\n  align-content: center;\r\n}\r\n\r\n.stg_PlayerEntry {\r\n  display: flex;\r\n  justify-content: space-between;\r\n  align-content: center;\r\n  border: 3px solid rgb(211, 211, 211);\r\n  border-radius: 5px;\r\n  box-shadow: 5px 5px black;\r\n  min-height: 100px;\r\n  padding: 8px;\r\n  opacity: 1;\r\n  transition: opacity 0.75s ease-in-out;\r\n}\r\n\r\nstg_PlayerEntry.pui-removing {\r\n  opacity: 0;\r\n}\r\n\r\n.stg_textSpan {\r\n  transform: translateY(35%);\r\n  font-size: x-large;\r\n}\r\n", "",{"version":3,"sources":["webpack://./src/styles/staging.css"],"names":[],"mappings":"AAAA;EACE,kBAAkB;EAClB,SAAS;EACT,cAAc;EACd,aAAa;EACb,kBAAkB;AACpB;;AAEA;EACE,kBAAkB;EAClB,SAAS;EACT,WAAW;EACX,YAAY;EACZ,aAAa;EACb,kBAAkB;EAClB,qDAAyC;EACzC,sBAAsB;EACtB,mBAAmB;EACnB,aAAa;EACb,6BAA6B;EAC7B,qBAAqB;EACrB,sBAAsB;AACxB;;AAEA;EACE,kBAAkB;EAClB,SAAS;EACT,SAAS;EACT,2BAA2B;EAC3B,YAAY;EACZ,YAAY;EACZ,aAAa;EACb,6BAA6B;EAC7B,qBAAqB;AACvB;;AAEA;EACE,aAAa;EACb,8BAA8B;EAC9B,qBAAqB;EACrB,oCAAoC;EACpC,kBAAkB;EAClB,yBAAyB;EACzB,iBAAiB;EACjB,YAAY;EACZ,UAAU;EACV,qCAAqC;AACvC;;AAEA;EACE,UAAU;AACZ;;AAEA;EACE,0BAA0B;EAC1B,kBAAkB;AACpB","sourcesContent":[".stg_Screentitle {\r\n  position: relative;\r\n  top: 20px;\r\n  margin: 0 auto;\r\n  bottom: 650px;\r\n  text-align: center;\r\n}\r\n\r\n.stg_Container {\r\n  position: relative;\r\n  top: 30px;\r\n  left: 300px;\r\n  width: 640px;\r\n  height: 520px;\r\n  border: 20px solid;\r\n  border-image: url(\"../assets/border.svg\");\r\n  border-image-slice: 20;\r\n  border-radius: 20px;\r\n  display: flex;\r\n  justify-content: space-evenly;\r\n  align-content: center;\r\n  flex-direction: column;\r\n}\r\n\r\n.stg_buttonflex {\r\n  position: relative;\r\n  top: 60px;\r\n  left: 50%;\r\n  transform: translateX(-50%);\r\n  width: 500px;\r\n  height: 60px;\r\n  display: flex;\r\n  justify-content: space-evenly;\r\n  align-content: center;\r\n}\r\n\r\n.stg_PlayerEntry {\r\n  display: flex;\r\n  justify-content: space-between;\r\n  align-content: center;\r\n  border: 3px solid rgb(211, 211, 211);\r\n  border-radius: 5px;\r\n  box-shadow: 5px 5px black;\r\n  min-height: 100px;\r\n  padding: 8px;\r\n  opacity: 1;\r\n  transition: opacity 0.75s ease-in-out;\r\n}\r\n\r\nstg_PlayerEntry.pui-removing {\r\n  opacity: 0;\r\n}\r\n\r\n.stg_textSpan {\r\n  transform: translateY(35%);\r\n  font-size: x-large;\r\n}\r\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./src/styles/title.css":
/*!********************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/styles/title.css ***!
  \********************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/getUrl.js */ "./node_modules/css-loader/dist/runtime/getUrl.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__);
// Imports



var ___CSS_LOADER_URL_IMPORT_0___ = new URL(/* asset import */ __webpack_require__(/*! ../assets/border.svg */ "./src/assets/border.svg"), __webpack_require__.b);
var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
var ___CSS_LOADER_URL_REPLACEMENT_0___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_0___);
// Module
___CSS_LOADER_EXPORT___.push([module.id, ".mainTitle {\r\n  position: relative;\r\n  width: 300px;\r\n  height: 200px;\r\n  border: 25px solid;\r\n  border-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_0___ + ");\r\n  border-image-slice: 25;\r\n  margin: 0 auto;\r\n  transform: translateY(50%);\r\n  display: flex;\r\n  justify-content: center;\r\n  flex-direction: column;\r\n  align-content: center;\r\n}\r\n\r\n.mainTitle > span {\r\n  text-align: center;\r\n  text-shadow: 2px 2px black;\r\n}\r\n\r\n.version {\r\n  font-size: small;\r\n  position: fixed;\r\n  top: 15px;\r\n  left: 15px;\r\n  font-family: \"Gill Sans\";\r\n}\r\n\r\n.STitle {\r\n  position: absolute;\r\n  bottom: 20px;\r\n  left: 50%;\r\n  transform: translateX(-50%);\r\n  width: 600px;\r\n  height: 30px;\r\n  border: 25px solid;\r\n  border-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_0___ + ");\r\n  border-image-slice: 25;\r\n  margin: 0 auto;\r\n  display: flex;\r\n  justify-content: center;\r\n  flex-direction: column;\r\n  align-content: center;\r\n  animation: blink 1.5s infinite;\r\n  text-shadow: 2px 2px black;\r\n}\r\n\r\n.STitle > span {\r\n  text-align: center;\r\n  font-size: large;\r\n}\r\n\r\n.titleButton {\r\n  position: relative;\r\n  top: 50%;\r\n  left: 50%;\r\n  transform: translate(-50%, 300%);\r\n  font-family: demonFont;\r\n  border: 5px rgb(211, 211, 211) solid;\r\n  border-radius: 5px;\r\n  background-color: #00000000;\r\n  color: rgb(211, 211, 211);\r\n  font-size: large;\r\n  width: 150px;\r\n  height: 60px;\r\n  padding: 10px 10px;\r\n  cursor: pointer;\r\n  text-shadow: 2px 2px black;\r\n  box-shadow: 2px 2px 1px 1px black;\r\n}\r\n\r\n.titleButton:hover {\r\n  background-color: rgb(211, 211, 211);\r\n  color: var(--background-start);\r\n}\r\n\r\n@keyframes blink {\r\n  0% {\r\n    opacity: 0;\r\n  }\r\n\r\n  50% {\r\n    opacity: 1;\r\n  }\r\n\r\n  100% {\r\n    opacity: 0;\r\n  }\r\n}\r\n\r\n.titleHelp {\r\n  position: fixed;\r\n  top: 5px;\r\n  right: 30px;\r\n  width: 20px;\r\n  height: 20px;\r\n  cursor: pointer;\r\n}\r\n", "",{"version":3,"sources":["webpack://./src/styles/title.css"],"names":[],"mappings":"AAAA;EACE,kBAAkB;EAClB,YAAY;EACZ,aAAa;EACb,kBAAkB;EAClB,qDAAyC;EACzC,sBAAsB;EACtB,cAAc;EACd,0BAA0B;EAC1B,aAAa;EACb,uBAAuB;EACvB,sBAAsB;EACtB,qBAAqB;AACvB;;AAEA;EACE,kBAAkB;EAClB,0BAA0B;AAC5B;;AAEA;EACE,gBAAgB;EAChB,eAAe;EACf,SAAS;EACT,UAAU;EACV,wBAAwB;AAC1B;;AAEA;EACE,kBAAkB;EAClB,YAAY;EACZ,SAAS;EACT,2BAA2B;EAC3B,YAAY;EACZ,YAAY;EACZ,kBAAkB;EAClB,qDAAyC;EACzC,sBAAsB;EACtB,cAAc;EACd,aAAa;EACb,uBAAuB;EACvB,sBAAsB;EACtB,qBAAqB;EACrB,8BAA8B;EAC9B,0BAA0B;AAC5B;;AAEA;EACE,kBAAkB;EAClB,gBAAgB;AAClB;;AAEA;EACE,kBAAkB;EAClB,QAAQ;EACR,SAAS;EACT,gCAAgC;EAChC,sBAAsB;EACtB,oCAAoC;EACpC,kBAAkB;EAClB,2BAA2B;EAC3B,yBAAyB;EACzB,gBAAgB;EAChB,YAAY;EACZ,YAAY;EACZ,kBAAkB;EAClB,eAAe;EACf,0BAA0B;EAC1B,iCAAiC;AACnC;;AAEA;EACE,oCAAoC;EACpC,8BAA8B;AAChC;;AAEA;EACE;IACE,UAAU;EACZ;;EAEA;IACE,UAAU;EACZ;;EAEA;IACE,UAAU;EACZ;AACF;;AAEA;EACE,eAAe;EACf,QAAQ;EACR,WAAW;EACX,WAAW;EACX,YAAY;EACZ,eAAe;AACjB","sourcesContent":[".mainTitle {\r\n  position: relative;\r\n  width: 300px;\r\n  height: 200px;\r\n  border: 25px solid;\r\n  border-image: url(\"../assets/border.svg\");\r\n  border-image-slice: 25;\r\n  margin: 0 auto;\r\n  transform: translateY(50%);\r\n  display: flex;\r\n  justify-content: center;\r\n  flex-direction: column;\r\n  align-content: center;\r\n}\r\n\r\n.mainTitle > span {\r\n  text-align: center;\r\n  text-shadow: 2px 2px black;\r\n}\r\n\r\n.version {\r\n  font-size: small;\r\n  position: fixed;\r\n  top: 15px;\r\n  left: 15px;\r\n  font-family: \"Gill Sans\";\r\n}\r\n\r\n.STitle {\r\n  position: absolute;\r\n  bottom: 20px;\r\n  left: 50%;\r\n  transform: translateX(-50%);\r\n  width: 600px;\r\n  height: 30px;\r\n  border: 25px solid;\r\n  border-image: url(\"../assets/border.svg\");\r\n  border-image-slice: 25;\r\n  margin: 0 auto;\r\n  display: flex;\r\n  justify-content: center;\r\n  flex-direction: column;\r\n  align-content: center;\r\n  animation: blink 1.5s infinite;\r\n  text-shadow: 2px 2px black;\r\n}\r\n\r\n.STitle > span {\r\n  text-align: center;\r\n  font-size: large;\r\n}\r\n\r\n.titleButton {\r\n  position: relative;\r\n  top: 50%;\r\n  left: 50%;\r\n  transform: translate(-50%, 300%);\r\n  font-family: demonFont;\r\n  border: 5px rgb(211, 211, 211) solid;\r\n  border-radius: 5px;\r\n  background-color: #00000000;\r\n  color: rgb(211, 211, 211);\r\n  font-size: large;\r\n  width: 150px;\r\n  height: 60px;\r\n  padding: 10px 10px;\r\n  cursor: pointer;\r\n  text-shadow: 2px 2px black;\r\n  box-shadow: 2px 2px 1px 1px black;\r\n}\r\n\r\n.titleButton:hover {\r\n  background-color: rgb(211, 211, 211);\r\n  color: var(--background-start);\r\n}\r\n\r\n@keyframes blink {\r\n  0% {\r\n    opacity: 0;\r\n  }\r\n\r\n  50% {\r\n    opacity: 1;\r\n  }\r\n\r\n  100% {\r\n    opacity: 0;\r\n  }\r\n}\r\n\r\n.titleHelp {\r\n  position: fixed;\r\n  top: 5px;\r\n  right: 30px;\r\n  width: 20px;\r\n  height: 20px;\r\n  cursor: pointer;\r\n}\r\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./src/styles/toast.css":
/*!********************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/styles/toast.css ***!
  \********************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/getUrl.js */ "./node_modules/css-loader/dist/runtime/getUrl.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__);
// Imports



var ___CSS_LOADER_URL_IMPORT_0___ = new URL(/* asset import */ __webpack_require__(/*! ../assets/border.svg */ "./src/assets/border.svg"), __webpack_require__.b);
var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
var ___CSS_LOADER_URL_REPLACEMENT_0___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_0___);
// Module
___CSS_LOADER_EXPORT___.push([module.id, ".toast_container {\r\n  position: fixed;\r\n  right: 0;\r\n  top: 30px;\r\n  width: 50px;\r\n  height: var(--game-height);\r\n  /*  display: flex;\r\n  flex-direction: column;\r\n  justify-content: end;\r\n  align-content: flex-start; */\r\n  margin: 10px;\r\n  z-index: 12;\r\n}\r\n\r\n.toast_entry {\r\n  z-index: 10;\r\n  display: flex;\r\n  margin-bottom: 25px;\r\n  justify-content: flex-end;\r\n}\r\n\r\n.toast_entry:hover > .toast_message {\r\n  animation: slide-in-from-right 0.75s forwards;\r\n}\r\n\r\n.toast_entry.pui-adding {\r\n  animation: slide-in-from-right 0.75s forwards;\r\n}\r\n\r\n.toast_entry.pui-removing {\r\n  animation: slide-out-to-right 0.75s;\r\n}\r\n\r\n@keyframes slide-in-from-right {\r\n  0% {\r\n    transform: translateX(200%);\r\n    opacity: 0;\r\n  }\r\n  90% {\r\n    transform: translateX(-10%);\r\n    opacity: 1;\r\n  }\r\n  100% {\r\n    transform: translateX(0%);\r\n    opacity: 1;\r\n  }\r\n}\r\n\r\n@keyframes slide-out-to-right {\r\n  0% {\r\n    transform: translateX(0%);\r\n    opacity: 1;\r\n  }\r\n  10% {\r\n    transform: translateX(-10%);\r\n  }\r\n  50% {\r\n    opacity: 0;\r\n  }\r\n  100% {\r\n    transform: translateX(200%);\r\n  }\r\n}\r\n\r\n.toast_message {\r\n  order: 1;\r\n  position: relative;\r\n  top: 0;\r\n  left: 0;\r\n  width: 150px;\r\n  height: 38px;\r\n  text-align: center;\r\n  font-family: demonFont;\r\n  font-size: small;\r\n  margin-right: 10px;\r\n  display: flex;\r\n  flex-wrap: nowrap;\r\n  flex-direction: column;\r\n  justify-content: center;\r\n  z-index: 12;\r\n  border: 5px solid;\r\n  border-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_0___ + ");\r\n  border-image-slice: 25;\r\n  border-radius: 5px;\r\n  box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.5);\r\n  background-color: white;\r\n  color: var(--background-end);\r\n  opacity: 0;\r\n  transform: translateX(200%);\r\n  transition: transform opacity 0.5s ease-in-out;\r\n}\r\n\r\n.toast_img {\r\n  min-width: 26px;\r\n  height: 26px;\r\n  position: relative;\r\n  right: 0;\r\n  bottom: 0;\r\n  margin: auto;\r\n  z-index: 13;\r\n  flex-shrink: 0;\r\n}\r\n\r\n.toast_img_container {\r\n  order: 2;\r\n  border: 2px solid white;\r\n  border-radius: 50%;\r\n  min-width: 40px;\r\n  min-height: 40px;\r\n  overflow: hidden;\r\n  box-shadow: 5px 5px 5px black;\r\n  display: flex;\r\n  justify-content: center;\r\n  align-content: center;\r\n}\r\n\r\n.toast_close {\r\n  order: 3;\r\n  position: relative;\r\n  right: 0;\r\n  top: 0;\r\n  transform: translate(-35%, -50%);\r\n  width: 20px;\r\n  height: 20px;\r\n  /* border: 50%; */\r\n  overflow: hidden;\r\n  color: white;\r\n  font-family: demonFont;\r\n  font-size: large;\r\n  transition: color 0.3s;\r\n  z-index: 14;\r\n}\r\n.toast_close:hover {\r\n  color: red;\r\n}\r\n\r\n.bloom {\r\n  box-shadow: 0px 0px 8px 3px white;\r\n}\r\n", "",{"version":3,"sources":["webpack://./src/styles/toast.css"],"names":[],"mappings":"AAAA;EACE,eAAe;EACf,QAAQ;EACR,SAAS;EACT,WAAW;EACX,0BAA0B;EAC1B;;;8BAG4B;EAC5B,YAAY;EACZ,WAAW;AACb;;AAEA;EACE,WAAW;EACX,aAAa;EACb,mBAAmB;EACnB,yBAAyB;AAC3B;;AAEA;EACE,6CAA6C;AAC/C;;AAEA;EACE,6CAA6C;AAC/C;;AAEA;EACE,mCAAmC;AACrC;;AAEA;EACE;IACE,2BAA2B;IAC3B,UAAU;EACZ;EACA;IACE,2BAA2B;IAC3B,UAAU;EACZ;EACA;IACE,yBAAyB;IACzB,UAAU;EACZ;AACF;;AAEA;EACE;IACE,yBAAyB;IACzB,UAAU;EACZ;EACA;IACE,2BAA2B;EAC7B;EACA;IACE,UAAU;EACZ;EACA;IACE,2BAA2B;EAC7B;AACF;;AAEA;EACE,QAAQ;EACR,kBAAkB;EAClB,MAAM;EACN,OAAO;EACP,YAAY;EACZ,YAAY;EACZ,kBAAkB;EAClB,sBAAsB;EACtB,gBAAgB;EAChB,kBAAkB;EAClB,aAAa;EACb,iBAAiB;EACjB,sBAAsB;EACtB,uBAAuB;EACvB,WAAW;EACX,iBAAiB;EACjB,qDAAyC;EACzC,sBAAsB;EACtB,kBAAkB;EAClB,0CAA0C;EAC1C,uBAAuB;EACvB,4BAA4B;EAC5B,UAAU;EACV,2BAA2B;EAC3B,8CAA8C;AAChD;;AAEA;EACE,eAAe;EACf,YAAY;EACZ,kBAAkB;EAClB,QAAQ;EACR,SAAS;EACT,YAAY;EACZ,WAAW;EACX,cAAc;AAChB;;AAEA;EACE,QAAQ;EACR,uBAAuB;EACvB,kBAAkB;EAClB,eAAe;EACf,gBAAgB;EAChB,gBAAgB;EAChB,6BAA6B;EAC7B,aAAa;EACb,uBAAuB;EACvB,qBAAqB;AACvB;;AAEA;EACE,QAAQ;EACR,kBAAkB;EAClB,QAAQ;EACR,MAAM;EACN,gCAAgC;EAChC,WAAW;EACX,YAAY;EACZ,iBAAiB;EACjB,gBAAgB;EAChB,YAAY;EACZ,sBAAsB;EACtB,gBAAgB;EAChB,sBAAsB;EACtB,WAAW;AACb;AACA;EACE,UAAU;AACZ;;AAEA;EACE,iCAAiC;AACnC","sourcesContent":[".toast_container {\r\n  position: fixed;\r\n  right: 0;\r\n  top: 30px;\r\n  width: 50px;\r\n  height: var(--game-height);\r\n  /*  display: flex;\r\n  flex-direction: column;\r\n  justify-content: end;\r\n  align-content: flex-start; */\r\n  margin: 10px;\r\n  z-index: 12;\r\n}\r\n\r\n.toast_entry {\r\n  z-index: 10;\r\n  display: flex;\r\n  margin-bottom: 25px;\r\n  justify-content: flex-end;\r\n}\r\n\r\n.toast_entry:hover > .toast_message {\r\n  animation: slide-in-from-right 0.75s forwards;\r\n}\r\n\r\n.toast_entry.pui-adding {\r\n  animation: slide-in-from-right 0.75s forwards;\r\n}\r\n\r\n.toast_entry.pui-removing {\r\n  animation: slide-out-to-right 0.75s;\r\n}\r\n\r\n@keyframes slide-in-from-right {\r\n  0% {\r\n    transform: translateX(200%);\r\n    opacity: 0;\r\n  }\r\n  90% {\r\n    transform: translateX(-10%);\r\n    opacity: 1;\r\n  }\r\n  100% {\r\n    transform: translateX(0%);\r\n    opacity: 1;\r\n  }\r\n}\r\n\r\n@keyframes slide-out-to-right {\r\n  0% {\r\n    transform: translateX(0%);\r\n    opacity: 1;\r\n  }\r\n  10% {\r\n    transform: translateX(-10%);\r\n  }\r\n  50% {\r\n    opacity: 0;\r\n  }\r\n  100% {\r\n    transform: translateX(200%);\r\n  }\r\n}\r\n\r\n.toast_message {\r\n  order: 1;\r\n  position: relative;\r\n  top: 0;\r\n  left: 0;\r\n  width: 150px;\r\n  height: 38px;\r\n  text-align: center;\r\n  font-family: demonFont;\r\n  font-size: small;\r\n  margin-right: 10px;\r\n  display: flex;\r\n  flex-wrap: nowrap;\r\n  flex-direction: column;\r\n  justify-content: center;\r\n  z-index: 12;\r\n  border: 5px solid;\r\n  border-image: url(\"../assets/border.svg\");\r\n  border-image-slice: 25;\r\n  border-radius: 5px;\r\n  box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.5);\r\n  background-color: white;\r\n  color: var(--background-end);\r\n  opacity: 0;\r\n  transform: translateX(200%);\r\n  transition: transform opacity 0.5s ease-in-out;\r\n}\r\n\r\n.toast_img {\r\n  min-width: 26px;\r\n  height: 26px;\r\n  position: relative;\r\n  right: 0;\r\n  bottom: 0;\r\n  margin: auto;\r\n  z-index: 13;\r\n  flex-shrink: 0;\r\n}\r\n\r\n.toast_img_container {\r\n  order: 2;\r\n  border: 2px solid white;\r\n  border-radius: 50%;\r\n  min-width: 40px;\r\n  min-height: 40px;\r\n  overflow: hidden;\r\n  box-shadow: 5px 5px 5px black;\r\n  display: flex;\r\n  justify-content: center;\r\n  align-content: center;\r\n}\r\n\r\n.toast_close {\r\n  order: 3;\r\n  position: relative;\r\n  right: 0;\r\n  top: 0;\r\n  transform: translate(-35%, -50%);\r\n  width: 20px;\r\n  height: 20px;\r\n  /* border: 50%; */\r\n  overflow: hidden;\r\n  color: white;\r\n  font-family: demonFont;\r\n  font-size: large;\r\n  transition: color 0.3s;\r\n  z-index: 14;\r\n}\r\n.toast_close:hover {\r\n  color: red;\r\n}\r\n\r\n.bloom {\r\n  box-shadow: 0px 0px 8px 3px white;\r\n}\r\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./src/styles/tower.css":
/*!********************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/styles/tower.css ***!
  \********************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/getUrl.js */ "./node_modules/css-loader/dist/runtime/getUrl.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__);
// Imports



var ___CSS_LOADER_URL_IMPORT_0___ = new URL(/* asset import */ __webpack_require__(/*! ../assets/border.svg */ "./src/assets/border.svg"), __webpack_require__.b);
var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
var ___CSS_LOADER_URL_REPLACEMENT_0___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_0___);
// Module
___CSS_LOADER_EXPORT___.push([module.id, ".td_container {\r\n  position: absolute;\r\n  border: 25px solid;\r\n  border-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_0___ + ");\r\n  border-image-slice: 25;\r\n  width: 210px;\r\n  aspect-ratio: 3/2;\r\n  top: 140px;\r\n  right: 50px;\r\n}\r\n\r\n.td_rel_container {\r\n  width: 100%;\r\n  height: 100%;\r\n  position: relative;\r\n}\r\n\r\n.td_title {\r\n  font-size: small;\r\n  position: absolute;\r\n  top: 50%;\r\n  left: 50%;\r\n  width: 100%;\r\n  transform: translate(-50%, -50%);\r\n  text-align: center;\r\n}\r\n\r\n.td_card {\r\n  position: absolute;\r\n  border: 1px solid white;\r\n  border-radius: 10px;\r\n  width: 200px;\r\n  aspect-ratio: 3/2;\r\n  top: 50%;\r\n  left: 50%;\r\n  transform: translate(-50%, -50%);\r\n  background-color: #fbfaf5;\r\n  color: #101f6b;\r\n  font-size: small;\r\n  transition: width 0.3s ease-in-out;\r\n  box-shadow: 5px 5px 8px 3px #00000080;\r\n  opacity: 1;\r\n  transition: opacity 1s ease-in-out;\r\n}\r\n\r\n.td_card.pui-adding {\r\n  opacity: 0;\r\n}\r\n.td_card.pui-removing {\r\n  opacity: 0;\r\n}\r\n\r\n.td_card_title {\r\n  position: absolute;\r\n  top: 50%;\r\n  left: 50%;\r\n  width: 100%;\r\n  transform: translate(-50%, -50%);\r\n  font-size: xx-large;\r\n  text-align: center;\r\n}\r\n\r\n.td_card_level {\r\n  position: absolute;\r\n  top: 10px;\r\n  left: 50%;\r\n  transform: translateX(-50%);\r\n  font-size: small;\r\n  text-align: center;\r\n}\r\n\r\n.td_card_desc {\r\n  position: absolute;\r\n  bottom: 10px;\r\n  left: 50%;\r\n  transform: translateX(-50%);\r\n  font-size: x-small;\r\n  text-align: center;\r\n  width: 100%;\r\n}\r\n\r\n.td_bloom {\r\n  box-shadow: 0 0 50px #fff, /* outer white */ -10px 0 80px #f0f, /* outer left magenta */ 10px 0 80px #0ff; /* outer right cyan */\r\n  animation: glow 1.2s infinite;\r\n}\r\n\r\n.td_clickable {\r\n  cursor: pointer;\r\n}\r\n\r\n@keyframes glow {\r\n  0%,\r\n  100% {\r\n    box-shadow: 0 0 50px #fff, /* outer white */ -10px 0 80px #f0f, /* outer left magenta */ 10px 0 80px #0ff; /* outer right cyan */\r\n  }\r\n  50% {\r\n    box-shadow: 0 0 80px #fff, /* outer white */ -24px 0 120px #f0f, /* outer left magenta */ 24px 0 120px #0ff; /* outer right cyan */\r\n  }\r\n}\r\n", "",{"version":3,"sources":["webpack://./src/styles/tower.css"],"names":[],"mappings":"AAAA;EACE,kBAAkB;EAClB,kBAAkB;EAClB,qDAAyC;EACzC,sBAAsB;EACtB,YAAY;EACZ,iBAAiB;EACjB,UAAU;EACV,WAAW;AACb;;AAEA;EACE,WAAW;EACX,YAAY;EACZ,kBAAkB;AACpB;;AAEA;EACE,gBAAgB;EAChB,kBAAkB;EAClB,QAAQ;EACR,SAAS;EACT,WAAW;EACX,gCAAgC;EAChC,kBAAkB;AACpB;;AAEA;EACE,kBAAkB;EAClB,uBAAuB;EACvB,mBAAmB;EACnB,YAAY;EACZ,iBAAiB;EACjB,QAAQ;EACR,SAAS;EACT,gCAAgC;EAChC,yBAAyB;EACzB,cAAc;EACd,gBAAgB;EAChB,kCAAkC;EAClC,qCAAqC;EACrC,UAAU;EACV,kCAAkC;AACpC;;AAEA;EACE,UAAU;AACZ;AACA;EACE,UAAU;AACZ;;AAEA;EACE,kBAAkB;EAClB,QAAQ;EACR,SAAS;EACT,WAAW;EACX,gCAAgC;EAChC,mBAAmB;EACnB,kBAAkB;AACpB;;AAEA;EACE,kBAAkB;EAClB,SAAS;EACT,SAAS;EACT,2BAA2B;EAC3B,gBAAgB;EAChB,kBAAkB;AACpB;;AAEA;EACE,kBAAkB;EAClB,YAAY;EACZ,SAAS;EACT,2BAA2B;EAC3B,kBAAkB;EAClB,kBAAkB;EAClB,WAAW;AACb;;AAEA;EACE,yGAAyG,EAAE,qBAAqB;EAChI,6BAA6B;AAC/B;;AAEA;EACE,eAAe;AACjB;;AAEA;EACE;;IAEE,yGAAyG,EAAE,qBAAqB;EAClI;EACA;IACE,2GAA2G,EAAE,qBAAqB;EACpI;AACF","sourcesContent":[".td_container {\r\n  position: absolute;\r\n  border: 25px solid;\r\n  border-image: url(\"../assets/border.svg\");\r\n  border-image-slice: 25;\r\n  width: 210px;\r\n  aspect-ratio: 3/2;\r\n  top: 140px;\r\n  right: 50px;\r\n}\r\n\r\n.td_rel_container {\r\n  width: 100%;\r\n  height: 100%;\r\n  position: relative;\r\n}\r\n\r\n.td_title {\r\n  font-size: small;\r\n  position: absolute;\r\n  top: 50%;\r\n  left: 50%;\r\n  width: 100%;\r\n  transform: translate(-50%, -50%);\r\n  text-align: center;\r\n}\r\n\r\n.td_card {\r\n  position: absolute;\r\n  border: 1px solid white;\r\n  border-radius: 10px;\r\n  width: 200px;\r\n  aspect-ratio: 3/2;\r\n  top: 50%;\r\n  left: 50%;\r\n  transform: translate(-50%, -50%);\r\n  background-color: #fbfaf5;\r\n  color: #101f6b;\r\n  font-size: small;\r\n  transition: width 0.3s ease-in-out;\r\n  box-shadow: 5px 5px 8px 3px #00000080;\r\n  opacity: 1;\r\n  transition: opacity 1s ease-in-out;\r\n}\r\n\r\n.td_card.pui-adding {\r\n  opacity: 0;\r\n}\r\n.td_card.pui-removing {\r\n  opacity: 0;\r\n}\r\n\r\n.td_card_title {\r\n  position: absolute;\r\n  top: 50%;\r\n  left: 50%;\r\n  width: 100%;\r\n  transform: translate(-50%, -50%);\r\n  font-size: xx-large;\r\n  text-align: center;\r\n}\r\n\r\n.td_card_level {\r\n  position: absolute;\r\n  top: 10px;\r\n  left: 50%;\r\n  transform: translateX(-50%);\r\n  font-size: small;\r\n  text-align: center;\r\n}\r\n\r\n.td_card_desc {\r\n  position: absolute;\r\n  bottom: 10px;\r\n  left: 50%;\r\n  transform: translateX(-50%);\r\n  font-size: x-small;\r\n  text-align: center;\r\n  width: 100%;\r\n}\r\n\r\n.td_bloom {\r\n  box-shadow: 0 0 50px #fff, /* outer white */ -10px 0 80px #f0f, /* outer left magenta */ 10px 0 80px #0ff; /* outer right cyan */\r\n  animation: glow 1.2s infinite;\r\n}\r\n\r\n.td_clickable {\r\n  cursor: pointer;\r\n}\r\n\r\n@keyframes glow {\r\n  0%,\r\n  100% {\r\n    box-shadow: 0 0 50px #fff, /* outer white */ -10px 0 80px #f0f, /* outer left magenta */ 10px 0 80px #0ff; /* outer right cyan */\r\n  }\r\n  50% {\r\n    box-shadow: 0 0 80px #fff, /* outer white */ -24px 0 120px #f0f, /* outer left magenta */ 24px 0 120px #0ff; /* outer right cyan */\r\n  }\r\n}\r\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/api.js":
/*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
/***/ ((module) => {

"use strict";


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
module.exports = function (cssWithMappingToString) {
  var list = []; // return the list of modules as css string

  list.toString = function toString() {
    return this.map(function (item) {
      var content = "";
      var needLayer = typeof item[5] !== "undefined";

      if (item[4]) {
        content += "@supports (".concat(item[4], ") {");
      }

      if (item[2]) {
        content += "@media ".concat(item[2], " {");
      }

      if (needLayer) {
        content += "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {");
      }

      content += cssWithMappingToString(item);

      if (needLayer) {
        content += "}";
      }

      if (item[2]) {
        content += "}";
      }

      if (item[4]) {
        content += "}";
      }

      return content;
    }).join("");
  }; // import a list of modules into the list


  list.i = function i(modules, media, dedupe, supports, layer) {
    if (typeof modules === "string") {
      modules = [[null, modules, undefined]];
    }

    var alreadyImportedModules = {};

    if (dedupe) {
      for (var k = 0; k < this.length; k++) {
        var id = this[k][0];

        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }

    for (var _k = 0; _k < modules.length; _k++) {
      var item = [].concat(modules[_k]);

      if (dedupe && alreadyImportedModules[item[0]]) {
        continue;
      }

      if (typeof layer !== "undefined") {
        if (typeof item[5] === "undefined") {
          item[5] = layer;
        } else {
          item[1] = "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {").concat(item[1], "}");
          item[5] = layer;
        }
      }

      if (media) {
        if (!item[2]) {
          item[2] = media;
        } else {
          item[1] = "@media ".concat(item[2], " {").concat(item[1], "}");
          item[2] = media;
        }
      }

      if (supports) {
        if (!item[4]) {
          item[4] = "".concat(supports);
        } else {
          item[1] = "@supports (".concat(item[4], ") {").concat(item[1], "}");
          item[4] = supports;
        }
      }

      list.push(item);
    }
  };

  return list;
};

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/getUrl.js":
/*!********************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/getUrl.js ***!
  \********************************************************/
/***/ ((module) => {

"use strict";


module.exports = function (url, options) {
  if (!options) {
    options = {};
  }

  if (!url) {
    return url;
  }

  url = String(url.__esModule ? url.default : url); // If url is already wrapped in quotes, remove them

  if (/^['"].*['"]$/.test(url)) {
    url = url.slice(1, -1);
  }

  if (options.hash) {
    url += options.hash;
  } // Should url be wrapped?
  // See https://drafts.csswg.org/css-values-3/#urls


  if (/["'() \t\n]|(%20)/.test(url) || options.needQuotes) {
    return "\"".concat(url.replace(/"/g, '\\"').replace(/\n/g, "\\n"), "\"");
  }

  return url;
};

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/sourceMaps.js":
/*!************************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/sourceMaps.js ***!
  \************************************************************/
/***/ ((module) => {

"use strict";


module.exports = function (item) {
  var content = item[1];
  var cssMapping = item[3];

  if (!cssMapping) {
    return content;
  }

  if (typeof btoa === "function") {
    var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(cssMapping))));
    var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
    var sourceMapping = "/*# ".concat(data, " */");
    var sourceURLs = cssMapping.sources.map(function (source) {
      return "/*# sourceURL=".concat(cssMapping.sourceRoot || "").concat(source, " */");
    });
    return [content].concat(sourceURLs).concat([sourceMapping]).join("\n");
  }

  return [content].join("\n");
};

/***/ }),

/***/ "./src/assets/audio/button.wav":
/*!*************************************!*\
  !*** ./src/assets/audio/button.wav ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "src/assets/audio/button.wav");

/***/ }),

/***/ "./src/assets/audio/dealingcard.wav":
/*!******************************************!*\
  !*** ./src/assets/audio/dealingcard.wav ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "src/assets/audio/dealingcard.wav");

/***/ }),

/***/ "./src/assets/audio/ingame.wav":
/*!*************************************!*\
  !*** ./src/assets/audio/ingame.wav ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "src/assets/audio/ingame.wav");

/***/ }),

/***/ "./src/assets/audio/mail.mp3":
/*!***********************************!*\
  !*** ./src/assets/audio/mail.mp3 ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "src/assets/audio/mail.mp3");

/***/ }),

/***/ "./src/assets/audio/main.wav":
/*!***********************************!*\
  !*** ./src/assets/audio/main.wav ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "src/assets/audio/main.wav");

/***/ }),

/***/ "./src/assets/audio/sadtrombone.wav":
/*!******************************************!*\
  !*** ./src/assets/audio/sadtrombone.wav ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "src/assets/audio/sadtrombone.wav");

/***/ }),

/***/ "./src/assets/audio/woosh.mp3":
/*!************************************!*\
  !*** ./src/assets/audio/woosh.mp3 ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "src/assets/audio/woosh.mp3");

/***/ }),

/***/ "./node_modules/howler/dist/howler.js":
/*!********************************************!*\
  !*** ./node_modules/howler/dist/howler.js ***!
  \********************************************/
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
 *  howler.js v2.2.3
 *  howlerjs.com
 *
 *  (c) 2013-2020, James Simpson of GoldFire Studios
 *  goldfirestudios.com
 *
 *  MIT License
 */

(function() {

  'use strict';

  /** Global Methods **/
  /***************************************************************************/

  /**
   * Create the global controller. All contained methods and properties apply
   * to all sounds that are currently playing or will be in the future.
   */
  var HowlerGlobal = function() {
    this.init();
  };
  HowlerGlobal.prototype = {
    /**
     * Initialize the global Howler object.
     * @return {Howler}
     */
    init: function() {
      var self = this || Howler;

      // Create a global ID counter.
      self._counter = 1000;

      // Pool of unlocked HTML5 Audio objects.
      self._html5AudioPool = [];
      self.html5PoolSize = 10;

      // Internal properties.
      self._codecs = {};
      self._howls = [];
      self._muted = false;
      self._volume = 1;
      self._canPlayEvent = 'canplaythrough';
      self._navigator = (typeof window !== 'undefined' && window.navigator) ? window.navigator : null;

      // Public properties.
      self.masterGain = null;
      self.noAudio = false;
      self.usingWebAudio = true;
      self.autoSuspend = true;
      self.ctx = null;

      // Set to false to disable the auto audio unlocker.
      self.autoUnlock = true;

      // Setup the various state values for global tracking.
      self._setup();

      return self;
    },

    /**
     * Get/set the global volume for all sounds.
     * @param  {Float} vol Volume from 0.0 to 1.0.
     * @return {Howler/Float}     Returns self or current volume.
     */
    volume: function(vol) {
      var self = this || Howler;
      vol = parseFloat(vol);

      // If we don't have an AudioContext created yet, run the setup.
      if (!self.ctx) {
        setupAudioContext();
      }

      if (typeof vol !== 'undefined' && vol >= 0 && vol <= 1) {
        self._volume = vol;

        // Don't update any of the nodes if we are muted.
        if (self._muted) {
          return self;
        }

        // When using Web Audio, we just need to adjust the master gain.
        if (self.usingWebAudio) {
          self.masterGain.gain.setValueAtTime(vol, Howler.ctx.currentTime);
        }

        // Loop through and change volume for all HTML5 audio nodes.
        for (var i=0; i<self._howls.length; i++) {
          if (!self._howls[i]._webAudio) {
            // Get all of the sounds in this Howl group.
            var ids = self._howls[i]._getSoundIds();

            // Loop through all sounds and change the volumes.
            for (var j=0; j<ids.length; j++) {
              var sound = self._howls[i]._soundById(ids[j]);

              if (sound && sound._node) {
                sound._node.volume = sound._volume * vol;
              }
            }
          }
        }

        return self;
      }

      return self._volume;
    },

    /**
     * Handle muting and unmuting globally.
     * @param  {Boolean} muted Is muted or not.
     */
    mute: function(muted) {
      var self = this || Howler;

      // If we don't have an AudioContext created yet, run the setup.
      if (!self.ctx) {
        setupAudioContext();
      }

      self._muted = muted;

      // With Web Audio, we just need to mute the master gain.
      if (self.usingWebAudio) {
        self.masterGain.gain.setValueAtTime(muted ? 0 : self._volume, Howler.ctx.currentTime);
      }

      // Loop through and mute all HTML5 Audio nodes.
      for (var i=0; i<self._howls.length; i++) {
        if (!self._howls[i]._webAudio) {
          // Get all of the sounds in this Howl group.
          var ids = self._howls[i]._getSoundIds();

          // Loop through all sounds and mark the audio node as muted.
          for (var j=0; j<ids.length; j++) {
            var sound = self._howls[i]._soundById(ids[j]);

            if (sound && sound._node) {
              sound._node.muted = (muted) ? true : sound._muted;
            }
          }
        }
      }

      return self;
    },

    /**
     * Handle stopping all sounds globally.
     */
    stop: function() {
      var self = this || Howler;

      // Loop through all Howls and stop them.
      for (var i=0; i<self._howls.length; i++) {
        self._howls[i].stop();
      }

      return self;
    },

    /**
     * Unload and destroy all currently loaded Howl objects.
     * @return {Howler}
     */
    unload: function() {
      var self = this || Howler;

      for (var i=self._howls.length-1; i>=0; i--) {
        self._howls[i].unload();
      }

      // Create a new AudioContext to make sure it is fully reset.
      if (self.usingWebAudio && self.ctx && typeof self.ctx.close !== 'undefined') {
        self.ctx.close();
        self.ctx = null;
        setupAudioContext();
      }

      return self;
    },

    /**
     * Check for codec support of specific extension.
     * @param  {String} ext Audio file extention.
     * @return {Boolean}
     */
    codecs: function(ext) {
      return (this || Howler)._codecs[ext.replace(/^x-/, '')];
    },

    /**
     * Setup various state values for global tracking.
     * @return {Howler}
     */
    _setup: function() {
      var self = this || Howler;

      // Keeps track of the suspend/resume state of the AudioContext.
      self.state = self.ctx ? self.ctx.state || 'suspended' : 'suspended';

      // Automatically begin the 30-second suspend process
      self._autoSuspend();

      // Check if audio is available.
      if (!self.usingWebAudio) {
        // No audio is available on this system if noAudio is set to true.
        if (typeof Audio !== 'undefined') {
          try {
            var test = new Audio();

            // Check if the canplaythrough event is available.
            if (typeof test.oncanplaythrough === 'undefined') {
              self._canPlayEvent = 'canplay';
            }
          } catch(e) {
            self.noAudio = true;
          }
        } else {
          self.noAudio = true;
        }
      }

      // Test to make sure audio isn't disabled in Internet Explorer.
      try {
        var test = new Audio();
        if (test.muted) {
          self.noAudio = true;
        }
      } catch (e) {}

      // Check for supported codecs.
      if (!self.noAudio) {
        self._setupCodecs();
      }

      return self;
    },

    /**
     * Check for browser support for various codecs and cache the results.
     * @return {Howler}
     */
    _setupCodecs: function() {
      var self = this || Howler;
      var audioTest = null;

      // Must wrap in a try/catch because IE11 in server mode throws an error.
      try {
        audioTest = (typeof Audio !== 'undefined') ? new Audio() : null;
      } catch (err) {
        return self;
      }

      if (!audioTest || typeof audioTest.canPlayType !== 'function') {
        return self;
      }

      var mpegTest = audioTest.canPlayType('audio/mpeg;').replace(/^no$/, '');

      // Opera version <33 has mixed MP3 support, so we need to check for and block it.
      var ua = self._navigator ? self._navigator.userAgent : '';
      var checkOpera = ua.match(/OPR\/([0-6].)/g);
      var isOldOpera = (checkOpera && parseInt(checkOpera[0].split('/')[1], 10) < 33);
      var checkSafari = ua.indexOf('Safari') !== -1 && ua.indexOf('Chrome') === -1;
      var safariVersion = ua.match(/Version\/(.*?) /);
      var isOldSafari = (checkSafari && safariVersion && parseInt(safariVersion[1], 10) < 15);

      self._codecs = {
        mp3: !!(!isOldOpera && (mpegTest || audioTest.canPlayType('audio/mp3;').replace(/^no$/, ''))),
        mpeg: !!mpegTest,
        opus: !!audioTest.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/, ''),
        ogg: !!audioTest.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ''),
        oga: !!audioTest.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ''),
        wav: !!(audioTest.canPlayType('audio/wav; codecs="1"') || audioTest.canPlayType('audio/wav')).replace(/^no$/, ''),
        aac: !!audioTest.canPlayType('audio/aac;').replace(/^no$/, ''),
        caf: !!audioTest.canPlayType('audio/x-caf;').replace(/^no$/, ''),
        m4a: !!(audioTest.canPlayType('audio/x-m4a;') || audioTest.canPlayType('audio/m4a;') || audioTest.canPlayType('audio/aac;')).replace(/^no$/, ''),
        m4b: !!(audioTest.canPlayType('audio/x-m4b;') || audioTest.canPlayType('audio/m4b;') || audioTest.canPlayType('audio/aac;')).replace(/^no$/, ''),
        mp4: !!(audioTest.canPlayType('audio/x-mp4;') || audioTest.canPlayType('audio/mp4;') || audioTest.canPlayType('audio/aac;')).replace(/^no$/, ''),
        weba: !!(!isOldSafari && audioTest.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, '')),
        webm: !!(!isOldSafari && audioTest.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, '')),
        dolby: !!audioTest.canPlayType('audio/mp4; codecs="ec-3"').replace(/^no$/, ''),
        flac: !!(audioTest.canPlayType('audio/x-flac;') || audioTest.canPlayType('audio/flac;')).replace(/^no$/, '')
      };

      return self;
    },

    /**
     * Some browsers/devices will only allow audio to be played after a user interaction.
     * Attempt to automatically unlock audio on the first user interaction.
     * Concept from: http://paulbakaus.com/tutorials/html5/web-audio-on-ios/
     * @return {Howler}
     */
    _unlockAudio: function() {
      var self = this || Howler;

      // Only run this if Web Audio is supported and it hasn't already been unlocked.
      if (self._audioUnlocked || !self.ctx) {
        return;
      }

      self._audioUnlocked = false;
      self.autoUnlock = false;

      // Some mobile devices/platforms have distortion issues when opening/closing tabs and/or web views.
      // Bugs in the browser (especially Mobile Safari) can cause the sampleRate to change from 44100 to 48000.
      // By calling Howler.unload(), we create a new AudioContext with the correct sampleRate.
      if (!self._mobileUnloaded && self.ctx.sampleRate !== 44100) {
        self._mobileUnloaded = true;
        self.unload();
      }

      // Scratch buffer for enabling iOS to dispose of web audio buffers correctly, as per:
      // http://stackoverflow.com/questions/24119684
      self._scratchBuffer = self.ctx.createBuffer(1, 1, 22050);

      // Call this method on touch start to create and play a buffer,
      // then check if the audio actually played to determine if
      // audio has now been unlocked on iOS, Android, etc.
      var unlock = function(e) {
        // Create a pool of unlocked HTML5 Audio objects that can
        // be used for playing sounds without user interaction. HTML5
        // Audio objects must be individually unlocked, as opposed
        // to the WebAudio API which only needs a single activation.
        // This must occur before WebAudio setup or the source.onended
        // event will not fire.
        while (self._html5AudioPool.length < self.html5PoolSize) {
          try {
            var audioNode = new Audio();

            // Mark this Audio object as unlocked to ensure it can get returned
            // to the unlocked pool when released.
            audioNode._unlocked = true;

            // Add the audio node to the pool.
            self._releaseHtml5Audio(audioNode);
          } catch (e) {
            self.noAudio = true;
            break;
          }
        }

        // Loop through any assigned audio nodes and unlock them.
        for (var i=0; i<self._howls.length; i++) {
          if (!self._howls[i]._webAudio) {
            // Get all of the sounds in this Howl group.
            var ids = self._howls[i]._getSoundIds();

            // Loop through all sounds and unlock the audio nodes.
            for (var j=0; j<ids.length; j++) {
              var sound = self._howls[i]._soundById(ids[j]);

              if (sound && sound._node && !sound._node._unlocked) {
                sound._node._unlocked = true;
                sound._node.load();
              }
            }
          }
        }

        // Fix Android can not play in suspend state.
        self._autoResume();

        // Create an empty buffer.
        var source = self.ctx.createBufferSource();
        source.buffer = self._scratchBuffer;
        source.connect(self.ctx.destination);

        // Play the empty buffer.
        if (typeof source.start === 'undefined') {
          source.noteOn(0);
        } else {
          source.start(0);
        }

        // Calling resume() on a stack initiated by user gesture is what actually unlocks the audio on Android Chrome >= 55.
        if (typeof self.ctx.resume === 'function') {
          self.ctx.resume();
        }

        // Setup a timeout to check that we are unlocked on the next event loop.
        source.onended = function() {
          source.disconnect(0);

          // Update the unlocked state and prevent this check from happening again.
          self._audioUnlocked = true;

          // Remove the touch start listener.
          document.removeEventListener('touchstart', unlock, true);
          document.removeEventListener('touchend', unlock, true);
          document.removeEventListener('click', unlock, true);
          document.removeEventListener('keydown', unlock, true);

          // Let all sounds know that audio has been unlocked.
          for (var i=0; i<self._howls.length; i++) {
            self._howls[i]._emit('unlock');
          }
        };
      };

      // Setup a touch start listener to attempt an unlock in.
      document.addEventListener('touchstart', unlock, true);
      document.addEventListener('touchend', unlock, true);
      document.addEventListener('click', unlock, true);
      document.addEventListener('keydown', unlock, true);

      return self;
    },

    /**
     * Get an unlocked HTML5 Audio object from the pool. If none are left,
     * return a new Audio object and throw a warning.
     * @return {Audio} HTML5 Audio object.
     */
    _obtainHtml5Audio: function() {
      var self = this || Howler;

      // Return the next object from the pool if one exists.
      if (self._html5AudioPool.length) {
        return self._html5AudioPool.pop();
      }

      //.Check if the audio is locked and throw a warning.
      var testPlay = new Audio().play();
      if (testPlay && typeof Promise !== 'undefined' && (testPlay instanceof Promise || typeof testPlay.then === 'function')) {
        testPlay.catch(function() {
          console.warn('HTML5 Audio pool exhausted, returning potentially locked audio object.');
        });
      }

      return new Audio();
    },

    /**
     * Return an activated HTML5 Audio object to the pool.
     * @return {Howler}
     */
    _releaseHtml5Audio: function(audio) {
      var self = this || Howler;

      // Don't add audio to the pool if we don't know if it has been unlocked.
      if (audio._unlocked) {
        self._html5AudioPool.push(audio);
      }

      return self;
    },

    /**
     * Automatically suspend the Web Audio AudioContext after no sound has played for 30 seconds.
     * This saves processing/energy and fixes various browser-specific bugs with audio getting stuck.
     * @return {Howler}
     */
    _autoSuspend: function() {
      var self = this;

      if (!self.autoSuspend || !self.ctx || typeof self.ctx.suspend === 'undefined' || !Howler.usingWebAudio) {
        return;
      }

      // Check if any sounds are playing.
      for (var i=0; i<self._howls.length; i++) {
        if (self._howls[i]._webAudio) {
          for (var j=0; j<self._howls[i]._sounds.length; j++) {
            if (!self._howls[i]._sounds[j]._paused) {
              return self;
            }
          }
        }
      }

      if (self._suspendTimer) {
        clearTimeout(self._suspendTimer);
      }

      // If no sound has played after 30 seconds, suspend the context.
      self._suspendTimer = setTimeout(function() {
        if (!self.autoSuspend) {
          return;
        }

        self._suspendTimer = null;
        self.state = 'suspending';

        // Handle updating the state of the audio context after suspending.
        var handleSuspension = function() {
          self.state = 'suspended';

          if (self._resumeAfterSuspend) {
            delete self._resumeAfterSuspend;
            self._autoResume();
          }
        };

        // Either the state gets suspended or it is interrupted.
        // Either way, we need to update the state to suspended.
        self.ctx.suspend().then(handleSuspension, handleSuspension);
      }, 30000);

      return self;
    },

    /**
     * Automatically resume the Web Audio AudioContext when a new sound is played.
     * @return {Howler}
     */
    _autoResume: function() {
      var self = this;

      if (!self.ctx || typeof self.ctx.resume === 'undefined' || !Howler.usingWebAudio) {
        return;
      }

      if (self.state === 'running' && self.ctx.state !== 'interrupted' && self._suspendTimer) {
        clearTimeout(self._suspendTimer);
        self._suspendTimer = null;
      } else if (self.state === 'suspended' || self.state === 'running' && self.ctx.state === 'interrupted') {
        self.ctx.resume().then(function() {
          self.state = 'running';

          // Emit to all Howls that the audio has resumed.
          for (var i=0; i<self._howls.length; i++) {
            self._howls[i]._emit('resume');
          }
        });

        if (self._suspendTimer) {
          clearTimeout(self._suspendTimer);
          self._suspendTimer = null;
        }
      } else if (self.state === 'suspending') {
        self._resumeAfterSuspend = true;
      }

      return self;
    }
  };

  // Setup the global audio controller.
  var Howler = new HowlerGlobal();

  /** Group Methods **/
  /***************************************************************************/

  /**
   * Create an audio group controller.
   * @param {Object} o Passed in properties for this group.
   */
  var Howl = function(o) {
    var self = this;

    // Throw an error if no source is provided.
    if (!o.src || o.src.length === 0) {
      console.error('An array of source files must be passed with any new Howl.');
      return;
    }

    self.init(o);
  };
  Howl.prototype = {
    /**
     * Initialize a new Howl group object.
     * @param  {Object} o Passed in properties for this group.
     * @return {Howl}
     */
    init: function(o) {
      var self = this;

      // If we don't have an AudioContext created yet, run the setup.
      if (!Howler.ctx) {
        setupAudioContext();
      }

      // Setup user-defined default properties.
      self._autoplay = o.autoplay || false;
      self._format = (typeof o.format !== 'string') ? o.format : [o.format];
      self._html5 = o.html5 || false;
      self._muted = o.mute || false;
      self._loop = o.loop || false;
      self._pool = o.pool || 5;
      self._preload = (typeof o.preload === 'boolean' || o.preload === 'metadata') ? o.preload : true;
      self._rate = o.rate || 1;
      self._sprite = o.sprite || {};
      self._src = (typeof o.src !== 'string') ? o.src : [o.src];
      self._volume = o.volume !== undefined ? o.volume : 1;
      self._xhr = {
        method: o.xhr && o.xhr.method ? o.xhr.method : 'GET',
        headers: o.xhr && o.xhr.headers ? o.xhr.headers : null,
        withCredentials: o.xhr && o.xhr.withCredentials ? o.xhr.withCredentials : false,
      };

      // Setup all other default properties.
      self._duration = 0;
      self._state = 'unloaded';
      self._sounds = [];
      self._endTimers = {};
      self._queue = [];
      self._playLock = false;

      // Setup event listeners.
      self._onend = o.onend ? [{fn: o.onend}] : [];
      self._onfade = o.onfade ? [{fn: o.onfade}] : [];
      self._onload = o.onload ? [{fn: o.onload}] : [];
      self._onloaderror = o.onloaderror ? [{fn: o.onloaderror}] : [];
      self._onplayerror = o.onplayerror ? [{fn: o.onplayerror}] : [];
      self._onpause = o.onpause ? [{fn: o.onpause}] : [];
      self._onplay = o.onplay ? [{fn: o.onplay}] : [];
      self._onstop = o.onstop ? [{fn: o.onstop}] : [];
      self._onmute = o.onmute ? [{fn: o.onmute}] : [];
      self._onvolume = o.onvolume ? [{fn: o.onvolume}] : [];
      self._onrate = o.onrate ? [{fn: o.onrate}] : [];
      self._onseek = o.onseek ? [{fn: o.onseek}] : [];
      self._onunlock = o.onunlock ? [{fn: o.onunlock}] : [];
      self._onresume = [];

      // Web Audio or HTML5 Audio?
      self._webAudio = Howler.usingWebAudio && !self._html5;

      // Automatically try to enable audio.
      if (typeof Howler.ctx !== 'undefined' && Howler.ctx && Howler.autoUnlock) {
        Howler._unlockAudio();
      }

      // Keep track of this Howl group in the global controller.
      Howler._howls.push(self);

      // If they selected autoplay, add a play event to the load queue.
      if (self._autoplay) {
        self._queue.push({
          event: 'play',
          action: function() {
            self.play();
          }
        });
      }

      // Load the source file unless otherwise specified.
      if (self._preload && self._preload !== 'none') {
        self.load();
      }

      return self;
    },

    /**
     * Load the audio file.
     * @return {Howler}
     */
    load: function() {
      var self = this;
      var url = null;

      // If no audio is available, quit immediately.
      if (Howler.noAudio) {
        self._emit('loaderror', null, 'No audio support.');
        return;
      }

      // Make sure our source is in an array.
      if (typeof self._src === 'string') {
        self._src = [self._src];
      }

      // Loop through the sources and pick the first one that is compatible.
      for (var i=0; i<self._src.length; i++) {
        var ext, str;

        if (self._format && self._format[i]) {
          // If an extension was specified, use that instead.
          ext = self._format[i];
        } else {
          // Make sure the source is a string.
          str = self._src[i];
          if (typeof str !== 'string') {
            self._emit('loaderror', null, 'Non-string found in selected audio sources - ignoring.');
            continue;
          }

          // Extract the file extension from the URL or base64 data URI.
          ext = /^data:audio\/([^;,]+);/i.exec(str);
          if (!ext) {
            ext = /\.([^.]+)$/.exec(str.split('?', 1)[0]);
          }

          if (ext) {
            ext = ext[1].toLowerCase();
          }
        }

        // Log a warning if no extension was found.
        if (!ext) {
          console.warn('No file extension was found. Consider using the "format" property or specify an extension.');
        }

        // Check if this extension is available.
        if (ext && Howler.codecs(ext)) {
          url = self._src[i];
          break;
        }
      }

      if (!url) {
        self._emit('loaderror', null, 'No codec support for selected audio sources.');
        return;
      }

      self._src = url;
      self._state = 'loading';

      // If the hosting page is HTTPS and the source isn't,
      // drop down to HTML5 Audio to avoid Mixed Content errors.
      if (window.location.protocol === 'https:' && url.slice(0, 5) === 'http:') {
        self._html5 = true;
        self._webAudio = false;
      }

      // Create a new sound object and add it to the pool.
      new Sound(self);

      // Load and decode the audio data for playback.
      if (self._webAudio) {
        loadBuffer(self);
      }

      return self;
    },

    /**
     * Play a sound or resume previous playback.
     * @param  {String/Number} sprite   Sprite name for sprite playback or sound id to continue previous.
     * @param  {Boolean} internal Internal Use: true prevents event firing.
     * @return {Number}          Sound ID.
     */
    play: function(sprite, internal) {
      var self = this;
      var id = null;

      // Determine if a sprite, sound id or nothing was passed
      if (typeof sprite === 'number') {
        id = sprite;
        sprite = null;
      } else if (typeof sprite === 'string' && self._state === 'loaded' && !self._sprite[sprite]) {
        // If the passed sprite doesn't exist, do nothing.
        return null;
      } else if (typeof sprite === 'undefined') {
        // Use the default sound sprite (plays the full audio length).
        sprite = '__default';

        // Check if there is a single paused sound that isn't ended.
        // If there is, play that sound. If not, continue as usual.
        if (!self._playLock) {
          var num = 0;
          for (var i=0; i<self._sounds.length; i++) {
            if (self._sounds[i]._paused && !self._sounds[i]._ended) {
              num++;
              id = self._sounds[i]._id;
            }
          }

          if (num === 1) {
            sprite = null;
          } else {
            id = null;
          }
        }
      }

      // Get the selected node, or get one from the pool.
      var sound = id ? self._soundById(id) : self._inactiveSound();

      // If the sound doesn't exist, do nothing.
      if (!sound) {
        return null;
      }

      // Select the sprite definition.
      if (id && !sprite) {
        sprite = sound._sprite || '__default';
      }

      // If the sound hasn't loaded, we must wait to get the audio's duration.
      // We also need to wait to make sure we don't run into race conditions with
      // the order of function calls.
      if (self._state !== 'loaded') {
        // Set the sprite value on this sound.
        sound._sprite = sprite;

        // Mark this sound as not ended in case another sound is played before this one loads.
        sound._ended = false;

        // Add the sound to the queue to be played on load.
        var soundId = sound._id;
        self._queue.push({
          event: 'play',
          action: function() {
            self.play(soundId);
          }
        });

        return soundId;
      }

      // Don't play the sound if an id was passed and it is already playing.
      if (id && !sound._paused) {
        // Trigger the play event, in order to keep iterating through queue.
        if (!internal) {
          self._loadQueue('play');
        }

        return sound._id;
      }

      // Make sure the AudioContext isn't suspended, and resume it if it is.
      if (self._webAudio) {
        Howler._autoResume();
      }

      // Determine how long to play for and where to start playing.
      var seek = Math.max(0, sound._seek > 0 ? sound._seek : self._sprite[sprite][0] / 1000);
      var duration = Math.max(0, ((self._sprite[sprite][0] + self._sprite[sprite][1]) / 1000) - seek);
      var timeout = (duration * 1000) / Math.abs(sound._rate);
      var start = self._sprite[sprite][0] / 1000;
      var stop = (self._sprite[sprite][0] + self._sprite[sprite][1]) / 1000;
      sound._sprite = sprite;

      // Mark the sound as ended instantly so that this async playback
      // doesn't get grabbed by another call to play while this one waits to start.
      sound._ended = false;

      // Update the parameters of the sound.
      var setParams = function() {
        sound._paused = false;
        sound._seek = seek;
        sound._start = start;
        sound._stop = stop;
        sound._loop = !!(sound._loop || self._sprite[sprite][2]);
      };

      // End the sound instantly if seek is at the end.
      if (seek >= stop) {
        self._ended(sound);
        return;
      }

      // Begin the actual playback.
      var node = sound._node;
      if (self._webAudio) {
        // Fire this when the sound is ready to play to begin Web Audio playback.
        var playWebAudio = function() {
          self._playLock = false;
          setParams();
          self._refreshBuffer(sound);

          // Setup the playback params.
          var vol = (sound._muted || self._muted) ? 0 : sound._volume;
          node.gain.setValueAtTime(vol, Howler.ctx.currentTime);
          sound._playStart = Howler.ctx.currentTime;

          // Play the sound using the supported method.
          if (typeof node.bufferSource.start === 'undefined') {
            sound._loop ? node.bufferSource.noteGrainOn(0, seek, 86400) : node.bufferSource.noteGrainOn(0, seek, duration);
          } else {
            sound._loop ? node.bufferSource.start(0, seek, 86400) : node.bufferSource.start(0, seek, duration);
          }

          // Start a new timer if none is present.
          if (timeout !== Infinity) {
            self._endTimers[sound._id] = setTimeout(self._ended.bind(self, sound), timeout);
          }

          if (!internal) {
            setTimeout(function() {
              self._emit('play', sound._id);
              self._loadQueue();
            }, 0);
          }
        };

        if (Howler.state === 'running' && Howler.ctx.state !== 'interrupted') {
          playWebAudio();
        } else {
          self._playLock = true;

          // Wait for the audio context to resume before playing.
          self.once('resume', playWebAudio);

          // Cancel the end timer.
          self._clearTimer(sound._id);
        }
      } else {
        // Fire this when the sound is ready to play to begin HTML5 Audio playback.
        var playHtml5 = function() {
          node.currentTime = seek;
          node.muted = sound._muted || self._muted || Howler._muted || node.muted;
          node.volume = sound._volume * Howler.volume();
          node.playbackRate = sound._rate;

          // Some browsers will throw an error if this is called without user interaction.
          try {
            var play = node.play();

            // Support older browsers that don't support promises, and thus don't have this issue.
            if (play && typeof Promise !== 'undefined' && (play instanceof Promise || typeof play.then === 'function')) {
              // Implements a lock to prevent DOMException: The play() request was interrupted by a call to pause().
              self._playLock = true;

              // Set param values immediately.
              setParams();

              // Releases the lock and executes queued actions.
              play
                .then(function() {
                  self._playLock = false;
                  node._unlocked = true;
                  if (!internal) {
                    self._emit('play', sound._id);
                  } else {
                    self._loadQueue();
                  }
                })
                .catch(function() {
                  self._playLock = false;
                  self._emit('playerror', sound._id, 'Playback was unable to start. This is most commonly an issue ' +
                    'on mobile devices and Chrome where playback was not within a user interaction.');

                  // Reset the ended and paused values.
                  sound._ended = true;
                  sound._paused = true;
                });
            } else if (!internal) {
              self._playLock = false;
              setParams();
              self._emit('play', sound._id);
            }

            // Setting rate before playing won't work in IE, so we set it again here.
            node.playbackRate = sound._rate;

            // If the node is still paused, then we can assume there was a playback issue.
            if (node.paused) {
              self._emit('playerror', sound._id, 'Playback was unable to start. This is most commonly an issue ' +
                'on mobile devices and Chrome where playback was not within a user interaction.');
              return;
            }

            // Setup the end timer on sprites or listen for the ended event.
            if (sprite !== '__default' || sound._loop) {
              self._endTimers[sound._id] = setTimeout(self._ended.bind(self, sound), timeout);
            } else {
              self._endTimers[sound._id] = function() {
                // Fire ended on this audio node.
                self._ended(sound);

                // Clear this listener.
                node.removeEventListener('ended', self._endTimers[sound._id], false);
              };
              node.addEventListener('ended', self._endTimers[sound._id], false);
            }
          } catch (err) {
            self._emit('playerror', sound._id, err);
          }
        };

        // If this is streaming audio, make sure the src is set and load again.
        if (node.src === 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA') {
          node.src = self._src;
          node.load();
        }

        // Play immediately if ready, or wait for the 'canplaythrough'e vent.
        var loadedNoReadyState = (window && window.ejecta) || (!node.readyState && Howler._navigator.isCocoonJS);
        if (node.readyState >= 3 || loadedNoReadyState) {
          playHtml5();
        } else {
          self._playLock = true;
          self._state = 'loading';

          var listener = function() {
            self._state = 'loaded';
            
            // Begin playback.
            playHtml5();

            // Clear this listener.
            node.removeEventListener(Howler._canPlayEvent, listener, false);
          };
          node.addEventListener(Howler._canPlayEvent, listener, false);

          // Cancel the end timer.
          self._clearTimer(sound._id);
        }
      }

      return sound._id;
    },

    /**
     * Pause playback and save current position.
     * @param  {Number} id The sound ID (empty to pause all in group).
     * @return {Howl}
     */
    pause: function(id) {
      var self = this;

      // If the sound hasn't loaded or a play() promise is pending, add it to the load queue to pause when capable.
      if (self._state !== 'loaded' || self._playLock) {
        self._queue.push({
          event: 'pause',
          action: function() {
            self.pause(id);
          }
        });

        return self;
      }

      // If no id is passed, get all ID's to be paused.
      var ids = self._getSoundIds(id);

      for (var i=0; i<ids.length; i++) {
        // Clear the end timer.
        self._clearTimer(ids[i]);

        // Get the sound.
        var sound = self._soundById(ids[i]);

        if (sound && !sound._paused) {
          // Reset the seek position.
          sound._seek = self.seek(ids[i]);
          sound._rateSeek = 0;
          sound._paused = true;

          // Stop currently running fades.
          self._stopFade(ids[i]);

          if (sound._node) {
            if (self._webAudio) {
              // Make sure the sound has been created.
              if (!sound._node.bufferSource) {
                continue;
              }

              if (typeof sound._node.bufferSource.stop === 'undefined') {
                sound._node.bufferSource.noteOff(0);
              } else {
                sound._node.bufferSource.stop(0);
              }

              // Clean up the buffer source.
              self._cleanBuffer(sound._node);
            } else if (!isNaN(sound._node.duration) || sound._node.duration === Infinity) {
              sound._node.pause();
            }
          }
        }

        // Fire the pause event, unless `true` is passed as the 2nd argument.
        if (!arguments[1]) {
          self._emit('pause', sound ? sound._id : null);
        }
      }

      return self;
    },

    /**
     * Stop playback and reset to start.
     * @param  {Number} id The sound ID (empty to stop all in group).
     * @param  {Boolean} internal Internal Use: true prevents event firing.
     * @return {Howl}
     */
    stop: function(id, internal) {
      var self = this;

      // If the sound hasn't loaded, add it to the load queue to stop when capable.
      if (self._state !== 'loaded' || self._playLock) {
        self._queue.push({
          event: 'stop',
          action: function() {
            self.stop(id);
          }
        });

        return self;
      }

      // If no id is passed, get all ID's to be stopped.
      var ids = self._getSoundIds(id);

      for (var i=0; i<ids.length; i++) {
        // Clear the end timer.
        self._clearTimer(ids[i]);

        // Get the sound.
        var sound = self._soundById(ids[i]);

        if (sound) {
          // Reset the seek position.
          sound._seek = sound._start || 0;
          sound._rateSeek = 0;
          sound._paused = true;
          sound._ended = true;

          // Stop currently running fades.
          self._stopFade(ids[i]);

          if (sound._node) {
            if (self._webAudio) {
              // Make sure the sound's AudioBufferSourceNode has been created.
              if (sound._node.bufferSource) {
                if (typeof sound._node.bufferSource.stop === 'undefined') {
                  sound._node.bufferSource.noteOff(0);
                } else {
                  sound._node.bufferSource.stop(0);
                }

                // Clean up the buffer source.
                self._cleanBuffer(sound._node);
              }
            } else if (!isNaN(sound._node.duration) || sound._node.duration === Infinity) {
              sound._node.currentTime = sound._start || 0;
              sound._node.pause();

              // If this is a live stream, stop download once the audio is stopped.
              if (sound._node.duration === Infinity) {
                self._clearSound(sound._node);
              }
            }
          }

          if (!internal) {
            self._emit('stop', sound._id);
          }
        }
      }

      return self;
    },

    /**
     * Mute/unmute a single sound or all sounds in this Howl group.
     * @param  {Boolean} muted Set to true to mute and false to unmute.
     * @param  {Number} id    The sound ID to update (omit to mute/unmute all).
     * @return {Howl}
     */
    mute: function(muted, id) {
      var self = this;

      // If the sound hasn't loaded, add it to the load queue to mute when capable.
      if (self._state !== 'loaded'|| self._playLock) {
        self._queue.push({
          event: 'mute',
          action: function() {
            self.mute(muted, id);
          }
        });

        return self;
      }

      // If applying mute/unmute to all sounds, update the group's value.
      if (typeof id === 'undefined') {
        if (typeof muted === 'boolean') {
          self._muted = muted;
        } else {
          return self._muted;
        }
      }

      // If no id is passed, get all ID's to be muted.
      var ids = self._getSoundIds(id);

      for (var i=0; i<ids.length; i++) {
        // Get the sound.
        var sound = self._soundById(ids[i]);

        if (sound) {
          sound._muted = muted;

          // Cancel active fade and set the volume to the end value.
          if (sound._interval) {
            self._stopFade(sound._id);
          }

          if (self._webAudio && sound._node) {
            sound._node.gain.setValueAtTime(muted ? 0 : sound._volume, Howler.ctx.currentTime);
          } else if (sound._node) {
            sound._node.muted = Howler._muted ? true : muted;
          }

          self._emit('mute', sound._id);
        }
      }

      return self;
    },

    /**
     * Get/set the volume of this sound or of the Howl group. This method can optionally take 0, 1 or 2 arguments.
     *   volume() -> Returns the group's volume value.
     *   volume(id) -> Returns the sound id's current volume.
     *   volume(vol) -> Sets the volume of all sounds in this Howl group.
     *   volume(vol, id) -> Sets the volume of passed sound id.
     * @return {Howl/Number} Returns self or current volume.
     */
    volume: function() {
      var self = this;
      var args = arguments;
      var vol, id;

      // Determine the values based on arguments.
      if (args.length === 0) {
        // Return the value of the groups' volume.
        return self._volume;
      } else if (args.length === 1 || args.length === 2 && typeof args[1] === 'undefined') {
        // First check if this is an ID, and if not, assume it is a new volume.
        var ids = self._getSoundIds();
        var index = ids.indexOf(args[0]);
        if (index >= 0) {
          id = parseInt(args[0], 10);
        } else {
          vol = parseFloat(args[0]);
        }
      } else if (args.length >= 2) {
        vol = parseFloat(args[0]);
        id = parseInt(args[1], 10);
      }

      // Update the volume or return the current volume.
      var sound;
      if (typeof vol !== 'undefined' && vol >= 0 && vol <= 1) {
        // If the sound hasn't loaded, add it to the load queue to change volume when capable.
        if (self._state !== 'loaded'|| self._playLock) {
          self._queue.push({
            event: 'volume',
            action: function() {
              self.volume.apply(self, args);
            }
          });

          return self;
        }

        // Set the group volume.
        if (typeof id === 'undefined') {
          self._volume = vol;
        }

        // Update one or all volumes.
        id = self._getSoundIds(id);
        for (var i=0; i<id.length; i++) {
          // Get the sound.
          sound = self._soundById(id[i]);

          if (sound) {
            sound._volume = vol;

            // Stop currently running fades.
            if (!args[2]) {
              self._stopFade(id[i]);
            }

            if (self._webAudio && sound._node && !sound._muted) {
              sound._node.gain.setValueAtTime(vol, Howler.ctx.currentTime);
            } else if (sound._node && !sound._muted) {
              sound._node.volume = vol * Howler.volume();
            }

            self._emit('volume', sound._id);
          }
        }
      } else {
        sound = id ? self._soundById(id) : self._sounds[0];
        return sound ? sound._volume : 0;
      }

      return self;
    },

    /**
     * Fade a currently playing sound between two volumes (if no id is passed, all sounds will fade).
     * @param  {Number} from The value to fade from (0.0 to 1.0).
     * @param  {Number} to   The volume to fade to (0.0 to 1.0).
     * @param  {Number} len  Time in milliseconds to fade.
     * @param  {Number} id   The sound id (omit to fade all sounds).
     * @return {Howl}
     */
    fade: function(from, to, len, id) {
      var self = this;

      // If the sound hasn't loaded, add it to the load queue to fade when capable.
      if (self._state !== 'loaded' || self._playLock) {
        self._queue.push({
          event: 'fade',
          action: function() {
            self.fade(from, to, len, id);
          }
        });

        return self;
      }

      // Make sure the to/from/len values are numbers.
      from = Math.min(Math.max(0, parseFloat(from)), 1);
      to = Math.min(Math.max(0, parseFloat(to)), 1);
      len = parseFloat(len);

      // Set the volume to the start position.
      self.volume(from, id);

      // Fade the volume of one or all sounds.
      var ids = self._getSoundIds(id);
      for (var i=0; i<ids.length; i++) {
        // Get the sound.
        var sound = self._soundById(ids[i]);

        // Create a linear fade or fall back to timeouts with HTML5 Audio.
        if (sound) {
          // Stop the previous fade if no sprite is being used (otherwise, volume handles this).
          if (!id) {
            self._stopFade(ids[i]);
          }

          // If we are using Web Audio, let the native methods do the actual fade.
          if (self._webAudio && !sound._muted) {
            var currentTime = Howler.ctx.currentTime;
            var end = currentTime + (len / 1000);
            sound._volume = from;
            sound._node.gain.setValueAtTime(from, currentTime);
            sound._node.gain.linearRampToValueAtTime(to, end);
          }

          self._startFadeInterval(sound, from, to, len, ids[i], typeof id === 'undefined');
        }
      }

      return self;
    },

    /**
     * Starts the internal interval to fade a sound.
     * @param  {Object} sound Reference to sound to fade.
     * @param  {Number} from The value to fade from (0.0 to 1.0).
     * @param  {Number} to   The volume to fade to (0.0 to 1.0).
     * @param  {Number} len  Time in milliseconds to fade.
     * @param  {Number} id   The sound id to fade.
     * @param  {Boolean} isGroup   If true, set the volume on the group.
     */
    _startFadeInterval: function(sound, from, to, len, id, isGroup) {
      var self = this;
      var vol = from;
      var diff = to - from;
      var steps = Math.abs(diff / 0.01);
      var stepLen = Math.max(4, (steps > 0) ? len / steps : len);
      var lastTick = Date.now();

      // Store the value being faded to.
      sound._fadeTo = to;

      // Update the volume value on each interval tick.
      sound._interval = setInterval(function() {
        // Update the volume based on the time since the last tick.
        var tick = (Date.now() - lastTick) / len;
        lastTick = Date.now();
        vol += diff * tick;

        // Round to within 2 decimal points.
        vol = Math.round(vol * 100) / 100;

        // Make sure the volume is in the right bounds.
        if (diff < 0) {
          vol = Math.max(to, vol);
        } else {
          vol = Math.min(to, vol);
        }

        // Change the volume.
        if (self._webAudio) {
          sound._volume = vol;
        } else {
          self.volume(vol, sound._id, true);
        }

        // Set the group's volume.
        if (isGroup) {
          self._volume = vol;
        }

        // When the fade is complete, stop it and fire event.
        if ((to < from && vol <= to) || (to > from && vol >= to)) {
          clearInterval(sound._interval);
          sound._interval = null;
          sound._fadeTo = null;
          self.volume(to, sound._id);
          self._emit('fade', sound._id);
        }
      }, stepLen);
    },

    /**
     * Internal method that stops the currently playing fade when
     * a new fade starts, volume is changed or the sound is stopped.
     * @param  {Number} id The sound id.
     * @return {Howl}
     */
    _stopFade: function(id) {
      var self = this;
      var sound = self._soundById(id);

      if (sound && sound._interval) {
        if (self._webAudio) {
          sound._node.gain.cancelScheduledValues(Howler.ctx.currentTime);
        }

        clearInterval(sound._interval);
        sound._interval = null;
        self.volume(sound._fadeTo, id);
        sound._fadeTo = null;
        self._emit('fade', id);
      }

      return self;
    },

    /**
     * Get/set the loop parameter on a sound. This method can optionally take 0, 1 or 2 arguments.
     *   loop() -> Returns the group's loop value.
     *   loop(id) -> Returns the sound id's loop value.
     *   loop(loop) -> Sets the loop value for all sounds in this Howl group.
     *   loop(loop, id) -> Sets the loop value of passed sound id.
     * @return {Howl/Boolean} Returns self or current loop value.
     */
    loop: function() {
      var self = this;
      var args = arguments;
      var loop, id, sound;

      // Determine the values for loop and id.
      if (args.length === 0) {
        // Return the grou's loop value.
        return self._loop;
      } else if (args.length === 1) {
        if (typeof args[0] === 'boolean') {
          loop = args[0];
          self._loop = loop;
        } else {
          // Return this sound's loop value.
          sound = self._soundById(parseInt(args[0], 10));
          return sound ? sound._loop : false;
        }
      } else if (args.length === 2) {
        loop = args[0];
        id = parseInt(args[1], 10);
      }

      // If no id is passed, get all ID's to be looped.
      var ids = self._getSoundIds(id);
      for (var i=0; i<ids.length; i++) {
        sound = self._soundById(ids[i]);

        if (sound) {
          sound._loop = loop;
          if (self._webAudio && sound._node && sound._node.bufferSource) {
            sound._node.bufferSource.loop = loop;
            if (loop) {
              sound._node.bufferSource.loopStart = sound._start || 0;
              sound._node.bufferSource.loopEnd = sound._stop;

              // If playing, restart playback to ensure looping updates.
              if (self.playing(ids[i])) {
                self.pause(ids[i], true);
                self.play(ids[i], true);
              }
            }
          }
        }
      }

      return self;
    },

    /**
     * Get/set the playback rate of a sound. This method can optionally take 0, 1 or 2 arguments.
     *   rate() -> Returns the first sound node's current playback rate.
     *   rate(id) -> Returns the sound id's current playback rate.
     *   rate(rate) -> Sets the playback rate of all sounds in this Howl group.
     *   rate(rate, id) -> Sets the playback rate of passed sound id.
     * @return {Howl/Number} Returns self or the current playback rate.
     */
    rate: function() {
      var self = this;
      var args = arguments;
      var rate, id;

      // Determine the values based on arguments.
      if (args.length === 0) {
        // We will simply return the current rate of the first node.
        id = self._sounds[0]._id;
      } else if (args.length === 1) {
        // First check if this is an ID, and if not, assume it is a new rate value.
        var ids = self._getSoundIds();
        var index = ids.indexOf(args[0]);
        if (index >= 0) {
          id = parseInt(args[0], 10);
        } else {
          rate = parseFloat(args[0]);
        }
      } else if (args.length === 2) {
        rate = parseFloat(args[0]);
        id = parseInt(args[1], 10);
      }

      // Update the playback rate or return the current value.
      var sound;
      if (typeof rate === 'number') {
        // If the sound hasn't loaded, add it to the load queue to change playback rate when capable.
        if (self._state !== 'loaded' || self._playLock) {
          self._queue.push({
            event: 'rate',
            action: function() {
              self.rate.apply(self, args);
            }
          });

          return self;
        }

        // Set the group rate.
        if (typeof id === 'undefined') {
          self._rate = rate;
        }

        // Update one or all volumes.
        id = self._getSoundIds(id);
        for (var i=0; i<id.length; i++) {
          // Get the sound.
          sound = self._soundById(id[i]);

          if (sound) {
            // Keep track of our position when the rate changed and update the playback
            // start position so we can properly adjust the seek position for time elapsed.
            if (self.playing(id[i])) {
              sound._rateSeek = self.seek(id[i]);
              sound._playStart = self._webAudio ? Howler.ctx.currentTime : sound._playStart;
            }
            sound._rate = rate;

            // Change the playback rate.
            if (self._webAudio && sound._node && sound._node.bufferSource) {
              sound._node.bufferSource.playbackRate.setValueAtTime(rate, Howler.ctx.currentTime);
            } else if (sound._node) {
              sound._node.playbackRate = rate;
            }

            // Reset the timers.
            var seek = self.seek(id[i]);
            var duration = ((self._sprite[sound._sprite][0] + self._sprite[sound._sprite][1]) / 1000) - seek;
            var timeout = (duration * 1000) / Math.abs(sound._rate);

            // Start a new end timer if sound is already playing.
            if (self._endTimers[id[i]] || !sound._paused) {
              self._clearTimer(id[i]);
              self._endTimers[id[i]] = setTimeout(self._ended.bind(self, sound), timeout);
            }

            self._emit('rate', sound._id);
          }
        }
      } else {
        sound = self._soundById(id);
        return sound ? sound._rate : self._rate;
      }

      return self;
    },

    /**
     * Get/set the seek position of a sound. This method can optionally take 0, 1 or 2 arguments.
     *   seek() -> Returns the first sound node's current seek position.
     *   seek(id) -> Returns the sound id's current seek position.
     *   seek(seek) -> Sets the seek position of the first sound node.
     *   seek(seek, id) -> Sets the seek position of passed sound id.
     * @return {Howl/Number} Returns self or the current seek position.
     */
    seek: function() {
      var self = this;
      var args = arguments;
      var seek, id;

      // Determine the values based on arguments.
      if (args.length === 0) {
        // We will simply return the current position of the first node.
        if (self._sounds.length) {
          id = self._sounds[0]._id;
        }
      } else if (args.length === 1) {
        // First check if this is an ID, and if not, assume it is a new seek position.
        var ids = self._getSoundIds();
        var index = ids.indexOf(args[0]);
        if (index >= 0) {
          id = parseInt(args[0], 10);
        } else if (self._sounds.length) {
          id = self._sounds[0]._id;
          seek = parseFloat(args[0]);
        }
      } else if (args.length === 2) {
        seek = parseFloat(args[0]);
        id = parseInt(args[1], 10);
      }

      // If there is no ID, bail out.
      if (typeof id === 'undefined') {
        return 0;
      }

      // If the sound hasn't loaded, add it to the load queue to seek when capable.
      if (typeof seek === 'number' && (self._state !== 'loaded' || self._playLock)) {
        self._queue.push({
          event: 'seek',
          action: function() {
            self.seek.apply(self, args);
          }
        });

        return self;
      }

      // Get the sound.
      var sound = self._soundById(id);

      if (sound) {
        if (typeof seek === 'number' && seek >= 0) {
          // Pause the sound and update position for restarting playback.
          var playing = self.playing(id);
          if (playing) {
            self.pause(id, true);
          }

          // Move the position of the track and cancel timer.
          sound._seek = seek;
          sound._ended = false;
          self._clearTimer(id);

          // Update the seek position for HTML5 Audio.
          if (!self._webAudio && sound._node && !isNaN(sound._node.duration)) {
            sound._node.currentTime = seek;
          }

          // Seek and emit when ready.
          var seekAndEmit = function() {
            // Restart the playback if the sound was playing.
            if (playing) {
              self.play(id, true);
            }

            self._emit('seek', id);
          };

          // Wait for the play lock to be unset before emitting (HTML5 Audio).
          if (playing && !self._webAudio) {
            var emitSeek = function() {
              if (!self._playLock) {
                seekAndEmit();
              } else {
                setTimeout(emitSeek, 0);
              }
            };
            setTimeout(emitSeek, 0);
          } else {
            seekAndEmit();
          }
        } else {
          if (self._webAudio) {
            var realTime = self.playing(id) ? Howler.ctx.currentTime - sound._playStart : 0;
            var rateSeek = sound._rateSeek ? sound._rateSeek - sound._seek : 0;
            return sound._seek + (rateSeek + realTime * Math.abs(sound._rate));
          } else {
            return sound._node.currentTime;
          }
        }
      }

      return self;
    },

    /**
     * Check if a specific sound is currently playing or not (if id is provided), or check if at least one of the sounds in the group is playing or not.
     * @param  {Number}  id The sound id to check. If none is passed, the whole sound group is checked.
     * @return {Boolean} True if playing and false if not.
     */
    playing: function(id) {
      var self = this;

      // Check the passed sound ID (if any).
      if (typeof id === 'number') {
        var sound = self._soundById(id);
        return sound ? !sound._paused : false;
      }

      // Otherwise, loop through all sounds and check if any are playing.
      for (var i=0; i<self._sounds.length; i++) {
        if (!self._sounds[i]._paused) {
          return true;
        }
      }

      return false;
    },

    /**
     * Get the duration of this sound. Passing a sound id will return the sprite duration.
     * @param  {Number} id The sound id to check. If none is passed, return full source duration.
     * @return {Number} Audio duration in seconds.
     */
    duration: function(id) {
      var self = this;
      var duration = self._duration;

      // If we pass an ID, get the sound and return the sprite length.
      var sound = self._soundById(id);
      if (sound) {
        duration = self._sprite[sound._sprite][1] / 1000;
      }

      return duration;
    },

    /**
     * Returns the current loaded state of this Howl.
     * @return {String} 'unloaded', 'loading', 'loaded'
     */
    state: function() {
      return this._state;
    },

    /**
     * Unload and destroy the current Howl object.
     * This will immediately stop all sound instances attached to this group.
     */
    unload: function() {
      var self = this;

      // Stop playing any active sounds.
      var sounds = self._sounds;
      for (var i=0; i<sounds.length; i++) {
        // Stop the sound if it is currently playing.
        if (!sounds[i]._paused) {
          self.stop(sounds[i]._id);
        }

        // Remove the source or disconnect.
        if (!self._webAudio) {
          // Set the source to 0-second silence to stop any downloading (except in IE).
          self._clearSound(sounds[i]._node);

          // Remove any event listeners.
          sounds[i]._node.removeEventListener('error', sounds[i]._errorFn, false);
          sounds[i]._node.removeEventListener(Howler._canPlayEvent, sounds[i]._loadFn, false);
          sounds[i]._node.removeEventListener('ended', sounds[i]._endFn, false);

          // Release the Audio object back to the pool.
          Howler._releaseHtml5Audio(sounds[i]._node);
        }

        // Empty out all of the nodes.
        delete sounds[i]._node;

        // Make sure all timers are cleared out.
        self._clearTimer(sounds[i]._id);
      }

      // Remove the references in the global Howler object.
      var index = Howler._howls.indexOf(self);
      if (index >= 0) {
        Howler._howls.splice(index, 1);
      }

      // Delete this sound from the cache (if no other Howl is using it).
      var remCache = true;
      for (i=0; i<Howler._howls.length; i++) {
        if (Howler._howls[i]._src === self._src || self._src.indexOf(Howler._howls[i]._src) >= 0) {
          remCache = false;
          break;
        }
      }

      if (cache && remCache) {
        delete cache[self._src];
      }

      // Clear global errors.
      Howler.noAudio = false;

      // Clear out `self`.
      self._state = 'unloaded';
      self._sounds = [];
      self = null;

      return null;
    },

    /**
     * Listen to a custom event.
     * @param  {String}   event Event name.
     * @param  {Function} fn    Listener to call.
     * @param  {Number}   id    (optional) Only listen to events for this sound.
     * @param  {Number}   once  (INTERNAL) Marks event to fire only once.
     * @return {Howl}
     */
    on: function(event, fn, id, once) {
      var self = this;
      var events = self['_on' + event];

      if (typeof fn === 'function') {
        events.push(once ? {id: id, fn: fn, once: once} : {id: id, fn: fn});
      }

      return self;
    },

    /**
     * Remove a custom event. Call without parameters to remove all events.
     * @param  {String}   event Event name.
     * @param  {Function} fn    Listener to remove. Leave empty to remove all.
     * @param  {Number}   id    (optional) Only remove events for this sound.
     * @return {Howl}
     */
    off: function(event, fn, id) {
      var self = this;
      var events = self['_on' + event];
      var i = 0;

      // Allow passing just an event and ID.
      if (typeof fn === 'number') {
        id = fn;
        fn = null;
      }

      if (fn || id) {
        // Loop through event store and remove the passed function.
        for (i=0; i<events.length; i++) {
          var isId = (id === events[i].id);
          if (fn === events[i].fn && isId || !fn && isId) {
            events.splice(i, 1);
            break;
          }
        }
      } else if (event) {
        // Clear out all events of this type.
        self['_on' + event] = [];
      } else {
        // Clear out all events of every type.
        var keys = Object.keys(self);
        for (i=0; i<keys.length; i++) {
          if ((keys[i].indexOf('_on') === 0) && Array.isArray(self[keys[i]])) {
            self[keys[i]] = [];
          }
        }
      }

      return self;
    },

    /**
     * Listen to a custom event and remove it once fired.
     * @param  {String}   event Event name.
     * @param  {Function} fn    Listener to call.
     * @param  {Number}   id    (optional) Only listen to events for this sound.
     * @return {Howl}
     */
    once: function(event, fn, id) {
      var self = this;

      // Setup the event listener.
      self.on(event, fn, id, 1);

      return self;
    },

    /**
     * Emit all events of a specific type and pass the sound id.
     * @param  {String} event Event name.
     * @param  {Number} id    Sound ID.
     * @param  {Number} msg   Message to go with event.
     * @return {Howl}
     */
    _emit: function(event, id, msg) {
      var self = this;
      var events = self['_on' + event];

      // Loop through event store and fire all functions.
      for (var i=events.length-1; i>=0; i--) {
        // Only fire the listener if the correct ID is used.
        if (!events[i].id || events[i].id === id || event === 'load') {
          setTimeout(function(fn) {
            fn.call(this, id, msg);
          }.bind(self, events[i].fn), 0);

          // If this event was setup with `once`, remove it.
          if (events[i].once) {
            self.off(event, events[i].fn, events[i].id);
          }
        }
      }

      // Pass the event type into load queue so that it can continue stepping.
      self._loadQueue(event);

      return self;
    },

    /**
     * Queue of actions initiated before the sound has loaded.
     * These will be called in sequence, with the next only firing
     * after the previous has finished executing (even if async like play).
     * @return {Howl}
     */
    _loadQueue: function(event) {
      var self = this;

      if (self._queue.length > 0) {
        var task = self._queue[0];

        // Remove this task if a matching event was passed.
        if (task.event === event) {
          self._queue.shift();
          self._loadQueue();
        }

        // Run the task if no event type is passed.
        if (!event) {
          task.action();
        }
      }

      return self;
    },

    /**
     * Fired when playback ends at the end of the duration.
     * @param  {Sound} sound The sound object to work with.
     * @return {Howl}
     */
    _ended: function(sound) {
      var self = this;
      var sprite = sound._sprite;

      // If we are using IE and there was network latency we may be clipping
      // audio before it completes playing. Lets check the node to make sure it
      // believes it has completed, before ending the playback.
      if (!self._webAudio && sound._node && !sound._node.paused && !sound._node.ended && sound._node.currentTime < sound._stop) {
        setTimeout(self._ended.bind(self, sound), 100);
        return self;
      }

      // Should this sound loop?
      var loop = !!(sound._loop || self._sprite[sprite][2]);

      // Fire the ended event.
      self._emit('end', sound._id);

      // Restart the playback for HTML5 Audio loop.
      if (!self._webAudio && loop) {
        self.stop(sound._id, true).play(sound._id);
      }

      // Restart this timer if on a Web Audio loop.
      if (self._webAudio && loop) {
        self._emit('play', sound._id);
        sound._seek = sound._start || 0;
        sound._rateSeek = 0;
        sound._playStart = Howler.ctx.currentTime;

        var timeout = ((sound._stop - sound._start) * 1000) / Math.abs(sound._rate);
        self._endTimers[sound._id] = setTimeout(self._ended.bind(self, sound), timeout);
      }

      // Mark the node as paused.
      if (self._webAudio && !loop) {
        sound._paused = true;
        sound._ended = true;
        sound._seek = sound._start || 0;
        sound._rateSeek = 0;
        self._clearTimer(sound._id);

        // Clean up the buffer source.
        self._cleanBuffer(sound._node);

        // Attempt to auto-suspend AudioContext if no sounds are still playing.
        Howler._autoSuspend();
      }

      // When using a sprite, end the track.
      if (!self._webAudio && !loop) {
        self.stop(sound._id, true);
      }

      return self;
    },

    /**
     * Clear the end timer for a sound playback.
     * @param  {Number} id The sound ID.
     * @return {Howl}
     */
    _clearTimer: function(id) {
      var self = this;

      if (self._endTimers[id]) {
        // Clear the timeout or remove the ended listener.
        if (typeof self._endTimers[id] !== 'function') {
          clearTimeout(self._endTimers[id]);
        } else {
          var sound = self._soundById(id);
          if (sound && sound._node) {
            sound._node.removeEventListener('ended', self._endTimers[id], false);
          }
        }

        delete self._endTimers[id];
      }

      return self;
    },

    /**
     * Return the sound identified by this ID, or return null.
     * @param  {Number} id Sound ID
     * @return {Object}    Sound object or null.
     */
    _soundById: function(id) {
      var self = this;

      // Loop through all sounds and find the one with this ID.
      for (var i=0; i<self._sounds.length; i++) {
        if (id === self._sounds[i]._id) {
          return self._sounds[i];
        }
      }

      return null;
    },

    /**
     * Return an inactive sound from the pool or create a new one.
     * @return {Sound} Sound playback object.
     */
    _inactiveSound: function() {
      var self = this;

      self._drain();

      // Find the first inactive node to recycle.
      for (var i=0; i<self._sounds.length; i++) {
        if (self._sounds[i]._ended) {
          return self._sounds[i].reset();
        }
      }

      // If no inactive node was found, create a new one.
      return new Sound(self);
    },

    /**
     * Drain excess inactive sounds from the pool.
     */
    _drain: function() {
      var self = this;
      var limit = self._pool;
      var cnt = 0;
      var i = 0;

      // If there are less sounds than the max pool size, we are done.
      if (self._sounds.length < limit) {
        return;
      }

      // Count the number of inactive sounds.
      for (i=0; i<self._sounds.length; i++) {
        if (self._sounds[i]._ended) {
          cnt++;
        }
      }

      // Remove excess inactive sounds, going in reverse order.
      for (i=self._sounds.length - 1; i>=0; i--) {
        if (cnt <= limit) {
          return;
        }

        if (self._sounds[i]._ended) {
          // Disconnect the audio source when using Web Audio.
          if (self._webAudio && self._sounds[i]._node) {
            self._sounds[i]._node.disconnect(0);
          }

          // Remove sounds until we have the pool size.
          self._sounds.splice(i, 1);
          cnt--;
        }
      }
    },

    /**
     * Get all ID's from the sounds pool.
     * @param  {Number} id Only return one ID if one is passed.
     * @return {Array}    Array of IDs.
     */
    _getSoundIds: function(id) {
      var self = this;

      if (typeof id === 'undefined') {
        var ids = [];
        for (var i=0; i<self._sounds.length; i++) {
          ids.push(self._sounds[i]._id);
        }

        return ids;
      } else {
        return [id];
      }
    },

    /**
     * Load the sound back into the buffer source.
     * @param  {Sound} sound The sound object to work with.
     * @return {Howl}
     */
    _refreshBuffer: function(sound) {
      var self = this;

      // Setup the buffer source for playback.
      sound._node.bufferSource = Howler.ctx.createBufferSource();
      sound._node.bufferSource.buffer = cache[self._src];

      // Connect to the correct node.
      if (sound._panner) {
        sound._node.bufferSource.connect(sound._panner);
      } else {
        sound._node.bufferSource.connect(sound._node);
      }

      // Setup looping and playback rate.
      sound._node.bufferSource.loop = sound._loop;
      if (sound._loop) {
        sound._node.bufferSource.loopStart = sound._start || 0;
        sound._node.bufferSource.loopEnd = sound._stop || 0;
      }
      sound._node.bufferSource.playbackRate.setValueAtTime(sound._rate, Howler.ctx.currentTime);

      return self;
    },

    /**
     * Prevent memory leaks by cleaning up the buffer source after playback.
     * @param  {Object} node Sound's audio node containing the buffer source.
     * @return {Howl}
     */
    _cleanBuffer: function(node) {
      var self = this;
      var isIOS = Howler._navigator && Howler._navigator.vendor.indexOf('Apple') >= 0;

      if (Howler._scratchBuffer && node.bufferSource) {
        node.bufferSource.onended = null;
        node.bufferSource.disconnect(0);
        if (isIOS) {
          try { node.bufferSource.buffer = Howler._scratchBuffer; } catch(e) {}
        }
      }
      node.bufferSource = null;

      return self;
    },

    /**
     * Set the source to a 0-second silence to stop any downloading (except in IE).
     * @param  {Object} node Audio node to clear.
     */
    _clearSound: function(node) {
      var checkIE = /MSIE |Trident\//.test(Howler._navigator && Howler._navigator.userAgent);
      if (!checkIE) {
        node.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
      }
    }
  };

  /** Single Sound Methods **/
  /***************************************************************************/

  /**
   * Setup the sound object, which each node attached to a Howl group is contained in.
   * @param {Object} howl The Howl parent group.
   */
  var Sound = function(howl) {
    this._parent = howl;
    this.init();
  };
  Sound.prototype = {
    /**
     * Initialize a new Sound object.
     * @return {Sound}
     */
    init: function() {
      var self = this;
      var parent = self._parent;

      // Setup the default parameters.
      self._muted = parent._muted;
      self._loop = parent._loop;
      self._volume = parent._volume;
      self._rate = parent._rate;
      self._seek = 0;
      self._paused = true;
      self._ended = true;
      self._sprite = '__default';

      // Generate a unique ID for this sound.
      self._id = ++Howler._counter;

      // Add itself to the parent's pool.
      parent._sounds.push(self);

      // Create the new node.
      self.create();

      return self;
    },

    /**
     * Create and setup a new sound object, whether HTML5 Audio or Web Audio.
     * @return {Sound}
     */
    create: function() {
      var self = this;
      var parent = self._parent;
      var volume = (Howler._muted || self._muted || self._parent._muted) ? 0 : self._volume;

      if (parent._webAudio) {
        // Create the gain node for controlling volume (the source will connect to this).
        self._node = (typeof Howler.ctx.createGain === 'undefined') ? Howler.ctx.createGainNode() : Howler.ctx.createGain();
        self._node.gain.setValueAtTime(volume, Howler.ctx.currentTime);
        self._node.paused = true;
        self._node.connect(Howler.masterGain);
      } else if (!Howler.noAudio) {
        // Get an unlocked Audio object from the pool.
        self._node = Howler._obtainHtml5Audio();

        // Listen for errors (http://dev.w3.org/html5/spec-author-view/spec.html#mediaerror).
        self._errorFn = self._errorListener.bind(self);
        self._node.addEventListener('error', self._errorFn, false);

        // Listen for 'canplaythrough' event to let us know the sound is ready.
        self._loadFn = self._loadListener.bind(self);
        self._node.addEventListener(Howler._canPlayEvent, self._loadFn, false);

        // Listen for the 'ended' event on the sound to account for edge-case where
        // a finite sound has a duration of Infinity.
        self._endFn = self._endListener.bind(self);
        self._node.addEventListener('ended', self._endFn, false);

        // Setup the new audio node.
        self._node.src = parent._src;
        self._node.preload = parent._preload === true ? 'auto' : parent._preload;
        self._node.volume = volume * Howler.volume();

        // Begin loading the source.
        self._node.load();
      }

      return self;
    },

    /**
     * Reset the parameters of this sound to the original state (for recycle).
     * @return {Sound}
     */
    reset: function() {
      var self = this;
      var parent = self._parent;

      // Reset all of the parameters of this sound.
      self._muted = parent._muted;
      self._loop = parent._loop;
      self._volume = parent._volume;
      self._rate = parent._rate;
      self._seek = 0;
      self._rateSeek = 0;
      self._paused = true;
      self._ended = true;
      self._sprite = '__default';

      // Generate a new ID so that it isn't confused with the previous sound.
      self._id = ++Howler._counter;

      return self;
    },

    /**
     * HTML5 Audio error listener callback.
     */
    _errorListener: function() {
      var self = this;

      // Fire an error event and pass back the code.
      self._parent._emit('loaderror', self._id, self._node.error ? self._node.error.code : 0);

      // Clear the event listener.
      self._node.removeEventListener('error', self._errorFn, false);
    },

    /**
     * HTML5 Audio canplaythrough listener callback.
     */
    _loadListener: function() {
      var self = this;
      var parent = self._parent;

      // Round up the duration to account for the lower precision in HTML5 Audio.
      parent._duration = Math.ceil(self._node.duration * 10) / 10;

      // Setup a sprite if none is defined.
      if (Object.keys(parent._sprite).length === 0) {
        parent._sprite = {__default: [0, parent._duration * 1000]};
      }

      if (parent._state !== 'loaded') {
        parent._state = 'loaded';
        parent._emit('load');
        parent._loadQueue();
      }

      // Clear the event listener.
      self._node.removeEventListener(Howler._canPlayEvent, self._loadFn, false);
    },

    /**
     * HTML5 Audio ended listener callback.
     */
    _endListener: function() {
      var self = this;
      var parent = self._parent;

      // Only handle the `ended`` event if the duration is Infinity.
      if (parent._duration === Infinity) {
        // Update the parent duration to match the real audio duration.
        // Round up the duration to account for the lower precision in HTML5 Audio.
        parent._duration = Math.ceil(self._node.duration * 10) / 10;

        // Update the sprite that corresponds to the real duration.
        if (parent._sprite.__default[1] === Infinity) {
          parent._sprite.__default[1] = parent._duration * 1000;
        }

        // Run the regular ended method.
        parent._ended(self);
      }

      // Clear the event listener since the duration is now correct.
      self._node.removeEventListener('ended', self._endFn, false);
    }
  };

  /** Helper Methods **/
  /***************************************************************************/

  var cache = {};

  /**
   * Buffer a sound from URL, Data URI or cache and decode to audio source (Web Audio API).
   * @param  {Howl} self
   */
  var loadBuffer = function(self) {
    var url = self._src;

    // Check if the buffer has already been cached and use it instead.
    if (cache[url]) {
      // Set the duration from the cache.
      self._duration = cache[url].duration;

      // Load the sound into this Howl.
      loadSound(self);

      return;
    }

    if (/^data:[^;]+;base64,/.test(url)) {
      // Decode the base64 data URI without XHR, since some browsers don't support it.
      var data = atob(url.split(',')[1]);
      var dataView = new Uint8Array(data.length);
      for (var i=0; i<data.length; ++i) {
        dataView[i] = data.charCodeAt(i);
      }

      decodeAudioData(dataView.buffer, self);
    } else {
      // Load the buffer from the URL.
      var xhr = new XMLHttpRequest();
      xhr.open(self._xhr.method, url, true);
      xhr.withCredentials = self._xhr.withCredentials;
      xhr.responseType = 'arraybuffer';

      // Apply any custom headers to the request.
      if (self._xhr.headers) {
        Object.keys(self._xhr.headers).forEach(function(key) {
          xhr.setRequestHeader(key, self._xhr.headers[key]);
        });
      }

      xhr.onload = function() {
        // Make sure we get a successful response back.
        var code = (xhr.status + '')[0];
        if (code !== '0' && code !== '2' && code !== '3') {
          self._emit('loaderror', null, 'Failed loading audio file with status: ' + xhr.status + '.');
          return;
        }

        decodeAudioData(xhr.response, self);
      };
      xhr.onerror = function() {
        // If there is an error, switch to HTML5 Audio.
        if (self._webAudio) {
          self._html5 = true;
          self._webAudio = false;
          self._sounds = [];
          delete cache[url];
          self.load();
        }
      };
      safeXhrSend(xhr);
    }
  };

  /**
   * Send the XHR request wrapped in a try/catch.
   * @param  {Object} xhr XHR to send.
   */
  var safeXhrSend = function(xhr) {
    try {
      xhr.send();
    } catch (e) {
      xhr.onerror();
    }
  };

  /**
   * Decode audio data from an array buffer.
   * @param  {ArrayBuffer} arraybuffer The audio data.
   * @param  {Howl}        self
   */
  var decodeAudioData = function(arraybuffer, self) {
    // Fire a load error if something broke.
    var error = function() {
      self._emit('loaderror', null, 'Decoding audio data failed.');
    };

    // Load the sound on success.
    var success = function(buffer) {
      if (buffer && self._sounds.length > 0) {
        cache[self._src] = buffer;
        loadSound(self, buffer);
      } else {
        error();
      }
    };

    // Decode the buffer into an audio source.
    if (typeof Promise !== 'undefined' && Howler.ctx.decodeAudioData.length === 1) {
      Howler.ctx.decodeAudioData(arraybuffer).then(success).catch(error);
    } else {
      Howler.ctx.decodeAudioData(arraybuffer, success, error);
    }
  }

  /**
   * Sound is now loaded, so finish setting everything up and fire the loaded event.
   * @param  {Howl} self
   * @param  {Object} buffer The decoded buffer sound source.
   */
  var loadSound = function(self, buffer) {
    // Set the duration.
    if (buffer && !self._duration) {
      self._duration = buffer.duration;
    }

    // Setup a sprite if none is defined.
    if (Object.keys(self._sprite).length === 0) {
      self._sprite = {__default: [0, self._duration * 1000]};
    }

    // Fire the loaded event.
    if (self._state !== 'loaded') {
      self._state = 'loaded';
      self._emit('load');
      self._loadQueue();
    }
  };

  /**
   * Setup the audio context when available, or switch to HTML5 Audio mode.
   */
  var setupAudioContext = function() {
    // If we have already detected that Web Audio isn't supported, don't run this step again.
    if (!Howler.usingWebAudio) {
      return;
    }

    // Check if we are using Web Audio and setup the AudioContext if we are.
    try {
      if (typeof AudioContext !== 'undefined') {
        Howler.ctx = new AudioContext();
      } else if (typeof webkitAudioContext !== 'undefined') {
        Howler.ctx = new webkitAudioContext();
      } else {
        Howler.usingWebAudio = false;
      }
    } catch(e) {
      Howler.usingWebAudio = false;
    }

    // If the audio context creation still failed, set using web audio to false.
    if (!Howler.ctx) {
      Howler.usingWebAudio = false;
    }

    // Check if a webview is being used on iOS8 or earlier (rather than the browser).
    // If it is, disable Web Audio as it causes crashing.
    var iOS = (/iP(hone|od|ad)/.test(Howler._navigator && Howler._navigator.platform));
    var appVersion = Howler._navigator && Howler._navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/);
    var version = appVersion ? parseInt(appVersion[1], 10) : null;
    if (iOS && version && version < 9) {
      var safari = /safari/.test(Howler._navigator && Howler._navigator.userAgent.toLowerCase());
      if (Howler._navigator && !safari) {
        Howler.usingWebAudio = false;
      }
    }

    // Create and expose the master GainNode when using Web Audio (useful for plugins or advanced usage).
    if (Howler.usingWebAudio) {
      Howler.masterGain = (typeof Howler.ctx.createGain === 'undefined') ? Howler.ctx.createGainNode() : Howler.ctx.createGain();
      Howler.masterGain.gain.setValueAtTime(Howler._muted ? 0 : Howler._volume, Howler.ctx.currentTime);
      Howler.masterGain.connect(Howler.ctx.destination);
    }

    // Re-run the setup on Howler.
    Howler._setup();
  };

  // Add support for AMD (Asynchronous Module Definition) libraries such as require.js.
  if (true) {
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = (function() {
      return {
        Howler: Howler,
        Howl: Howl
      };
    }).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  }

  // Add support for CommonJS libraries such as browserify.
  if (true) {
    exports.Howler = Howler;
    exports.Howl = Howl;
  }

  // Add to global in Node.js (for testing, etc).
  if (typeof __webpack_require__.g !== 'undefined') {
    __webpack_require__.g.HowlerGlobal = HowlerGlobal;
    __webpack_require__.g.Howler = Howler;
    __webpack_require__.g.Howl = Howl;
    __webpack_require__.g.Sound = Sound;
  } else if (typeof window !== 'undefined') {  // Define globally in case AMD is not available or unused.
    window.HowlerGlobal = HowlerGlobal;
    window.Howler = Howler;
    window.Howl = Howl;
    window.Sound = Sound;
  }
})();


/*!
 *  Spatial Plugin - Adds support for stereo and 3D audio where Web Audio is supported.
 *  
 *  howler.js v2.2.3
 *  howlerjs.com
 *
 *  (c) 2013-2020, James Simpson of GoldFire Studios
 *  goldfirestudios.com
 *
 *  MIT License
 */

(function() {

  'use strict';

  // Setup default properties.
  HowlerGlobal.prototype._pos = [0, 0, 0];
  HowlerGlobal.prototype._orientation = [0, 0, -1, 0, 1, 0];

  /** Global Methods **/
  /***************************************************************************/

  /**
   * Helper method to update the stereo panning position of all current Howls.
   * Future Howls will not use this value unless explicitly set.
   * @param  {Number} pan A value of -1.0 is all the way left and 1.0 is all the way right.
   * @return {Howler/Number}     Self or current stereo panning value.
   */
  HowlerGlobal.prototype.stereo = function(pan) {
    var self = this;

    // Stop right here if not using Web Audio.
    if (!self.ctx || !self.ctx.listener) {
      return self;
    }

    // Loop through all Howls and update their stereo panning.
    for (var i=self._howls.length-1; i>=0; i--) {
      self._howls[i].stereo(pan);
    }

    return self;
  };

  /**
   * Get/set the position of the listener in 3D cartesian space. Sounds using
   * 3D position will be relative to the listener's position.
   * @param  {Number} x The x-position of the listener.
   * @param  {Number} y The y-position of the listener.
   * @param  {Number} z The z-position of the listener.
   * @return {Howler/Array}   Self or current listener position.
   */
  HowlerGlobal.prototype.pos = function(x, y, z) {
    var self = this;

    // Stop right here if not using Web Audio.
    if (!self.ctx || !self.ctx.listener) {
      return self;
    }

    // Set the defaults for optional 'y' & 'z'.
    y = (typeof y !== 'number') ? self._pos[1] : y;
    z = (typeof z !== 'number') ? self._pos[2] : z;

    if (typeof x === 'number') {
      self._pos = [x, y, z];

      if (typeof self.ctx.listener.positionX !== 'undefined') {
        self.ctx.listener.positionX.setTargetAtTime(self._pos[0], Howler.ctx.currentTime, 0.1);
        self.ctx.listener.positionY.setTargetAtTime(self._pos[1], Howler.ctx.currentTime, 0.1);
        self.ctx.listener.positionZ.setTargetAtTime(self._pos[2], Howler.ctx.currentTime, 0.1);
      } else {
        self.ctx.listener.setPosition(self._pos[0], self._pos[1], self._pos[2]);
      }
    } else {
      return self._pos;
    }

    return self;
  };

  /**
   * Get/set the direction the listener is pointing in the 3D cartesian space.
   * A front and up vector must be provided. The front is the direction the
   * face of the listener is pointing, and up is the direction the top of the
   * listener is pointing. Thus, these values are expected to be at right angles
   * from each other.
   * @param  {Number} x   The x-orientation of the listener.
   * @param  {Number} y   The y-orientation of the listener.
   * @param  {Number} z   The z-orientation of the listener.
   * @param  {Number} xUp The x-orientation of the top of the listener.
   * @param  {Number} yUp The y-orientation of the top of the listener.
   * @param  {Number} zUp The z-orientation of the top of the listener.
   * @return {Howler/Array}     Returns self or the current orientation vectors.
   */
  HowlerGlobal.prototype.orientation = function(x, y, z, xUp, yUp, zUp) {
    var self = this;

    // Stop right here if not using Web Audio.
    if (!self.ctx || !self.ctx.listener) {
      return self;
    }

    // Set the defaults for optional 'y' & 'z'.
    var or = self._orientation;
    y = (typeof y !== 'number') ? or[1] : y;
    z = (typeof z !== 'number') ? or[2] : z;
    xUp = (typeof xUp !== 'number') ? or[3] : xUp;
    yUp = (typeof yUp !== 'number') ? or[4] : yUp;
    zUp = (typeof zUp !== 'number') ? or[5] : zUp;

    if (typeof x === 'number') {
      self._orientation = [x, y, z, xUp, yUp, zUp];

      if (typeof self.ctx.listener.forwardX !== 'undefined') {
        self.ctx.listener.forwardX.setTargetAtTime(x, Howler.ctx.currentTime, 0.1);
        self.ctx.listener.forwardY.setTargetAtTime(y, Howler.ctx.currentTime, 0.1);
        self.ctx.listener.forwardZ.setTargetAtTime(z, Howler.ctx.currentTime, 0.1);
        self.ctx.listener.upX.setTargetAtTime(xUp, Howler.ctx.currentTime, 0.1);
        self.ctx.listener.upY.setTargetAtTime(yUp, Howler.ctx.currentTime, 0.1);
        self.ctx.listener.upZ.setTargetAtTime(zUp, Howler.ctx.currentTime, 0.1);
      } else {
        self.ctx.listener.setOrientation(x, y, z, xUp, yUp, zUp);
      }
    } else {
      return or;
    }

    return self;
  };

  /** Group Methods **/
  /***************************************************************************/

  /**
   * Add new properties to the core init.
   * @param  {Function} _super Core init method.
   * @return {Howl}
   */
  Howl.prototype.init = (function(_super) {
    return function(o) {
      var self = this;

      // Setup user-defined default properties.
      self._orientation = o.orientation || [1, 0, 0];
      self._stereo = o.stereo || null;
      self._pos = o.pos || null;
      self._pannerAttr = {
        coneInnerAngle: typeof o.coneInnerAngle !== 'undefined' ? o.coneInnerAngle : 360,
        coneOuterAngle: typeof o.coneOuterAngle !== 'undefined' ? o.coneOuterAngle : 360,
        coneOuterGain: typeof o.coneOuterGain !== 'undefined' ? o.coneOuterGain : 0,
        distanceModel: typeof o.distanceModel !== 'undefined' ? o.distanceModel : 'inverse',
        maxDistance: typeof o.maxDistance !== 'undefined' ? o.maxDistance : 10000,
        panningModel: typeof o.panningModel !== 'undefined' ? o.panningModel : 'HRTF',
        refDistance: typeof o.refDistance !== 'undefined' ? o.refDistance : 1,
        rolloffFactor: typeof o.rolloffFactor !== 'undefined' ? o.rolloffFactor : 1
      };

      // Setup event listeners.
      self._onstereo = o.onstereo ? [{fn: o.onstereo}] : [];
      self._onpos = o.onpos ? [{fn: o.onpos}] : [];
      self._onorientation = o.onorientation ? [{fn: o.onorientation}] : [];

      // Complete initilization with howler.js core's init function.
      return _super.call(this, o);
    };
  })(Howl.prototype.init);

  /**
   * Get/set the stereo panning of the audio source for this sound or all in the group.
   * @param  {Number} pan  A value of -1.0 is all the way left and 1.0 is all the way right.
   * @param  {Number} id (optional) The sound ID. If none is passed, all in group will be updated.
   * @return {Howl/Number}    Returns self or the current stereo panning value.
   */
  Howl.prototype.stereo = function(pan, id) {
    var self = this;

    // Stop right here if not using Web Audio.
    if (!self._webAudio) {
      return self;
    }

    // If the sound hasn't loaded, add it to the load queue to change stereo pan when capable.
    if (self._state !== 'loaded') {
      self._queue.push({
        event: 'stereo',
        action: function() {
          self.stereo(pan, id);
        }
      });

      return self;
    }

    // Check for PannerStereoNode support and fallback to PannerNode if it doesn't exist.
    var pannerType = (typeof Howler.ctx.createStereoPanner === 'undefined') ? 'spatial' : 'stereo';

    // Setup the group's stereo panning if no ID is passed.
    if (typeof id === 'undefined') {
      // Return the group's stereo panning if no parameters are passed.
      if (typeof pan === 'number') {
        self._stereo = pan;
        self._pos = [pan, 0, 0];
      } else {
        return self._stereo;
      }
    }

    // Change the streo panning of one or all sounds in group.
    var ids = self._getSoundIds(id);
    for (var i=0; i<ids.length; i++) {
      // Get the sound.
      var sound = self._soundById(ids[i]);

      if (sound) {
        if (typeof pan === 'number') {
          sound._stereo = pan;
          sound._pos = [pan, 0, 0];

          if (sound._node) {
            // If we are falling back, make sure the panningModel is equalpower.
            sound._pannerAttr.panningModel = 'equalpower';

            // Check if there is a panner setup and create a new one if not.
            if (!sound._panner || !sound._panner.pan) {
              setupPanner(sound, pannerType);
            }

            if (pannerType === 'spatial') {
              if (typeof sound._panner.positionX !== 'undefined') {
                sound._panner.positionX.setValueAtTime(pan, Howler.ctx.currentTime);
                sound._panner.positionY.setValueAtTime(0, Howler.ctx.currentTime);
                sound._panner.positionZ.setValueAtTime(0, Howler.ctx.currentTime);
              } else {
                sound._panner.setPosition(pan, 0, 0);
              }
            } else {
              sound._panner.pan.setValueAtTime(pan, Howler.ctx.currentTime);
            }
          }

          self._emit('stereo', sound._id);
        } else {
          return sound._stereo;
        }
      }
    }

    return self;
  };

  /**
   * Get/set the 3D spatial position of the audio source for this sound or group relative to the global listener.
   * @param  {Number} x  The x-position of the audio source.
   * @param  {Number} y  The y-position of the audio source.
   * @param  {Number} z  The z-position of the audio source.
   * @param  {Number} id (optional) The sound ID. If none is passed, all in group will be updated.
   * @return {Howl/Array}    Returns self or the current 3D spatial position: [x, y, z].
   */
  Howl.prototype.pos = function(x, y, z, id) {
    var self = this;

    // Stop right here if not using Web Audio.
    if (!self._webAudio) {
      return self;
    }

    // If the sound hasn't loaded, add it to the load queue to change position when capable.
    if (self._state !== 'loaded') {
      self._queue.push({
        event: 'pos',
        action: function() {
          self.pos(x, y, z, id);
        }
      });

      return self;
    }

    // Set the defaults for optional 'y' & 'z'.
    y = (typeof y !== 'number') ? 0 : y;
    z = (typeof z !== 'number') ? -0.5 : z;

    // Setup the group's spatial position if no ID is passed.
    if (typeof id === 'undefined') {
      // Return the group's spatial position if no parameters are passed.
      if (typeof x === 'number') {
        self._pos = [x, y, z];
      } else {
        return self._pos;
      }
    }

    // Change the spatial position of one or all sounds in group.
    var ids = self._getSoundIds(id);
    for (var i=0; i<ids.length; i++) {
      // Get the sound.
      var sound = self._soundById(ids[i]);

      if (sound) {
        if (typeof x === 'number') {
          sound._pos = [x, y, z];

          if (sound._node) {
            // Check if there is a panner setup and create a new one if not.
            if (!sound._panner || sound._panner.pan) {
              setupPanner(sound, 'spatial');
            }

            if (typeof sound._panner.positionX !== 'undefined') {
              sound._panner.positionX.setValueAtTime(x, Howler.ctx.currentTime);
              sound._panner.positionY.setValueAtTime(y, Howler.ctx.currentTime);
              sound._panner.positionZ.setValueAtTime(z, Howler.ctx.currentTime);
            } else {
              sound._panner.setPosition(x, y, z);
            }
          }

          self._emit('pos', sound._id);
        } else {
          return sound._pos;
        }
      }
    }

    return self;
  };

  /**
   * Get/set the direction the audio source is pointing in the 3D cartesian coordinate
   * space. Depending on how direction the sound is, based on the `cone` attributes,
   * a sound pointing away from the listener can be quiet or silent.
   * @param  {Number} x  The x-orientation of the source.
   * @param  {Number} y  The y-orientation of the source.
   * @param  {Number} z  The z-orientation of the source.
   * @param  {Number} id (optional) The sound ID. If none is passed, all in group will be updated.
   * @return {Howl/Array}    Returns self or the current 3D spatial orientation: [x, y, z].
   */
  Howl.prototype.orientation = function(x, y, z, id) {
    var self = this;

    // Stop right here if not using Web Audio.
    if (!self._webAudio) {
      return self;
    }

    // If the sound hasn't loaded, add it to the load queue to change orientation when capable.
    if (self._state !== 'loaded') {
      self._queue.push({
        event: 'orientation',
        action: function() {
          self.orientation(x, y, z, id);
        }
      });

      return self;
    }

    // Set the defaults for optional 'y' & 'z'.
    y = (typeof y !== 'number') ? self._orientation[1] : y;
    z = (typeof z !== 'number') ? self._orientation[2] : z;

    // Setup the group's spatial orientation if no ID is passed.
    if (typeof id === 'undefined') {
      // Return the group's spatial orientation if no parameters are passed.
      if (typeof x === 'number') {
        self._orientation = [x, y, z];
      } else {
        return self._orientation;
      }
    }

    // Change the spatial orientation of one or all sounds in group.
    var ids = self._getSoundIds(id);
    for (var i=0; i<ids.length; i++) {
      // Get the sound.
      var sound = self._soundById(ids[i]);

      if (sound) {
        if (typeof x === 'number') {
          sound._orientation = [x, y, z];

          if (sound._node) {
            // Check if there is a panner setup and create a new one if not.
            if (!sound._panner) {
              // Make sure we have a position to setup the node with.
              if (!sound._pos) {
                sound._pos = self._pos || [0, 0, -0.5];
              }

              setupPanner(sound, 'spatial');
            }

            if (typeof sound._panner.orientationX !== 'undefined') {
              sound._panner.orientationX.setValueAtTime(x, Howler.ctx.currentTime);
              sound._panner.orientationY.setValueAtTime(y, Howler.ctx.currentTime);
              sound._panner.orientationZ.setValueAtTime(z, Howler.ctx.currentTime);
            } else {
              sound._panner.setOrientation(x, y, z);
            }
          }

          self._emit('orientation', sound._id);
        } else {
          return sound._orientation;
        }
      }
    }

    return self;
  };

  /**
   * Get/set the panner node's attributes for a sound or group of sounds.
   * This method can optionall take 0, 1 or 2 arguments.
   *   pannerAttr() -> Returns the group's values.
   *   pannerAttr(id) -> Returns the sound id's values.
   *   pannerAttr(o) -> Set's the values of all sounds in this Howl group.
   *   pannerAttr(o, id) -> Set's the values of passed sound id.
   *
   *   Attributes:
   *     coneInnerAngle - (360 by default) A parameter for directional audio sources, this is an angle, in degrees,
   *                      inside of which there will be no volume reduction.
   *     coneOuterAngle - (360 by default) A parameter for directional audio sources, this is an angle, in degrees,
   *                      outside of which the volume will be reduced to a constant value of `coneOuterGain`.
   *     coneOuterGain - (0 by default) A parameter for directional audio sources, this is the gain outside of the
   *                     `coneOuterAngle`. It is a linear value in the range `[0, 1]`.
   *     distanceModel - ('inverse' by default) Determines algorithm used to reduce volume as audio moves away from
   *                     listener. Can be `linear`, `inverse` or `exponential.
   *     maxDistance - (10000 by default) The maximum distance between source and listener, after which the volume
   *                   will not be reduced any further.
   *     refDistance - (1 by default) A reference distance for reducing volume as source moves further from the listener.
   *                   This is simply a variable of the distance model and has a different effect depending on which model
   *                   is used and the scale of your coordinates. Generally, volume will be equal to 1 at this distance.
   *     rolloffFactor - (1 by default) How quickly the volume reduces as source moves from listener. This is simply a
   *                     variable of the distance model and can be in the range of `[0, 1]` with `linear` and `[0, ∞]`
   *                     with `inverse` and `exponential`.
   *     panningModel - ('HRTF' by default) Determines which spatialization algorithm is used to position audio.
   *                     Can be `HRTF` or `equalpower`.
   *
   * @return {Howl/Object} Returns self or current panner attributes.
   */
  Howl.prototype.pannerAttr = function() {
    var self = this;
    var args = arguments;
    var o, id, sound;

    // Stop right here if not using Web Audio.
    if (!self._webAudio) {
      return self;
    }

    // Determine the values based on arguments.
    if (args.length === 0) {
      // Return the group's panner attribute values.
      return self._pannerAttr;
    } else if (args.length === 1) {
      if (typeof args[0] === 'object') {
        o = args[0];

        // Set the grou's panner attribute values.
        if (typeof id === 'undefined') {
          if (!o.pannerAttr) {
            o.pannerAttr = {
              coneInnerAngle: o.coneInnerAngle,
              coneOuterAngle: o.coneOuterAngle,
              coneOuterGain: o.coneOuterGain,
              distanceModel: o.distanceModel,
              maxDistance: o.maxDistance,
              refDistance: o.refDistance,
              rolloffFactor: o.rolloffFactor,
              panningModel: o.panningModel
            };
          }

          self._pannerAttr = {
            coneInnerAngle: typeof o.pannerAttr.coneInnerAngle !== 'undefined' ? o.pannerAttr.coneInnerAngle : self._coneInnerAngle,
            coneOuterAngle: typeof o.pannerAttr.coneOuterAngle !== 'undefined' ? o.pannerAttr.coneOuterAngle : self._coneOuterAngle,
            coneOuterGain: typeof o.pannerAttr.coneOuterGain !== 'undefined' ? o.pannerAttr.coneOuterGain : self._coneOuterGain,
            distanceModel: typeof o.pannerAttr.distanceModel !== 'undefined' ? o.pannerAttr.distanceModel : self._distanceModel,
            maxDistance: typeof o.pannerAttr.maxDistance !== 'undefined' ? o.pannerAttr.maxDistance : self._maxDistance,
            refDistance: typeof o.pannerAttr.refDistance !== 'undefined' ? o.pannerAttr.refDistance : self._refDistance,
            rolloffFactor: typeof o.pannerAttr.rolloffFactor !== 'undefined' ? o.pannerAttr.rolloffFactor : self._rolloffFactor,
            panningModel: typeof o.pannerAttr.panningModel !== 'undefined' ? o.pannerAttr.panningModel : self._panningModel
          };
        }
      } else {
        // Return this sound's panner attribute values.
        sound = self._soundById(parseInt(args[0], 10));
        return sound ? sound._pannerAttr : self._pannerAttr;
      }
    } else if (args.length === 2) {
      o = args[0];
      id = parseInt(args[1], 10);
    }

    // Update the values of the specified sounds.
    var ids = self._getSoundIds(id);
    for (var i=0; i<ids.length; i++) {
      sound = self._soundById(ids[i]);

      if (sound) {
        // Merge the new values into the sound.
        var pa = sound._pannerAttr;
        pa = {
          coneInnerAngle: typeof o.coneInnerAngle !== 'undefined' ? o.coneInnerAngle : pa.coneInnerAngle,
          coneOuterAngle: typeof o.coneOuterAngle !== 'undefined' ? o.coneOuterAngle : pa.coneOuterAngle,
          coneOuterGain: typeof o.coneOuterGain !== 'undefined' ? o.coneOuterGain : pa.coneOuterGain,
          distanceModel: typeof o.distanceModel !== 'undefined' ? o.distanceModel : pa.distanceModel,
          maxDistance: typeof o.maxDistance !== 'undefined' ? o.maxDistance : pa.maxDistance,
          refDistance: typeof o.refDistance !== 'undefined' ? o.refDistance : pa.refDistance,
          rolloffFactor: typeof o.rolloffFactor !== 'undefined' ? o.rolloffFactor : pa.rolloffFactor,
          panningModel: typeof o.panningModel !== 'undefined' ? o.panningModel : pa.panningModel
        };

        // Update the panner values or create a new panner if none exists.
        var panner = sound._panner;
        if (panner) {
          panner.coneInnerAngle = pa.coneInnerAngle;
          panner.coneOuterAngle = pa.coneOuterAngle;
          panner.coneOuterGain = pa.coneOuterGain;
          panner.distanceModel = pa.distanceModel;
          panner.maxDistance = pa.maxDistance;
          panner.refDistance = pa.refDistance;
          panner.rolloffFactor = pa.rolloffFactor;
          panner.panningModel = pa.panningModel;
        } else {
          // Make sure we have a position to setup the node with.
          if (!sound._pos) {
            sound._pos = self._pos || [0, 0, -0.5];
          }

          // Create a new panner node.
          setupPanner(sound, 'spatial');
        }
      }
    }

    return self;
  };

  /** Single Sound Methods **/
  /***************************************************************************/

  /**
   * Add new properties to the core Sound init.
   * @param  {Function} _super Core Sound init method.
   * @return {Sound}
   */
  Sound.prototype.init = (function(_super) {
    return function() {
      var self = this;
      var parent = self._parent;

      // Setup user-defined default properties.
      self._orientation = parent._orientation;
      self._stereo = parent._stereo;
      self._pos = parent._pos;
      self._pannerAttr = parent._pannerAttr;

      // Complete initilization with howler.js core Sound's init function.
      _super.call(this);

      // If a stereo or position was specified, set it up.
      if (self._stereo) {
        parent.stereo(self._stereo);
      } else if (self._pos) {
        parent.pos(self._pos[0], self._pos[1], self._pos[2], self._id);
      }
    };
  })(Sound.prototype.init);

  /**
   * Override the Sound.reset method to clean up properties from the spatial plugin.
   * @param  {Function} _super Sound reset method.
   * @return {Sound}
   */
  Sound.prototype.reset = (function(_super) {
    return function() {
      var self = this;
      var parent = self._parent;

      // Reset all spatial plugin properties on this sound.
      self._orientation = parent._orientation;
      self._stereo = parent._stereo;
      self._pos = parent._pos;
      self._pannerAttr = parent._pannerAttr;

      // If a stereo or position was specified, set it up.
      if (self._stereo) {
        parent.stereo(self._stereo);
      } else if (self._pos) {
        parent.pos(self._pos[0], self._pos[1], self._pos[2], self._id);
      } else if (self._panner) {
        // Disconnect the panner.
        self._panner.disconnect(0);
        self._panner = undefined;
        parent._refreshBuffer(self);
      }

      // Complete resetting of the sound.
      return _super.call(this);
    };
  })(Sound.prototype.reset);

  /** Helper Methods **/
  /***************************************************************************/

  /**
   * Create a new panner node and save it on the sound.
   * @param  {Sound} sound Specific sound to setup panning on.
   * @param {String} type Type of panner to create: 'stereo' or 'spatial'.
   */
  var setupPanner = function(sound, type) {
    type = type || 'spatial';

    // Create the new panner node.
    if (type === 'spatial') {
      sound._panner = Howler.ctx.createPanner();
      sound._panner.coneInnerAngle = sound._pannerAttr.coneInnerAngle;
      sound._panner.coneOuterAngle = sound._pannerAttr.coneOuterAngle;
      sound._panner.coneOuterGain = sound._pannerAttr.coneOuterGain;
      sound._panner.distanceModel = sound._pannerAttr.distanceModel;
      sound._panner.maxDistance = sound._pannerAttr.maxDistance;
      sound._panner.refDistance = sound._pannerAttr.refDistance;
      sound._panner.rolloffFactor = sound._pannerAttr.rolloffFactor;
      sound._panner.panningModel = sound._pannerAttr.panningModel;

      if (typeof sound._panner.positionX !== 'undefined') {
        sound._panner.positionX.setValueAtTime(sound._pos[0], Howler.ctx.currentTime);
        sound._panner.positionY.setValueAtTime(sound._pos[1], Howler.ctx.currentTime);
        sound._panner.positionZ.setValueAtTime(sound._pos[2], Howler.ctx.currentTime);
      } else {
        sound._panner.setPosition(sound._pos[0], sound._pos[1], sound._pos[2]);
      }

      if (typeof sound._panner.orientationX !== 'undefined') {
        sound._panner.orientationX.setValueAtTime(sound._orientation[0], Howler.ctx.currentTime);
        sound._panner.orientationY.setValueAtTime(sound._orientation[1], Howler.ctx.currentTime);
        sound._panner.orientationZ.setValueAtTime(sound._orientation[2], Howler.ctx.currentTime);
      } else {
        sound._panner.setOrientation(sound._orientation[0], sound._orientation[1], sound._orientation[2]);
      }
    } else {
      sound._panner = Howler.ctx.createStereoPanner();
      sound._panner.pan.setValueAtTime(sound._stereo, Howler.ctx.currentTime);
    }

    sound._panner.connect(sound._node);

    // Update the connections.
    if (!sound._paused) {
      sound._parent.pause(sound._id, true).play(sound._id, true);
    }
  };
})();


/***/ }),

/***/ "./node_modules/peasy-ui/dist/index.js":
/*!*********************************************!*\
  !*** ./node_modules/peasy-ui/dist/index.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, exports) => {

(()=>{"use strict";var e={d:(t,i)=>{for(var s in i)e.o(i,s)&&!e.o(t,s)&&Object.defineProperty(t,s,{enumerable:!0,get:i[s]})},o:(e,t)=>Object.prototype.hasOwnProperty.call(e,t),r:e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})}},t={};e.r(t),e.d(t,{UI:()=>n,UIView:()=>i});class i{constructor(){this.state="created",this.bindings=[],this.animations=[],this.animationQueue=[],this.destroyed="",this.moved=""}static create(e,t,s={},l={parent:null,prepare:!0,sibling:null}){var o;const r=new i;return r.model=s,r.element=t,r.bindings.push(...n.parse(r.element,s,r,l.parent)),r.parentElement=e,r.sibling=l.sibling,r.parent=null!==(o=l.parent)&&void 0!==o?o:n,r.attached=new Promise((e=>{r.attachResolve=e})),r}destroy(){this.element.classList.add("pui-removing"),this.destroyed="queue",n.destroyed.push(this)}terminate(){Promise.all(this.getAnimations()).then((()=>{var e;null===(e=this.element.parentElement)||void 0===e||e.removeChild(this.element),this.bindings.forEach((e=>e.unbind()));const t=this.parent.views.findIndex((e=>e===this));t>-1&&this.parent.views.splice(t,1)})),this.destroyed="destroyed"}move(e){this.moved="queue",this.element.classList.add("pui-moving"),this.sibling=e}play(e,t){return"string"==typeof e&&(e=this.animations.find((t=>t.name===e)).clone()),e.element=t,e.state="pending",this.animationQueue.push(e),this.updateAnimations(performance.now()),e}updateFromUI(){this.bindings.forEach((e=>e.updateFromUI()))}updateToUI(){var e,t;switch(this.bindings.forEach((e=>e.updateToUI())),this.state){case"created":this.element.classList.add("pui-adding"),this.element.hasAttribute("PUI-UNRENDERED")||(null!==(e=this.parentElement)&&void 0!==e?e:n.parentElement(this.element,this.parent)).insertBefore(this.element,null===(t=this.sibling)||void 0===t?void 0:t.nextSibling),this.attachResolve(),this.state="attaching";break;case"attaching":0===this.getAnimations(!1).length&&(this.element.classList.remove("pui-adding"),this.state="attached")}}updateAtEvents(){this.bindings.forEach((e=>e.updateAtEvents()))}updateAnimations(e){for(var t,i;null!==(i="finished"===(null===(t=this.animationQueue[0])||void 0===t?void 0:t.state))&&void 0!==i&&i;)this.animationQueue.shift().destroy();for(let t=0;t<this.animationQueue.length;t++){const i=this.animationQueue[t];"pending"===i.state&&(i.isBlocked(e)||(i.state="playing",i.startTime=e,i.animation=i.element.animate(i.keyframes,i.options),i.finished=i.animation.finished,i.finished.then((()=>{i.state="finished",this.updateAnimations(performance.now())}))))}}updateMove(){switch(this.moved){case"queue":this.moved="move";break;case"move":0===this.getAnimations().length&&(n.parentElement(this.element,this.parent).insertBefore(this.element,this.sibling.nextSibling),this.element.classList.remove("pui-moving"),this.moved="",this.sibling=void 0)}this.bindings.forEach((e=>e.updateMove()))}getAnimations(e=!0){return this.element.getAnimations({subtree:e}).filter((e=>"finished"!==e.playState&&e.effect.getTiming().iterations!==1/0)).map((e=>e.finished))}}class s{constructor(){this.fromUI=!1,this.toUI=!0,this.atEvent=!1,this.oneTime=!1,this.views=[],this.firstUpdate=!0,this.events=[],this.triggerAtEvent=e=>{this.events.push(e)},this.id=++n.id}get element(){return null==this.$element&&(this.$element="string"==typeof this.selector?this.context.querySelector(this.selector):this.selector),this.$element}set element(e){this.$element=e}static create(e){var t,i,l,o,r,a,h,u,d,m,p;const c=new s,v=null!==(i=null===(t=e.property)||void 0===t?void 0:t.split(":"))&&void 0!==i?i:[],f=v.shift();return c.object="$model"in e.object?e.object:{$model:e.object},c.property=f,c.arguments=v,c.context=null!==(l=e.context)&&void 0!==l?l:document,c.selector=e.selector,c.attribute=null!==(o=e.attribute)&&void 0!==o?o:"innerText",c.value=null!==(r=e.value)&&void 0!==r?r:c.value,c.template=null!==(a=e.template)&&void 0!==a?a:c.template,c.fromUI=null!==(h=e.fromUI)&&void 0!==h?h:c.fromUI,c.toUI=null!==(u=e.toUI)&&void 0!==u?u:c.toUI,c.atEvent=null!==(d=e.atEvent)&&void 0!==d?d:c.atEvent,c.oneTime=null!==(m=e.oneTime)&&void 0!==m?m:c.oneTime,c.parent=null!==(p=e.parent)&&void 0!==p?p:n,c.addListener(),"boolean"!=typeof c.fromUI&&(c.fromUI=c.fromUI.bind(c)),"boolean"!=typeof c.toUI&&(c.toUI=c.toUI.bind(c)),c}destroy(){this.element=null,this.removeListener(),this.views.forEach((e=>e.destroy()))}unbind(){n.unbind(this)}addListener(){this.atEvent&&(this.toUI=!1,this.fromUI=!1,this.element.addEventListener(this.attribute,this.triggerAtEvent))}removeListener(){this.atEvent&&this.element.removeEventListener(this.attribute,this.triggerAtEvent)}updateFromUI(){if(!1===this.fromUI||this.firstUpdate)return this.firstUpdate=!1,void this.views.forEach((e=>e.updateFromUI()));const{target:e,property:t}=n.resolveProperty(this.element,this.attribute),i=e[t];if(i!==this.lastUIValue){let e=!0!==this.fromUI?this.fromUI(i,this.lastUIValue,this.property,this.object):i;if(this.lastUIValue=i,void 0!==e&&e!==this.lastValue){this.lastValue=e;const{target:t,property:i}=n.resolveProperty(this.object,this.property);"number"!==n.resolveValue(this.object,this.property)||isNaN(e)||(e=+e),t[i]=e}else this.lastValue=e}this.views.forEach((e=>e.updateFromUI()))}updateToUI(){var e,t,s,l,o,r,a,h,u,d;if(!1===this.toUI)return void this.views.forEach((e=>e.updateToUI()));let m=n.resolveValue(this.object,this.property),p=!1;if(null!=this.template){if(this.template instanceof HTMLElement)if("boolean"==typeof this.attribute){if(m=!1!==(null!=m&&m),m!==this.lastValue){const e=!0!==this.toUI?this.toUI(m,this.lastValue,this.property,this.object):m;if(void 0!==e&&e!==this.lastUIValue){if(e===this.attribute)this.views.push(i.create(this.element.parentElement,this.template.cloneNode(!0),this.object,{parent:this,prepare:!1,sibling:this.element}));else{const e=this.views.pop();null==e||e.destroy()}this.lastValue=m,this.lastUIValue=e}}}else{null==m&&(m=[]);const c=this.arguments[0],v=null!==(e=this.lastValue)&&void 0!==e?e:[];if(m.length!==v.length)p=!0;else for(let e=0,i=m.length;e<i;e++){let i,l;if(null==c?(i=m[e],l=v[e]):(i=n.resolveValue(null!==(t=m[e])&&void 0!==t?t:{},c),l=n.resolveValue(null!==(s=v[e])&&void 0!==s?s:{},c)),i!==l){p=!0;break}}if(!p)return this.views.forEach((e=>e.updateToUI())),void(this.oneTime&&this.oneTimeDone());const f=!0!==this.toUI?this.toUI(m,v,this.property,this.object):m;if(null==f)return this.views.forEach((e=>e.updateToUI())),void(this.oneTime&&this.oneTimeDone());const b=null!==(l=this.lastUIValue)&&void 0!==l?l:[];let g=0;for(let e=0,t=f.length,i=0;e<t;e++,i++){let t,s;if(null==c?(t=f[e],s=b[i]):(t=n.resolveValue(null!==(o=f[e])&&void 0!==o?o:{},c),s=n.resolveValue(null!==(r=b[i])&&void 0!==r?r:{},c)),t!==s)break;g++}if(g===f.length&&f.length===b.length)return this.views.forEach((e=>e.updateToUI())),void(this.oneTime&&this.oneTimeDone());const y=this.views.splice(0,g);let U=y[y.length-1];for(let e=g,t=f.length,s=g;e<t;e++,s++){const t=f[e];"string"!=typeof t&&(t.$index=e);const s=this.views.shift();if(null==s){const e={$model:{[this.attribute]:t},$parent:this.object},s=i.create(this.element.parentElement,this.template.cloneNode(!0),e,{parent:this,prepare:!1,sibling:null!==(a=null==U?void 0:U.element)&&void 0!==a?a:this.element});y.push(s),U=s;continue}const l=null==c?t:n.resolveValue(null!=t?t:{},c),o=null==s?void 0:s.model.$model[this.attribute],r=null==c?o:n.resolveValue(null!=o?o:{},c);if(l===r){y.push(s),s.move(null!==(h=null==U?void 0:U.element)&&void 0!==h?h:this.element),U=s;continue}if(!f.slice(e).map((e=>null==c?e:n.resolveValue(null!=e?e:{},c))).includes(r)){s.destroy(),e--,U=s;continue}this.views.unshift(s);let m=!1;for(let e=0,t=this.views.length;e<t;e++){const t=this.views[e],i=null==t?void 0:t.model.$model[this.attribute];if(l===(null==c?i:n.resolveValue(null!=i?i:{},c))){y.push(...this.views.splice(e,1)),t.move(null!==(u=null==U?void 0:U.element)&&void 0!==u?u:this.element),m=!0,U=t;break}}if(!m){const e={$model:{[this.attribute]:t},$parent:this.object},s=i.create(this.element.parentElement,this.template.cloneNode(!0),e,{parent:this,prepare:!1,sibling:null!==(d=null==U?void 0:U.element)&&void 0!==d?d:this.element});y.push(s),U=s}}this.views.forEach((e=>e.destroy())),this.views=y,this.lastValue=[...m],this.lastUIValue=[...f]}else if(null==this.value){const e=n.resolveValue(this.object,this.attribute),t=e.template,i=null==m?e:e.create(m);this.value=null!=m?m:e,this.views.push(n.create(this.element.parentElement,t,i,{parent:this,prepare:!0,sibling:this.element}))}}else if(m!==this.lastValue){const e=!0!==this.toUI?this.toUI(m,this.lastValue,this.property,this.object):m;if(void 0!==e&&e!==this.lastUIValue){const{target:t,property:i}=n.resolveProperty(this.element,this.attribute);t[i]=e,this.lastValue=m,this.lastUIValue=e}}this.views.forEach((e=>e.updateToUI())),this.oneTime&&this.oneTimeDone()}oneTimeDone(){this.toUI=!1,this.fromUI=!1}updateAtEvents(){let e=this.events.shift();for(;null!=e;)n.resolveValue(this.object,this.property)(e,this.object.$model,this.element,this.attribute,this.object),e=this.events.shift();this.views.forEach((e=>e.updateAtEvents()))}updateMove(){this.views.forEach((e=>e.updateMove()))}}class n{static create(e,t,s={},l={parent:null,prepare:!0,sibling:null}){var o;if("string"==typeof t){const i=(null!==(o=null==e?void 0:e.ownerDocument)&&void 0!==o?o:document).createElement("div");i.innerHTML=l.prepare?n.prepare(t):t,t=i.firstElementChild}const r=i.create(e,t,s,l);return r.parent===n&&n.views.push(r),r}static play(e,t){return"string"==typeof e?(e=this.globals.animations.find((t=>t.name===e)).clone()).play(t):e.play()}static parse(e,t,i,s){var l,o,r;const a=[];if(3===e.nodeType){let l=e.textContent,o=l.match(n.regexValue);for(;null!=o;){const r=o[1];let h=o[2];l=o[3];let u=!1;h.startsWith("|")&&(u=!0,h=h.slice(1).trimStart());let d=e.cloneNode();e.textContent=r,n.parentElement(e,s).insertBefore(d,e.nextSibling),a.push(n.bind({selector:d,attribute:"textContent",object:t,property:h,parent:i,oneTime:u})),d=(e=d).cloneNode(),d.textContent=l,n.parentElement(e,s).insertBefore(d,e.nextSibling),e=d,o=l.match(n.regexValue)}}else{if(a.push(...Object.keys(null!==(l=e.attributes)&&void 0!==l?l:[]).reverse().map((l=>{const o=[];if(e instanceof Comment)return[];const r=e.attributes[l];if(r.name.startsWith("pui.")){const l=r.value.match(n.regexAttribute);let o,a,[h,u,d,m,p]=l,c=!1;if("@"!==d){const i=u.match(/^'(.*?)'$/);if(null!=i)o=i[1],e.setAttribute("value",o),u="option"===e.nodeName.toLowerCase()?"selected":"checked",m=e=>e?o:void 0,d=e=>e===o;else if(""===u){if(">"===m){const{target:i,property:s}=n.resolveProperty(t,p);return i[s]=e,[]}{const t=document.createComment(r.name);n.parentNode(e,s).insertBefore(t,e),n.parentNode(e,s).removeChild(e),e.removeAttribute(r.name),a=e,e=t,u="="===d,d=!0,"|"===m&&(c=!0)}}else if("="===m&&"="===d){const t=n.parentNode(e,s);if(8!==t.nodeType){const i=document.createComment(r.name);t.insertBefore(i,e),t.removeChild(e),e.removeAttribute(r.name),e=i}else e=t;a=u,c=!0,d=!0}else if("*"===m){const t=document.createComment(r.name);n.parentNode(e,s).insertBefore(t,e),n.parentNode(e,s).removeChild(e),e.removeAttribute(r.name),a=e,e=t}else"|"===m?c=!0:"checked"!==u&&e.setAttribute(u,"")}return[n.bind({selector:e,attribute:u,value:o,object:t,property:p,template:a,toUI:"string"==typeof d?"<"===d:d,fromUI:"string"==typeof m?">"===m:m,atEvent:"@"===d,parent:i,oneTime:c})]}const a=[r.value];let h=0,u=a[h].match(n.regexValue);for(;null!=u;){let{before:s,property:l,after:d}=u.groups,m=!1;l.startsWith("|")&&(m=!0,l=l.slice(1).trimStart()),o.push(n.bind({selector:e,attribute:r.name,object:t,property:l,oneTime:m,toUI(t,i,s,l){if(this.oneTime){const e=a.indexOf(s);e>-1&&(a[e]=n.resolveValue(l,s),a[e-1]+=a[e]+a[e+1],a.splice(e,2))}const o=a.map(((e,t)=>t%2==0?e:n.resolveValue(l,e))).join("");e.setAttribute(r.name,o)},parent:i})),a[h++]=s,a[h++]=l,a[h]=d,u=a[h].match(n.regexValue)}return o})).flat()),e instanceof Comment)return a.filter((e=>null!=e.template||(e.unbind(),!1)));if(!n.leaveAttributes)for(let t=Object.keys(null!==(o=e.attributes)&&void 0!==o?o:[]).length-1;t>=0;t--){const i=e.attributes[Object.keys(null!==(r=e.attributes)&&void 0!==r?r:[])[t]];i.name.startsWith("pui.")&&e.removeAttribute(i.name)}a.push(...Array.from(e.childNodes).map((e=>n.parse(e,t,i,s))).flat())}return a}static bind(e){return s.create(e)}static unbind(e){if(e.destroy(),e.parent!==n){const t=e.parent.bindings,i=t.indexOf(e);i>-1&&t.splice(i,1)}}static update(){this.views.forEach((e=>e.updateFromUI())),this.views.forEach((e=>e.updateToUI())),this.views.forEach((e=>e.updateAtEvents()));const e=performance.now();[...this.views,this.globals].forEach((t=>t.updateAnimations(e))),this.views.forEach((e=>{e.updateMove()})),this.destroyed.forEach((e=>{switch(e.destroyed){case"queue":e.destroyed="destroy";break;case"destroy":{e.terminate();const t=this.destroyed.findIndex((t=>e===t));t>-1&&this.destroyed.splice(t,1)}}}))}static resolveProperty(e,t){const i=(t=t.replace("[",".").replace("]",".")).split(".").filter((e=>(null!=e?e:"").length>0));let s="$model"in e?e.$model:e;for(;i.length>1;)s=s[i.shift()];return{target:s,property:i[0]}}static resolveValue(e,t){let i=0;do{const{target:i,property:s}=n.resolveProperty(e,t);if(null!=i&&s in i)return i[s];e=e.$parent}while(null!=e&&i++<1e3)}static parentElement(e,t){const i=e.parentElement;if(null!=i)return i;for(;null!=t&&(null==t.element||t.element===e);)t=t.parent;return null==t?void 0:t.element}static parentNode(e,t){const i=e.parentNode;if(null!=i)return i;for(;null!=t&&(null==t.element||t.element===e);)t=t.parent;return null==t?void 0:t.element}static prepare(e){let t=e;e="";let i=t.match(n.regexReplace);for(;null!=i;){const[s,l,o,r]=i;o.match(/\S\s*===/)?e+=`${l.trimEnd()}br PUI-UNRENDERED PUI.${n.bindingCounter++}="${o}"`:e+=`${l} PUI.${n.bindingCounter++}="${o}" `,t=r,i=t.match(n.regexReplace)}return e+t}}n.id=0,n.views=[],n.destroyed=[],n.globals=new i,n.leaveAttributes=!1,n.regexReplace=/([\S\s]*?)\$\{([^}]*?[<=@!]=[*=>|][^}]*?)\}([\S\s]*)/m,n.regexAttribute=/^\s*(\S*?)\s*([<=@!])=([*=>|])\s*(\S*?)\s*$/,n.regexValue=/(?<before>[\S\s]*?)\$\{\s*(?<property>[\s\S]*?)\s*\}(?<after>[\S\s]*)/m,n.bindingCounter=0;var l=exports;for(var o in t)l[o]=t[o];t.__esModule&&Object.defineProperty(l,"__esModule",{value:!0})})();

/***/ }),

/***/ "./src/styles/StatusEffect.css":
/*!*************************************!*\
  !*** ./src/styles/StatusEffect.css ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_StatusEffect_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../../node_modules/css-loader/dist/cjs.js!./StatusEffect.css */ "./node_modules/css-loader/dist/cjs.js!./src/styles/StatusEffect.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_StatusEffect_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_StatusEffect_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_StatusEffect_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_StatusEffect_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./src/styles/card.css":
/*!*****************************!*\
  !*** ./src/styles/card.css ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_card_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../../node_modules/css-loader/dist/cjs.js!./card.css */ "./node_modules/css-loader/dist/cjs.js!./src/styles/card.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_card_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_card_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_card_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_card_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./src/styles/cardPool.css":
/*!*********************************!*\
  !*** ./src/styles/cardPool.css ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_cardPool_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../../node_modules/css-loader/dist/cjs.js!./cardPool.css */ "./node_modules/css-loader/dist/cjs.js!./src/styles/cardPool.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_cardPool_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_cardPool_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_cardPool_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_cardPool_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./src/styles/charscreen.css":
/*!***********************************!*\
  !*** ./src/styles/charscreen.css ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_charscreen_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../../node_modules/css-loader/dist/cjs.js!./charscreen.css */ "./node_modules/css-loader/dist/cjs.js!./src/styles/charscreen.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_charscreen_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_charscreen_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_charscreen_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_charscreen_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./src/styles/chat.css":
/*!*****************************!*\
  !*** ./src/styles/chat.css ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_chat_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../../node_modules/css-loader/dist/cjs.js!./chat.css */ "./node_modules/css-loader/dist/cjs.js!./src/styles/chat.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_chat_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_chat_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_chat_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_chat_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./src/styles/game.css":
/*!*****************************!*\
  !*** ./src/styles/game.css ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_game_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../../node_modules/css-loader/dist/cjs.js!./game.css */ "./node_modules/css-loader/dist/cjs.js!./src/styles/game.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_game_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_game_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_game_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_game_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./src/styles/gameContainer.css":
/*!**************************************!*\
  !*** ./src/styles/gameContainer.css ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_gameContainer_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../../node_modules/css-loader/dist/cjs.js!./gameContainer.css */ "./node_modules/css-loader/dist/cjs.js!./src/styles/gameContainer.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_gameContainer_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_gameContainer_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_gameContainer_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_gameContainer_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./src/styles/globals.css":
/*!********************************!*\
  !*** ./src/styles/globals.css ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_globals_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../../node_modules/css-loader/dist/cjs.js!./globals.css */ "./node_modules/css-loader/dist/cjs.js!./src/styles/globals.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_globals_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_globals_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_globals_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_globals_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./src/styles/hand.css":
/*!*****************************!*\
  !*** ./src/styles/hand.css ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_hand_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../../node_modules/css-loader/dist/cjs.js!./hand.css */ "./node_modules/css-loader/dist/cjs.js!./src/styles/hand.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_hand_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_hand_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_hand_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_hand_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./src/styles/help.css":
/*!*****************************!*\
  !*** ./src/styles/help.css ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_help_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../../node_modules/css-loader/dist/cjs.js!./help.css */ "./node_modules/css-loader/dist/cjs.js!./src/styles/help.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_help_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_help_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_help_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_help_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./src/styles/lobby.css":
/*!******************************!*\
  !*** ./src/styles/lobby.css ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_lobby_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../../node_modules/css-loader/dist/cjs.js!./lobby.css */ "./node_modules/css-loader/dist/cjs.js!./src/styles/lobby.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_lobby_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_lobby_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_lobby_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_lobby_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./src/styles/location.css":
/*!*********************************!*\
  !*** ./src/styles/location.css ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_location_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../../node_modules/css-loader/dist/cjs.js!./location.css */ "./node_modules/css-loader/dist/cjs.js!./src/styles/location.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_location_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_location_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_location_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_location_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./src/styles/messageOverlay.css":
/*!***************************************!*\
  !*** ./src/styles/messageOverlay.css ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_messageOverlay_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../../node_modules/css-loader/dist/cjs.js!./messageOverlay.css */ "./node_modules/css-loader/dist/cjs.js!./src/styles/messageOverlay.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_messageOverlay_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_messageOverlay_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_messageOverlay_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_messageOverlay_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./src/styles/monster.css":
/*!********************************!*\
  !*** ./src/styles/monster.css ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_monster_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../../node_modules/css-loader/dist/cjs.js!./monster.css */ "./node_modules/css-loader/dist/cjs.js!./src/styles/monster.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_monster_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_monster_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_monster_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_monster_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./src/styles/navInput.css":
/*!*********************************!*\
  !*** ./src/styles/navInput.css ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_navInput_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../../node_modules/css-loader/dist/cjs.js!./navInput.css */ "./node_modules/css-loader/dist/cjs.js!./src/styles/navInput.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_navInput_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_navInput_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_navInput_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_navInput_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./src/styles/navbar.css":
/*!*******************************!*\
  !*** ./src/styles/navbar.css ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_navbar_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../../node_modules/css-loader/dist/cjs.js!./navbar.css */ "./node_modules/css-loader/dist/cjs.js!./src/styles/navbar.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_navbar_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_navbar_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_navbar_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_navbar_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./src/styles/playerUI.css":
/*!*********************************!*\
  !*** ./src/styles/playerUI.css ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_playerUI_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../../node_modules/css-loader/dist/cjs.js!./playerUI.css */ "./node_modules/css-loader/dist/cjs.js!./src/styles/playerUI.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_playerUI_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_playerUI_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_playerUI_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_playerUI_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./src/styles/pointPlacard.css":
/*!*************************************!*\
  !*** ./src/styles/pointPlacard.css ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_pointPlacard_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../../node_modules/css-loader/dist/cjs.js!./pointPlacard.css */ "./node_modules/css-loader/dist/cjs.js!./src/styles/pointPlacard.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_pointPlacard_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_pointPlacard_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_pointPlacard_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_pointPlacard_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./src/styles/sceneTransition.css":
/*!****************************************!*\
  !*** ./src/styles/sceneTransition.css ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_sceneTransition_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../../node_modules/css-loader/dist/cjs.js!./sceneTransition.css */ "./node_modules/css-loader/dist/cjs.js!./src/styles/sceneTransition.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_sceneTransition_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_sceneTransition_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_sceneTransition_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_sceneTransition_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./src/styles/settings.css":
/*!*********************************!*\
  !*** ./src/styles/settings.css ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_settings_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../../node_modules/css-loader/dist/cjs.js!./settings.css */ "./node_modules/css-loader/dist/cjs.js!./src/styles/settings.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_settings_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_settings_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_settings_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_settings_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./src/styles/staging.css":
/*!********************************!*\
  !*** ./src/styles/staging.css ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_staging_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../../node_modules/css-loader/dist/cjs.js!./staging.css */ "./node_modules/css-loader/dist/cjs.js!./src/styles/staging.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_staging_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_staging_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_staging_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_staging_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./src/styles/title.css":
/*!******************************!*\
  !*** ./src/styles/title.css ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_title_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../../node_modules/css-loader/dist/cjs.js!./title.css */ "./node_modules/css-loader/dist/cjs.js!./src/styles/title.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_title_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_title_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_title_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_title_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./src/styles/toast.css":
/*!******************************!*\
  !*** ./src/styles/toast.css ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_toast_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../../node_modules/css-loader/dist/cjs.js!./toast.css */ "./node_modules/css-loader/dist/cjs.js!./src/styles/toast.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_toast_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_toast_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_toast_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_toast_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./src/styles/tower.css":
/*!******************************!*\
  !*** ./src/styles/tower.css ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_tower_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../../node_modules/css-loader/dist/cjs.js!./tower.css */ "./node_modules/css-loader/dist/cjs.js!./src/styles/tower.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_tower_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_tower_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_tower_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_tower_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js":
/*!****************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js ***!
  \****************************************************************************/
/***/ ((module) => {

"use strict";


var stylesInDOM = [];

function getIndexByIdentifier(identifier) {
  var result = -1;

  for (var i = 0; i < stylesInDOM.length; i++) {
    if (stylesInDOM[i].identifier === identifier) {
      result = i;
      break;
    }
  }

  return result;
}

function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];

  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var indexByIdentifier = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3],
      supports: item[4],
      layer: item[5]
    };

    if (indexByIdentifier !== -1) {
      stylesInDOM[indexByIdentifier].references++;
      stylesInDOM[indexByIdentifier].updater(obj);
    } else {
      var updater = addElementStyle(obj, options);
      options.byIndex = i;
      stylesInDOM.splice(i, 0, {
        identifier: identifier,
        updater: updater,
        references: 1
      });
    }

    identifiers.push(identifier);
  }

  return identifiers;
}

function addElementStyle(obj, options) {
  var api = options.domAPI(options);
  api.update(obj);

  var updater = function updater(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap && newObj.supports === obj.supports && newObj.layer === obj.layer) {
        return;
      }

      api.update(obj = newObj);
    } else {
      api.remove();
    }
  };

  return updater;
}

module.exports = function (list, options) {
  options = options || {};
  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];

    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDOM[index].references--;
    }

    var newLastIdentifiers = modulesToDom(newList, options);

    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];

      var _index = getIndexByIdentifier(_identifier);

      if (stylesInDOM[_index].references === 0) {
        stylesInDOM[_index].updater();

        stylesInDOM.splice(_index, 1);
      }
    }

    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertBySelector.js":
/*!********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertBySelector.js ***!
  \********************************************************************/
/***/ ((module) => {

"use strict";


var memo = {};
/* istanbul ignore next  */

function getTarget(target) {
  if (typeof memo[target] === "undefined") {
    var styleTarget = document.querySelector(target); // Special case to return head of iframe instead of iframe itself

    if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
      try {
        // This will throw an exception if access to iframe is blocked
        // due to cross-origin restrictions
        styleTarget = styleTarget.contentDocument.head;
      } catch (e) {
        // istanbul ignore next
        styleTarget = null;
      }
    }

    memo[target] = styleTarget;
  }

  return memo[target];
}
/* istanbul ignore next  */


function insertBySelector(insert, style) {
  var target = getTarget(insert);

  if (!target) {
    throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
  }

  target.appendChild(style);
}

module.exports = insertBySelector;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertStyleElement.js":
/*!**********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertStyleElement.js ***!
  \**********************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function insertStyleElement(options) {
  var element = document.createElement("style");
  options.setAttributes(element, options.attributes);
  options.insert(element, options.options);
  return element;
}

module.exports = insertStyleElement;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js ***!
  \**********************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


/* istanbul ignore next  */
function setAttributesWithoutAttributes(styleElement) {
  var nonce =  true ? __webpack_require__.nc : 0;

  if (nonce) {
    styleElement.setAttribute("nonce", nonce);
  }
}

module.exports = setAttributesWithoutAttributes;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleDomAPI.js":
/*!***************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleDomAPI.js ***!
  \***************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function apply(styleElement, options, obj) {
  var css = "";

  if (obj.supports) {
    css += "@supports (".concat(obj.supports, ") {");
  }

  if (obj.media) {
    css += "@media ".concat(obj.media, " {");
  }

  var needLayer = typeof obj.layer !== "undefined";

  if (needLayer) {
    css += "@layer".concat(obj.layer.length > 0 ? " ".concat(obj.layer) : "", " {");
  }

  css += obj.css;

  if (needLayer) {
    css += "}";
  }

  if (obj.media) {
    css += "}";
  }

  if (obj.supports) {
    css += "}";
  }

  var sourceMap = obj.sourceMap;

  if (sourceMap && typeof btoa !== "undefined") {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  } // For old IE

  /* istanbul ignore if  */


  options.styleTagTransform(css, styleElement, options.options);
}

function removeStyleElement(styleElement) {
  // istanbul ignore if
  if (styleElement.parentNode === null) {
    return false;
  }

  styleElement.parentNode.removeChild(styleElement);
}
/* istanbul ignore next  */


function domAPI(options) {
  var styleElement = options.insertStyleElement(options);
  return {
    update: function update(obj) {
      apply(styleElement, options, obj);
    },
    remove: function remove() {
      removeStyleElement(styleElement);
    }
  };
}

module.exports = domAPI;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleTagTransform.js":
/*!*********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleTagTransform.js ***!
  \*********************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function styleTagTransform(css, styleElement) {
  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css;
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild);
    }

    styleElement.appendChild(document.createTextNode(css));
  }
}

module.exports = styleTagTransform;

/***/ }),

/***/ "../../api/base.ts":
/*!*************************!*\
  !*** ../../api/base.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "COORDINATOR_HOST": () => (/* binding */ COORDINATOR_HOST),
/* harmony export */   "MATCHMAKER_HOST": () => (/* binding */ MATCHMAKER_HOST),
/* harmony export */   "Message": () => (/* binding */ Message),
/* harmony export */   "Method": () => (/* binding */ Method),
/* harmony export */   "NO_DIFF": () => (/* binding */ NO_DIFF),
/* harmony export */   "Response": () => (/* binding */ Response),
/* harmony export */   "getUserDisplayName": () => (/* binding */ getUserDisplayName),
/* harmony export */   "lookupUser": () => (/* binding */ lookupUser)
/* harmony export */ });
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! axios */ "../../api/node_modules/axios/index.js");
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(axios__WEBPACK_IMPORTED_MODULE_0__);

const COORDINATOR_HOST = "coordinator.hathora.com" ?? 0;
const MATCHMAKER_HOST = "matchmaker.hathora.com" ?? 0;
const NO_DIFF = Symbol("NODIFF");
var Method;
(function (Method) {
    Method[Method["JOIN_GAME"] = 0] = "JOIN_GAME";
    Method[Method["LEAVE_GAME"] = 1] = "LEAVE_GAME";
    Method[Method["START_GAME"] = 2] = "START_GAME";
    Method[Method["START_TURN"] = 3] = "START_TURN";
    Method[Method["RUN_PLAYER_PASSIVES"] = 4] = "RUN_PLAYER_PASSIVES";
    Method[Method["RUN_MONSTER_PASSIVES"] = 5] = "RUN_MONSTER_PASSIVES";
    Method[Method["ENABLE_T_D"] = 6] = "ENABLE_T_D";
    Method[Method["PLAY_T_D"] = 7] = "PLAY_T_D";
    Method[Method["ENABLE_MONSTERS"] = 8] = "ENABLE_MONSTERS";
    Method[Method["PLAY_MONSTER"] = 9] = "PLAY_MONSTER";
    Method[Method["ENABLE_PLAYER"] = 10] = "ENABLE_PLAYER";
    Method[Method["PLAY_PLAYER_CARD"] = 11] = "PLAY_PLAYER_CARD";
    Method[Method["PLAYER_HAND_COMPLETE"] = 12] = "PLAYER_HAND_COMPLETE";
    Method[Method["ENABLE_MONSTER_DAMAGE"] = 13] = "ENABLE_MONSTER_DAMAGE";
    Method[Method["APPLY_MONSTER_DAMAGE"] = 14] = "APPLY_MONSTER_DAMAGE";
    Method[Method["DISABLE_MONSTER_DAMAGE"] = 15] = "DISABLE_MONSTER_DAMAGE";
    Method[Method["ENABLE_CARD_POOL"] = 16] = "ENABLE_CARD_POOL";
    Method[Method["BUY_FROM_CARD_POOL"] = 17] = "BUY_FROM_CARD_POOL";
    Method[Method["CLOSE_CARD_POOL"] = 18] = "CLOSE_CARD_POOL";
    Method[Method["END_ROUND"] = 19] = "END_ROUND";
    Method[Method["SEND_MESSAGE"] = 20] = "SEND_MESSAGE";
    Method[Method["SEEN_MESSAGE"] = 21] = "SEEN_MESSAGE";
    Method[Method["USER_RESPONSE"] = 22] = "USER_RESPONSE";
})(Method || (Method = {}));
const Response = {
    ok: () => ({ type: "ok" }),
    error: (error) => ({ type: "error", error }),
};
const Message = {
    response: (msgId, response) => ({ type: "response", msgId, response }),
    event: (event) => ({ type: "event", event }),
};
function lookupUser(userId) {
    return axios__WEBPACK_IMPORTED_MODULE_0___default().get(`https://${COORDINATOR_HOST}/users/${userId}`).then((res) => res.data);
}
function getUserDisplayName(user) {
    switch (user.type) {
        case "anonymous":
            return user.name;
    }
}


/***/ }),

/***/ "../../api/types.ts":
/*!**************************!*\
  !*** ../../api/types.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ABCard": () => (/* binding */ ABCard),
/* harmony export */   "AbilityCardTypes": () => (/* binding */ AbilityCardTypes),
/* harmony export */   "Effect": () => (/* binding */ Effect),
/* harmony export */   "EffectType": () => (/* binding */ EffectType),
/* harmony export */   "GameState": () => (/* binding */ GameState),
/* harmony export */   "Gender": () => (/* binding */ Gender),
/* harmony export */   "IApplyMonsterDamageRequest": () => (/* binding */ IApplyMonsterDamageRequest),
/* harmony export */   "IBuyFromCardPoolRequest": () => (/* binding */ IBuyFromCardPoolRequest),
/* harmony export */   "ICloseCardPoolRequest": () => (/* binding */ ICloseCardPoolRequest),
/* harmony export */   "IDisableMonsterDamageRequest": () => (/* binding */ IDisableMonsterDamageRequest),
/* harmony export */   "IEnableCardPoolRequest": () => (/* binding */ IEnableCardPoolRequest),
/* harmony export */   "IEnableMonsterDamageRequest": () => (/* binding */ IEnableMonsterDamageRequest),
/* harmony export */   "IEnableMonstersRequest": () => (/* binding */ IEnableMonstersRequest),
/* harmony export */   "IEnablePlayerRequest": () => (/* binding */ IEnablePlayerRequest),
/* harmony export */   "IEnableTDRequest": () => (/* binding */ IEnableTDRequest),
/* harmony export */   "IEndRoundRequest": () => (/* binding */ IEndRoundRequest),
/* harmony export */   "IInitializeRequest": () => (/* binding */ IInitializeRequest),
/* harmony export */   "IJoinGameRequest": () => (/* binding */ IJoinGameRequest),
/* harmony export */   "ILeaveGameRequest": () => (/* binding */ ILeaveGameRequest),
/* harmony export */   "IPlayMonsterRequest": () => (/* binding */ IPlayMonsterRequest),
/* harmony export */   "IPlayPlayerCardRequest": () => (/* binding */ IPlayPlayerCardRequest),
/* harmony export */   "IPlayTDRequest": () => (/* binding */ IPlayTDRequest),
/* harmony export */   "IPlayerHandCompleteRequest": () => (/* binding */ IPlayerHandCompleteRequest),
/* harmony export */   "IRunMonsterPassivesRequest": () => (/* binding */ IRunMonsterPassivesRequest),
/* harmony export */   "IRunPlayerPassivesRequest": () => (/* binding */ IRunPlayerPassivesRequest),
/* harmony export */   "ISeenMessageRequest": () => (/* binding */ ISeenMessageRequest),
/* harmony export */   "ISendMessageRequest": () => (/* binding */ ISendMessageRequest),
/* harmony export */   "IStartGameRequest": () => (/* binding */ IStartGameRequest),
/* harmony export */   "IStartTurnRequest": () => (/* binding */ IStartTurnRequest),
/* harmony export */   "IUserResponseRequest": () => (/* binding */ IUserResponseRequest),
/* harmony export */   "LCard": () => (/* binding */ LCard),
/* harmony export */   "MCard": () => (/* binding */ MCard),
/* harmony export */   "Message": () => (/* binding */ Message),
/* harmony export */   "Player": () => (/* binding */ Player),
/* harmony export */   "Roles": () => (/* binding */ Roles),
/* harmony export */   "RoundState": () => (/* binding */ RoundState),
/* harmony export */   "StatusEffects": () => (/* binding */ StatusEffects),
/* harmony export */   "TDCard": () => (/* binding */ TDCard),
/* harmony export */   "UserResponse": () => (/* binding */ UserResponse),
/* harmony export */   "UserState": () => (/* binding */ UserState),
/* harmony export */   "decodeStateSnapshot": () => (/* binding */ decodeStateSnapshot),
/* harmony export */   "decodeStateUpdate": () => (/* binding */ decodeStateUpdate),
/* harmony export */   "encodeStateError": () => (/* binding */ encodeStateError),
/* harmony export */   "encodeStateSnapshot": () => (/* binding */ encodeStateSnapshot),
/* harmony export */   "encodeStateUpdate": () => (/* binding */ encodeStateUpdate)
/* harmony export */ });
/* harmony import */ var bin_serde__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! bin-serde */ "../../api/node_modules/bin-serde/lib/index.js");
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./base */ "../../api/base.ts");


var AbilityCardTypes;
(function (AbilityCardTypes) {
    AbilityCardTypes[AbilityCardTypes["Item"] = 0] = "Item";
    AbilityCardTypes[AbilityCardTypes["Spell"] = 1] = "Spell";
    AbilityCardTypes[AbilityCardTypes["Weapon"] = 2] = "Weapon";
    AbilityCardTypes[AbilityCardTypes["Friend"] = 3] = "Friend";
})(AbilityCardTypes || (AbilityCardTypes = {}));
var Roles;
(function (Roles) {
    Roles[Roles["Barbarian"] = 0] = "Barbarian";
    Roles[Roles["Wizard"] = 1] = "Wizard";
    Roles[Roles["Rogue"] = 2] = "Rogue";
    Roles[Roles["Paladin"] = 3] = "Paladin";
})(Roles || (Roles = {}));
var Gender;
(function (Gender) {
    Gender[Gender["Male"] = 0] = "Male";
    Gender[Gender["Female"] = 1] = "Female";
})(Gender || (Gender = {}));
var RoundState;
(function (RoundState) {
    RoundState[RoundState["idle"] = 0] = "idle";
    RoundState[RoundState["waitingPlayerPassives"] = 1] = "waitingPlayerPassives";
    RoundState[RoundState["activeRunningPlayerPassives"] = 2] = "activeRunningPlayerPassives";
    RoundState[RoundState["waitingMonsterPassives"] = 3] = "waitingMonsterPassives";
    RoundState[RoundState["activeRunningMonsterPassives"] = 4] = "activeRunningMonsterPassives";
    RoundState[RoundState["waitingOnTD"] = 5] = "waitingOnTD";
    RoundState[RoundState["activeRunningTDEffects"] = 6] = "activeRunningTDEffects";
    RoundState[RoundState["waitingOnMonster"] = 7] = "waitingOnMonster";
    RoundState[RoundState["activeRunningMonster"] = 8] = "activeRunningMonster";
    RoundState[RoundState["waitingOnPlayer"] = 9] = "waitingOnPlayer";
    RoundState[RoundState["activeRunningPlayer"] = 10] = "activeRunningPlayer";
    RoundState[RoundState["waitingOnApplyingDamage"] = 11] = "waitingOnApplyingDamage";
    RoundState[RoundState["activeApplyingDamage"] = 12] = "activeApplyingDamage";
    RoundState[RoundState["waitingOnCardPool"] = 13] = "waitingOnCardPool";
    RoundState[RoundState["activeOpeningPool"] = 14] = "activeOpeningPool";
    RoundState[RoundState["waitingToBuyCard"] = 15] = "waitingToBuyCard";
    RoundState[RoundState["activeBuyingCard"] = 16] = "activeBuyingCard";
    RoundState[RoundState["waitingOnEndTurn"] = 17] = "waitingOnEndTurn";
    RoundState[RoundState["activeEndingTurn"] = 18] = "activeEndingTurn";
})(RoundState || (RoundState = {}));
var GameState;
(function (GameState) {
    GameState[GameState["Lobby"] = 0] = "Lobby";
    GameState[GameState["GameSetup"] = 1] = "GameSetup";
    GameState[GameState["ReadyToStart"] = 2] = "ReadyToStart";
    GameState[GameState["RoundSetup"] = 3] = "RoundSetup";
    GameState[GameState["PlayersTurn"] = 4] = "PlayersTurn";
    GameState[GameState["GameOver"] = 5] = "GameOver";
})(GameState || (GameState = {}));
var StatusEffects;
(function (StatusEffects) {
    StatusEffects[StatusEffects["Stunned"] = 0] = "Stunned";
    StatusEffects[StatusEffects["NoHeal"] = 1] = "NoHeal";
    StatusEffects[StatusEffects["NoDraw"] = 2] = "NoDraw";
    StatusEffects[StatusEffects["LocationCursed"] = 3] = "LocationCursed";
    StatusEffects[StatusEffects["DiscardCurse"] = 4] = "DiscardCurse";
    StatusEffects[StatusEffects["MonsterBonus"] = 5] = "MonsterBonus";
})(StatusEffects || (StatusEffects = {}));
var EffectType;
(function (EffectType) {
    EffectType[EffectType["Active"] = 0] = "Active";
    EffectType[EffectType["Passive"] = 1] = "Passive";
})(EffectType || (EffectType = {}));
const Message = {
    default() {
        return {
            id: 0,
            sender: "",
            nickName: "",
            data: "",
        };
    },
    validate(obj) {
        if (typeof obj !== "object") {
            return [`Invalid Message object: ${obj}`];
        }
        let validationErrors;
        validationErrors = validatePrimitive(Number.isInteger(obj.id), `Invalid int: ${obj.id}`);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: Message.id");
        }
        validationErrors = validatePrimitive(typeof obj.sender === "string", `Invalid UserId: ${obj.sender}`);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: Message.sender");
        }
        validationErrors = validatePrimitive(typeof obj.nickName === "string", `Invalid string: ${obj.nickName}`);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: Message.nickName");
        }
        validationErrors = validatePrimitive(typeof obj.data === "string", `Invalid string: ${obj.data}`);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: Message.data");
        }
        return validationErrors;
    },
    encode(obj, writer) {
        const buf = writer ?? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        writeInt(buf, obj.id);
        writeString(buf, obj.sender);
        writeString(buf, obj.nickName);
        writeString(buf, obj.data);
        return buf;
    },
    encodeDiff(obj, writer) {
        const buf = writer ?? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        const tracker = [];
        tracker.push(obj.id !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.sender !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.nickName !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.data !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        buf.writeBits(tracker);
        if (obj.id !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeInt(buf, obj.id);
        }
        if (obj.sender !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeString(buf, obj.sender);
        }
        if (obj.nickName !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeString(buf, obj.nickName);
        }
        if (obj.data !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeString(buf, obj.data);
        }
        return buf;
    },
    decode(buf) {
        const sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {
            id: parseInt(sb),
            sender: parseString(sb),
            nickName: parseString(sb),
            data: parseString(sb),
        };
    },
    decodeDiff(buf) {
        const sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        const tracker = sb.readBits(4);
        return {
            id: tracker.shift() ? parseInt(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            sender: tracker.shift() ? parseString(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            nickName: tracker.shift() ? parseString(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            data: tracker.shift() ? parseString(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
        };
    },
};
const UserResponse = {
    default() {
        return {
            Callback: "",
            Response: "",
        };
    },
    validate(obj) {
        if (typeof obj !== "object") {
            return [`Invalid UserResponse object: ${obj}`];
        }
        let validationErrors;
        validationErrors = validatePrimitive(typeof obj.Callback === "string", `Invalid string: ${obj.Callback}`);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: UserResponse.Callback");
        }
        validationErrors = validatePrimitive(typeof obj.Response === "string", `Invalid string: ${obj.Response}`);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: UserResponse.Response");
        }
        return validationErrors;
    },
    encode(obj, writer) {
        const buf = writer ?? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        writeString(buf, obj.Callback);
        writeString(buf, obj.Response);
        return buf;
    },
    encodeDiff(obj, writer) {
        const buf = writer ?? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        const tracker = [];
        tracker.push(obj.Callback !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.Response !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        buf.writeBits(tracker);
        if (obj.Callback !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeString(buf, obj.Callback);
        }
        if (obj.Response !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeString(buf, obj.Response);
        }
        return buf;
    },
    decode(buf) {
        const sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {
            Callback: parseString(sb),
            Response: parseString(sb),
        };
    },
    decodeDiff(buf) {
        const sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        const tracker = sb.readBits(2);
        return {
            Callback: tracker.shift() ? parseString(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            Response: tracker.shift() ? parseString(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
        };
    },
};
const Effect = {
    default() {
        return {
            callback: "",
            userPrompt: undefined,
        };
    },
    validate(obj) {
        if (typeof obj !== "object") {
            return [`Invalid Effect object: ${obj}`];
        }
        let validationErrors;
        validationErrors = validatePrimitive(typeof obj.callback === "string", `Invalid string: ${obj.callback}`);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: Effect.callback");
        }
        validationErrors = validateOptional(obj.userPrompt, (x) => validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: Effect.userPrompt");
        }
        return validationErrors;
    },
    encode(obj, writer) {
        const buf = writer ?? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        writeString(buf, obj.callback);
        writeOptional(buf, obj.userPrompt, (x) => writeString(buf, x));
        return buf;
    },
    encodeDiff(obj, writer) {
        const buf = writer ?? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        const tracker = [];
        tracker.push(obj.callback !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.userPrompt !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        buf.writeBits(tracker);
        if (obj.callback !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeString(buf, obj.callback);
        }
        if (obj.userPrompt !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeOptional(buf, obj.userPrompt, (x) => writeString(buf, x));
        }
        return buf;
    },
    decode(buf) {
        const sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {
            callback: parseString(sb),
            userPrompt: parseOptional(sb, () => parseString(sb)),
        };
    },
    decodeDiff(buf) {
        const sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        const tracker = sb.readBits(2);
        return {
            callback: tracker.shift() ? parseString(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            userPrompt: tracker.shift() ? parseOptional(sb, () => parseString(sb)) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
        };
    },
};
const MCard = {
    default() {
        return {
            id: "",
            title: "",
            effectstring: "",
            rewardstring: "",
            health: 0,
            damage: 0,
            level: 0,
            ActiveEffect: undefined,
            PassiveEffect: undefined,
            Rewards: Effect.default(),
            StatusEffects: [],
        };
    },
    validate(obj) {
        if (typeof obj !== "object") {
            return [`Invalid MCard object: ${obj}`];
        }
        let validationErrors;
        validationErrors = validatePrimitive(typeof obj.id === "string", `Invalid string: ${obj.id}`);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: MCard.id");
        }
        validationErrors = validatePrimitive(typeof obj.title === "string", `Invalid string: ${obj.title}`);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: MCard.title");
        }
        validationErrors = validatePrimitive(typeof obj.effectstring === "string", `Invalid string: ${obj.effectstring}`);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: MCard.effectstring");
        }
        validationErrors = validatePrimitive(typeof obj.rewardstring === "string", `Invalid string: ${obj.rewardstring}`);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: MCard.rewardstring");
        }
        validationErrors = validatePrimitive(Number.isInteger(obj.health), `Invalid int: ${obj.health}`);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: MCard.health");
        }
        validationErrors = validatePrimitive(Number.isInteger(obj.damage), `Invalid int: ${obj.damage}`);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: MCard.damage");
        }
        validationErrors = validatePrimitive(Number.isInteger(obj.level), `Invalid int: ${obj.level}`);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: MCard.level");
        }
        validationErrors = validateOptional(obj.ActiveEffect, (x) => Effect.validate(x));
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: MCard.ActiveEffect");
        }
        validationErrors = validateOptional(obj.PassiveEffect, (x) => Effect.validate(x));
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: MCard.PassiveEffect");
        }
        validationErrors = Effect.validate(obj.Rewards);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: MCard.Rewards");
        }
        validationErrors = validateArray(obj.StatusEffects, (x) => validatePrimitive(x in StatusEffects, `Invalid StatusEffects: ${x}`));
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: MCard.StatusEffects");
        }
        return validationErrors;
    },
    encode(obj, writer) {
        const buf = writer ?? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        writeString(buf, obj.id);
        writeString(buf, obj.title);
        writeString(buf, obj.effectstring);
        writeString(buf, obj.rewardstring);
        writeInt(buf, obj.health);
        writeInt(buf, obj.damage);
        writeInt(buf, obj.level);
        writeOptional(buf, obj.ActiveEffect, (x) => Effect.encode(x, buf));
        writeOptional(buf, obj.PassiveEffect, (x) => Effect.encode(x, buf));
        Effect.encode(obj.Rewards, buf);
        writeArray(buf, obj.StatusEffects, (x) => writeUInt8(buf, x));
        return buf;
    },
    encodeDiff(obj, writer) {
        const buf = writer ?? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        const tracker = [];
        tracker.push(obj.id !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.title !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.effectstring !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.rewardstring !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.health !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.damage !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.level !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.ActiveEffect !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.PassiveEffect !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.Rewards !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.StatusEffects !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        buf.writeBits(tracker);
        if (obj.id !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeString(buf, obj.id);
        }
        if (obj.title !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeString(buf, obj.title);
        }
        if (obj.effectstring !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeString(buf, obj.effectstring);
        }
        if (obj.rewardstring !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeString(buf, obj.rewardstring);
        }
        if (obj.health !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeInt(buf, obj.health);
        }
        if (obj.damage !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeInt(buf, obj.damage);
        }
        if (obj.level !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeInt(buf, obj.level);
        }
        if (obj.ActiveEffect !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeOptional(buf, obj.ActiveEffect, (x) => Effect.encodeDiff(x, buf));
        }
        if (obj.PassiveEffect !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeOptional(buf, obj.PassiveEffect, (x) => Effect.encodeDiff(x, buf));
        }
        if (obj.Rewards !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            Effect.encodeDiff(obj.Rewards, buf);
        }
        if (obj.StatusEffects !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeArrayDiff(buf, obj.StatusEffects, (x) => writeUInt8(buf, x));
        }
        return buf;
    },
    decode(buf) {
        const sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {
            id: parseString(sb),
            title: parseString(sb),
            effectstring: parseString(sb),
            rewardstring: parseString(sb),
            health: parseInt(sb),
            damage: parseInt(sb),
            level: parseInt(sb),
            ActiveEffect: parseOptional(sb, () => Effect.decode(sb)),
            PassiveEffect: parseOptional(sb, () => Effect.decode(sb)),
            Rewards: Effect.decode(sb),
            StatusEffects: parseArray(sb, () => parseUInt8(sb)),
        };
    },
    decodeDiff(buf) {
        const sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        const tracker = sb.readBits(11);
        return {
            id: tracker.shift() ? parseString(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            title: tracker.shift() ? parseString(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            effectstring: tracker.shift() ? parseString(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            rewardstring: tracker.shift() ? parseString(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            health: tracker.shift() ? parseInt(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            damage: tracker.shift() ? parseInt(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            level: tracker.shift() ? parseInt(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            ActiveEffect: tracker.shift() ? parseOptional(sb, () => Effect.decodeDiff(sb)) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            PassiveEffect: tracker.shift() ? parseOptional(sb, () => Effect.decodeDiff(sb)) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            Rewards: tracker.shift() ? Effect.decodeDiff(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            StatusEffects: tracker.shift() ? parseArrayDiff(sb, () => parseUInt8(sb)) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
        };
    },
};
const TDCard = {
    default() {
        return {
            id: "",
            title: "",
            level: 0,
            effectString: "",
            ActiveEffect: undefined,
            PassiveEffect: undefined,
        };
    },
    validate(obj) {
        if (typeof obj !== "object") {
            return [`Invalid TDCard object: ${obj}`];
        }
        let validationErrors;
        validationErrors = validatePrimitive(typeof obj.id === "string", `Invalid string: ${obj.id}`);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: TDCard.id");
        }
        validationErrors = validatePrimitive(typeof obj.title === "string", `Invalid string: ${obj.title}`);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: TDCard.title");
        }
        validationErrors = validatePrimitive(Number.isInteger(obj.level), `Invalid int: ${obj.level}`);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: TDCard.level");
        }
        validationErrors = validatePrimitive(typeof obj.effectString === "string", `Invalid string: ${obj.effectString}`);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: TDCard.effectString");
        }
        validationErrors = validateOptional(obj.ActiveEffect, (x) => Effect.validate(x));
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: TDCard.ActiveEffect");
        }
        validationErrors = validateOptional(obj.PassiveEffect, (x) => Effect.validate(x));
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: TDCard.PassiveEffect");
        }
        return validationErrors;
    },
    encode(obj, writer) {
        const buf = writer ?? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        writeString(buf, obj.id);
        writeString(buf, obj.title);
        writeInt(buf, obj.level);
        writeString(buf, obj.effectString);
        writeOptional(buf, obj.ActiveEffect, (x) => Effect.encode(x, buf));
        writeOptional(buf, obj.PassiveEffect, (x) => Effect.encode(x, buf));
        return buf;
    },
    encodeDiff(obj, writer) {
        const buf = writer ?? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        const tracker = [];
        tracker.push(obj.id !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.title !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.level !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.effectString !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.ActiveEffect !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.PassiveEffect !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        buf.writeBits(tracker);
        if (obj.id !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeString(buf, obj.id);
        }
        if (obj.title !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeString(buf, obj.title);
        }
        if (obj.level !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeInt(buf, obj.level);
        }
        if (obj.effectString !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeString(buf, obj.effectString);
        }
        if (obj.ActiveEffect !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeOptional(buf, obj.ActiveEffect, (x) => Effect.encodeDiff(x, buf));
        }
        if (obj.PassiveEffect !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeOptional(buf, obj.PassiveEffect, (x) => Effect.encodeDiff(x, buf));
        }
        return buf;
    },
    decode(buf) {
        const sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {
            id: parseString(sb),
            title: parseString(sb),
            level: parseInt(sb),
            effectString: parseString(sb),
            ActiveEffect: parseOptional(sb, () => Effect.decode(sb)),
            PassiveEffect: parseOptional(sb, () => Effect.decode(sb)),
        };
    },
    decodeDiff(buf) {
        const sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        const tracker = sb.readBits(6);
        return {
            id: tracker.shift() ? parseString(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            title: tracker.shift() ? parseString(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            level: tracker.shift() ? parseInt(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            effectString: tracker.shift() ? parseString(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            ActiveEffect: tracker.shift() ? parseOptional(sb, () => Effect.decodeDiff(sb)) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            PassiveEffect: tracker.shift() ? parseOptional(sb, () => Effect.decodeDiff(sb)) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
        };
    },
};
const ABCard = {
    default() {
        return {
            id: "",
            title: "",
            effectString: "",
            type: 0,
            level: 0,
            cost: 0,
            ActiveEffect: undefined,
            PassiveEffect: undefined,
        };
    },
    validate(obj) {
        if (typeof obj !== "object") {
            return [`Invalid ABCard object: ${obj}`];
        }
        let validationErrors;
        validationErrors = validatePrimitive(typeof obj.id === "string", `Invalid string: ${obj.id}`);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: ABCard.id");
        }
        validationErrors = validatePrimitive(typeof obj.title === "string", `Invalid string: ${obj.title}`);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: ABCard.title");
        }
        validationErrors = validatePrimitive(typeof obj.effectString === "string", `Invalid string: ${obj.effectString}`);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: ABCard.effectString");
        }
        validationErrors = validatePrimitive(obj.type in AbilityCardTypes, `Invalid AbilityCardTypes: ${obj.type}`);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: ABCard.type");
        }
        validationErrors = validatePrimitive(Number.isInteger(obj.level), `Invalid int: ${obj.level}`);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: ABCard.level");
        }
        validationErrors = validatePrimitive(Number.isInteger(obj.cost), `Invalid int: ${obj.cost}`);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: ABCard.cost");
        }
        validationErrors = validateOptional(obj.ActiveEffect, (x) => Effect.validate(x));
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: ABCard.ActiveEffect");
        }
        validationErrors = validateOptional(obj.PassiveEffect, (x) => Effect.validate(x));
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: ABCard.PassiveEffect");
        }
        return validationErrors;
    },
    encode(obj, writer) {
        const buf = writer ?? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        writeString(buf, obj.id);
        writeString(buf, obj.title);
        writeString(buf, obj.effectString);
        writeUInt8(buf, obj.type);
        writeInt(buf, obj.level);
        writeInt(buf, obj.cost);
        writeOptional(buf, obj.ActiveEffect, (x) => Effect.encode(x, buf));
        writeOptional(buf, obj.PassiveEffect, (x) => Effect.encode(x, buf));
        return buf;
    },
    encodeDiff(obj, writer) {
        const buf = writer ?? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        const tracker = [];
        tracker.push(obj.id !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.title !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.effectString !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.type !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.level !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.cost !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.ActiveEffect !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.PassiveEffect !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        buf.writeBits(tracker);
        if (obj.id !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeString(buf, obj.id);
        }
        if (obj.title !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeString(buf, obj.title);
        }
        if (obj.effectString !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeString(buf, obj.effectString);
        }
        if (obj.type !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeUInt8(buf, obj.type);
        }
        if (obj.level !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeInt(buf, obj.level);
        }
        if (obj.cost !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeInt(buf, obj.cost);
        }
        if (obj.ActiveEffect !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeOptional(buf, obj.ActiveEffect, (x) => Effect.encodeDiff(x, buf));
        }
        if (obj.PassiveEffect !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeOptional(buf, obj.PassiveEffect, (x) => Effect.encodeDiff(x, buf));
        }
        return buf;
    },
    decode(buf) {
        const sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {
            id: parseString(sb),
            title: parseString(sb),
            effectString: parseString(sb),
            type: parseUInt8(sb),
            level: parseInt(sb),
            cost: parseInt(sb),
            ActiveEffect: parseOptional(sb, () => Effect.decode(sb)),
            PassiveEffect: parseOptional(sb, () => Effect.decode(sb)),
        };
    },
    decodeDiff(buf) {
        const sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        const tracker = sb.readBits(8);
        return {
            id: tracker.shift() ? parseString(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            title: tracker.shift() ? parseString(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            effectString: tracker.shift() ? parseString(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            type: tracker.shift() ? parseUInt8(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            level: tracker.shift() ? parseInt(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            cost: tracker.shift() ? parseInt(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            ActiveEffect: tracker.shift() ? parseOptional(sb, () => Effect.decodeDiff(sb)) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            PassiveEffect: tracker.shift() ? parseOptional(sb, () => Effect.decodeDiff(sb)) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
        };
    },
};
const LCard = {
    default() {
        return {
            id: "",
            title: "",
            level: 0,
            sequence: 0,
            td: 0,
            health: 0,
            damage: 0,
            ActiveEffect: undefined,
            PassiveEffect: undefined,
        };
    },
    validate(obj) {
        if (typeof obj !== "object") {
            return [`Invalid LCard object: ${obj}`];
        }
        let validationErrors;
        validationErrors = validatePrimitive(typeof obj.id === "string", `Invalid string: ${obj.id}`);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: LCard.id");
        }
        validationErrors = validatePrimitive(typeof obj.title === "string", `Invalid string: ${obj.title}`);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: LCard.title");
        }
        validationErrors = validatePrimitive(Number.isInteger(obj.level), `Invalid int: ${obj.level}`);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: LCard.level");
        }
        validationErrors = validatePrimitive(Number.isInteger(obj.sequence), `Invalid int: ${obj.sequence}`);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: LCard.sequence");
        }
        validationErrors = validatePrimitive(Number.isInteger(obj.td), `Invalid int: ${obj.td}`);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: LCard.td");
        }
        validationErrors = validatePrimitive(Number.isInteger(obj.health), `Invalid int: ${obj.health}`);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: LCard.health");
        }
        validationErrors = validatePrimitive(Number.isInteger(obj.damage), `Invalid int: ${obj.damage}`);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: LCard.damage");
        }
        validationErrors = validateOptional(obj.ActiveEffect, (x) => Effect.validate(x));
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: LCard.ActiveEffect");
        }
        validationErrors = validateOptional(obj.PassiveEffect, (x) => Effect.validate(x));
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: LCard.PassiveEffect");
        }
        return validationErrors;
    },
    encode(obj, writer) {
        const buf = writer ?? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        writeString(buf, obj.id);
        writeString(buf, obj.title);
        writeInt(buf, obj.level);
        writeInt(buf, obj.sequence);
        writeInt(buf, obj.td);
        writeInt(buf, obj.health);
        writeInt(buf, obj.damage);
        writeOptional(buf, obj.ActiveEffect, (x) => Effect.encode(x, buf));
        writeOptional(buf, obj.PassiveEffect, (x) => Effect.encode(x, buf));
        return buf;
    },
    encodeDiff(obj, writer) {
        const buf = writer ?? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        const tracker = [];
        tracker.push(obj.id !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.title !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.level !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.sequence !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.td !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.health !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.damage !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.ActiveEffect !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.PassiveEffect !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        buf.writeBits(tracker);
        if (obj.id !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeString(buf, obj.id);
        }
        if (obj.title !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeString(buf, obj.title);
        }
        if (obj.level !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeInt(buf, obj.level);
        }
        if (obj.sequence !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeInt(buf, obj.sequence);
        }
        if (obj.td !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeInt(buf, obj.td);
        }
        if (obj.health !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeInt(buf, obj.health);
        }
        if (obj.damage !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeInt(buf, obj.damage);
        }
        if (obj.ActiveEffect !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeOptional(buf, obj.ActiveEffect, (x) => Effect.encodeDiff(x, buf));
        }
        if (obj.PassiveEffect !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeOptional(buf, obj.PassiveEffect, (x) => Effect.encodeDiff(x, buf));
        }
        return buf;
    },
    decode(buf) {
        const sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {
            id: parseString(sb),
            title: parseString(sb),
            level: parseInt(sb),
            sequence: parseInt(sb),
            td: parseInt(sb),
            health: parseInt(sb),
            damage: parseInt(sb),
            ActiveEffect: parseOptional(sb, () => Effect.decode(sb)),
            PassiveEffect: parseOptional(sb, () => Effect.decode(sb)),
        };
    },
    decodeDiff(buf) {
        const sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        const tracker = sb.readBits(9);
        return {
            id: tracker.shift() ? parseString(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            title: tracker.shift() ? parseString(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            level: tracker.shift() ? parseInt(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            sequence: tracker.shift() ? parseInt(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            td: tracker.shift() ? parseInt(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            health: tracker.shift() ? parseInt(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            damage: tracker.shift() ? parseInt(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            ActiveEffect: tracker.shift() ? parseOptional(sb, () => Effect.decodeDiff(sb)) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            PassiveEffect: tracker.shift() ? parseOptional(sb, () => Effect.decodeDiff(sb)) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
        };
    },
};
const Player = {
    default() {
        return {
            id: "",
            name: "",
            health: 0,
            attack: 0,
            coin: 0,
            hand: [],
            deck: [],
            discard: [],
            role: 0,
            gender: 0,
            statusEffects: [],
            lastSeen: 0,
        };
    },
    validate(obj) {
        if (typeof obj !== "object") {
            return [`Invalid Player object: ${obj}`];
        }
        let validationErrors;
        validationErrors = validatePrimitive(typeof obj.id === "string", `Invalid UserId: ${obj.id}`);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: Player.id");
        }
        validationErrors = validatePrimitive(typeof obj.name === "string", `Invalid string: ${obj.name}`);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: Player.name");
        }
        validationErrors = validatePrimitive(Number.isInteger(obj.health), `Invalid int: ${obj.health}`);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: Player.health");
        }
        validationErrors = validatePrimitive(Number.isInteger(obj.attack), `Invalid int: ${obj.attack}`);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: Player.attack");
        }
        validationErrors = validatePrimitive(Number.isInteger(obj.coin), `Invalid int: ${obj.coin}`);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: Player.coin");
        }
        validationErrors = validateArray(obj.hand, (x) => ABCard.validate(x));
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: Player.hand");
        }
        validationErrors = validateArray(obj.deck, (x) => ABCard.validate(x));
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: Player.deck");
        }
        validationErrors = validateArray(obj.discard, (x) => ABCard.validate(x));
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: Player.discard");
        }
        validationErrors = validatePrimitive(obj.role in Roles, `Invalid Roles: ${obj.role}`);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: Player.role");
        }
        validationErrors = validatePrimitive(obj.gender in Gender, `Invalid Gender: ${obj.gender}`);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: Player.gender");
        }
        validationErrors = validateArray(obj.statusEffects, (x) => validatePrimitive(x in StatusEffects, `Invalid StatusEffects: ${x}`));
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: Player.statusEffects");
        }
        validationErrors = validatePrimitive(Number.isInteger(obj.lastSeen), `Invalid int: ${obj.lastSeen}`);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: Player.lastSeen");
        }
        return validationErrors;
    },
    encode(obj, writer) {
        const buf = writer ?? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        writeString(buf, obj.id);
        writeString(buf, obj.name);
        writeInt(buf, obj.health);
        writeInt(buf, obj.attack);
        writeInt(buf, obj.coin);
        writeArray(buf, obj.hand, (x) => ABCard.encode(x, buf));
        writeArray(buf, obj.deck, (x) => ABCard.encode(x, buf));
        writeArray(buf, obj.discard, (x) => ABCard.encode(x, buf));
        writeUInt8(buf, obj.role);
        writeUInt8(buf, obj.gender);
        writeArray(buf, obj.statusEffects, (x) => writeUInt8(buf, x));
        writeInt(buf, obj.lastSeen);
        return buf;
    },
    encodeDiff(obj, writer) {
        const buf = writer ?? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        const tracker = [];
        tracker.push(obj.id !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.name !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.health !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.attack !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.coin !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.hand !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.deck !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.discard !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.role !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.gender !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.statusEffects !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.lastSeen !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        buf.writeBits(tracker);
        if (obj.id !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeString(buf, obj.id);
        }
        if (obj.name !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeString(buf, obj.name);
        }
        if (obj.health !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeInt(buf, obj.health);
        }
        if (obj.attack !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeInt(buf, obj.attack);
        }
        if (obj.coin !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeInt(buf, obj.coin);
        }
        if (obj.hand !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeArrayDiff(buf, obj.hand, (x) => ABCard.encodeDiff(x, buf));
        }
        if (obj.deck !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeArrayDiff(buf, obj.deck, (x) => ABCard.encodeDiff(x, buf));
        }
        if (obj.discard !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeArrayDiff(buf, obj.discard, (x) => ABCard.encodeDiff(x, buf));
        }
        if (obj.role !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeUInt8(buf, obj.role);
        }
        if (obj.gender !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeUInt8(buf, obj.gender);
        }
        if (obj.statusEffects !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeArrayDiff(buf, obj.statusEffects, (x) => writeUInt8(buf, x));
        }
        if (obj.lastSeen !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeInt(buf, obj.lastSeen);
        }
        return buf;
    },
    decode(buf) {
        const sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {
            id: parseString(sb),
            name: parseString(sb),
            health: parseInt(sb),
            attack: parseInt(sb),
            coin: parseInt(sb),
            hand: parseArray(sb, () => ABCard.decode(sb)),
            deck: parseArray(sb, () => ABCard.decode(sb)),
            discard: parseArray(sb, () => ABCard.decode(sb)),
            role: parseUInt8(sb),
            gender: parseUInt8(sb),
            statusEffects: parseArray(sb, () => parseUInt8(sb)),
            lastSeen: parseInt(sb),
        };
    },
    decodeDiff(buf) {
        const sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        const tracker = sb.readBits(12);
        return {
            id: tracker.shift() ? parseString(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            name: tracker.shift() ? parseString(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            health: tracker.shift() ? parseInt(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            attack: tracker.shift() ? parseInt(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            coin: tracker.shift() ? parseInt(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            hand: tracker.shift() ? parseArrayDiff(sb, () => ABCard.decodeDiff(sb)) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            deck: tracker.shift() ? parseArrayDiff(sb, () => ABCard.decodeDiff(sb)) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            discard: tracker.shift() ? parseArrayDiff(sb, () => ABCard.decodeDiff(sb)) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            role: tracker.shift() ? parseUInt8(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            gender: tracker.shift() ? parseUInt8(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            statusEffects: tracker.shift() ? parseArrayDiff(sb, () => parseUInt8(sb)) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            lastSeen: tracker.shift() ? parseInt(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
        };
    },
};
const UserState = {
    default() {
        return {
            me: 0,
            players: [],
            roundState: 0,
            activeMonsters: [],
            location: undefined,
            TDcard: undefined,
            cardPool: [],
            turnOrder: [],
            turn: undefined,
            Messages: [],
        };
    },
    validate(obj) {
        if (typeof obj !== "object") {
            return [`Invalid UserState object: ${obj}`];
        }
        let validationErrors;
        validationErrors = validatePrimitive(Number.isInteger(obj.me), `Invalid int: ${obj.me}`);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: UserState.me");
        }
        validationErrors = validateArray(obj.players, (x) => Player.validate(x));
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: UserState.players");
        }
        validationErrors = validatePrimitive(obj.roundState in RoundState, `Invalid RoundState: ${obj.roundState}`);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: UserState.roundState");
        }
        validationErrors = validateArray(obj.activeMonsters, (x) => MCard.validate(x));
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: UserState.activeMonsters");
        }
        validationErrors = validateOptional(obj.location, (x) => LCard.validate(x));
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: UserState.location");
        }
        validationErrors = validateOptional(obj.TDcard, (x) => TDCard.validate(x));
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: UserState.TDcard");
        }
        validationErrors = validateArray(obj.cardPool, (x) => ABCard.validate(x));
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: UserState.cardPool");
        }
        validationErrors = validateArray(obj.turnOrder, (x) => validatePrimitive(typeof x === "string", `Invalid UserId: ${x}`));
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: UserState.turnOrder");
        }
        validationErrors = validateOptional(obj.turn, (x) => validatePrimitive(typeof x === "string", `Invalid UserId: ${x}`));
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: UserState.turn");
        }
        validationErrors = validateArray(obj.Messages, (x) => Message.validate(x));
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: UserState.Messages");
        }
        return validationErrors;
    },
    encode(obj, writer) {
        const buf = writer ?? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        writeInt(buf, obj.me);
        writeArray(buf, obj.players, (x) => Player.encode(x, buf));
        writeUInt8(buf, obj.roundState);
        writeArray(buf, obj.activeMonsters, (x) => MCard.encode(x, buf));
        writeOptional(buf, obj.location, (x) => LCard.encode(x, buf));
        writeOptional(buf, obj.TDcard, (x) => TDCard.encode(x, buf));
        writeArray(buf, obj.cardPool, (x) => ABCard.encode(x, buf));
        writeArray(buf, obj.turnOrder, (x) => writeString(buf, x));
        writeOptional(buf, obj.turn, (x) => writeString(buf, x));
        writeArray(buf, obj.Messages, (x) => Message.encode(x, buf));
        return buf;
    },
    encodeDiff(obj, writer) {
        const buf = writer ?? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        const tracker = [];
        tracker.push(obj.me !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.players !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.roundState !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.activeMonsters !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.location !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.TDcard !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.cardPool !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.turnOrder !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.turn !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.Messages !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        buf.writeBits(tracker);
        if (obj.me !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeInt(buf, obj.me);
        }
        if (obj.players !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeArrayDiff(buf, obj.players, (x) => Player.encodeDiff(x, buf));
        }
        if (obj.roundState !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeUInt8(buf, obj.roundState);
        }
        if (obj.activeMonsters !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeArrayDiff(buf, obj.activeMonsters, (x) => MCard.encodeDiff(x, buf));
        }
        if (obj.location !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeOptional(buf, obj.location, (x) => LCard.encodeDiff(x, buf));
        }
        if (obj.TDcard !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeOptional(buf, obj.TDcard, (x) => TDCard.encodeDiff(x, buf));
        }
        if (obj.cardPool !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeArrayDiff(buf, obj.cardPool, (x) => ABCard.encodeDiff(x, buf));
        }
        if (obj.turnOrder !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeArrayDiff(buf, obj.turnOrder, (x) => writeString(buf, x));
        }
        if (obj.turn !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeOptional(buf, obj.turn, (x) => writeString(buf, x));
        }
        if (obj.Messages !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeArrayDiff(buf, obj.Messages, (x) => Message.encodeDiff(x, buf));
        }
        return buf;
    },
    decode(buf) {
        const sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {
            me: parseInt(sb),
            players: parseArray(sb, () => Player.decode(sb)),
            roundState: parseUInt8(sb),
            activeMonsters: parseArray(sb, () => MCard.decode(sb)),
            location: parseOptional(sb, () => LCard.decode(sb)),
            TDcard: parseOptional(sb, () => TDCard.decode(sb)),
            cardPool: parseArray(sb, () => ABCard.decode(sb)),
            turnOrder: parseArray(sb, () => parseString(sb)),
            turn: parseOptional(sb, () => parseString(sb)),
            Messages: parseArray(sb, () => Message.decode(sb)),
        };
    },
    decodeDiff(buf) {
        const sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        const tracker = sb.readBits(10);
        return {
            me: tracker.shift() ? parseInt(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            players: tracker.shift() ? parseArrayDiff(sb, () => Player.decodeDiff(sb)) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            roundState: tracker.shift() ? parseUInt8(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            activeMonsters: tracker.shift() ? parseArrayDiff(sb, () => MCard.decodeDiff(sb)) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            location: tracker.shift() ? parseOptional(sb, () => LCard.decodeDiff(sb)) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            TDcard: tracker.shift() ? parseOptional(sb, () => TDCard.decodeDiff(sb)) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            cardPool: tracker.shift() ? parseArrayDiff(sb, () => ABCard.decodeDiff(sb)) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            turnOrder: tracker.shift() ? parseArrayDiff(sb, () => parseString(sb)) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            turn: tracker.shift() ? parseOptional(sb, () => parseString(sb)) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            Messages: tracker.shift() ? parseArrayDiff(sb, () => Message.decodeDiff(sb)) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
        };
    },
};
const IJoinGameRequest = {
    default() {
        return {
            role: 0,
            name: "",
            gender: 0,
            level: 0,
        };
    },
    encode(obj, writer) {
        const buf = writer ?? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        writeUInt8(buf, obj.role);
        writeString(buf, obj.name);
        writeUInt8(buf, obj.gender);
        writeInt(buf, obj.level);
        return buf;
    },
    decode(buf) {
        const sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {
            role: parseUInt8(sb),
            name: parseString(sb),
            gender: parseUInt8(sb),
            level: parseInt(sb),
        };
    },
};
const ILeaveGameRequest = {
    default() {
        return {};
    },
    encode(obj, writer) {
        const buf = writer ?? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        return buf;
    },
    decode(buf) {
        const sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {};
    },
};
const IStartGameRequest = {
    default() {
        return {};
    },
    encode(obj, writer) {
        const buf = writer ?? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        return buf;
    },
    decode(buf) {
        const sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {};
    },
};
const IStartTurnRequest = {
    default() {
        return {};
    },
    encode(obj, writer) {
        const buf = writer ?? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        return buf;
    },
    decode(buf) {
        const sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {};
    },
};
const IRunPlayerPassivesRequest = {
    default() {
        return {};
    },
    encode(obj, writer) {
        const buf = writer ?? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        return buf;
    },
    decode(buf) {
        const sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {};
    },
};
const IRunMonsterPassivesRequest = {
    default() {
        return {};
    },
    encode(obj, writer) {
        const buf = writer ?? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        return buf;
    },
    decode(buf) {
        const sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {};
    },
};
const IEnableTDRequest = {
    default() {
        return {};
    },
    encode(obj, writer) {
        const buf = writer ?? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        return buf;
    },
    decode(buf) {
        const sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {};
    },
};
const IPlayTDRequest = {
    default() {
        return {
            cardID: "",
        };
    },
    encode(obj, writer) {
        const buf = writer ?? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        writeString(buf, obj.cardID);
        return buf;
    },
    decode(buf) {
        const sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {
            cardID: parseString(sb),
        };
    },
};
const IEnableMonstersRequest = {
    default() {
        return {};
    },
    encode(obj, writer) {
        const buf = writer ?? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        return buf;
    },
    decode(buf) {
        const sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {};
    },
};
const IPlayMonsterRequest = {
    default() {
        return {
            cardID: "",
        };
    },
    encode(obj, writer) {
        const buf = writer ?? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        writeString(buf, obj.cardID);
        return buf;
    },
    decode(buf) {
        const sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {
            cardID: parseString(sb),
        };
    },
};
const IEnablePlayerRequest = {
    default() {
        return {};
    },
    encode(obj, writer) {
        const buf = writer ?? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        return buf;
    },
    decode(buf) {
        const sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {};
    },
};
const IPlayPlayerCardRequest = {
    default() {
        return {
            cardID: "",
        };
    },
    encode(obj, writer) {
        const buf = writer ?? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        writeString(buf, obj.cardID);
        return buf;
    },
    decode(buf) {
        const sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {
            cardID: parseString(sb),
        };
    },
};
const IPlayerHandCompleteRequest = {
    default() {
        return {};
    },
    encode(obj, writer) {
        const buf = writer ?? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        return buf;
    },
    decode(buf) {
        const sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {};
    },
};
const IEnableMonsterDamageRequest = {
    default() {
        return {};
    },
    encode(obj, writer) {
        const buf = writer ?? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        return buf;
    },
    decode(buf) {
        const sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {};
    },
};
const IApplyMonsterDamageRequest = {
    default() {
        return {
            cardID: "",
        };
    },
    encode(obj, writer) {
        const buf = writer ?? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        writeString(buf, obj.cardID);
        return buf;
    },
    decode(buf) {
        const sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {
            cardID: parseString(sb),
        };
    },
};
const IDisableMonsterDamageRequest = {
    default() {
        return {};
    },
    encode(obj, writer) {
        const buf = writer ?? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        return buf;
    },
    decode(buf) {
        const sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {};
    },
};
const IEnableCardPoolRequest = {
    default() {
        return {};
    },
    encode(obj, writer) {
        const buf = writer ?? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        return buf;
    },
    decode(buf) {
        const sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {};
    },
};
const IBuyFromCardPoolRequest = {
    default() {
        return {
            cardID: "",
        };
    },
    encode(obj, writer) {
        const buf = writer ?? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        writeString(buf, obj.cardID);
        return buf;
    },
    decode(buf) {
        const sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {
            cardID: parseString(sb),
        };
    },
};
const ICloseCardPoolRequest = {
    default() {
        return {};
    },
    encode(obj, writer) {
        const buf = writer ?? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        return buf;
    },
    decode(buf) {
        const sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {};
    },
};
const IEndRoundRequest = {
    default() {
        return {};
    },
    encode(obj, writer) {
        const buf = writer ?? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        return buf;
    },
    decode(buf) {
        const sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {};
    },
};
const ISendMessageRequest = {
    default() {
        return {
            msg: "",
        };
    },
    encode(obj, writer) {
        const buf = writer ?? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        writeString(buf, obj.msg);
        return buf;
    },
    decode(buf) {
        const sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {
            msg: parseString(sb),
        };
    },
};
const ISeenMessageRequest = {
    default() {
        return {
            msgID: 0,
        };
    },
    encode(obj, writer) {
        const buf = writer ?? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        writeInt(buf, obj.msgID);
        return buf;
    },
    decode(buf) {
        const sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {
            msgID: parseInt(sb),
        };
    },
};
const IUserResponseRequest = {
    default() {
        return {
            response: UserResponse.default(),
        };
    },
    encode(obj, writer) {
        const buf = writer ?? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        UserResponse.encode(obj.response, buf);
        return buf;
    },
    decode(buf) {
        const sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {
            response: UserResponse.decode(sb),
        };
    },
};
const IInitializeRequest = {
    default() {
        return {};
    },
    encode(x, buf) {
        return buf ?? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
    },
    decode(sb) {
        return {};
    },
};
function encodeStateSnapshot(x) {
    const buf = new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
    buf.writeUInt8(0);
    UserState.encode(x, buf);
    return buf.toBuffer();
}
function encodeStateUpdate(x, changedAtDiff, messages) {
    const buf = new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
    buf.writeUInt8(1);
    buf.writeUVarint(changedAtDiff);
    const responses = messages.flatMap((msg) => (msg.type === "response" ? msg : []));
    buf.writeUVarint(responses.length);
    responses.forEach(({ msgId, response }) => {
        buf.writeUInt32(Number(msgId));
        writeOptional(buf, response.type === "error" ? response.error : undefined, (x) => writeString(buf, x));
    });
    const events = messages.flatMap((msg) => (msg.type === "event" ? msg : []));
    buf.writeUVarint(events.length);
    events.forEach(({ event }) => buf.writeString(event));
    if (x !== undefined) {
        UserState.encodeDiff(x, buf);
    }
    return buf.toBuffer();
}
function encodeStateError() {
    const buf = new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
    buf.writeUInt8(2);
    return buf.toBuffer();
}
function decodeStateUpdate(buf) {
    const sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
    const changedAtDiff = sb.readUVarint();
    const responses = [...Array(sb.readUVarint())].map(() => {
        const msgId = sb.readUInt32();
        const maybeError = parseOptional(sb, () => parseString(sb));
        return _base__WEBPACK_IMPORTED_MODULE_1__.Message.response(msgId, maybeError === undefined ? _base__WEBPACK_IMPORTED_MODULE_1__.Response.ok() : _base__WEBPACK_IMPORTED_MODULE_1__.Response.error(maybeError));
    });
    const events = [...Array(sb.readUVarint())].map(() => _base__WEBPACK_IMPORTED_MODULE_1__.Message.event(sb.readString()));
    const stateDiff = sb.remaining() ? UserState.decodeDiff(sb) : undefined;
    return { stateDiff, changedAtDiff, responses, events };
}
function decodeStateSnapshot(buf) {
    const sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
    return UserState.decode(sb);
}
function validatePrimitive(isValid, errorMessage) {
    return isValid ? [] : [errorMessage];
}
function validateOptional(val, innerValidate) {
    if (val !== undefined) {
        return innerValidate(val);
    }
    return [];
}
function validateArray(arr, innerValidate) {
    if (!Array.isArray(arr)) {
        return ["Invalid array: " + arr];
    }
    for (let i = 0; i < arr.length; i++) {
        const validationErrors = innerValidate(arr[i]);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid array item at index " + i);
        }
    }
    return [];
}
function writeUInt8(buf, x) {
    buf.writeUInt8(x);
}
function writeBoolean(buf, x) {
    buf.writeUInt8(x ? 1 : 0);
}
function writeInt(buf, x) {
    buf.writeVarint(x);
}
function writeFloat(buf, x) {
    buf.writeFloat(x);
}
function writeString(buf, x) {
    buf.writeString(x);
}
function writeOptional(buf, x, innerWrite) {
    writeBoolean(buf, x !== undefined);
    if (x !== undefined) {
        innerWrite(x);
    }
}
function writeArray(buf, x, innerWrite) {
    buf.writeUVarint(x.length);
    for (const val of x) {
        innerWrite(val);
    }
}
function writeArrayDiff(buf, x, innerWrite) {
    buf.writeUVarint(x.length);
    const tracker = [];
    x.forEach((val) => {
        tracker.push(val !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
    });
    buf.writeBits(tracker);
    x.forEach((val) => {
        if (val !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            innerWrite(val);
        }
    });
}
function parseUInt8(buf) {
    return buf.readUInt8();
}
function parseBoolean(buf) {
    return buf.readUInt8() > 0;
}
function parseInt(buf) {
    return buf.readVarint();
}
function parseFloat(buf) {
    return buf.readFloat();
}
function parseString(buf) {
    return buf.readString();
}
function parseOptional(buf, innerParse) {
    return parseBoolean(buf) ? innerParse(buf) : undefined;
}
function parseArray(buf, innerParse) {
    const len = buf.readUVarint();
    const arr = [];
    for (let i = 0; i < len; i++) {
        arr.push(innerParse());
    }
    return arr;
}
function parseArrayDiff(buf, innerParse) {
    const len = buf.readUVarint();
    const tracker = buf.readBits(len);
    const arr = [];
    for (let i = 0; i < len; i++) {
        if (tracker.shift()) {
            arr.push(innerParse());
        }
        else {
            arr.push(_base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        }
    }
    return arr;
}


/***/ }),

/***/ "../.hathora/client.ts":
/*!*****************************!*\
  !*** ../.hathora/client.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "HathoraClient": () => (/* binding */ HathoraClient),
/* harmony export */   "HathoraConnection": () => (/* binding */ HathoraConnection)
/* harmony export */ });
/* harmony import */ var get_random_values__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! get-random-values */ "../.hathora/node_modules/get-random-values/index.js");
/* harmony import */ var get_random_values__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(get_random_values__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var bin_serde__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! bin-serde */ "../.hathora/node_modules/bin-serde/lib/index.js");
/* harmony import */ var _hathora_client_sdk__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @hathora/client-sdk */ "../.hathora/node_modules/@hathora/client-sdk/lib/client.js");
/* harmony import */ var _hathora_client_sdk_lib_transport__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @hathora/client-sdk/lib/transport */ "../.hathora/node_modules/@hathora/client-sdk/lib/transport.js");
/* harmony import */ var _api_types__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../api/types */ "../../api/types.ts");
/* harmony import */ var _api_base__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../api/base */ "../../api/base.ts");
/* harmony import */ var _patch__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./patch */ "../.hathora/patch.ts");
/* harmony import */ var _failures__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./failures */ "../.hathora/failures.ts");
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore








class HathoraClient {
    constructor() {
        this.appId = "app-93503a45-490f-4d76-9935-f6201ead0360";
        this._client = new _hathora_client_sdk__WEBPACK_IMPORTED_MODULE_2__.HathoraClient(this.appId, _api_base__WEBPACK_IMPORTED_MODULE_5__.COORDINATOR_HOST);
    }
    static getUserFromToken(token) {
        return _hathora_client_sdk__WEBPACK_IMPORTED_MODULE_2__.HathoraClient.getUserFromToken(token);
    }
    async loginAnonymous() {
        return this._client.loginAnonymous();
    }
    async create(token, request) {
        return this._client.create(token, _api_types__WEBPACK_IMPORTED_MODULE_4__.IInitializeRequest.encode(request).toBuffer());
    }
    async connect(token, stateId, onUpdate, onError, transportType = _hathora_client_sdk_lib_transport__WEBPACK_IMPORTED_MODULE_3__.TransportType.WebSocket) {
        const connection = new HathoraConnection(this._client, stateId, token, transportType, onUpdate, onError);
        await connection.connect();
        return connection;
    }
    async findMatch(token, request, numPlayers, onUpdate) {
        return new Promise((resolve, reject) => {
            const socket = new WebSocket(`wss://${_api_base__WEBPACK_IMPORTED_MODULE_5__.MATCHMAKER_HOST}/${this.appId}`);
            socket.binaryType = "arraybuffer";
            socket.onclose = reject;
            socket.onopen = () => socket.send(new bin_serde__WEBPACK_IMPORTED_MODULE_1__.Writer()
                .writeString(token)
                .writeUVarint(numPlayers)
                .writeBuffer(_api_types__WEBPACK_IMPORTED_MODULE_4__.IInitializeRequest.encode(request).toBuffer())
                .toBuffer());
            socket.onmessage = ({ data }) => {
                const reader = new bin_serde__WEBPACK_IMPORTED_MODULE_1__.Reader(new Uint8Array(data));
                const type = reader.readUInt8();
                if (type === 0) {
                    onUpdate(reader.readUVarint());
                }
                else if (type === 1) {
                    resolve(reader.readString());
                }
                else {
                    console.error("Unknown message type", type);
                }
            };
        });
    }
}
class HathoraConnection {
    constructor(_client, stateId, token, transportType, onUpdate, onError) {
        this._client = _client;
        this.stateId = stateId;
        this.token = token;
        this.transportType = transportType;
        this.callbacks = {};
        this.changedAt = 0;
        this.updateListeners = [];
        this.errorListeners = [];
        this.handleData = (data) => {
            const reader = new bin_serde__WEBPACK_IMPORTED_MODULE_1__.Reader(new Uint8Array(data));
            const type = reader.readUInt8();
            if (type === 0) {
                this.internalState = (0,_api_types__WEBPACK_IMPORTED_MODULE_4__.decodeStateSnapshot)(reader);
                this.changedAt = 0;
                this.updateListeners.forEach((listener) => listener({
                    stateId: this.stateId,
                    state: JSON.parse(JSON.stringify(this.internalState)),
                    updatedAt: 0,
                    events: [],
                }));
            }
            else if (type === 1) {
                const { stateDiff, changedAtDiff, responses, events } = (0,_api_types__WEBPACK_IMPORTED_MODULE_4__.decodeStateUpdate)(reader);
                if (stateDiff !== undefined) {
                    this.internalState = (0,_patch__WEBPACK_IMPORTED_MODULE_6__.computePatch)(this.internalState, stateDiff);
                }
                this.changedAt += changedAtDiff;
                this.updateListeners.forEach((listener) => listener({
                    stateId: this.stateId,
                    state: JSON.parse(JSON.stringify(this.internalState)),
                    updatedAt: this.changedAt,
                    events: events.map((e) => e.event),
                }));
                responses.forEach(({ msgId, response }) => {
                    if (msgId in this.callbacks) {
                        this.callbacks[msgId](response);
                        delete this.callbacks[msgId];
                    }
                });
            }
            else if (type === 2) {
                this.transport.disconnect(4004);
            }
            else if (type === 3) {
                this.transport.pong();
            }
            else {
                console.error("Unknown message type", type);
            }
        };
        this.handleClose = (e) => {
            console.error("Connection closed", e);
            this.errorListeners.forEach((listener) => listener((0,_failures__WEBPACK_IMPORTED_MODULE_7__.transformCoordinatorFailure)(e)));
        };
        this.stateId = stateId;
        this.token = token;
        if (onUpdate !== undefined) {
            this.onUpdate(onUpdate);
        }
        if (onError !== undefined) {
            this.onError(onError);
        }
    }
    async connect() {
        return new Promise(async (resolve, reject) => {
            this.transport = await this._client.connect(this.token, this.stateId, (data) => {
                resolve();
                this.handleData(data);
            }, (e) => {
                reject(e.reason);
                this.handleClose(e);
            }, this.transportType);
        });
    }
    get state() {
        return this.internalState;
    }
    onUpdate(listener) {
        this.updateListeners.push(listener);
    }
    onError(listener) {
        this.errorListeners.push(listener);
    }
    removeAllListeners() {
        this.updateListeners = [];
        this.errorListeners = [];
    }
    joinGame(request) {
        return this.callMethod(_api_base__WEBPACK_IMPORTED_MODULE_5__.Method.JOIN_GAME, _api_types__WEBPACK_IMPORTED_MODULE_4__.IJoinGameRequest.encode(request).toBuffer());
    }
    leaveGame(request) {
        return this.callMethod(_api_base__WEBPACK_IMPORTED_MODULE_5__.Method.LEAVE_GAME, _api_types__WEBPACK_IMPORTED_MODULE_4__.ILeaveGameRequest.encode(request).toBuffer());
    }
    startGame(request) {
        return this.callMethod(_api_base__WEBPACK_IMPORTED_MODULE_5__.Method.START_GAME, _api_types__WEBPACK_IMPORTED_MODULE_4__.IStartGameRequest.encode(request).toBuffer());
    }
    startTurn(request) {
        return this.callMethod(_api_base__WEBPACK_IMPORTED_MODULE_5__.Method.START_TURN, _api_types__WEBPACK_IMPORTED_MODULE_4__.IStartTurnRequest.encode(request).toBuffer());
    }
    runPlayerPassives(request) {
        return this.callMethod(_api_base__WEBPACK_IMPORTED_MODULE_5__.Method.RUN_PLAYER_PASSIVES, _api_types__WEBPACK_IMPORTED_MODULE_4__.IRunPlayerPassivesRequest.encode(request).toBuffer());
    }
    runMonsterPassives(request) {
        return this.callMethod(_api_base__WEBPACK_IMPORTED_MODULE_5__.Method.RUN_MONSTER_PASSIVES, _api_types__WEBPACK_IMPORTED_MODULE_4__.IRunMonsterPassivesRequest.encode(request).toBuffer());
    }
    enableTD(request) {
        return this.callMethod(_api_base__WEBPACK_IMPORTED_MODULE_5__.Method.ENABLE_T_D, _api_types__WEBPACK_IMPORTED_MODULE_4__.IEnableTDRequest.encode(request).toBuffer());
    }
    playTD(request) {
        return this.callMethod(_api_base__WEBPACK_IMPORTED_MODULE_5__.Method.PLAY_T_D, _api_types__WEBPACK_IMPORTED_MODULE_4__.IPlayTDRequest.encode(request).toBuffer());
    }
    enableMonsters(request) {
        return this.callMethod(_api_base__WEBPACK_IMPORTED_MODULE_5__.Method.ENABLE_MONSTERS, _api_types__WEBPACK_IMPORTED_MODULE_4__.IEnableMonstersRequest.encode(request).toBuffer());
    }
    playMonster(request) {
        return this.callMethod(_api_base__WEBPACK_IMPORTED_MODULE_5__.Method.PLAY_MONSTER, _api_types__WEBPACK_IMPORTED_MODULE_4__.IPlayMonsterRequest.encode(request).toBuffer());
    }
    enablePlayer(request) {
        return this.callMethod(_api_base__WEBPACK_IMPORTED_MODULE_5__.Method.ENABLE_PLAYER, _api_types__WEBPACK_IMPORTED_MODULE_4__.IEnablePlayerRequest.encode(request).toBuffer());
    }
    playPlayerCard(request) {
        return this.callMethod(_api_base__WEBPACK_IMPORTED_MODULE_5__.Method.PLAY_PLAYER_CARD, _api_types__WEBPACK_IMPORTED_MODULE_4__.IPlayPlayerCardRequest.encode(request).toBuffer());
    }
    playerHandComplete(request) {
        return this.callMethod(_api_base__WEBPACK_IMPORTED_MODULE_5__.Method.PLAYER_HAND_COMPLETE, _api_types__WEBPACK_IMPORTED_MODULE_4__.IPlayerHandCompleteRequest.encode(request).toBuffer());
    }
    enableMonsterDamage(request) {
        return this.callMethod(_api_base__WEBPACK_IMPORTED_MODULE_5__.Method.ENABLE_MONSTER_DAMAGE, _api_types__WEBPACK_IMPORTED_MODULE_4__.IEnableMonsterDamageRequest.encode(request).toBuffer());
    }
    applyMonsterDamage(request) {
        return this.callMethod(_api_base__WEBPACK_IMPORTED_MODULE_5__.Method.APPLY_MONSTER_DAMAGE, _api_types__WEBPACK_IMPORTED_MODULE_4__.IApplyMonsterDamageRequest.encode(request).toBuffer());
    }
    disableMonsterDamage(request) {
        return this.callMethod(_api_base__WEBPACK_IMPORTED_MODULE_5__.Method.DISABLE_MONSTER_DAMAGE, _api_types__WEBPACK_IMPORTED_MODULE_4__.IDisableMonsterDamageRequest.encode(request).toBuffer());
    }
    enableCardPool(request) {
        return this.callMethod(_api_base__WEBPACK_IMPORTED_MODULE_5__.Method.ENABLE_CARD_POOL, _api_types__WEBPACK_IMPORTED_MODULE_4__.IEnableCardPoolRequest.encode(request).toBuffer());
    }
    buyFromCardPool(request) {
        return this.callMethod(_api_base__WEBPACK_IMPORTED_MODULE_5__.Method.BUY_FROM_CARD_POOL, _api_types__WEBPACK_IMPORTED_MODULE_4__.IBuyFromCardPoolRequest.encode(request).toBuffer());
    }
    closeCardPool(request) {
        return this.callMethod(_api_base__WEBPACK_IMPORTED_MODULE_5__.Method.CLOSE_CARD_POOL, _api_types__WEBPACK_IMPORTED_MODULE_4__.ICloseCardPoolRequest.encode(request).toBuffer());
    }
    endRound(request) {
        return this.callMethod(_api_base__WEBPACK_IMPORTED_MODULE_5__.Method.END_ROUND, _api_types__WEBPACK_IMPORTED_MODULE_4__.IEndRoundRequest.encode(request).toBuffer());
    }
    sendMessage(request) {
        return this.callMethod(_api_base__WEBPACK_IMPORTED_MODULE_5__.Method.SEND_MESSAGE, _api_types__WEBPACK_IMPORTED_MODULE_4__.ISendMessageRequest.encode(request).toBuffer());
    }
    seenMessage(request) {
        return this.callMethod(_api_base__WEBPACK_IMPORTED_MODULE_5__.Method.SEEN_MESSAGE, _api_types__WEBPACK_IMPORTED_MODULE_4__.ISeenMessageRequest.encode(request).toBuffer());
    }
    userResponse(request) {
        return this.callMethod(_api_base__WEBPACK_IMPORTED_MODULE_5__.Method.USER_RESPONSE, _api_types__WEBPACK_IMPORTED_MODULE_4__.IUserResponseRequest.encode(request).toBuffer());
    }
    disconnect(code) {
        this.transport.disconnect(code);
    }
    callMethod(method, request) {
        return new Promise((resolve, reject) => {
            if (!this.transport.isReady()) {
                reject("Connection not open");
            }
            else {
                const msgId = get_random_values__WEBPACK_IMPORTED_MODULE_0___default()(new Uint8Array(4));
                this.transport.write(new Uint8Array([...new Uint8Array([method]), ...msgId, ...request]));
                this.callbacks[new DataView(msgId.buffer).getUint32(0)] = resolve;
            }
        });
    }
}


/***/ }),

/***/ "../.hathora/failures.ts":
/*!*******************************!*\
  !*** ../.hathora/failures.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ConnectionFailureType": () => (/* binding */ ConnectionFailureType),
/* harmony export */   "transformCoordinatorFailure": () => (/* binding */ transformCoordinatorFailure)
/* harmony export */ });
var ConnectionFailureType;
(function (ConnectionFailureType) {
    ConnectionFailureType["STATE_NOT_FOUND"] = "STATE_NOT_FOUND";
    ConnectionFailureType["NO_AVAILABLE_STORES"] = "NO_AVAILABLE_STORES";
    ConnectionFailureType["INVALID_USER_DATA"] = "INVALID_USER_DATA";
    ConnectionFailureType["INVALID_STATE_ID"] = "INVALID_STATE_ID";
    ConnectionFailureType["GENERIC_FAILURE"] = "GENERIC_FAILURE";
})(ConnectionFailureType || (ConnectionFailureType = {}));
const transformCoordinatorFailure = (e) => {
    return {
        message: e.reason,
        type: (function (code) {
            switch (code) {
                case 4000:
                    return ConnectionFailureType.STATE_NOT_FOUND;
                case 4001:
                    return ConnectionFailureType.NO_AVAILABLE_STORES;
                case 4002:
                    return ConnectionFailureType.INVALID_USER_DATA;
                case 4003:
                    return ConnectionFailureType.INVALID_STATE_ID;
                default:
                    return ConnectionFailureType.GENERIC_FAILURE;
            }
        })(e.code)
    };
};


/***/ }),

/***/ "../.hathora/patch.ts":
/*!****************************!*\
  !*** ../.hathora/patch.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "computePatch": () => (/* binding */ computePatch)
/* harmony export */ });
/* harmony import */ var _api_base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../api/base */ "../../api/base.ts");

function patchMessage(obj, patch) {
    if (patch.id !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.id = patch.id;
    }
    if (patch.sender !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.sender = patch.sender;
    }
    if (patch.nickName !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.nickName = patch.nickName;
    }
    if (patch.data !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.data = patch.data;
    }
    return obj;
}
function patchUserResponse(obj, patch) {
    if (patch.Callback !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.Callback = patch.Callback;
    }
    if (patch.Response !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.Response = patch.Response;
    }
    return obj;
}
function patchEffect(obj, patch) {
    if (patch.callback !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.callback = patch.callback;
    }
    if (patch.userPrompt !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.userPrompt = patchOptional(obj.userPrompt, patch.userPrompt, (a, b) => b);
    }
    return obj;
}
function patchMCard(obj, patch) {
    if (patch.id !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.id = patch.id;
    }
    if (patch.title !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.title = patch.title;
    }
    if (patch.effectstring !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.effectstring = patch.effectstring;
    }
    if (patch.rewardstring !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.rewardstring = patch.rewardstring;
    }
    if (patch.health !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.health = patch.health;
    }
    if (patch.damage !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.damage = patch.damage;
    }
    if (patch.level !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.level = patch.level;
    }
    if (patch.ActiveEffect !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.ActiveEffect = patchOptional(obj.ActiveEffect, patch.ActiveEffect, (a, b) => patchEffect(a, b));
    }
    if (patch.PassiveEffect !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.PassiveEffect = patchOptional(obj.PassiveEffect, patch.PassiveEffect, (a, b) => patchEffect(a, b));
    }
    if (patch.Rewards !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.Rewards = patchEffect(obj.Rewards, patch.Rewards);
    }
    if (patch.StatusEffects !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.StatusEffects = patchArray(obj.StatusEffects, patch.StatusEffects, (a, b) => b);
    }
    return obj;
}
function patchTDCard(obj, patch) {
    if (patch.id !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.id = patch.id;
    }
    if (patch.title !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.title = patch.title;
    }
    if (patch.level !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.level = patch.level;
    }
    if (patch.effectString !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.effectString = patch.effectString;
    }
    if (patch.ActiveEffect !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.ActiveEffect = patchOptional(obj.ActiveEffect, patch.ActiveEffect, (a, b) => patchEffect(a, b));
    }
    if (patch.PassiveEffect !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.PassiveEffect = patchOptional(obj.PassiveEffect, patch.PassiveEffect, (a, b) => patchEffect(a, b));
    }
    return obj;
}
function patchABCard(obj, patch) {
    if (patch.id !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.id = patch.id;
    }
    if (patch.title !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.title = patch.title;
    }
    if (patch.effectString !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.effectString = patch.effectString;
    }
    if (patch.type !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.type = patch.type;
    }
    if (patch.level !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.level = patch.level;
    }
    if (patch.cost !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.cost = patch.cost;
    }
    if (patch.ActiveEffect !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.ActiveEffect = patchOptional(obj.ActiveEffect, patch.ActiveEffect, (a, b) => patchEffect(a, b));
    }
    if (patch.PassiveEffect !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.PassiveEffect = patchOptional(obj.PassiveEffect, patch.PassiveEffect, (a, b) => patchEffect(a, b));
    }
    return obj;
}
function patchLCard(obj, patch) {
    if (patch.id !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.id = patch.id;
    }
    if (patch.title !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.title = patch.title;
    }
    if (patch.level !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.level = patch.level;
    }
    if (patch.sequence !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.sequence = patch.sequence;
    }
    if (patch.td !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.td = patch.td;
    }
    if (patch.health !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.health = patch.health;
    }
    if (patch.damage !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.damage = patch.damage;
    }
    if (patch.ActiveEffect !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.ActiveEffect = patchOptional(obj.ActiveEffect, patch.ActiveEffect, (a, b) => patchEffect(a, b));
    }
    if (patch.PassiveEffect !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.PassiveEffect = patchOptional(obj.PassiveEffect, patch.PassiveEffect, (a, b) => patchEffect(a, b));
    }
    return obj;
}
function patchPlayer(obj, patch) {
    if (patch.id !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.id = patch.id;
    }
    if (patch.name !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.name = patch.name;
    }
    if (patch.health !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.health = patch.health;
    }
    if (patch.attack !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.attack = patch.attack;
    }
    if (patch.coin !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.coin = patch.coin;
    }
    if (patch.hand !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.hand = patchArray(obj.hand, patch.hand, (a, b) => patchABCard(a, b));
    }
    if (patch.deck !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.deck = patchArray(obj.deck, patch.deck, (a, b) => patchABCard(a, b));
    }
    if (patch.discard !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.discard = patchArray(obj.discard, patch.discard, (a, b) => patchABCard(a, b));
    }
    if (patch.role !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.role = patch.role;
    }
    if (patch.gender !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.gender = patch.gender;
    }
    if (patch.statusEffects !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.statusEffects = patchArray(obj.statusEffects, patch.statusEffects, (a, b) => b);
    }
    if (patch.lastSeen !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.lastSeen = patch.lastSeen;
    }
    return obj;
}
function patchUserState(obj, patch) {
    if (patch.me !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.me = patch.me;
    }
    if (patch.players !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.players = patchArray(obj.players, patch.players, (a, b) => patchPlayer(a, b));
    }
    if (patch.roundState !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.roundState = patch.roundState;
    }
    if (patch.activeMonsters !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.activeMonsters = patchArray(obj.activeMonsters, patch.activeMonsters, (a, b) => patchMCard(a, b));
    }
    if (patch.location !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.location = patchOptional(obj.location, patch.location, (a, b) => patchLCard(a, b));
    }
    if (patch.TDcard !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.TDcard = patchOptional(obj.TDcard, patch.TDcard, (a, b) => patchTDCard(a, b));
    }
    if (patch.cardPool !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.cardPool = patchArray(obj.cardPool, patch.cardPool, (a, b) => patchABCard(a, b));
    }
    if (patch.turnOrder !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.turnOrder = patchArray(obj.turnOrder, patch.turnOrder, (a, b) => b);
    }
    if (patch.turn !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.turn = patchOptional(obj.turn, patch.turn, (a, b) => b);
    }
    if (patch.Messages !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.Messages = patchArray(obj.Messages, patch.Messages, (a, b) => patchMessage(a, b));
    }
    return obj;
}
function patchArray(arr, patch, innerPatch) {
    if (patch === _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        return arr;
    }
    patch.forEach((val, i) => {
        if (val !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
            if (i >= arr.length) {
                arr.push(val);
            }
            else {
                arr[i] = innerPatch(arr[i], val);
            }
        }
    });
    if (patch.length < arr.length) {
        arr.splice(patch.length);
    }
    return arr;
}
function patchOptional(obj, patch, innerPatch) {
    if (patch === undefined) {
        return undefined;
    }
    else if (obj === undefined) {
        return patch;
    }
    else {
        return innerPatch(obj, patch);
    }
}
function computePatch(state, patch) {
    return patchUserState(state, patch);
}


/***/ }),

/***/ "./src/assets/assetPool.ts":
/*!*********************************!*\
  !*** ./src/assets/assetPool.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "arrow": () => (/* reexport default export from named module */ _assets_help_whiteback_button_png__WEBPACK_IMPORTED_MODULE_20__),
/* harmony export */   "atk": () => (/* reexport default export from named module */ _assets_hud_attackicon_png__WEBPACK_IMPORTED_MODULE_21__),
/* harmony export */   "bfemale": () => (/* reexport default export from named module */ _assets_people_barbarian_w_png__WEBPACK_IMPORTED_MODULE_1__),
/* harmony export */   "bgMusic": () => (/* reexport safe */ _assets_audio_main_wav__WEBPACK_IMPORTED_MODULE_26__["default"]),
/* harmony export */   "bmale": () => (/* reexport default export from named module */ _assets_people_barbarian_m_png__WEBPACK_IMPORTED_MODULE_0__),
/* harmony export */   "bubble": () => (/* reexport default export from named module */ _assets_chat_whitespeech_bubble_png__WEBPACK_IMPORTED_MODULE_18__),
/* harmony export */   "buttonWav": () => (/* reexport safe */ _assets_audio_button_wav__WEBPACK_IMPORTED_MODULE_28__["default"]),
/* harmony export */   "cardIcon": () => (/* reexport default export from named module */ _assets_toast_whitecard_png__WEBPACK_IMPORTED_MODULE_11__),
/* harmony export */   "coin": () => (/* reexport default export from named module */ _assets_hud_stackofcoin_png__WEBPACK_IMPORTED_MODULE_22__),
/* harmony export */   "dealcard": () => (/* reexport safe */ _assets_audio_dealingcard_wav__WEBPACK_IMPORTED_MODULE_31__["default"]),
/* harmony export */   "discard": () => (/* reexport default export from named module */ _assets_hud_statusEffect_discard_png__WEBPACK_IMPORTED_MODULE_15__),
/* harmony export */   "effectIcon": () => (/* reexport default export from named module */ _assets_toast_whiteeffect_png__WEBPACK_IMPORTED_MODULE_12__),
/* harmony export */   "gmMusic": () => (/* reexport safe */ _assets_audio_ingame_wav__WEBPACK_IMPORTED_MODULE_27__["default"]),
/* harmony export */   "help": () => (/* reexport default export from named module */ _assets_help_whitequestion_mark_png__WEBPACK_IMPORTED_MODULE_23__),
/* harmony export */   "location": () => (/* reexport default export from named module */ _assets_hud_statusEffect_location_png__WEBPACK_IMPORTED_MODULE_17__),
/* harmony export */   "locationIcon": () => (/* reexport default export from named module */ _assets_toast_whitebuilding_png__WEBPACK_IMPORTED_MODULE_9__),
/* harmony export */   "mBonus": () => (/* reexport default export from named module */ _assets_hud_statusEffect_MonsterBonus_png__WEBPACK_IMPORTED_MODULE_24__),
/* harmony export */   "mail": () => (/* reexport safe */ _assets_audio_mail_mp3__WEBPACK_IMPORTED_MODULE_30__["default"]),
/* harmony export */   "monsterIcon": () => (/* reexport default export from named module */ _assets_toast_whitemonster_png__WEBPACK_IMPORTED_MODULE_10__),
/* harmony export */   "mute": () => (/* reexport default export from named module */ _assets_options_whitemute_png__WEBPACK_IMPORTED_MODULE_13__),
/* harmony export */   "nodraw": () => (/* reexport default export from named module */ _assets_hud_statusEffect_nodraw_png__WEBPACK_IMPORTED_MODULE_16__),
/* harmony export */   "pfemale": () => (/* reexport default export from named module */ _assets_people_paladin_w_png__WEBPACK_IMPORTED_MODULE_7__),
/* harmony export */   "pmale": () => (/* reexport default export from named module */ _assets_people_paladin_male_png__WEBPACK_IMPORTED_MODULE_6__),
/* harmony export */   "rfemale": () => (/* reexport default export from named module */ _assets_people_rogue_w_png__WEBPACK_IMPORTED_MODULE_5__),
/* harmony export */   "rmale": () => (/* reexport default export from named module */ _assets_people_rogue_male_png__WEBPACK_IMPORTED_MODULE_4__),
/* harmony export */   "sad": () => (/* reexport safe */ _assets_audio_sadtrombone_wav__WEBPACK_IMPORTED_MODULE_32__["default"]),
/* harmony export */   "settings": () => (/* reexport default export from named module */ _assets_options_whitemenu_png__WEBPACK_IMPORTED_MODULE_19__),
/* harmony export */   "stunned": () => (/* reexport default export from named module */ _assets_hud_statusEffect_stunned_png__WEBPACK_IMPORTED_MODULE_25__),
/* harmony export */   "unmute": () => (/* reexport default export from named module */ _assets_options_whiteunmute_png__WEBPACK_IMPORTED_MODULE_14__),
/* harmony export */   "userIcon": () => (/* reexport default export from named module */ _assets_toast_whiteuser_png__WEBPACK_IMPORTED_MODULE_8__),
/* harmony export */   "wfemale": () => (/* reexport default export from named module */ _assets_people_wizard_female_png__WEBPACK_IMPORTED_MODULE_3__),
/* harmony export */   "wmale": () => (/* reexport default export from named module */ _assets_people_wizard_png__WEBPACK_IMPORTED_MODULE_2__),
/* harmony export */   "woosh": () => (/* reexport safe */ _assets_audio_woosh_mp3__WEBPACK_IMPORTED_MODULE_29__["default"])
/* harmony export */ });
/* harmony import */ var _assets_people_barbarian_m_png__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../assets/people/barbarian_m.png */ "./src/assets/people/barbarian_m.png");
/* harmony import */ var _assets_people_barbarian_w_png__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../assets/people/barbarian_w.png */ "./src/assets/people/barbarian_w.png");
/* harmony import */ var _assets_people_wizard_png__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../assets/people/wizard.png */ "./src/assets/people/wizard.png");
/* harmony import */ var _assets_people_wizard_female_png__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../assets/people/wizard_female.png */ "./src/assets/people/wizard_female.png");
/* harmony import */ var _assets_people_rogue_male_png__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../assets/people/rogue_male.png */ "./src/assets/people/rogue_male.png");
/* harmony import */ var _assets_people_rogue_w_png__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../assets/people/rogue_w.png */ "./src/assets/people/rogue_w.png");
/* harmony import */ var _assets_people_paladin_male_png__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../assets/people/paladin_male.png */ "./src/assets/people/paladin_male.png");
/* harmony import */ var _assets_people_paladin_w_png__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../assets/people/paladin_w.png */ "./src/assets/people/paladin_w.png");
/* harmony import */ var _assets_toast_whiteuser_png__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../assets/toast/whiteuser.png */ "./src/assets/toast/whiteuser.png");
/* harmony import */ var _assets_toast_whitebuilding_png__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../assets/toast/whitebuilding.png */ "./src/assets/toast/whitebuilding.png");
/* harmony import */ var _assets_toast_whitemonster_png__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../assets/toast/whitemonster.png */ "./src/assets/toast/whitemonster.png");
/* harmony import */ var _assets_toast_whitecard_png__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../assets/toast/whitecard.png */ "./src/assets/toast/whitecard.png");
/* harmony import */ var _assets_toast_whiteeffect_png__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../assets/toast/whiteeffect.png */ "./src/assets/toast/whiteeffect.png");
/* harmony import */ var _assets_options_whitemute_png__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../assets/options/whitemute.png */ "./src/assets/options/whitemute.png");
/* harmony import */ var _assets_options_whiteunmute_png__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../assets/options/whiteunmute.png */ "./src/assets/options/whiteunmute.png");
/* harmony import */ var _assets_hud_statusEffect_discard_png__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../assets/hud/statusEffect_discard.png */ "./src/assets/hud/statusEffect_discard.png");
/* harmony import */ var _assets_hud_statusEffect_nodraw_png__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ../assets/hud/statusEffect_nodraw.png */ "./src/assets/hud/statusEffect_nodraw.png");
/* harmony import */ var _assets_hud_statusEffect_location_png__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ../assets/hud/statusEffect_location.png */ "./src/assets/hud/statusEffect_location.png");
/* harmony import */ var _assets_chat_whitespeech_bubble_png__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ../assets/chat/whitespeech-bubble.png */ "./src/assets/chat/whitespeech-bubble.png");
/* harmony import */ var _assets_options_whitemenu_png__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ../assets/options/whitemenu.png */ "./src/assets/options/whitemenu.png");
/* harmony import */ var _assets_help_whiteback_button_png__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ../assets/help/whiteback-button.png */ "./src/assets/help/whiteback-button.png");
/* harmony import */ var _assets_hud_attackicon_png__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ../assets/hud/attackicon.png */ "./src/assets/hud/attackicon.png");
/* harmony import */ var _assets_hud_stackofcoin_png__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ../assets/hud/stackofcoin.png */ "./src/assets/hud/stackofcoin.png");
/* harmony import */ var _assets_help_whitequestion_mark_png__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! ../assets/help/whitequestion-mark.png */ "./src/assets/help/whitequestion-mark.png");
/* harmony import */ var _assets_hud_statusEffect_MonsterBonus_png__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! ../assets/hud/statusEffect_MonsterBonus.png */ "./src/assets/hud/statusEffect_MonsterBonus.png");
/* harmony import */ var _assets_hud_statusEffect_stunned_png__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! ../assets/hud/statusEffect_stunned.png */ "./src/assets/hud/statusEffect_stunned.png");
/* harmony import */ var _assets_audio_main_wav__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! ../assets/audio/main.wav */ "./src/assets/audio/main.wav");
/* harmony import */ var _assets_audio_ingame_wav__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! ../assets/audio/ingame.wav */ "./src/assets/audio/ingame.wav");
/* harmony import */ var _assets_audio_button_wav__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! ../assets/audio/button.wav */ "./src/assets/audio/button.wav");
/* harmony import */ var _assets_audio_woosh_mp3__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! ../assets/audio/woosh.mp3 */ "./src/assets/audio/woosh.mp3");
/* harmony import */ var _assets_audio_mail_mp3__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! ../assets/audio/mail.mp3 */ "./src/assets/audio/mail.mp3");
/* harmony import */ var _assets_audio_dealingcard_wav__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(/*! ../assets/audio/dealingcard.wav */ "./src/assets/audio/dealingcard.wav");
/* harmony import */ var _assets_audio_sadtrombone_wav__WEBPACK_IMPORTED_MODULE_32__ = __webpack_require__(/*! ../assets/audio/sadtrombone.wav */ "./src/assets/audio/sadtrombone.wav");





































/***/ }),

/***/ "./src/components/SceneTransition.ts":
/*!*******************************************!*\
  !*** ./src/components/SceneTransition.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SceneTransition": () => (/* binding */ SceneTransition)
/* harmony export */ });
class SceneTransition {
    constructor(state) {
        this.componentName = "mySceneTransition";
        this.template = `
    <div class="\${mySceneTransition.classString}">
        <div>  </div>
    </div>
    `;
        this.localState = state;
    }
}


/***/ }),

/***/ "./src/components/card.ts":
/*!********************************!*\
  !*** ./src/components/card.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Card": () => (/* binding */ Card)
/* harmony export */ });
class Card {
    constructor(config) {
        this.componentName = "myCard";
        this.localState = config.state;
        this.type = config.type;
        this.title = config.title;
        this.level = config.level;
        this.description = config.description;
        this.health = config.health ? config.health : undefined;
        this.activeEffect = config.activeEffect ? config.activeEffect : undefined;
        this.passiveEffect = config.passiveEffect ? config.passiveEffect : undefined;
        this.rewardEffect = config.rewardEffect ? config.rewardEffect : undefined;
        this.cost = config.cost ? config.cost : undefined;
    }
}


/***/ }),

/***/ "./src/components/cardPool.ts":
/*!************************************!*\
  !*** ./src/components/cardPool.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "CardPool": () => (/* binding */ CardPool)
/* harmony export */ });
class CardPool {
    constructor(state) {
        this.componentName = "myGameScreen";
        this.template = `
    <div class="CP_container" \${===myGame.showModal}>

        <div class="CP_modal_ack" \${===myCardPool.showConfirmation}>
            <div class="CP_backgroundtint"></div>
            <div class="CP_Modal_Inner">
                <span class="CP_Modaltitle">Confirm card selection?</span>
                <div class="CP_cardspot">
                  <div class="card_title smallCard">\${myCardPool.selectedCard.title}</div>
                  <div class="card_level smallCard">Level \${myCardPool.selectedCard.level}</div>
                  <div class="card_desc smallCard">\${myCardPool.selectedCard.desc}</div>
                  <div class="card_cost smallCard">Cost \${myCardPool.selectedCard.cost}</div>
                </div>
                <div class="CP_buttonflex">
                    <button class="lobbyButton" \${click@=>myCardPool.confCancel}>Cancel</button>
                    <button class="lobbyButton" \${click@=>myCardPool.confAccept}>OK</button>
                </div>
            </div>
        </div>
        <div class="CP_CardModal">
            <div id="CP0" class="CP_cardspot CPspot1" \${click@=>myCardPool.clickHandler}>
              <div class="card_title smallCard">\${gameData.cardPool[0].title}</div>
              <div class="card_level smallCard">Level \${gameData.cardPool[0]..level}</div>
              <div class="card_desc smallCard">\${gameData.cardPool[0].effectString}</div>
              <div class="card_cost smallCard">Cost \${gameData.cardPool[0].cost}</div>
            </div>
            <div id="CP1" class="CP_cardspot CPspot2" \${click@=>myCardPool.clickHandler}>
              <div class="card_title smallCard">\${gameData.cardPool[1].title}</div>
              <div class="card_level smallCard">Level \${gameData.cardPool[1]..level}</div>
              <div class="card_desc smallCard">\${gameData.cardPool[1].effectString}</div>
              <div class="card_cost smallCard">Cost \${gameData.cardPool[1].cost}</div>
            </div>
            <div  id="CP2" class="CP_cardspot CPspot3" \${click@=>myCardPool.clickHandler}>
              <div class="card_title smallCard">\${gameData.cardPool[2].title}</div>
              <div class="card_level smallCard">Level \${gameData.cardPool[2]..level}</div>
              <div class="card_desc smallCard">\${gameData.cardPool[2].effectString}</div>
              <div class="card_cost smallCard">Cost \${gameData.cardPool[2].cost}</div>
            </div>
            <div id="CP3" class="CP_cardspot CPspot4" \${click@=>myCardPool.clickHandler}>
              <div class="card_title smallCard">\${gameData.cardPool[3].title}</div>
              <div class="card_level smallCard">Level \${gameData.cardPool[3]..level}</div>
              <div class="card_desc smallCard">\${gameData.cardPool[3].effectString}</div>
              <div class="card_cost smallCard">Cost \${gameData.cardPool[3].cost}</div>
            </div>
            <div id="CP4" class="CP_cardspot CPspot5" \${click@=>myCardPool.clickHandler}>
              <div class="card_title smallCard">\${gameData.cardPool[4].title}</div>
              <div class="card_level smallCard">Level \${gameData.cardPool[4]..level}</div>
              <div class="card_desc smallCard">\${gameData.cardPool[4].effectString}</div>
              <div class="card_cost smallCard">Cost \${gameData.cardPool[4].cost}</div>
            </div>
            <div id="CP5" class="CP_cardspot CPspot6" \${click@=>myCardPool.clickHandler}>
              <div class="card_title smallCard">\${gameData.cardPool[5].title}</div>
              <div class="card_level smallCard">Level \${gameData.cardPool[5]..level}</div>
              <div class="card_desc smallCard">\${gameData.cardPool[5].effectString}</div>
              <div class="card_cost smallCard">Cost \${gameData.cardPool[5].cost}</div>
            </div>
        </div>
        
    </div>
      `;
        this.localState = state;
    }
}


/***/ }),

/***/ "./src/components/charScreen.ts":
/*!**************************************!*\
  !*** ./src/components/charScreen.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "CharScreen": () => (/* binding */ CharScreen)
/* harmony export */ });
/* harmony import */ var _assets_assetPool__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../assets/assetPool */ "./src/assets/assetPool.ts");
/* harmony import */ var _settings__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./settings */ "./src/components/settings.ts");


class CharScreen {
    constructor(state) {
        this.componentName = "myCharscreen";
        this.localState = state;
        this.settings = new _settings__WEBPACK_IMPORTED_MODULE_1__.Settings(state);
        this.template = `
    <div class="charscreentitle">Character Selection</div>
    <div class="charscreenContainer">
      ${this.settings.template}
      <div class="cs_modaldiv" \${!==myCharscreen.isModalShowing}>
          <div class="cs_inputsdiv">
            <input class="cs_inputname"  type="text" \${focus@=>myCharscreen.selectText} \${value<=>myCharscreen.characterName}/>
            <div class="switchcontainer">
                <div class="cs_letter">M</div>
                <div class="cs_MFselectordiv" style="justify-content:\${myCharscreen.switchPosition};" \${click@=>myCharscreen.toggleGender}>
                    <div class="cs_selectorButton"> </div>
                </div>
                <div class="cs_letter">F</div>
            </div>
          </div>

          <button class="lobbyButton barbutton" \${click@=>myCharscreen.selectBarbarian}>Barbarian</button>
          <img src="${_assets_assetPool__WEBPACK_IMPORTED_MODULE_0__.bmale}" class="cs_barbarian_sprite "  alt=""  \${===myCharscreen.isMale} >
          <img src="${_assets_assetPool__WEBPACK_IMPORTED_MODULE_0__.bfemale}" class="cs_barbarian_sprite "  alt="" \${!==myCharscreen.isMale} >
                          
          <button class="lobbyButton wizbutton" \${click@=>myCharscreen.selectWizard}>Wizard</button>
          <img src="${_assets_assetPool__WEBPACK_IMPORTED_MODULE_0__.wmale}" class="cs_wizard_sprite "  alt="" \${===myCharscreen.isMale} />
          <img src="${_assets_assetPool__WEBPACK_IMPORTED_MODULE_0__.wfemale}" class="cs_wizard_sprite " alt="" \${!==myCharscreen.isMale}/>
          
          <button class="lobbyButton rogbutton" \${click@=>myCharscreen.selectRogue}>Rogue</button>
          <img src="${_assets_assetPool__WEBPACK_IMPORTED_MODULE_0__.rmale}" class="cs_rogue_sprite"  alt="" \${===myCharscreen.isMale} />
          <img src="${_assets_assetPool__WEBPACK_IMPORTED_MODULE_0__.rfemale}" class="cs_rogue_sprite" alt="" \${!==myCharscreen.isMale} />
        
          <button class="lobbyButton palbutton" \${click@=>myCharscreen.selectPaladin}>Paladin</button>
          <img src="${_assets_assetPool__WEBPACK_IMPORTED_MODULE_0__.pmale}" class="cs_paladin_sprite"  alt="" \${===myCharscreen.isMale} />
          <img src="${_assets_assetPool__WEBPACK_IMPORTED_MODULE_0__.pfemale}" class="cs_paladin_sprite"  alt="" \${!==myCharscreen.isMale} />

      </div>
      <div class="cs_modaldiv2" \${===myCharscreen.isModalShowing}>
          <div class="cs_modal2_title">Confirm these character selection settings?</div>
          <div class="cs_modal2_prompt">Character Name: \${myCharscreen.characterName}</div>
          <div class="cs_modal2_image">
            <img src="\${myCharscreen.imgSource}" alt=""/>
          </div>
          <div class="cs_modal2_buttondiv">
            <button class="lobbyButton" \${click@=>myCharscreen.cancelSelection}>Cancel</button>
            <button class="lobbyButton" \${click@=>myCharscreen.enterGame}>Accept</button>
          </div>
          
      </div> 
           
      
    </div>
          
    <div class="csbuttonflex">
        <button class="lobbyButton " \${click@=>myCharscreen.goBack}>Back</button>
        <button class="lobbyButton " \${click@=>myCharscreen.logout}>Logout</button>
    </div>
    
    <div class="loginText">
          <p>Logged in as: \${playerData.username}</p>
          <p>Game ID is \${gameData.gameID}</p>
    </div>
    <img class="game_menu_icon" src="${_assets_assetPool__WEBPACK_IMPORTED_MODULE_0__.settings}" alt="" \${click@=>mypUI.showOptions}/>
      `;
    }
}


/***/ }),

/***/ "./src/components/character.ts":
/*!*************************************!*\
  !*** ./src/components/character.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Character": () => (/* binding */ Character)
/* harmony export */ });
/* harmony import */ var _api_types__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../api/types */ "../../api/types.ts");
/* harmony import */ var _assets_assetPool__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../assets/assetPool */ "./src/assets/assetPool.ts");


class Character {
    constructor(config) {
        this.roleMap = {
            [_api_types__WEBPACK_IMPORTED_MODULE_0__.Roles.Barbarian]: {
                [_api_types__WEBPACK_IMPORTED_MODULE_0__.Gender.Male]: _assets_assetPool__WEBPACK_IMPORTED_MODULE_1__.bmale,
                [_api_types__WEBPACK_IMPORTED_MODULE_0__.Gender.Female]: _assets_assetPool__WEBPACK_IMPORTED_MODULE_1__.bfemale,
            },
            [_api_types__WEBPACK_IMPORTED_MODULE_0__.Roles.Wizard]: {
                [_api_types__WEBPACK_IMPORTED_MODULE_0__.Gender.Male]: _assets_assetPool__WEBPACK_IMPORTED_MODULE_1__.wmale,
                [_api_types__WEBPACK_IMPORTED_MODULE_0__.Gender.Female]: _assets_assetPool__WEBPACK_IMPORTED_MODULE_1__.wfemale,
            },
            [_api_types__WEBPACK_IMPORTED_MODULE_0__.Roles.Rogue]: {
                [_api_types__WEBPACK_IMPORTED_MODULE_0__.Gender.Male]: _assets_assetPool__WEBPACK_IMPORTED_MODULE_1__.rmale,
                [_api_types__WEBPACK_IMPORTED_MODULE_0__.Gender.Female]: _assets_assetPool__WEBPACK_IMPORTED_MODULE_1__.rfemale,
            },
            [_api_types__WEBPACK_IMPORTED_MODULE_0__.Roles.Paladin]: {
                [_api_types__WEBPACK_IMPORTED_MODULE_0__.Gender.Male]: _assets_assetPool__WEBPACK_IMPORTED_MODULE_1__.pmale,
                [_api_types__WEBPACK_IMPORTED_MODULE_0__.Gender.Female]: _assets_assetPool__WEBPACK_IMPORTED_MODULE_1__.pfemale,
            },
        };
        this.classMap = {
            1: "pui_meter-1",
            2: "pui_meter-2",
            3: "pui_meter-3",
            4: "pui_meter-4",
        };
        this.clearHover = () => {
            this.hovered = false;
        };
        this.setHover = () => {
            this.hovered = true;
        };
        this.isHovered = () => {
            return this.hovered;
        };
        this.attack = 0;
        this.coin = 0;
        this.health = 10;
        this.index = config.index + 1;
        this.name = config.name || "noman";
        this.role = config.role || _api_types__WEBPACK_IMPORTED_MODULE_0__.Roles.Barbarian;
        this.gender = config.gender || _api_types__WEBPACK_IMPORTED_MODULE_0__.Gender.Male;
        this.img = this.roleMap[this.role][this.gender];
        this.bloomStatus = config.bloomStatus;
        this.hovered = false;
        this.statusEffects = config.statusEffects;
        this.coinPlacard = {
            isVisible: false,
            text: "+1",
            offset: 0,
            color: "limegreen",
            opacity: 1,
        };
        this.attackPlacard = {
            isVisible: false,
            text: "+1",
            offset: 0,
            color: "limegreen",
            opacity: 1,
        };
    }
    addHealth(num) {
        this.health = this.health + num <= 10 ? this.health + num : 10;
        let myUI = document.querySelector(`.${this.classMap[this.index]}`);
        let newAngle = (10 - this.health) * 36;
        myUI.style.setProperty(`--angle${this.index}`, `${newAngle}`);
        if (this.health <= 4 && this.health > 2)
            myUI.style.stroke = "yellow";
        else if (this.health > 4)
            myUI.style.stroke = "lime";
    }
    lowerHealth(num) {
        this.health = this.health - num >= 0 ? this.health - num : 0;
        let myUI = document.querySelector(`.${this.classMap[this.index]}`);
        let newAngle = (10 - this.health) * 36;
        myUI.style.setProperty(`--angle${this.index}`, `${newAngle}`);
        if (this.health <= 4 && this.health > 2)
            myUI.style.stroke = "yellow";
        else if (this.health <= 2)
            myUI.style.stroke = "red";
    }
    resetHealth() {
        this.health = 10;
        let myUI = document.querySelector(`.${this.classMap[this.index]}`);
        myUI.style.setProperty(`--angle${this.index}`, `${0}`);
        myUI.style.stroke = "lime";
    }
    addStatusMessage(msg) {
        this.statusEffects.push(msg);
        //reset ALL the angles of each status
        this.statusEffects.forEach((se, index) => {
            const startingRotation = -90 - ((this.statusEffects.length - 1) * 25) / 2;
            const indexedRotation = index * 25;
            const rotation = startingRotation + indexedRotation;
            se.angle = rotation;
            se.negAngle = -rotation;
        });
    }
    removeStatusMessage(msg) { }
    clearStatusMessages() {
        this.statusEffects.length = 0;
    }
}


/***/ }),

/***/ "./src/components/chat.ts":
/*!********************************!*\
  !*** ./src/components/chat.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Chat": () => (/* binding */ Chat)
/* harmony export */ });
/* harmony import */ var _assets_assetPool__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../assets/assetPool */ "./src/assets/assetPool.ts");

class Chat {
    constructor(state) {
        this.componentName = "myChat";
        this.template = `
        <div class="chat_Component">
          <div class="chat_messageContainer" \${===myChat.isActive}>
            <!- messages field ->

            <div id="chatdiv" class="chat_message_innerContainer">
            <div class="\${msg.type}" \${msg<=*myChat.messages}>
            <!- peasy many to one binding for each message ->
            <p>\${msg.message}</p>
          </div>
            </div>

           
            <div>
              <!- input field ->
              <div>
                <input class="chat_inputtext" type="text" \${value<=>myChat.inputMessage} \${click@=>myChat.selectText}></input>
              </div>
              <!- message icon ->
              <div>
                <img class="chat_input_icon" width="25" height="25" alt="" src="${_assets_assetPool__WEBPACK_IMPORTED_MODULE_0__.bubble}" \${click@=>myChat.sendMessage}/>  
              </div>
            </div>
          </div>
          <div class="chat_iconContainer">
            <div \${click@=>myChat.toggleChat}>
              <!- messaging icon->
              <img width="30" height="30" alt="" src="${_assets_assetPool__WEBPACK_IMPORTED_MODULE_0__.bubble}"/>
            </div>
            <div class="chat_unreadpill" \${===myChat.showPill}  \${click@=>myChat.toggleChat}>
              <span>\${myChat.numUnreadMessages}</span>
              <!- unread messages pill ->
            </div>
          </div>
            
          
        </div>
          `;
        this.localState = state;
    }
}
/**
 * when rendered, this should create a keybinding for the message enter
 * and when unrendered, this should destroy that binding
 */


/***/ }),

/***/ "./src/components/game.ts":
/*!********************************!*\
  !*** ./src/components/game.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Game": () => (/* binding */ Game)
/* harmony export */ });
/* harmony import */ var _assets_assetPool__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../assets/assetPool */ "./src/assets/assetPool.ts");
/* harmony import */ var _components_index__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../components/index */ "./src/components/index.ts");


class Game {
    constructor(state) {
        this.componentName = "myGameScreen";
        this.localState = state;
        this.cardPool = new _components_index__WEBPACK_IMPORTED_MODULE_1__.CardPool(state);
        this.toast = new _components_index__WEBPACK_IMPORTED_MODULE_1__.Toast(state);
        this.chat = new _components_index__WEBPACK_IMPORTED_MODULE_1__.Chat(state);
        this.toast.init();
        this.pui = new _components_index__WEBPACK_IMPORTED_MODULE_1__.pUI(state);
        this.hand = new _components_index__WEBPACK_IMPORTED_MODULE_1__.Hand(state);
        this.location = new _components_index__WEBPACK_IMPORTED_MODULE_1__.Location(state);
        this.towerD = new _components_index__WEBPACK_IMPORTED_MODULE_1__.Tower(state);
        this.settings = new _components_index__WEBPACK_IMPORTED_MODULE_1__.Settings(state);
        this.monster = new _components_index__WEBPACK_IMPORTED_MODULE_1__.Monster(state);
        this.navBar = new _components_index__WEBPACK_IMPORTED_MODULE_1__.NavBar(state);
        this.navInput = new _components_index__WEBPACK_IMPORTED_MODULE_1__.NavInput(state);
        this.messageOverlay = new _components_index__WEBPACK_IMPORTED_MODULE_1__.MessageOverlay(state);
        this.template = `
    
    <img class="game_menu_icon" src="${_assets_assetPool__WEBPACK_IMPORTED_MODULE_0__.settings}" alt="" \${click@=>mypUI.showOptions}>
    
    ${this.cardPool.template}
    ${this.toast.template}
    ${this.chat.template}
    ${this.pui.template}
    ${this.hand.template}
    ${this.location.template}
    ${this.towerD.template}
    ${this.settings.template}
    ${this.monster.template}
    ${this.navBar.template}
    ${this.navInput.template}
    ${this.messageOverlay.template}
    `;
    }
}
//


/***/ }),

/***/ "./src/components/gameContainer.ts":
/*!*****************************************!*\
  !*** ./src/components/gameContainer.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "GameContainer": () => (/* binding */ GameContainer),
/* harmony export */   "Router": () => (/* binding */ Router)
/* harmony export */ });
/* harmony import */ var _index__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./index */ "./src/components/index.ts");

var Router;
(function (Router) {
    Router[Router["Title"] = 0] = "Title";
    Router[Router["Lobby"] = 1] = "Lobby";
    Router[Router["Character"] = 2] = "Character";
    Router[Router["Staging"] = 3] = "Staging";
    Router[Router["Game"] = 4] = "Game";
})(Router || (Router = {}));
class GameContainer {
    constructor(state) {
        this.componentName = "myContainer";
        this.localState = state;
        this.Title = new _index__WEBPACK_IMPORTED_MODULE_0__.TitleComponent(state);
        this.Lobby = new _index__WEBPACK_IMPORTED_MODULE_0__.LobbyComponent(state);
        this.SceneTransitionComponent = new _index__WEBPACK_IMPORTED_MODULE_0__.SceneTransition(state);
        this.charScreen = new _index__WEBPACK_IMPORTED_MODULE_0__.CharScreen(state);
        this.myStaging = new _index__WEBPACK_IMPORTED_MODULE_0__.StagingComponent(state);
        this.game = new _index__WEBPACK_IMPORTED_MODULE_0__.Game(state);
        this.template = `
    <div class="container">
        ${this.SceneTransitionComponent.template}           
        <div class="titlescreen" \${===myContainer.isTitle}>
          ${this.Title.template}
        </div>
        
        <div class="lobbyscreen" \${===myContainer.isLobby}>
          ${this.Lobby.template}
        </div>
        
        <div class="charscreen" \${===myContainer.isCharacter}>
          ${this.charScreen.template}
        </div>

        <div class="stagingScreen" \${===myContainer.isStaging}>
          ${this.myStaging.template}
        </div>
        
        <div class="gamescreen" \${=== myContainer.isGame}>
          ${this.game.template}
        </div>
    </div>
    `;
    }
}


/***/ }),

/***/ "./src/components/hand.ts":
/*!********************************!*\
  !*** ./src/components/hand.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Hand": () => (/* binding */ Hand)
/* harmony export */ });
class Hand {
    constructor(state) {
        this.componentName = "myHand";
        this.template = `

       <div class="hand_blurdiv" \${===myHand.isVisible}>
          <div class="hand_container" >
            <div class="hand">
              <div id="\${card.id}" class="card_container" \${card<=*myHand.hand:id} \${click@=>myHand.clickHandler}>
                      <div class="card_title">\${card.title}</div>
                      <div class="card_level">Level \${card.level}</div>
                      <div class="card_desc">\${card.effectString}</div>
              </div>
              <button class="lobbyButton card_done_button" \${click@=>myHand.done}  \${===myHand.isEmpty}>FINISHED</button>
            </div>
            <div class="footer">
                  \${myHand.footer}
            </div>
          </div>
       </div>
            `;
        this.localState = state;
    }
}


/***/ }),

/***/ "./src/components/help.ts":
/*!********************************!*\
  !*** ./src/components/help.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Help": () => (/* binding */ Help)
/* harmony export */ });
/* harmony import */ var _assets_assetPool__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../assets/assetPool */ "./src/assets/assetPool.ts");

class Help {
    constructor(state) {
        this.componentName = "myHelp";
        this.template = `
      <div class="settings_container" \${===myHelp.isVisible}> 
        <div class="setting_relative_container">
            <div class="settings_background_mask">
            </div>
            <div class="help_inner_container">
                <span class="help_title">How To Play</span>
                <span class="help_pagenum">Page \${myHelp.pageNum} / \${myHelp.numPages}</span>
                <div class="help_text" \${===myHelp.page1}>
                  <p>  
                  How to play</p>
                  
                  <p>
                  Introduction
                  </p>

                  <p>
                  Demon Siege is a cooperative, multiplayer deck building game. Game hosts upto 4 players concurrently.  The full game will have 8 levels of increasing difficulty to complete.  
                  As the game progresses, the characters will gain additional skills and bonuses.</p>
                  <p>
                  Objective
                  </p>
                  <p>
                  The objective of each round is to defeat all the monsters on that level before the monsters capture all the available locations for that level.
                  
                  </p>
                </div>
                <div class="help_text" \${===myHelp.page2}>
                  <p>Play Format</p>

                  <p>
                  Each player takes turn for each round.  For each players turn, first a Tower Defense card is played, and the corresponding effects, either passive or active, are applied for each Tower Defense card.
                  </p>
                  
                  <p>After the Tower Defense cards are played, then each active Monster card is then played, with their effects being applied.  After the Tower Defense cards are played and all the Monster cards are played, then the active players hand becomes active.
                  </p>

                  <p>
                  The player can play any of their cards in any order, and the player's turn is completed after all their cards are played.  Each player's card will have an effect to apply, which can include gaining coins, attack points, healing, and so forth.
                  </p>


                  At any time during the players turn, they can choose to spend coins gathered within that turn, and buy additional ability cards from the card pool.  These new purchased cards will be added to the players discard pile, and will be available on the next shuffle.
                  
                  As attack points are collected, the player may choose to apply them to the active monsters of their choosing.  When the cumulative damage for the monster reaches their health level, the monster is defeated, and discarded.
                  
                  The round ends when all the monsters for the level are defeated.
                  </p>
                  
                </div>

                <div class="help_text" \${===myHelp.page3}>
                  <p>
                  Getting Started
                  </p>

                  <p>
                  This is a mulitplayer game, so when player reaches landing site, they must click the 'Login' button to login to the server.  In the lobby, the user will be able to select between logging out, creating a new game, or joining an existing game.
                  </p>
                  <p>Logging out will send player back to the title screen.</p>
                  
                  <p>Create New Game will send player to character creation screen.</p>
                  
                  <p>Join Game will open a popup to acquire the game ID for the existing game to join, then onto the character creation screen.</p>
                  
                  </p>
                </div>

                <div class="help_text" \${===myHelp.page4}>
                <p>  Character Creation</p>

                <p>
                There are 4 classes of characters, and 2 genders that can be selected.</p> <p> There are no applicable difference between genders, just modified sprites.  Each class has some specializations though.  
                The starting deck for each character is determined by their class.  As levels increase, each class receives tailored perks and bonuses based on class.
                
                Barbarian: Attack oriented
                Wizard: Ability point oriented
                Paladin: Team support oriented
                Rogue: Balanced
                
                You must enter a character name to display to proceed past this screen.
                </p>
                <p>
                Staging Screen</p>
                
                This is where all the joined players are staged and waiting until match is started.
                  </p>
                </div>
                <img \${click@=>myHelp.back} class="help_nav_left" src="${_assets_assetPool__WEBPACK_IMPORTED_MODULE_0__.arrow}" alt="" />
                <img \${click@=>myHelp.next} class="help_nav_right" src="${_assets_assetPool__WEBPACK_IMPORTED_MODULE_0__.arrow}" alt="" />
                <button class="lobbyButton settings_ok" \${click@=>myHelp.closeModal}>OK</button>
            </div>
        </div>
      </div>
        `;
        this.localState = state;
    }
}


/***/ }),

/***/ "./src/components/index.ts":
/*!*********************************!*\
  !*** ./src/components/index.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Card": () => (/* reexport safe */ _card__WEBPACK_IMPORTED_MODULE_12__.Card),
/* harmony export */   "CardPool": () => (/* reexport safe */ _cardPool__WEBPACK_IMPORTED_MODULE_8__.CardPool),
/* harmony export */   "CharScreen": () => (/* reexport safe */ _charScreen__WEBPACK_IMPORTED_MODULE_5__.CharScreen),
/* harmony export */   "Chat": () => (/* reexport safe */ _chat__WEBPACK_IMPORTED_MODULE_7__.Chat),
/* harmony export */   "Game": () => (/* reexport safe */ _game__WEBPACK_IMPORTED_MODULE_6__.Game),
/* harmony export */   "GameContainer": () => (/* reexport safe */ _gameContainer__WEBPACK_IMPORTED_MODULE_0__.GameContainer),
/* harmony export */   "Hand": () => (/* reexport safe */ _hand__WEBPACK_IMPORTED_MODULE_11__.Hand),
/* harmony export */   "LobbyComponent": () => (/* reexport safe */ _lobby__WEBPACK_IMPORTED_MODULE_4__.LobbyComponent),
/* harmony export */   "Location": () => (/* reexport safe */ _location__WEBPACK_IMPORTED_MODULE_13__.Location),
/* harmony export */   "MessageOverlay": () => (/* reexport safe */ _messageOverlay__WEBPACK_IMPORTED_MODULE_20__.MessageOverlay),
/* harmony export */   "Monster": () => (/* reexport safe */ _monsterarea__WEBPACK_IMPORTED_MODULE_16__.Monster),
/* harmony export */   "NavBar": () => (/* reexport safe */ _navbar__WEBPACK_IMPORTED_MODULE_18__.NavBar),
/* harmony export */   "NavInput": () => (/* reexport safe */ _navInput__WEBPACK_IMPORTED_MODULE_19__.NavInput),
/* harmony export */   "PointPlacard": () => (/* reexport safe */ _pointPlacard__WEBPACK_IMPORTED_MODULE_21__.PointPlacard),
/* harmony export */   "Router": () => (/* reexport safe */ _gameContainer__WEBPACK_IMPORTED_MODULE_0__.Router),
/* harmony export */   "SceneTransition": () => (/* reexport safe */ _SceneTransition__WEBPACK_IMPORTED_MODULE_1__.SceneTransition),
/* harmony export */   "Settings": () => (/* reexport safe */ _settings__WEBPACK_IMPORTED_MODULE_15__.Settings),
/* harmony export */   "StagingComponent": () => (/* reexport safe */ _staging__WEBPACK_IMPORTED_MODULE_3__.StagingComponent),
/* harmony export */   "StatusEffect": () => (/* reexport safe */ _statusEffect__WEBPACK_IMPORTED_MODULE_17__.StatusEffect),
/* harmony export */   "TitleComponent": () => (/* reexport safe */ _title__WEBPACK_IMPORTED_MODULE_2__.TitleComponent),
/* harmony export */   "Toast": () => (/* reexport safe */ _toast__WEBPACK_IMPORTED_MODULE_9__.Toast),
/* harmony export */   "Tower": () => (/* reexport safe */ _towerD__WEBPACK_IMPORTED_MODULE_14__.Tower),
/* harmony export */   "pUI": () => (/* reexport safe */ _playerUI__WEBPACK_IMPORTED_MODULE_10__.pUI)
/* harmony export */ });
/* harmony import */ var _gameContainer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./gameContainer */ "./src/components/gameContainer.ts");
/* harmony import */ var _SceneTransition__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./SceneTransition */ "./src/components/SceneTransition.ts");
/* harmony import */ var _title__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./title */ "./src/components/title.ts");
/* harmony import */ var _staging__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./staging */ "./src/components/staging.ts");
/* harmony import */ var _lobby__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./lobby */ "./src/components/lobby.ts");
/* harmony import */ var _charScreen__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./charScreen */ "./src/components/charScreen.ts");
/* harmony import */ var _game__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./game */ "./src/components/game.ts");
/* harmony import */ var _chat__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./chat */ "./src/components/chat.ts");
/* harmony import */ var _cardPool__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./cardPool */ "./src/components/cardPool.ts");
/* harmony import */ var _toast__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./toast */ "./src/components/toast.ts");
/* harmony import */ var _playerUI__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./playerUI */ "./src/components/playerUI.ts");
/* harmony import */ var _hand__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./hand */ "./src/components/hand.ts");
/* harmony import */ var _card__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./card */ "./src/components/card.ts");
/* harmony import */ var _location__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./location */ "./src/components/location.ts");
/* harmony import */ var _towerD__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./towerD */ "./src/components/towerD.ts");
/* harmony import */ var _settings__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./settings */ "./src/components/settings.ts");
/* harmony import */ var _monsterarea__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./monsterarea */ "./src/components/monsterarea.ts");
/* harmony import */ var _statusEffect__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./statusEffect */ "./src/components/statusEffect.ts");
/* harmony import */ var _navbar__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./navbar */ "./src/components/navbar.ts");
/* harmony import */ var _navInput__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ./navInput */ "./src/components/navInput.ts");
/* harmony import */ var _messageOverlay__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ./messageOverlay */ "./src/components/messageOverlay.ts");
/* harmony import */ var _pointPlacard__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ./pointPlacard */ "./src/components/pointPlacard.ts");
























/***/ }),

/***/ "./src/components/lobby.ts":
/*!*********************************!*\
  !*** ./src/components/lobby.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "LobbyComponent": () => (/* binding */ LobbyComponent)
/* harmony export */ });
/* harmony import */ var _assets_assetPool__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../assets/assetPool */ "./src/assets/assetPool.ts");
/* harmony import */ var _settings__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./settings */ "./src/components/settings.ts");


class LobbyComponent {
    constructor(state) {
        this.componentName = "myLobby";
        this.localState = state;
        this.settings = new _settings__WEBPACK_IMPORTED_MODULE_1__.Settings(state);
        this.template = `
    <div class="mainLobby"><span>\${myLobby.title}</span></div>
    <div class="sLobby"><span>\${myLobby.subtitle}</span></div>
    <img class="game_menu_icon" src="${_assets_assetPool__WEBPACK_IMPORTED_MODULE_0__.settings}" alt="" \${click@=>mypUI.showOptions}>
    ${this.settings.template}
    <div class="buttonflex">
      <button class="lobbyButton b1" \${click@=>myLobby.createGame}>Create New Game</button>
      <button class="lobbyButton b2" \${click@=>myLobby.joinGame}>Join Existing Game</button>
      
      <button class="lobbyButton b3" \${click@=>myLobby.logout}>Logout</button>
    </div>
    <div class="joinflex" \${===myLobby.isJoining}>
        <label for="joinGameInput">Enter Game ID</label>
        <input id="joinGameInput" \${input@=>myLobby.validate} class=\${myLobby.validationCSSstring} \${value==>gameData.gameID}/>
        <button class="lobbyButton b4" \${click@=>myLobby.connect} \${disabled<==myLobby.buttonEnable}>Join</button>
    </div>
    <div class="loginText">
        <span>Logged in as: \${playerData.username}</span>
    </div>`;
    }
}
//<button class="lobbyButton b2" \${click@=>myLobby.findGame}>Find Existing Game</button>


/***/ }),

/***/ "./src/components/location.ts":
/*!************************************!*\
  !*** ./src/components/location.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Location": () => (/* binding */ Location)
/* harmony export */ });
class Location {
    constructor(state) {
        this.componentName = "myLocation";
        this.template = `
    <div class="loc_container" >
        <div class="loc_rel_container \${myLocation.cssString}">
            <span class="loc_title">Location Card</span>
            <div class="loc_card" \${===myLocation.isVisible}>
                <div  class="loc_card_title">\${myLocation.title}</div>
                <div  class="loc_card_level">Level \${myLocation.level}</div>
                <div  class="loc_card_health">Influence Points \${myLocation.damage}/\${myLocation.health}</div>
                <div  class="loc_card_sequence">Sequence \${myLocation.sequence}/3</div>
            </div>
        </div>
    </div>
`;
        this.localState = state;
    }
}


/***/ }),

/***/ "./src/components/messageOverlay.ts":
/*!******************************************!*\
  !*** ./src/components/messageOverlay.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "MessageOverlay": () => (/* binding */ MessageOverlay)
/* harmony export */ });
class MessageOverlay {
    constructor(state) {
        this.componentName = "myMessageOverlay";
        this.template = `
    <div class="MO_container" \${===myMessageOverlay.isVisble}>
        <div class="MO_relative">
            <div class="MO_main">\${myMessageOverlay.mainMessage}</div>
            <div class="MO_sub">\${myMessageOverlay.subMessage}</div>
        </div>
    </div>
    `;
        this.localState = state;
    }
}


/***/ }),

/***/ "./src/components/monsterarea.ts":
/*!***************************************!*\
  !*** ./src/components/monsterarea.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Monster": () => (/* binding */ Monster)
/* harmony export */ });
class Monster {
    constructor(state) {
        this.componentName = "myMonster";
        this.template = `
      <div  class="monster_container" >
          <div  class="monster_rel_container" >
              <span class="monster_title">Monster Card</span>
              <div id="mon" class="monster_card_outer \${myMonster.cssString}" $\{===myMonster.isVisible}>
                <div id="\${monster.id}" class="monster_card"  \${monster<=*gameData.activeMonsters} \${click@=>myMonster.clickHandler}>
                  <div class="topside">
                    <div  class="monster_card_title">\${monster.title}</div>
                    <div  class="monster_card_level">Level \${monster.level}</div>
                    <div  class="monster_card_health">Health: \${monster.damage}/\${monster.health}</div>
                    <div class="monster_card_description">\${monster.effectstring}</div>
                  </div>
                  <div class="bottomside">
                    <div  class="monster_card_subtitle">\${monster.title}</div>
                    <div class="monster_card_reward">Reward: \${monster.rewardstring}</div>
                  </div>    
                </div>
              </div>
              
          </div>
      </div>
  `;
        this.localState = state;
    }
}


/***/ }),

/***/ "./src/components/navInput.ts":
/*!************************************!*\
  !*** ./src/components/navInput.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "NavInput": () => (/* binding */ NavInput)
/* harmony export */ });
class NavInput {
    constructor(state) {
        this.componentName = "myNavInput";
        this.template = `
    <div class="NIcontainer" \${===myNavInput.isVisible} style="--component-top: \${myNavInput.contTop}; --component-width: \${myNavInput.contWidth}; --component-zh: \${myNavInput.contZ}" >
        <button \${button<=*myNavInput.buttons}  \${mouseup@=>button.unaction} \${mousedown@=>button.action} class="NIbutton \${button.style}">\${button.label}</button>
    </div>
      `;
        this.localState = state;
    }
    init() { }
}


/***/ }),

/***/ "./src/components/navbar.ts":
/*!**********************************!*\
  !*** ./src/components/navbar.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "NavBar": () => (/* binding */ NavBar)
/* harmony export */ });
class NavBar {
    constructor(state) {
        this.componentName = "myNavBar";
        this.template = `
    <div class="NBtimeline" \${===myNavBar.showNavBar}>
        <div data-state='\${ts.data}' class='NBtimestamp \${ts.style}' \${ts<=*myNavBar.timestamps} \${click@=>myNavBar.increment}>
        <div class=NBtimestap_rel>
            <p>\${ts.title}</p>
            <span class="NBdone" \${===ts.doneFlag}>\${ts.done}</span>
            <div class="NBconnector \${ts.connStyle}" \${===ts.connector}> </div>
        </div>
        </div>
    </div>
    `;
        this.localState = state;
    }
}


/***/ }),

/***/ "./src/components/playerUI.ts":
/*!************************************!*\
  !*** ./src/components/playerUI.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "pUI": () => (/* binding */ pUI)
/* harmony export */ });
/* harmony import */ var _statusEffect__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./statusEffect */ "./src/components/statusEffect.ts");
/* harmony import */ var _assets_assetPool__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../assets/assetPool */ "./src/assets/assetPool.ts");
/* harmony import */ var _pointPlacard__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./pointPlacard */ "./src/components/pointPlacard.ts");



class pUI {
    constructor(state) {
        this.componentName = "myUI";
        this.localState = state;
        this.statusEffect = new _statusEffect__WEBPACK_IMPORTED_MODULE_0__.StatusEffect(state);
        this.atkPlac = new _pointPlacard__WEBPACK_IMPORTED_MODULE_2__.PointPlacard(state, "attack");
        this.coinPlac = new _pointPlacard__WEBPACK_IMPORTED_MODULE_2__.PointPlacard(state, "coin");
        this.template = `
    <div class="pui_Container" \${mouseout@=>mypUI.clear} \${mousemove@=>mypUI.checkHover}>
        <div id="pui_\${player.$index}" class="pui_playerContainer"  \${player<=*mypUI.allPlayers}>
            
                ${this.statusEffect.template}
                <p class="pui_coin_text">\${player.coin}</p>
                <p class="pui_atk_text">\${player.attack}</p>
                <img class="pui_atkIMG" src=${_assets_assetPool__WEBPACK_IMPORTED_MODULE_1__.atk} alt="" width="25" height="25"/>
                ${this.atkPlac.template}
                <img class="pui_coinIMG" src=${_assets_assetPool__WEBPACK_IMPORTED_MODULE_1__.coin} alt="" width="25" height="25"/>
                ${this.coinPlac.template}
                <img class="pui_character" src="\${player.img}" alt="" width="60" height="100" \${mouseenter@=>player.setHover} \${mouseleave@=>player.clearHover} />
                <svg class="pui_svg \${player.bloomStatus}" >
                    <style>
                      pui_meter-\${player.index}{
                        stroke-dashoffset: calc((65 * 0.01745 * 36)*(10-\${player.health}));
                      }
                    </style>
                    <circle class="pui_bg" cx="70" cy="70" r="65" />
                    <circle class="pui_meter-\${player.index}" cx="70" cy="70" r="65" />
                </svg>
            
        </div>
    </div>
      `;
    }
}
//${this.atkPlac.template}
//${this.coinPlac.template}


/***/ }),

/***/ "./src/components/pointPlacard.ts":
/*!****************************************!*\
  !*** ./src/components/pointPlacard.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PointPlacard": () => (/* binding */ PointPlacard)
/* harmony export */ });
class PointPlacard {
    constructor(state, mode) {
        this.componentName = "myPointPlacard";
        this.localState = state;
        if (mode == "attack")
            this.template = `
      <div class="Plac_container Plac_atk" \${===player.attackPlacard.isVisible} style="transform: translateY(\${player.attackPlacard.offset}px); opacity: \${player.attackPlacard.opacity};">
          <div class="Plac_txt" style="color: \${player.attackPlacard.color}">\${player.attackPlacard.text}</div>
      </div>
      `;
        else if (mode == "coin")
            this.template = `
      <div class="Plac_container Plac_coin" \${===player.coinPlacard.isVisible}  style="transform: translateY(\${player.coinPlacard.offset}px); opacity: \${player.coinPlacard.opacity};" >
          <div class="Plac_txt" style="color: \${player.coinPlacard.color}">\${player.coinPlacard.text}</div>
      </div>
      `;
    }
}


/***/ }),

/***/ "./src/components/settings.ts":
/*!************************************!*\
  !*** ./src/components/settings.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Settings": () => (/* binding */ Settings)
/* harmony export */ });
class Settings {
    constructor(state) {
        this.componentName = "mySettings";
        this.template = `
      <div class="settings_container" \${===mySettings.showModal}> 
        <div class="setting_relative_container">
            <div class="settings_background_mask">
            </div>
            <div class="settings_inner_container">
                <div class="settings_inner_cont_rel">
                    <div class="setting_title">
                        <span>Settings</span>
                    </div>

                    <div class="settings_chat_cont">
                        <div class="settings_chat_rel">
                            <span class="settings_chat_label" >Chat</span>
                            <label class="settings_chat_um_label" >User Messages</label>
                            <input class="settings_chat_um_color" type="color" \${value<=>mySettings.chatUM} ></input>
                            <label class="settings_chat_sys_label" >System Messages</label>
                            <input class="settings_chat_sys_color" type="color" \${value<=>mySettings.chatSM} ></input>
                            <label class="settings_chat_om_label" >Other Messages</label>
                            <input class="settings_chat_om_color" type="color" \${value<=>mySettings.chatOM} ></input>
                            <label class="settings_chat_bg_label" >Background</label>
                            <input class="settings_chat_bg_color" type="color" \${value<=>mySettings.chatBG} ></input>
                            <label class="settings_chat_op_label" >Opacity</label>
                            <input class="settings_chat_op_color" type="range" min="0" max="1" step="0.1" \${value<=>mySettings.chatOP} ></input>
                        </div>
                        
                    </div>

                    <div class="settings_screen_color_cont">
                        <div class="settings_chat_rel">
                            <span class="settings_screen_color_label" >Screen Color</span>
                            <label class="settings_screen_color_label_beg" >Beginning</label>
                            <input class="settings_screen_color_color_beg" type="color" \${value<=>mySettings.beginningColor} ></input>
                            <label class="settings_screen_color_label_end" >Ending</label>
                            <input class="settings_screen_color_color_end" type="color" \${value<=>mySettings.endingColor} ></input>
                        </div>
                    </div>

                    <div class="settings_gamespeed_cont">
                        <div class="settings_chat_rel">
                            <span class="settings_gamespeed_label" >Game Speed</span>
                            <label class="settings_gamespeed_label_low" >Slow</label>
                            <input class="settings_gamespeed_slider" type="range"  ></input>
                            <label class="settings_gamespeed_label_high" >Fast</label>
                        </div>
                       
                    </div>

                    <div class="settings_sfx_cont">
                        <div class="settings_chat_rel">
                            <span class="settings_sfx_label" >SFX Volume</span>
                            <img class="settings_sfx_icon" src="\${mySettings.sfxIcon}" alt=""  \${click@=>mySettings.muteSFX}/>
                            <label class="settings_sfx_label_low" >Low</label>
                            <input class="settings_sfx_slider" type="range" \${value<=>mySettings.sfxGain} \${input@=>mySettings.changeSFX}  min="0" max="1"  step="0.05"></input>
                            <label class="settings_sfx_label_high" >High</label>
                        </div>
                        
                    </div>

                    <div class="settings_bgm_cont">
                        <div class="settings_chat_rel">
                            <span class="settings_bgm_label" >Music Volume</span>
                            <img class="settings_bgm_icon" src="\${mySettings.bgmIcon}" alt=""  \${click@=>mySettings.muteBGM}/>
                            <label class="settings_bgm_label_low">Low</label>
                            <input class="settings_bgm_range_slider" type="range" min="0" max="1"  step="0.05" \${value<=>mySettings.bgmGain} \${input@=>mySettings.changeBGM} ></input>
                            <label class="settings_bgm_label_high">High</label>
                        </div>
                    </div>
                </div>
                <button class="lobbyButton settings_ok" \${click@=>mySettings.closeModal}>OK</button>
            </div>
        </div>
      </div>
        `;
        this.localState = state;
    }
}


/***/ }),

/***/ "./src/components/staging.ts":
/*!***********************************!*\
  !*** ./src/components/staging.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "StagingComponent": () => (/* binding */ StagingComponent)
/* harmony export */ });
/* harmony import */ var _assets_assetPool__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../assets/assetPool */ "./src/assets/assetPool.ts");
/* harmony import */ var _settings__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./settings */ "./src/components/settings.ts");


class StagingComponent {
    constructor(state) {
        this.componentName = "myStaging";
        this.localState = state;
        this.settings = new _settings__WEBPACK_IMPORTED_MODULE_1__.Settings(state);
        this.template = `
  <div class="stg_Screentitle">Game Staging Selection</div>
    <div class="stg_Container" \${===myStaging.isVisible}>
      ${this.settings.template}
      <img class="game_menu_icon" src="${_assets_assetPool__WEBPACK_IMPORTED_MODULE_0__.settings}" alt="" \${click@=>mypUI.showOptions}>
      <div class="stg_PlayerEntry" \${players <=* myStaging.group} >
        <span class="stg_textSpan">Player \${players.index} : </span>
        <span class="stg_textSpan">\${players.name}</span>
        <img src="\${players.img}" alt=""/>
      </div>                 
    </div>
          
    <div class="stg_buttonflex">
        <button class="lobbyButton" \${===myStaging.isVisible} \${click@=>myStaging.back}>Back</button>
        <button class="lobbyButton" \${===myStaging.isVisible} \${click@=>myStaging.logout}>Logout</button>
        <button class="lobbyButton" \${===myStaging.isVisible} \${click@=>myStaging.start}>Start Game</button>
    </div>
    
    <div class="loginText">
    <p>Logged in as: \${playerData.username}</p>
    <p>Game ID is \${gameData.gameID}</p>
  </div>`;
    }
}


/***/ }),

/***/ "./src/components/statusEffect.ts":
/*!****************************************!*\
  !*** ./src/components/statusEffect.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "StatusEffect": () => (/* binding */ StatusEffect)
/* harmony export */ });
class StatusEffect {
    constructor(state) {
        this.componentName = "myStatusEffect";
        this.localState = state;
        this.template = `
    <div class="SE_container">
           <div class="SE_rel">
                <div class="SE_status_effect_cont" \${effect<=*player.statusEffects} style="transform: rotate(\${effect.angle}deg);" >
                    <div class="SE_status_effect" style="transform: rotate(\${effect.negAngle}deg);"  >
                        <img  class="SE_status_effect_img" alt="" src="\${effect.img}" />
                        <span class="tooltip">\${effect.effect}</span>
                    </div>
                </div>
           </div>
      </div>`;
    }
}


/***/ }),

/***/ "./src/components/title.ts":
/*!*********************************!*\
  !*** ./src/components/title.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "TitleComponent": () => (/* binding */ TitleComponent)
/* harmony export */ });
/* harmony import */ var _assets_assetPool__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../assets/assetPool */ "./src/assets/assetPool.ts");
/* harmony import */ var _settings__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./settings */ "./src/components/settings.ts");
/* harmony import */ var _help__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./help */ "./src/components/help.ts");



class TitleComponent {
    constructor(state) {
        this.componentName = "myTitle";
        this.settings = new _settings__WEBPACK_IMPORTED_MODULE_1__.Settings(state);
        this.localState = state;
        this.help = new _help__WEBPACK_IMPORTED_MODULE_2__.Help(state);
        this.template = `
    <span class="version">\${myTitle.version}</span>
    <div class="mainTitle" >
      <span>\${myTitle.title}</span>
    </div>
    <div class="STitle" >
      <span>\${myTitle.subtitle}</span>
    </div>
    <div>
      <button class="titleButton" \${click@=>myTitle.login}>LOGIN</button>
      <img class="titleHelp" src="${_assets_assetPool__WEBPACK_IMPORTED_MODULE_0__.help}" alt="" \${click@=>myHelp.showModal}/>
      <img class="game_menu_icon" src="${_assets_assetPool__WEBPACK_IMPORTED_MODULE_0__.settings}" alt="" \${click@=>mypUI.showOptions}>
      ${this.help.template}
      ${this.settings.template}
    </div>`;
    }
}


/***/ }),

/***/ "./src/components/toast.ts":
/*!*********************************!*\
  !*** ./src/components/toast.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Toast": () => (/* binding */ Toast)
/* harmony export */ });
class Toast {
    constructor(state) {
        this.componentName = "myGameScreen";
        this.template = `
  <div class="container">
    <div class="toast_container">
        <div  class="toast_entry" \${msg<=*myToast.messages} >
            <div id="elm_\${msg.$index}"  class="toast_img_container bloom">
                    <img \${mouseover@=>msg.hover} class="toast_img" src="\${msg.img}" alt=""/>    
            </div>
            <div  class="toast_message">\${msg.msg}</div>
            <div \${click@=>msg.close} class="toast_close">X</div>
        </div>
    </div>
  </div>
  `;
        this.isHover = e => e.parentElement.querySelector(":hover") === e;
        this.localState = state;
    }
    init() {
        this.localState.state.myToast.intervalID = setInterval(() => {
            //update all toast timers
            const numMessages = this.localState.state.myToast.messages.length;
            if (numMessages > 0) {
                for (let index = numMessages - 1; index >= 0; index--) {
                    let elm = document.getElementById(`elm_${index}`);
                    if (!this.isHover(elm)) {
                        this.localState.state.myToast.messages[index].timeOut -= 500;
                        if (this.localState.state.myToast.messages[index].timeOut <= 0) {
                            this.localState.state.myToast.messages.splice(index, 1);
                        }
                    }
                }
            }
        }, 500);
    }
}


/***/ }),

/***/ "./src/components/towerD.ts":
/*!**********************************!*\
  !*** ./src/components/towerD.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Tower": () => (/* binding */ Tower)
/* harmony export */ });
class Tower {
    constructor(state) {
        this.componentName = "myTowerD";
        this.template = `
    <div class="td_container" >
        <div class="td_rel_container ">
            <span class="td_title">Tower Defense Card</span>
            <div class="td_card \${myTowerD.cssString}" \${===myTowerD.isVisible} \${click@=>myTowerD.clicked}>
                <div  class="td_card_title">\${myTowerD.title}</div>
                <div  class="td_card_level">Level \${myTowerD.level}</div>
                <div  class="td_card_desc">\${myTowerD.desc}</div>
            </div>
        </div>
    </div>
`;
        this.localState = state;
    }
}


/***/ }),

/***/ "./src/events.ts":
/*!***********************!*\
  !*** ./src/events.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ChangeMonster": () => (/* binding */ ChangeMonster),
/* harmony export */   "MonsterPlayed": () => (/* binding */ MonsterPlayed),
/* harmony export */   "add1Attack": () => (/* binding */ add1Attack),
/* harmony export */   "add1Coin": () => (/* binding */ add1Coin),
/* harmony export */   "add2Attack": () => (/* binding */ add2Attack),
/* harmony export */   "add2Coin": () => (/* binding */ add2Coin),
/* harmony export */   "anyPlayer1Coin": () => (/* binding */ anyPlayer1Coin),
/* harmony export */   "anyPlayer1Health": () => (/* binding */ anyPlayer1Health),
/* harmony export */   "bloomMonsters": () => (/* binding */ bloomMonsters),
/* harmony export */   "cardpurchased": () => (/* binding */ cardpurchased),
/* harmony export */   "chooseAtk1Coin1": () => (/* binding */ chooseAtk1Coin1),
/* harmony export */   "chooseAtk1Draw1": () => (/* binding */ chooseAtk1Draw1),
/* harmony export */   "chooseCoin1Draw1": () => (/* binding */ chooseCoin1Draw1),
/* harmony export */   "chooseHealth1Coin1": () => (/* binding */ chooseHealth1Coin1),
/* harmony export */   "chooseHealth1Draw1": () => (/* binding */ chooseHealth1Draw1),
/* harmony export */   "clearSE": () => (/* binding */ clearSE),
/* harmony export */   "damageMonster": () => (/* binding */ damageMonster),
/* harmony export */   "discard1": () => (/* binding */ discard1),
/* harmony export */   "draw2NewCard": () => (/* binding */ draw2NewCard),
/* harmony export */   "drawNewCard": () => (/* binding */ drawNewCard),
/* harmony export */   "enablemonsterDamage": () => (/* binding */ enablemonsterDamage),
/* harmony export */   "endturn": () => (/* binding */ endturn),
/* harmony export */   "healOthers1": () => (/* binding */ healOthers1),
/* harmony export */   "hideCardpool": () => (/* binding */ hideCardpool),
/* harmony export */   "hideLocation": () => (/* binding */ hideLocation),
/* harmony export */   "hideTD": () => (/* binding */ hideTD),
/* harmony export */   "locDamage": () => (/* binding */ locDamage),
/* harmony export */   "loseGameOver": () => (/* binding */ loseGameOver),
/* harmony export */   "lowerHealth1": () => (/* binding */ lowerHealth1),
/* harmony export */   "lowerHealth2": () => (/* binding */ lowerHealth2),
/* harmony export */   "otherPlayer1Health": () => (/* binding */ otherPlayer1Health),
/* harmony export */   "p1Coin1": () => (/* binding */ p1Coin1),
/* harmony export */   "p1Health1": () => (/* binding */ p1Health1),
/* harmony export */   "p2Coin1": () => (/* binding */ p2Coin1),
/* harmony export */   "p2Health1": () => (/* binding */ p2Health1),
/* harmony export */   "p3Coin1": () => (/* binding */ p3Coin1),
/* harmony export */   "p3Health1": () => (/* binding */ p3Health1),
/* harmony export */   "p4Coin1": () => (/* binding */ p4Coin1),
/* harmony export */   "p4Health1": () => (/* binding */ p4Health1),
/* harmony export */   "passives": () => (/* binding */ passives),
/* harmony export */   "playerHandDone": () => (/* binding */ playerHandDone),
/* harmony export */   "playerHandShow": () => (/* binding */ playerHandShow),
/* harmony export */   "raiseHealth1": () => (/* binding */ raiseHealth1),
/* harmony export */   "raiseHealth2": () => (/* binding */ raiseHealth2),
/* harmony export */   "readyToEndTurn": () => (/* binding */ readyToEndTurn),
/* harmony export */   "refreshHand": () => (/* binding */ refreshHand),
/* harmony export */   "remove1Location": () => (/* binding */ remove1Location),
/* harmony export */   "sendToastDiscardCurse": () => (/* binding */ sendToastDiscardCurse),
/* harmony export */   "sendToastDrawBlocked": () => (/* binding */ sendToastDrawBlocked),
/* harmony export */   "sendToastLocation": () => (/* binding */ sendToastLocation),
/* harmony export */   "showCardPool": () => (/* binding */ showCardPool),
/* harmony export */   "showNewLocation": () => (/* binding */ showNewLocation),
/* harmony export */   "skipMonsters": () => (/* binding */ skipMonsters),
/* harmony export */   "startEventSequence": () => (/* binding */ startEventSequence),
/* harmony export */   "startSequence": () => (/* binding */ startSequence),
/* harmony export */   "startSetupSeq": () => (/* binding */ startSetupSeq),
/* harmony export */   "startTurn": () => (/* binding */ startTurn),
/* harmony export */   "updateStatEffects": () => (/* binding */ updateStatEffects),
/* harmony export */   "winGameOver": () => (/* binding */ winGameOver)
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils */ "./src/utils.ts");
/* harmony import */ var _state_state__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./state/state */ "./src/state/state.ts");
/* harmony import */ var _assets_assetPool__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./assets/assetPool */ "./src/assets/assetPool.ts");
/* harmony import */ var _api_types__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../api/types */ "../../api/types.ts");
/* harmony import */ var _components__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./components */ "./src/components/index.ts");





let SE_map = {
    0: { img: _assets_assetPool__WEBPACK_IMPORTED_MODULE_2__.stunned, effect: "STUNNED" },
    1: { img: "", effect: "NO HEALING" },
    2: { img: _assets_assetPool__WEBPACK_IMPORTED_MODULE_2__.nodraw, effect: "CANNOT DRAW CARD" },
    3: { img: _assets_assetPool__WEBPACK_IMPORTED_MODULE_2__.location, effect: "LOCATION CURSE" },
    4: { img: _assets_assetPool__WEBPACK_IMPORTED_MODULE_2__.discard, effect: "DISCARD CURSE" },
    5: { img: _assets_assetPool__WEBPACK_IMPORTED_MODULE_2__.mBonus, effect: "MONSTER DEFEAT BONUS" },
};
let isAttackPointsZero = false;
let longdelay = { type: "delay", timeout: 1500 };
let shortdelay = { type: "delay", timeout: 300 };
let indexProgressBar_passive = { type: "indexProgress", state: "passives" };
let indexProgressBar_td = { type: "indexProgress", state: "td" };
let indexProgressBar_monster = { type: "indexProgress", state: "monster" };
let indexProgressBar_player = { type: "indexProgress", state: "player" };
let indexProgressBar_cardPool = { type: "indexProgress", state: "purchase" };
let indexProgressBar_mDamage = { type: "indexProgress", state: "damage" };
let indexProgressBar_EndTurn = { type: "indexProgress", state: "endturn" };
let indexProgressBar_reset = { type: "resetTimebar" };
let lose1Health = { type: "lowerhealth", value: 1 };
let lose2Health = { type: "lowerhealth", value: 2 };
let gain1Health = { type: "raisehealth", value: 1 };
let gain2Health = { type: "raisehealth", value: 2 };
let addAttack1 = { type: "showAttackAnimation", value: 1, message: "add" };
let addAttack2 = { type: "showAttackAnimation", value: 2, message: "add" };
let addCoin2 = { type: "showCoinAnimation", value: 2, message: "add" };
let addCoin1 = { type: "showCoinAnimation", value: 1, message: "add" };
let healOthers = { type: "healOthers", value: 1 };
let dealCards = { type: "dealCards" };
let clearscreen = { type: "clearscreen" };
let startScreen = { type: "startBanner" };
let nextRound = { type: "nextRound" };
let showStartTurn = { type: "showStartTurn" };
let setPlayerBloom = { type: "setBloom" };
let hideNavButton = { type: "hideNavButton" };
let showNavBar = { type: "showNavBar" };
let hideNavbar = { type: "hideNavBar" };
let dealTD = { type: "dealTD" };
let playerPassives = { type: "pPassives" };
let updateStatusEffects = { type: "statEffects" };
let highlightTD = { type: "TDbloom" };
let hideTDcard = { type: "hideTD" };
let enablemonsters = { type: "enableMonsters" };
let playerDamage = { type: "damageFlash" };
let playerHeal = { type: "healFlash" };
let locationDamage = { type: "locationFlash" };
let locationHeal = { type: "locationHealFlash" };
let highlightMonsters = { type: "bloomMonsters" };
let unBloomMonster = { type: "unbloomMonster" };
let promptPlayersHand = { type: "prompt_playerHand" };
let showPlayerHand = { type: "show_playerHand" };
let drawCard = { type: "draw" };
let drawCard2 = { type: "draw2" };
let choose_Atk1Coin1 = { type: "handChoiceAttack1Ability1" };
let choose_Health1Coin1 = { type: "handChoiceHealth1Ability1" };
let choose_Atk1Draw1 = { type: "handChoiceAtk1Draw1" };
let choose_Coin1Draw1 = { type: "handChoiceCoin1Draw1" };
let choose_Health1Draw1 = { type: "handChoiceHealth1Draw1" };
let hidePlayerHand = { type: "hideHand" };
let chooseOtherPlayerToHeal = { type: "otherplayerheal" };
let chooseAnyPlayerToHeal = { type: "anyplayerheal" };
let chooseAnyPlayerToCoin = { type: "anyplayercoin" };
let discard1card = { type: "discard1" };
let raisep1health = { type: "raiseOtherhealth1", value: 0 };
let raisep2health = { type: "raiseOtherhealth1", value: 1 };
let raisep3health = { type: "raiseOtherhealth1", value: 2 };
let raisep4health = { type: "raiseOtherhealth1", value: 3 };
let flashp1 = { type: "otherHealthFlash", value: 0 };
let flashp2 = { type: "otherHealthFlash", value: 1 };
let flashp3 = { type: "otherHealthFlash", value: 2 };
let flashp4 = { type: "otherHealthFlash", value: 3 };
let refreshPlayerHand = { type: "handRefresh" };
let raisep1Coin = { type: "otherCoinAdd", value: 0 };
let raisep2Coin = { type: "otherCoinAdd", value: 1 };
let raisep3Coin = { type: "otherCoinAdd", value: 2 };
let raisep4Coin = { type: "otherCoinAdd", value: 3 };
let showCardPoolEnable = { type: "prompt_CardPool" };
let openCardPool = { type: "openCardPool" };
let buycard = { type: "buyCardfromPool" };
let closeCardPool = { type: "closeCardPool" };
let enableMonsterDamage = { type: "enableMonster" };
let checkforCoins = { type: "checkCoins" };
let checkforAttack = { type: "checkForAttackPoints" };
let enableEndTurn = { type: "promptForEndTurn" };
let damagemonster = { type: "applyDamage" };
let clearSe = { type: "clearStatusEffects" };
let showMonster = { type: "monsterChange", message: "show" };
let hideMonster = { type: "monsterChange", message: "hide" };
let gameoverwin = { type: "Endbanner", message: "VICTORY" };
let gameoverlose = { type: "Endbanner", message: "FAILURE, TRY AGAIN" };
let hideloc = { type: "hidelocation" };
let shownewloc = { type: "showlocation" };
let showLocationToast = { type: "toastLocationCurse" };
let showDrawToast = { type: "toastDrawCurse" };
let showDiscardCurseToast = { type: "toastDiscardCurse" };
let returnToLogin = { type: "resetGame" };
let damageMonster = { sequence: [damagemonster] };
let startSetupSeq = { sequence: [clearscreen] };
let startSequence = { sequence: [startScreen, dealCards, showStartTurn, setPlayerBloom] };
let startTurn = {
    sequence: [hideNavButton, shortdelay, showNavBar, shortdelay, dealTD, shortdelay, playerPassives],
};
let passives = {
    sequence: [hideNavButton, shortdelay, indexProgressBar_passive, shortdelay, highlightTD],
};
let updateStatEffects = { sequence: [updateStatusEffects, shortdelay] };
let lowerHealth1 = { sequence: [playerDamage, lose1Health, shortdelay, refreshPlayerHand] };
let raiseHealth2 = { sequence: [playerHeal, gain2Health, shortdelay, refreshPlayerHand] };
let raiseHealth1 = { sequence: [playerHeal, gain1Health, shortdelay, refreshPlayerHand] };
let lowerHealth2 = { sequence: [playerDamage, lose2Health, shortdelay, refreshPlayerHand] };
let hideTD = {
    sequence: [hideTDcard, shortdelay, indexProgressBar_td, shortdelay, enablemonsters],
};
let locDamage = { sequence: [locationDamage] };
let bloomMonsters = { sequence: [highlightMonsters] };
let skipMonsters = {
    sequence: [shortdelay, indexProgressBar_monster, shortdelay, promptPlayersHand],
};
let MonsterPlayed = {
    sequence: [unBloomMonster, shortdelay, indexProgressBar_monster, promptPlayersHand],
};
let playerHandShow = { sequence: [shortdelay, showPlayerHand] };
let add1Attack = { sequence: [addAttack1, refreshPlayerHand] };
let add2Attack = { sequence: [addAttack2, refreshPlayerHand] };
let add1Coin = { sequence: [addCoin1, refreshPlayerHand] };
let add2Coin = { sequence: [addCoin2, refreshPlayerHand] };
let drawNewCard = { sequence: [drawCard, refreshPlayerHand] };
let draw2NewCard = { sequence: [drawCard2, refreshPlayerHand] };
let healOthers1 = { sequence: [healOthers, refreshPlayerHand] };
let remove1Location = { sequence: [locationHeal, refreshPlayerHand] };
let chooseAtk1Coin1 = { sequence: [choose_Atk1Coin1, refreshPlayerHand] };
let chooseHealth1Coin1 = { sequence: [choose_Health1Coin1, refreshPlayerHand] };
let chooseAtk1Draw1 = { sequence: [choose_Atk1Draw1, refreshPlayerHand] };
let chooseCoin1Draw1 = { sequence: [choose_Coin1Draw1, refreshPlayerHand] };
let chooseHealth1Draw1 = { sequence: [choose_Health1Draw1, refreshPlayerHand] };
let playerHandDone = {
    sequence: [hidePlayerHand, shortdelay, indexProgressBar_player, shortdelay, showCardPoolEnable],
};
let otherPlayer1Health = { sequence: [chooseOtherPlayerToHeal, refreshPlayerHand] };
let anyPlayer1Health = { sequence: [chooseAnyPlayerToHeal, refreshPlayerHand] };
let discard1 = { sequence: [discard1card, refreshPlayerHand] };
let p1Health1 = { sequence: [raisep1health, flashp1, refreshPlayerHand] };
let p2Health1 = { sequence: [raisep2health, flashp2, refreshPlayerHand] };
let p3Health1 = { sequence: [raisep3health, flashp3, refreshPlayerHand] };
let p4Health1 = { sequence: [raisep4health, flashp4, refreshPlayerHand] };
let refreshHand = { sequence: [refreshPlayerHand] };
let anyPlayer1Coin = { sequence: [chooseAnyPlayerToCoin, refreshPlayerHand] };
let p1Coin1 = { sequence: [raisep1Coin, refreshPlayerHand] };
let p2Coin1 = { sequence: [raisep2Coin, refreshPlayerHand] };
let p3Coin1 = { sequence: [raisep3Coin, refreshPlayerHand] };
let p4Coin1 = { sequence: [raisep4Coin, refreshPlayerHand] };
let showCardPool = { sequence: [openCardPool, shortdelay, checkforCoins] };
let cardpurchased = { sequence: [shortdelay, buycard] };
let hideCardpool = {
    sequence: [shortdelay, closeCardPool, indexProgressBar_cardPool, shortdelay, enableMonsterDamage],
};
let enablemonsterDamage = { sequence: [checkforAttack, highlightMonsters] };
let readyToEndTurn = { sequence: [indexProgressBar_mDamage, enableEndTurn] };
let endturn = {
    sequence: [indexProgressBar_EndTurn, shortdelay, indexProgressBar_reset, shortdelay, hideNavbar, nextRound, dealCards],
};
let clearSE = { sequence: [clearSe] };
let ChangeMonster = { sequence: [hideMonster, shortdelay, showMonster] };
let winGameOver = { sequence: [gameoverwin, clearscreen, returnToLogin] };
let loseGameOver = { sequence: [gameoverlose, clearscreen, returnToLogin] };
let hideLocation = { sequence: [hideloc] };
let showNewLocation = { sequence: [shortdelay, shownewloc] };
let sendToastLocation = { sequence: [showLocationToast] };
let sendToastDrawBlocked = { sequence: [showDrawToast] };
let sendToastDiscardCurse = { sequence: [showDiscardCurseToast] };
class GameEvent {
    constructor(event) {
        this.event = event;
    }
    handChoiceAttack1Ability1(resolve) {
        const usr = this.state.gameData.Players.findIndex(p => {
            return this.state.gameData.turn === p.id;
        });
        const username = this.state.gameData.Players[usr].name;
        const myTurn = this.state.gameData.Players[usr].id == this.state.playerData.id;
        if (myTurn) {
            this.state.myNavInput.contZ = "17";
            this.state.myNavInput.contWidth = "250";
            this.state.myNavInput.buttons = [
                {
                    label: "Attack +1",
                    action: () => {
                        _utils__WEBPACK_IMPORTED_MODULE_0__.utils.userResponse({
                            Callback: "chooseAttack1Ability1",
                            Response: "Attack",
                        });
                        this.state.myNavInput.isVisible = false;
                        this.state.myNavInput.contTop = "55%";
                        this.state.myNavInput.contWidth = "190";
                        this.state.myNavInput.contZ = "15";
                        this.state.myNavInput.buttons = [];
                        (0,_state_state__WEBPACK_IMPORTED_MODULE_1__.clearIsChoiceFlag)();
                    },
                    unaction: () => { },
                    style: "",
                },
                {
                    label: "Coin +1",
                    action: () => {
                        _utils__WEBPACK_IMPORTED_MODULE_0__.utils.userResponse({
                            Callback: "chooseAttack1Ability1",
                            Response: "Coin",
                        });
                        this.state.myNavInput.isVisible = false;
                        this.state.myNavInput.contTop = "55%";
                        this.state.myNavInput.contWidth = "190";
                        this.state.myNavInput.contZ = "15";
                        this.state.myNavInput.buttons = [];
                        (0,_state_state__WEBPACK_IMPORTED_MODULE_1__.clearIsChoiceFlag)();
                    },
                    unaction: () => { },
                    style: "",
                },
            ];
            this.state.myNavInput.contTop = "25%";
            this.state.myNavInput.isVisible = true;
        }
        resolve();
    }
    handChoiceCoin1Draw1(resolve) {
        const usr = this.state.gameData.Players.findIndex(p => {
            return this.state.gameData.turn === p.id;
        });
        const username = this.state.gameData.Players[usr].name;
        const myTurn = this.state.gameData.Players[usr].id == this.state.playerData.id;
        if (myTurn) {
            this.state.myNavInput.contZ = "17";
            this.state.myNavInput.contWidth = "250";
            this.state.myNavInput.buttons = [
                {
                    label: "Coin +1",
                    action: () => {
                        _utils__WEBPACK_IMPORTED_MODULE_0__.utils.userResponse({
                            Callback: "chooseAbility1Draw1",
                            Response: "Coin",
                        });
                        this.state.myNavInput.isVisible = false;
                        this.state.myNavInput.contTop = "55%";
                        this.state.myNavInput.contWidth = "190";
                        this.state.myNavInput.buttons = [];
                        this.state.myNavInput.contZ = "15";
                        (0,_state_state__WEBPACK_IMPORTED_MODULE_1__.clearIsChoiceFlag)();
                    },
                    unaction: () => { },
                    style: "",
                },
                {
                    label: "Draw 1",
                    action: () => {
                        _utils__WEBPACK_IMPORTED_MODULE_0__.utils.userResponse({
                            Callback: "chooseAbility1Draw1",
                            Response: "draw",
                        });
                        this.state.myNavInput.isVisible = false;
                        this.state.myNavInput.contTop = "55%";
                        this.state.myNavInput.contWidth = "190";
                        this.state.myNavInput.buttons = [];
                        this.state.myNavInput.contZ = "15";
                        (0,_state_state__WEBPACK_IMPORTED_MODULE_1__.clearIsChoiceFlag)();
                    },
                    unaction: () => { },
                    style: "",
                },
            ];
            this.state.myNavInput.contTop = "25%";
            this.state.myNavInput.isVisible = true;
        }
        resolve();
    }
    enableMonster(resolve) {
        const usr = this.state.gameData.Players.findIndex(p => {
            return this.state.gameData.turn === p.id;
        });
        const username = this.state.gameData.Players[usr].name;
        const myTurn = this.state.gameData.Players[usr].id == this.state.playerData.id;
        if (myTurn) {
            this.state.myNavInput.buttons = [];
            this.state.myNavInput.buttons.push({
                label: "Apply Damage",
                action: (event, model, element) => {
                    _utils__WEBPACK_IMPORTED_MODULE_0__.utils.enableMonsterDamage();
                    _utils__WEBPACK_IMPORTED_MODULE_0__.utils.playSound("button");
                    this.state.myNavInput.isVisible = false;
                },
                unaction: (event, model, element) => { },
                style: "",
            });
            this.state.myNavInput.isVisible = true;
        }
        else {
        }
        resolve();
    }
    handChoiceAtk1Draw1(resolve) {
        const usr = this.state.gameData.Players.findIndex(p => {
            return this.state.gameData.turn === p.id;
        });
        const username = this.state.gameData.Players[usr].name;
        const myTurn = this.state.gameData.Players[usr].id == this.state.playerData.id;
        if (myTurn) {
            this.state.myNavInput.contZ = "17";
            this.state.myNavInput.contWidth = "250";
            this.state.myNavInput.buttons = [
                {
                    label: "Attack +1",
                    action: () => {
                        _utils__WEBPACK_IMPORTED_MODULE_0__.utils.userResponse({
                            Callback: "chooseAttack1Draw1",
                            Response: "Attack",
                        });
                        this.state.myNavInput.isVisible = false;
                        this.state.myNavInput.contTop = "55%";
                        this.state.myNavInput.contWidth = "190";
                        this.state.myNavInput.contZ = "15";
                        this.state.myNavInput.buttons = [];
                        (0,_state_state__WEBPACK_IMPORTED_MODULE_1__.clearIsChoiceFlag)();
                    },
                    unaction: () => { },
                    style: "",
                },
                {
                    label: "Draw 1",
                    action: () => {
                        _utils__WEBPACK_IMPORTED_MODULE_0__.utils.userResponse({
                            Callback: "chooseAttack1Draw1",
                            Response: "draw",
                        });
                        this.state.myNavInput.isVisible = false;
                        this.state.myNavInput.contZ = "15";
                        this.state.myNavInput.contTop = "55%";
                        this.state.myNavInput.contWidth = "190";
                        this.state.myNavInput.buttons = [];
                        (0,_state_state__WEBPACK_IMPORTED_MODULE_1__.clearIsChoiceFlag)();
                    },
                    unaction: () => { },
                    style: "",
                },
            ];
            this.state.myNavInput.contTop = "25%";
            this.state.myNavInput.isVisible = true;
        }
        resolve();
    }
    handChoiceHealth1Draw1(resolve) {
        const usr = this.state.gameData.Players.findIndex(p => {
            return this.state.gameData.turn === p.id;
        });
        const username = this.state.gameData.Players[usr].name;
        const myTurn = this.state.gameData.Players[usr].id == this.state.playerData.id;
        if (myTurn) {
            this.state.myNavInput.contZ = "17";
            this.state.myNavInput.contWidth = "250";
            this.state.myNavInput.buttons = [
                {
                    label: "Health +1",
                    action: () => {
                        _utils__WEBPACK_IMPORTED_MODULE_0__.utils.userResponse({
                            Callback: "chooseHealth1Draw1",
                            Response: "Health",
                        });
                        this.state.myNavInput.isVisible = false;
                        this.state.myNavInput.contZ = "15";
                        this.state.myNavInput.contWidth = "190";
                        this.state.myNavInput.contTop = "55%";
                        this.state.myNavInput.buttons = [];
                        (0,_state_state__WEBPACK_IMPORTED_MODULE_1__.clearIsChoiceFlag)();
                    },
                    unaction: () => { },
                    style: "",
                },
                {
                    label: "Draw 1",
                    action: () => {
                        _utils__WEBPACK_IMPORTED_MODULE_0__.utils.userResponse({
                            Callback: "chooseHealth1Draw1",
                            Response: "draw",
                        });
                        this.state.myNavInput.isVisible = false;
                        this.state.myNavInput.contZ = "15";
                        this.state.myNavInput.contWidth = "190";
                        this.state.myNavInput.contTop = "55%";
                        this.state.myNavInput.buttons = [];
                        (0,_state_state__WEBPACK_IMPORTED_MODULE_1__.clearIsChoiceFlag)();
                    },
                    unaction: () => { },
                    style: "",
                },
            ];
            this.state.myNavInput.contTop = "25%";
            this.state.myNavInput.isVisible = true;
        }
        resolve();
    }
    openCardPool(resolve) {
        this.state.myGame.showModal = true;
        resolve();
    }
    anyplayerheal(resolve) {
        const usr = this.state.gameData.Players.findIndex(p => {
            return this.state.gameData.turn === p.id;
        });
        const myTurn = this.state.gameData.Players[usr].id == this.state.playerData.id;
        if (myTurn) {
            this.state.myNavInput.contZ = "17";
            this.state.myNavInput.buttons = [];
            const numPlayers = this.state.gameData.Players;
            this.state.myNavInput.contWidth = `${190 * numPlayers}`;
            this.state.gameData.Players.forEach(p => {
                this.state.myNavInput.buttons.push({
                    label: `${p.name}`,
                    action: () => {
                        _utils__WEBPACK_IMPORTED_MODULE_0__.utils.userResponse({
                            Callback: "addHealth1anyPlayer",
                            Response: `${p.name}`,
                        });
                        this.state.myNavInput.isVisible = false;
                        this.state.myNavInput.contTop = "55%";
                        this.state.myNavInput.contWidth = "190";
                        this.state.myNavInput.contZ = "15";
                        this.state.myNavInput.buttons = [];
                        (0,_state_state__WEBPACK_IMPORTED_MODULE_1__.clearIsChoiceFlag)();
                    },
                    unaction: () => { },
                    style: "",
                });
            });
            this.state.myNavInput.contTop = "25%";
            this.state.myNavInput.isVisible = true;
        }
        resolve();
    }
    anyplayercoin(resolve) {
        const usr = this.state.gameData.Players.findIndex(p => {
            return this.state.gameData.turn === p.id;
        });
        const myTurn = this.state.gameData.Players[usr].id == this.state.playerData.id;
        if (myTurn) {
            this.state.myNavInput.contZ = "17";
            const numPlayers = this.state.gameData.Players.length;
            this.state.myNavInput.contWidth = `${190 * numPlayers}`;
            this.state.myNavInput.buttons = [];
            this.state.gameData.Players.forEach(p => {
                this.state.myNavInput.buttons.push({
                    label: `${p.name}`,
                    action: () => {
                        _utils__WEBPACK_IMPORTED_MODULE_0__.utils.userResponse({
                            Callback: "addCoin1anyPlayer",
                            Response: `${p.name}`,
                        });
                        this.state.myNavInput.isVisible = false;
                        this.state.myNavInput.contZ = "15";
                        this.state.myNavInput.contWidth = "190";
                        this.state.myNavInput.contTop = "55%";
                        this.state.myNavInput.buttons = [];
                        (0,_state_state__WEBPACK_IMPORTED_MODULE_1__.clearIsChoiceFlag)();
                    },
                    unaction: () => { },
                    style: "",
                });
            });
            this.state.myNavInput.contTop = "25%";
            this.state.myNavInput.isVisible = true;
        }
        resolve();
    }
    otherplayerheal(resolve) {
        const usr = this.state.gameData.Players.findIndex(p => {
            return this.state.gameData.turn === p.id;
        });
        const username = this.state.gameData.Players[usr].name;
        const myTurn = this.state.gameData.Players[usr].id == this.state.playerData.id;
        if (myTurn) {
            this.state.myNavInput.contZ = "17";
            const listOfOtherPlayers = this.state.gameData.Players.filter((p, i) => i != usr);
            const numOtherPlayers = listOfOtherPlayers.length;
            this.state.myNavInput.contWidth = `${numOtherPlayers * 190}`;
            this.state.myNavInput.buttons = [];
            listOfOtherPlayers.forEach(p => {
                this.state.myNavInput.buttons.push({
                    label: `${p.name}`,
                    action: () => {
                        _utils__WEBPACK_IMPORTED_MODULE_0__.utils.userResponse({
                            Callback: "addHealth1anyPlayer",
                            Response: `${p.name}`,
                        });
                        this.state.myNavInput.isVisible = false;
                        this.state.myNavInput.contZ = "15";
                        this.state.myNavInput.contTop = "55%";
                        this.state.myNavInput.contWidth = "190";
                        this.state.myNavInput.buttons = [];
                        (0,_state_state__WEBPACK_IMPORTED_MODULE_1__.clearIsChoiceFlag)();
                    },
                    unaction: () => { },
                    style: "",
                });
            });
            this.state.myNavInput.contTop = "25%";
            this.state.myNavInput.isVisible = true;
        }
        resolve();
    }
    handChoiceHealth1Ability1(resolve) {
        const usr = this.state.gameData.Players.findIndex(p => {
            return this.state.gameData.turn === p.id;
        });
        const username = this.state.gameData.Players[usr].name;
        const myTurn = this.state.gameData.Players[usr].id == this.state.playerData.id;
        if (myTurn) {
            this.state.myNavInput.contZ = "17";
            this.state.myNavInput.contWidth = "250";
            this.state.myNavInput.buttons = [
                {
                    label: "Health +1",
                    action: () => {
                        _utils__WEBPACK_IMPORTED_MODULE_0__.utils.userResponse({
                            Callback: "chooseHealth1Ability1",
                            Response: "Health",
                        });
                        this.state.myNavInput.isVisible = false;
                        this.state.myNavInput.contZ = "15";
                        this.state.myNavInput.contTop = "55%";
                        this.state.myNavInput.contWidth = "190";
                        this.state.myNavInput.buttons = [];
                        (0,_state_state__WEBPACK_IMPORTED_MODULE_1__.clearIsChoiceFlag)();
                    },
                    unaction: () => { },
                    style: "",
                },
                {
                    label: "Coin +1",
                    action: () => {
                        _utils__WEBPACK_IMPORTED_MODULE_0__.utils.userResponse({
                            Callback: "chooseHealth1Ability1",
                            Response: "Coin",
                        });
                        this.state.myNavInput.isVisible = false;
                        this.state.myNavInput.contZ = "15";
                        this.state.myNavInput.contTop = "55%";
                        this.state.myNavInput.contWidth = "190";
                        this.state.myNavInput.buttons = [];
                        (0,_state_state__WEBPACK_IMPORTED_MODULE_1__.clearIsChoiceFlag)();
                    },
                    unaction: () => { },
                    style: "",
                },
            ];
            this.state.myNavInput.contTop = "25%";
            this.state.myNavInput.isVisible = true;
        }
        resolve();
    }
    monsterChange(resolve) {
        if (this.event.message == "hide") {
            this.state.myMonster.isVisible = false;
        }
        else if (this.event.message == "show") {
            this.state.myToast.addToast("monster", "New Monster Appears");
            this.state.myMonster.isVisible = true;
        }
        resolve();
    }
    statEffects(resolve) {
        const usr = this.state.gameData.Players.findIndex(p => {
            return this.state.gameData.turn === p.id;
        });
        const username = this.state.gameData.Players[usr].name;
        const myTurn = this.state.gameData.Players[usr].id == this.state.playerData.id;
        //clear UI statusEffects
        this.state.mypUI.allPlayers[usr].statusEffects = [];
        //loop through statuseffects call execute callbacks
        this.state.gameData.Players[usr].statusEffects.forEach(se => {
            let msg = {
                img: SE_map[se].img,
                effect: SE_map[se].effect,
                angle: 0,
                negAngle: 0,
            };
            this.state.mypUI.allPlayers[usr].addStatusMessage(msg);
        });
        this.state.myToast.addToast("effect", `Player received status effect`);
        resolve();
    }
    discard1(resolve) {
        const usr = this.state.gameData.Players.findIndex(p => {
            return this.state.gameData.turn === p.id;
        });
        const myTurn = this.state.gameData.Players[usr].id == this.state.playerData.id;
        if (myTurn) {
            this.state.myNavInput.contZ = "17";
            this.state.myNavInput.buttons = [];
            const numCards = this.state.myHand.hand.length;
            this.state.myNavInput.contWidth = `${numCards * 190}`;
            this.state.myHand.hand.forEach(c => {
                this.state.myNavInput.buttons.push({
                    label: `${c.title}`,
                    action: () => {
                        _utils__WEBPACK_IMPORTED_MODULE_0__.utils.userResponse({
                            Callback: "discard",
                            Response: `${c.id}`,
                        });
                        this.state.myNavInput.isVisible = false;
                        this.state.myNavInput.contZ = "15";
                        this.state.myNavInput.contTop = "55%";
                        this.state.myNavInput.contWidth = `190`;
                        this.state.myNavInput.buttons = [];
                        (0,_state_state__WEBPACK_IMPORTED_MODULE_1__.clearIsChoiceFlag)();
                    },
                    unaction: () => { },
                    style: "",
                });
            });
            this.state.myNavInput.contTop = "25%";
            this.state.myNavInput.isVisible = true;
        }
        resolve();
    }
    healOthers(resolve) {
        const usr = this.state.gameData.Players.findIndex(p => {
            return this.state.gameData.turn === p.id;
        });
        const username = this.state.gameData.Players[usr].name;
        const myTurn = this.state.gameData.Players[usr].id == this.state.playerData.id;
        if (myTurn) {
            const listOfOtherPlayers = this.state.gameData.Players.filter((p, i) => i != usr);
            listOfOtherPlayers.forEach(p => {
                p.addHealth(this.event.value);
                p.bloomStatus = p.bloomStatus + " playerHeal";
            });
        }
        resolve();
    }
    otherCoinAdd(resolve) {
        const usr = this.event.value;
        console.log("made it here, usr: ", usr);
        this.state.mypUI.allPlayers[usr].coinPlacard.color = "limegreen";
        this.state.mypUI.allPlayers[usr].coinPlacard.text = `+1`;
        this.state.mypUI.allPlayers[usr].coinPlacard.isVisible = true;
        const mInt = setInterval(() => {
            this.state.mypUI.allPlayers[usr].coinPlacard.offset -= 2;
            if (this.state.mypUI.allPlayers[usr].coinPlacard.offset < -15) {
                this.state.mypUI.allPlayers[usr].coinPlacard.opacity -= 0.05;
            }
            if (this.state.mypUI.allPlayers[usr].coinPlacard.offset <= -50) {
                clearInterval(mInt);
                this.state.mypUI.allPlayers[usr].coinPlacard.offset = 0;
                this.state.mypUI.allPlayers[usr].coinPlacard.opacity = 1;
                this.state.mypUI.allPlayers[usr].coinPlacard.isVisible = false;
            }
        }, 30);
        resolve();
    }
    prompt_CardPool(resolve) {
        const usr = this.state.gameData.Players.findIndex(p => {
            return this.state.gameData.turn === p.id;
        });
        const username = this.state.gameData.Players[usr].name;
        const myTurn = this.state.gameData.Players[usr].id == this.state.playerData.id;
        if (myTurn) {
            this.state.myNavInput.buttons = [];
            this.state.myNavInput.buttons.push({
                label: "Open Card Pool",
                action: (event, model, element) => {
                    _utils__WEBPACK_IMPORTED_MODULE_0__.utils.showCardPool();
                    _utils__WEBPACK_IMPORTED_MODULE_0__.utils.playSound("button");
                    this.state.myNavInput.isVisible = false;
                },
                unaction: (event, model, element) => { },
                style: "",
            });
            this.state.myNavInput.isVisible = true;
        }
        else {
        }
        resolve();
    }
    checkCoins(resolve) {
        const usr = this.state.gameData.Players.findIndex(p => {
            return this.state.gameData.turn === p.id;
        });
        const username = this.state.gameData.Players[usr].name;
        const myTurn = this.state.gameData.Players[usr].id == this.state.playerData.id;
        //if player doesn't have enough money...
        //can player afford any more cards
        const remainingFunds = this.state.gameData.Players[usr].coin;
        const newGroupOfBuyableCards = [
            this.state.gameData.cardPool[0],
            this.state.gameData.cardPool[1],
            this.state.gameData.cardPool[2],
            this.state.gameData.cardPool[3],
            this.state.gameData.cardPool[4],
            this.state.gameData.cardPool[5],
        ];
        const canBuy = newGroupOfBuyableCards.some(c => {
            return remainingFunds >= c.cost;
        });
        console.log(`purchase test result: ${canBuy}`);
        if (!canBuy) {
            _utils__WEBPACK_IMPORTED_MODULE_0__.utils.playSound("sadT");
            setTimeout(() => {
                _utils__WEBPACK_IMPORTED_MODULE_0__.utils.doneBuyingCards();
                resolve();
            }, 1250);
        }
        resolve();
    }
    resetTimebar(resolve) {
        this.state.myNavBar.resetTimeline();
        resolve();
    }
    buyCardfromPool(resolve) {
        const usr = this.state.gameData.Players.findIndex(p => {
            return this.state.gameData.turn === p.id;
        });
        const username = this.state.gameData.Players[usr].name;
        const myTurn = this.state.gameData.Players[usr].id == this.state.playerData.id;
        //can player afford any more cards
        const remainingFunds = this.state.gameData.Players[usr].coin;
        const newGroupOfBuyableCards = [
            this.state.gameData.cardPool[0],
            this.state.gameData.cardPool[1],
            this.state.gameData.cardPool[2],
            this.state.gameData.cardPool[3],
            this.state.gameData.cardPool[4],
            this.state.gameData.cardPool[5],
        ];
        const canBuy = newGroupOfBuyableCards.some(c => {
            return remainingFunds >= c.cost;
        });
        console.log(`purchase test result: ${canBuy}`);
        if (!canBuy) {
            _utils__WEBPACK_IMPORTED_MODULE_0__.utils.doneBuyingCards();
        }
        resolve();
    }
    closeCardPool(resolve) {
        this.state.myGame.showModal = false;
        resolve();
    }
    prompt_playerHand(resolve) {
        const usr = this.state.gameData.Players.findIndex(p => {
            return this.state.gameData.turn === p.id;
        });
        const username = this.state.gameData.Players[usr].name;
        const myTurn = this.state.gameData.Players[usr].id == this.state.playerData.id;
        //this.state.myNavBar.increment("passives");
        if (myTurn) {
            //show start turn button
            this.state.myNavInput.buttons = [];
            this.state.myNavInput.buttons.push({
                label: "Play your hand?",
                action: (event, model, element) => {
                    _utils__WEBPACK_IMPORTED_MODULE_0__.utils.showPcard();
                    _utils__WEBPACK_IMPORTED_MODULE_0__.utils.playSound("button");
                    this.state.myNavInput.isVisible = false;
                },
                unaction: (event, model, element) => { },
                style: "",
            });
            this.state.myNavInput.isVisible = true;
        }
        else {
        }
        resolve();
    }
    draw2(resolve) {
        const usr = this.state.gameData.Players.findIndex(p => {
            return this.state.gameData.turn === p.id;
        });
        const myTurn = this.state.gameData.Players[usr].id == this.state.playerData.id;
        if (myTurn) {
            //grab card from state
            const lastcardindex = this.state.gameData.Players[usr].hand.length;
            const newCard1 = this.state.gameData.Players[usr].hand[lastcardindex - 1];
            const newCard2 = this.state.gameData.Players[usr].hand[lastcardindex - 2];
            //update current hand
            switch (usr) {
                case 0:
                    this.state.myHand.player1Hand.push(newCard1);
                    this.state.myHand.player1Hand.push(newCard2);
                    break;
                case 1:
                    this.state.myHand.player2Hand.push(newCard1);
                    this.state.myHand.player2Hand.push(newCard2);
                    break;
                case 2:
                    this.state.myHand.player3Hand.push(newCard1);
                    this.state.myHand.player3Hand.push(newCard2);
                    break;
                case 3:
                    this.state.myHand.player4Hand.push(newCard1);
                    this.state.myHand.player4Hand.push(newCard2);
                    break;
            }
            this.state.myHand.hand.push(newCard1);
            this.state.myHand.hand.push(newCard2);
        }
        resolve();
    }
    hidelocation(resolve) {
        this.state.location.isVisible = false;
        resolve();
    }
    showlocation(resolve) {
        this.state.location.isVisible = true;
        resolve();
    }
    toastLocationCurse(resolve) {
        this.state.myToast.addToast("location", "Location Curse Active");
        resolve();
    }
    toastDrawCurse(resolve) {
        this.state.myToast.addToast("card", "Player Draw Blocked");
        resolve();
    }
    toastDiscardCurse(resolve) {
        this.state.myToast.addToast("user", "Discard Curse Active");
        resolve();
    }
    promptForEndTurn(resolve) {
        const usr = this.state.gameData.Players.findIndex(p => {
            return this.state.gameData.turn === p.id;
        });
        const username = this.state.gameData.Players[usr].name;
        const myTurn = this.state.gameData.Players[usr].id == this.state.playerData.id;
        if (myTurn) {
            this.state.myNavInput.buttons = [];
            this.state.myNavInput.buttons.push({
                label: "End Turn?",
                action: (event, model, element) => {
                    _utils__WEBPACK_IMPORTED_MODULE_0__.utils.endTurn();
                    _utils__WEBPACK_IMPORTED_MODULE_0__.utils.playSound("button");
                    this.state.myNavInput.isVisible = false;
                },
                unaction: (event, model, element) => { },
                style: "",
            });
            this.state.myNavInput.isVisible = true;
        }
        else {
        }
        resolve();
    }
    draw(resolve) {
        const usr = this.state.gameData.Players.findIndex(p => {
            return this.state.gameData.turn === p.id;
        });
        const myTurn = this.state.gameData.Players[usr].id == this.state.playerData.id;
        if (myTurn) {
            //grab card from state
            const lastcardindex = this.state.gameData.Players[usr].hand.length;
            const newCard = this.state.gameData.Players[usr].hand[lastcardindex - 1];
            console.log("state hand");
            console.table(this.state.gameData.Players[0].hand);
            console.log("display hand");
            console.table(this.state.myHand.hand);
            console.log("player ui hand");
            console.table(this.state.myHand.player1Hand);
            //update current hand
            switch (usr) {
                case 0:
                    this.state.myHand.player1Hand.push(newCard);
                    break;
                case 1:
                    this.state.myHand.player2Hand.push(newCard);
                    break;
                case 2:
                    this.state.myHand.player3Hand.push(newCard);
                    break;
                case 3:
                    this.state.myHand.player4Hand.push(newCard);
                    break;
            }
            this.state.myHand.hand.push(newCard);
        }
        resolve();
    }
    show_playerHand(resolve) {
        const usr = this.state.gameData.Players.findIndex(p => {
            return this.state.gameData.turn === p.id;
        });
        const username = this.state.gameData.Players[usr].name;
        switch (usr) {
            case 0:
                this.state.myHand.hand = [...this.state.myHand.player1Hand];
                break;
            case 1:
                this.state.myHand.hand = [...this.state.myHand.player2Hand];
                break;
            case 2:
                this.state.myHand.hand = [...this.state.myHand.player3Hand];
                break;
            case 3:
                this.state.myHand.hand = [...this.state.myHand.player4Hand];
                break;
        }
        this.state.myHand.footer = `${username.replace(/^\w/, c => c.toUpperCase())}'s Hand`;
        if (this.state.myHand.hand.length != 0)
            this.state.myHand.isVisible = true;
        //make cards clickable
        resolve();
    }
    showCoinAnimation(resolve) {
        const usr = this.state.gameData.Players.findIndex(p => {
            return this.state.gameData.turn === p.id;
        });
        if (this.event.message == "add") {
            this.state.mypUI.allPlayers[usr].coinPlacard.color = "limegreen";
            this.state.mypUI.allPlayers[usr].coinPlacard.text = `+${this.event.value}`;
        }
        else if (this.event.message == "remove") {
            this.state.mypUI.allPlayers[usr].coinPlacard.color = "red";
            this.state.mypUI.allPlayers[usr].coinPlacard.text = `-${this.event.value}`;
        }
        this.state.mypUI.allPlayers[usr].coinPlacard.isVisible = true;
        const mInt = setInterval(() => {
            this.state.mypUI.allPlayers[usr].coinPlacard.offset -= 2;
            if (this.state.mypUI.allPlayers[usr].coinPlacard.offset < -15) {
                this.state.mypUI.allPlayers[usr].coinPlacard.opacity -= 0.05;
            }
            if (this.state.mypUI.allPlayers[usr].coinPlacard.offset <= -50) {
                clearInterval(mInt);
                this.state.mypUI.allPlayers[usr].coinPlacard.offset = 0;
                this.state.mypUI.allPlayers[usr].coinPlacard.opacity = 1;
                this.state.mypUI.allPlayers[usr].coinPlacard.isVisible = false;
            }
        }, 30);
        resolve();
    }
    checkForAttackPoints(resolve) {
        const usr = this.state.gameData.Players.findIndex(p => {
            return this.state.gameData.turn === p.id;
        });
        isAttackPointsZero = this.state.gameData.Players[usr].attack == 0;
        if (isAttackPointsZero) {
            _utils__WEBPACK_IMPORTED_MODULE_0__.utils.monsterDamageDone();
        }
        resolve();
    }
    handRefresh(resolve) {
        const usr = this.state.gameData.Players.findIndex(p => {
            return this.state.gameData.turn === p.id;
        });
        switch (usr) {
            case 0:
                this.state.myHand.player1Hand = [...this.state.gameData.Players[usr].hand];
                break;
            case 1:
                this.state.myHand.player2Hand = [...this.state.gameData.Players[usr].hand];
                break;
            case 2:
                this.state.myHand.player3Hand = [...this.state.gameData.Players[usr].hand];
                break;
            case 3:
                this.state.myHand.player4Hand = [...this.state.gameData.Players[usr].hand];
                break;
        }
        this.state.myHand.hand = [...this.state.gameData.Players[usr].hand];
        resolve();
    }
    showAttackAnimation(resolve) {
        const usr = this.state.gameData.Players.findIndex(p => {
            return this.state.gameData.turn === p.id;
        });
        if (this.event.message == "add") {
            this.state.mypUI.allPlayers[usr].attackPlacard.color = "limegreen";
            this.state.mypUI.allPlayers[usr].attackPlacard.text = `+${this.event.value}`;
        }
        else if (this.event.message == "remove") {
            this.state.mypUI.allPlayers[usr].attackPlacard.color = "red";
            this.state.mypUI.allPlayers[usr].attackPlacard.text = `-${this.event.value}`;
        }
        this.state.mypUI.allPlayers[usr].attackPlacard.isVisible = true;
        const mInt = setInterval(() => {
            this.state.mypUI.allPlayers[usr].attackPlacard.offset -= 2;
            if (this.state.mypUI.allPlayers[usr].attackPlacard.offset < -15) {
                this.state.mypUI.allPlayers[usr].attackPlacard.opacity -= 0.05;
            }
            if (this.state.mypUI.allPlayers[usr].attackPlacard.offset <= -50) {
                clearInterval(mInt);
                this.state.mypUI.allPlayers[usr].attackPlacard.offset = 0;
                this.state.mypUI.allPlayers[usr].attackPlacard.opacity = 1;
                this.state.mypUI.allPlayers[usr].attackPlacard.isVisible = false;
            }
        }, 30);
        resolve();
    }
    Endbanner(resolve) {
        this.state.myMessageOverlay.mainMessage = "GAME OVER";
        this.state.myMessageOverlay.subMessage = this.event.message;
        this.state.myMessageOverlay.isVisble = true;
        setTimeout(() => {
            this.state.myMessageOverlay.isVisble = false;
            resolve();
        }, 5000);
    }
    damageFlash(resolve) {
        const usr = this.state.gameData.Players.findIndex(p => {
            return this.state.gameData.turn === p.id;
        });
        this.state.mypUI.allPlayers[usr].bloomStatus = this.state.mypUI.allPlayers[usr].bloomStatus + " playerdamage";
        resolve();
    }
    hideHand(resolve) {
        this.state.myHand.isVisible = false;
        resolve();
    }
    healFlash(resolve) {
        const usr = this.state.gameData.Players.findIndex(p => {
            return this.state.gameData.turn === p.id;
        });
        this.state.mypUI.allPlayers[usr].bloomStatus = this.state.mypUI.allPlayers[usr].bloomStatus + " playerHeal";
        resolve();
    }
    locationFlash(resolve) {
        this.state.myLocation.cssString = " locationdamage";
        setTimeout(() => {
            this.state.myLocation.cssString = "";
        }, 500);
        resolve();
    }
    locationHealFlash(resolve) {
        this.state.myLocation.cssString = " locationHeal";
        setTimeout(() => {
            this.state.myLocation.cssString = "";
        }, 500);
        resolve();
    }
    enableMonsters(resolve) {
        _utils__WEBPACK_IMPORTED_MODULE_0__.utils.enableM();
        resolve();
    }
    hideTD(resolve) {
        this.state.myTowerD.cssString = "";
        this.state.myTowerD.isVisible = false;
        resolve();
    }
    lowerhealth(resolve) {
        const usr = this.state.gameData.Players.findIndex(p => {
            return this.state.gameData.turn === p.id;
        });
        this.state.mypUI.allPlayers[usr].lowerHealth(this.event.value);
        resolve();
    }
    raisehealth(resolve) {
        const usr = this.state.gameData.Players.findIndex(p => {
            return this.state.gameData.turn === p.id;
        });
        this.state.mypUI.allPlayers[usr].addHealth(this.event.value);
        resolve();
    }
    raiseOtherhealth1(resolve) {
        this.state.mypUI.allPlayers[this.event.value].addHealth(1);
        resolve();
    }
    otherHealthFlash(resolve) {
        const index = this.event.value;
        this.state.mypUI.allPlayers[index].bloomStatus = this.state.mypUI.allPlayers[index].bloomStatus + " playerHeal";
        resolve();
    }
    clearStatusEffects(resolve) {
        (0,_state_state__WEBPACK_IMPORTED_MODULE_1__.clearIsChoiceFlag)();
        const usr = this.state.gameData.Players.findIndex(p => {
            return this.state.gameData.turn === p.id;
        });
        this.state.mypUI.allPlayers[usr].clearStatusMessages();
        resolve();
    }
    applyDamage(resolve) {
        const usr = this.state.gameData.Players.findIndex(p => {
            return this.state.gameData.turn === p.id;
        });
        // add locationdamage css to monster card
        const existingString = this.state.myMonster.cssString;
        this.state.myMonster.cssString = existingString + " playerdamage";
        setTimeout(() => {
            this.state.myMonster.cssString = existingString;
            if (this.state.gameData.Players[usr].attack == 0) {
                console.log(`attack empty`);
                this.state.myMonster.cssString = "";
                _utils__WEBPACK_IMPORTED_MODULE_0__.utils.monsterDamageDone();
            }
            resolve();
        }, 1000);
    }
    indexProgress(resolve) {
        this.state.myNavBar.increment(`${this.event.state}`);
        resolve();
    }
    TDbloom(resolve) {
        const usr = this.state.gameData.Players.findIndex(p => {
            return this.state.gameData.turn === p.id;
        });
        const myTurn = this.state.gameData.Players[usr].id == this.state.playerData.id;
        //this.state.myNavBar.increment("passives");
        if (myTurn) {
            this.state.myTowerD.cssString = "td_bloom td_clickable";
        }
        else {
            this.state.myTowerD.cssString = "td_bloom";
        }
        resolve();
    }
    bloomMonsters(resolve) {
        if (isAttackPointsZero && _api_types__WEBPACK_IMPORTED_MODULE_3__.RoundState.activeApplyingDamage)
            return;
        const usr = this.state.gameData.Players.findIndex(p => {
            return this.state.gameData.turn === p.id;
        });
        const myTurn = this.state.gameData.Players[usr].id == this.state.playerData.id;
        if (myTurn) {
            this.state.myMonster.cssString = " td_bloom td_clickable nohover";
        }
        else {
            this.state.myMonster.cssString = " td_bloom";
        }
        resolve();
    }
    unbloomMonster(resolve) {
        this.state.myMonster.cssString = "";
        resolve();
    }
    hideNavButton(resolve) {
        this.state.myNavInput.isVisible = false;
        resolve();
    }
    dealTD(resolve) {
        this.state.myTowerD.isVisible = true;
        resolve();
    }
    showNavBar(resolve) {
        this.state.myNavBar.showNavBar = true;
        resolve();
    }
    hideNavBar(resolve) {
        this.state.myNavBar.showNavBar = false;
        resolve();
    }
    clearscreen(resolve) {
        this.state.myGame.showModal = false;
        this.state.myChat.isActive = false;
        this.state.myHand.isVisible = false;
        this.state.myLocation.isVisible = false;
        this.state.myTowerD.isVisible = false;
        this.state.myMonster.isVisible = false;
        this.state.myNavBar.showNavBar = false;
        this.state.myNavInput.isVisible = false;
        this.state.myNavInput.buttons = [];
        this.state.myHand.hand = [];
        resolve();
    }
    dealCards(resolve) {
        //deal monster card
        this.state.myMonster.isVisible = true;
        this.state.myLocation.isVisible = true;
        this.state.gameData.Players.forEach((p, i) => {
            switch (i) {
                case 0:
                    this.state.myHand.player1Hand = [...this.state.gameData.Players[i].hand];
                    break;
                case 1:
                    this.state.myHand.player2Hand = [...this.state.gameData.Players[i].hand];
                    break;
                case 2:
                    this.state.myHand.player3Hand = [...this.state.gameData.Players[i].hand];
                    break;
                case 3:
                    this.state.myHand.player4Hand = [...this.state.gameData.Players[i].hand];
                    break;
            }
        });
        resolve();
    }
    startBanner(resolve) {
        this.state.myMessageOverlay.mainMessage = "STARTING GAME";
        this.state.myMessageOverlay.subMessage = "";
        this.state.myMessageOverlay.isVisble = true;
        setTimeout(() => {
            this.state.myMessageOverlay.isVisble = false;
            resolve();
        }, 3000);
    }
    nextRound(resolve) {
        this.state.myMessageOverlay.mainMessage = "Next Turn";
        this.state.myMessageOverlay.subMessage = "";
        this.state.myMessageOverlay.isVisble = true;
        setTimeout(() => {
            this.state.myMessageOverlay.isVisble = false;
            console.log("starting turn");
            _utils__WEBPACK_IMPORTED_MODULE_0__.utils.startTurn();
            resolve();
        }, 3000);
    }
    pPassives(resolve) {
        const usr = this.state.gameData.Players.findIndex(p => {
            return this.state.gameData.turn === p.id;
        });
        const username = this.state.gameData.Players[usr].name;
        const myTurn = this.state.gameData.Players[usr].id == this.state.playerData.id;
        //this.state.myNavBar.increment("passives");
        if (myTurn) {
            //show start turn button
            this.state.myNavInput.buttons = [];
            this.state.myNavInput.buttons.push({
                label: "Run Passives",
                action: (event, model, element) => {
                    _utils__WEBPACK_IMPORTED_MODULE_0__.utils.passives();
                    _utils__WEBPACK_IMPORTED_MODULE_0__.utils.playSound("button");
                    this.state.myNavInput.isVisible = false;
                },
                unaction: (event, model, element) => { },
                style: "",
            });
            this.state.myNavInput.isVisible = true;
        }
        else {
        }
        resolve();
    }
    showStartTurn(resolve) {
        //get user name
        const usr = this.state.gameData.Players.findIndex(p => {
            return this.state.gameData.turn === p.id;
        });
        const username = this.state.gameData.Players[usr].name;
        const myTurn = this.state.gameData.Players[usr].id == this.state.playerData.id;
        if (myTurn) {
            //show start turn button
            this.state.myNavInput.isVisible = true;
            this.state.myNavInput.buttons.push({
                label: "Start Turn",
                action: (event, model, element) => {
                    _utils__WEBPACK_IMPORTED_MODULE_0__.utils.startTurn();
                    _utils__WEBPACK_IMPORTED_MODULE_0__.utils.playSound("button");
                    this.state.myNavInput.isVisible = false;
                },
                unaction: (event, model, element) => { },
                style: "",
            });
        }
        else {
            //toast message that its someone else's turn
            this.state.myToast.addToast("user", `It is ${username}'s turn!`);
        }
        resolve();
    }
    setBloom(resolve) {
        const usr = this.state.gameData.Players.findIndex(p => {
            return this.state.gameData.turn === p.id;
        });
        this.state.mypUI.allPlayers[usr].bloomStatus = "playerBloom";
        resolve();
    }
    resetGame(resolve) {
        //change screen back to login
        //clear out game data
        this.state.myContainer.screenSwitch(_components__WEBPACK_IMPORTED_MODULE_4__.Router.Lobby);
        this.state.gameData.Players = [];
        this.state.gameData.playerIndex = 1;
        this.state.gameData.roundState = 0;
        this.state.gameData.activeMonsters = [];
        this.state.gameData.location = {};
        this.state.gameData.TDcard = {};
        this.state.gameData.cardPool = [];
        this.state.gameData.turn = 0;
        this.state.gameData.turnOrder = [];
        this.state.gameData.gameID = "";
        resolve();
    }
    delay(resolve) {
        setTimeout(() => {
            resolve();
        }, this.event.timeout);
    }
    init(state) {
        this.state = state;
        return new Promise(resolve => {
            this[this.event.type](resolve);
        });
    }
}
const startEventSequence = async (events, state) => {
    for (let i = 0; i < events.sequence.length; i++) {
        const eventHandler = new GameEvent(events.sequence[i]);
        await eventHandler.init(state);
    }
};


/***/ }),

/***/ "./src/sound.ts":
/*!**********************!*\
  !*** ./src/sound.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "BGM": () => (/* binding */ BGM),
/* harmony export */   "SFX": () => (/* binding */ SFX)
/* harmony export */ });
/* harmony import */ var _assets_assetPool__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./assets/assetPool */ "./src/assets/assetPool.ts");
/* harmony import */ var howler__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! howler */ "./node_modules/howler/dist/howler.js");
/* harmony import */ var howler__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(howler__WEBPACK_IMPORTED_MODULE_1__);


class SFX {
    constructor() {
        this.sfxGain = 0.8;
        this.buttonClick = new howler__WEBPACK_IMPORTED_MODULE_1__.Howl({
            src: [_assets_assetPool__WEBPACK_IMPORTED_MODULE_0__.buttonWav],
            volume: this.sfxGain,
        });
        this.sadtrombone = new howler__WEBPACK_IMPORTED_MODULE_1__.Howl({
            src: [_assets_assetPool__WEBPACK_IMPORTED_MODULE_0__.sad],
            volume: this.sfxGain,
            rate: 1.5,
        });
        this.cardPlayed = new howler__WEBPACK_IMPORTED_MODULE_1__.Howl({
            src: [_assets_assetPool__WEBPACK_IMPORTED_MODULE_0__.dealcard],
            volume: this.sfxGain,
        });
        this.mailSend = new howler__WEBPACK_IMPORTED_MODULE_1__.Howl({
            src: [_assets_assetPool__WEBPACK_IMPORTED_MODULE_0__.woosh],
            volume: this.sfxGain,
        });
        this.mailGet = new howler__WEBPACK_IMPORTED_MODULE_1__.Howl({
            src: [_assets_assetPool__WEBPACK_IMPORTED_MODULE_0__.mail],
            volume: this.sfxGain,
        });
        this.gameSfx = {
            button: this.buttonClick,
            mailSend: this.mailSend,
            mailGet: this.mailGet,
            playCard: this.cardPlayed,
            sadT: this.sadtrombone,
        };
    }
    play(sfx) {
        // this.gameSfx[sfx].play();
    }
    updateVolume(newLevel) {
        this.sfxGain = newLevel;
        Object.values(this.gameSfx).forEach(entry => {
            entry.volume(newLevel);
        });
    }
    mute(muted) {
        Object.values(this.gameSfx).forEach(entry => {
            entry.mute(muted);
        });
    }
}
class BGM {
    constructor() {
        this.bgmGain = 0.3;
        this.gamesong = new howler__WEBPACK_IMPORTED_MODULE_1__.Howl({
            src: [_assets_assetPool__WEBPACK_IMPORTED_MODULE_0__.gmMusic],
            loop: true,
            volume: this.bgmGain,
        });
        this.titlesong = new howler__WEBPACK_IMPORTED_MODULE_1__.Howl({
            src: [_assets_assetPool__WEBPACK_IMPORTED_MODULE_0__.bgMusic],
            loop: true,
            volume: this.bgmGain,
        });
        this.gameMusic = {
            title: this.titlesong,
            game: this.gamesong,
        };
    }
    play(song) {
        if (this.currentSong) {
            this.currentSong.fade(this.bgmGain, 0, 0.25);
            this.currentSong.stop();
        }
        this.currentSong = this.gameMusic[song];
        this.updateVolume(this.bgmGain);
        //this.gameMusic[song].play();
    }
    updateVolume(newLevel) {
        this.bgmGain = newLevel;
        Object.values(this.gameMusic).forEach(entry => {
            entry.volume(newLevel);
        });
    }
    mute(muted) {
        Object.values(this.gameMusic).forEach(entry => {
            entry.mute(muted);
        });
    }
}


/***/ }),

/***/ "./src/state/state.ts":
/*!****************************!*\
  !*** ./src/state/state.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "State": () => (/* binding */ State),
/* harmony export */   "clearIsChoiceFlag": () => (/* binding */ clearIsChoiceFlag)
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");
/* harmony import */ var _components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../components */ "./src/components/index.ts");
/* harmony import */ var _components_character__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../components/character */ "./src/components/character.ts");
/* harmony import */ var _api_types__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../api/types */ "../../api/types.ts");
/* harmony import */ var _events__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../events */ "./src/events.ts");
/* harmony import */ var _assets_assetPool__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../assets/assetPool */ "./src/assets/assetPool.ts");






//TODO -
//validate all ability cards work
//toast messages aren't high enough z index - try again later
//helpfile needs finished
let isChoiceButtonActive = false;
const MOUSELIMIT = 10;
let mouseCount = 0;
let keybinding = undefined;
let chatDiv;
let controller;
let roleMap = {
    [_api_types__WEBPACK_IMPORTED_MODULE_3__.Roles.Barbarian]: {
        [_api_types__WEBPACK_IMPORTED_MODULE_3__.Gender.Male]: _assets_assetPool__WEBPACK_IMPORTED_MODULE_5__.bmale,
        [_api_types__WEBPACK_IMPORTED_MODULE_3__.Gender.Female]: _assets_assetPool__WEBPACK_IMPORTED_MODULE_5__.bfemale,
    },
    [_api_types__WEBPACK_IMPORTED_MODULE_3__.Roles.Wizard]: {
        [_api_types__WEBPACK_IMPORTED_MODULE_3__.Gender.Male]: _assets_assetPool__WEBPACK_IMPORTED_MODULE_5__.wmale,
        [_api_types__WEBPACK_IMPORTED_MODULE_3__.Gender.Female]: _assets_assetPool__WEBPACK_IMPORTED_MODULE_5__.wfemale,
    },
    [_api_types__WEBPACK_IMPORTED_MODULE_3__.Roles.Rogue]: {
        [_api_types__WEBPACK_IMPORTED_MODULE_3__.Gender.Male]: _assets_assetPool__WEBPACK_IMPORTED_MODULE_5__.rmale,
        [_api_types__WEBPACK_IMPORTED_MODULE_3__.Gender.Female]: _assets_assetPool__WEBPACK_IMPORTED_MODULE_5__.rfemale,
    },
    [_api_types__WEBPACK_IMPORTED_MODULE_3__.Roles.Paladin]: {
        [_api_types__WEBPACK_IMPORTED_MODULE_3__.Gender.Male]: _assets_assetPool__WEBPACK_IMPORTED_MODULE_5__.pmale,
        [_api_types__WEBPACK_IMPORTED_MODULE_3__.Gender.Female]: _assets_assetPool__WEBPACK_IMPORTED_MODULE_5__.pfemale,
    },
};
const clearIsChoiceFlag = () => {
    isChoiceButtonActive = false;
};
class State {
    constructor() {
        this.areArraysEqual = (a, b) => {
            //if both empty, true
            if (a.length == 0 && b.length == 0)
                return true;
            if (a.length != b.length)
                return false;
            let failedtests = 0;
            if (a.length == b.length) {
                b.forEach((card, i) => {
                    if ("id" in a[i]) {
                        if (card.id != a[i].id)
                            failedtests++;
                        console.log(`card damage: ${card.damage} vs ${a[i].damage}`);
                        if (card.damage != a[i].damage)
                            failedtests++;
                    }
                });
                if (failedtests == 0)
                    return true;
            }
            return false;
        };
        this.updateArgs = (update) => {
            if (this) {
                this.state.gameData.gameID = update.stateId;
                this.state.gameData.playerIndex = update.state.me;
                this.state.gameData.Players = update.state.players;
                this.state.gameData.roundState = update.state.roundState;
                this.state.gameData.cardPool = update.state.cardPool;
                this.state.gameData.turnOrder = update.state.turnOrder;
                this.state.gameData.turn = update.state.turn;
                if (update.state.activeMonsters.length > 0) {
                    console.log("monsters", this.state.gameData.activeMonsters[0], update.state.activeMonsters[0]);
                    if (this.state.gameData.activeMonsters.length == 0) {
                        this.state.gameData.activeMonsters = [...update.state.activeMonsters];
                    }
                    else if (update.state.activeMonsters[0].id != this.state.gameData.activeMonsters[0].id) {
                        this.state.gameData.activeMonsters = [...update.state.activeMonsters];
                    }
                    else if (update.state.activeMonsters[0].damage != this.state.gameData.activeMonsters[0].damage) {
                        this.state.gameData.activeMonsters[0].damage = update.state.activeMonsters[0].damage;
                    }
                }
                this.state.gameData.location = update.state.location;
                this.state.gameData.TDCard = update.state.TDcard;
                if (this.state.gameData.TDCard) {
                    this.state.myTowerD.desc = this.state.gameData.TDCard.effectString;
                    this.state.myTowerD.level = this.state.gameData.TDCard.level;
                    this.state.myTowerD.title = this.state.gameData.TDCard.title;
                    this.state.myTowerD.id = this.state.gameData.TDCard.id;
                }
                let lastMessage = update.state.Messages.length;
                if (update.state.Messages.length != this.state.myChat.messages.length) {
                    let lastindex = this.state.myChat.messages.length;
                    const newArray = update.state.Messages.filter(elem => {
                        return elem.id > lastindex;
                    });
                    newArray.forEach(msg => {
                        let msgType;
                        if (msg.sender == this.state.gameData.Players[this.state.gameData.playerIndex].id)
                            msgType = "chat_user";
                        else
                            msgType = "chat_other";
                        this.state.myChat.messages.push({
                            type: msgType,
                            message: `${msg.nickName}: ${msg.data}`,
                            id: msg.id,
                        });
                    });
                    setTimeout(() => {
                        chatDiv = document.getElementById("chatdiv");
                        if (chatDiv) {
                            chatDiv.scrollTop = chatDiv.scrollHeight + 45;
                        }
                    }, 50);
                }
                if (update.state.me != undefined && this.state.gameData.Players.length > 0) {
                    if (this.state.myChat.isActive === true) {
                        this.state.myChat.numUnreadMessages = 0;
                        if (this.state.gameData.Players[this.state.gameData.playerIndex].lastSeen != lastMessage)
                            _utils__WEBPACK_IMPORTED_MODULE_0__.utils.seenChat(lastMessage);
                    }
                    else {
                        this.state.myChat.numUnreadMessages =
                            lastMessage - this.state.gameData.Players[this.state.gameData.playerIndex].lastSeen;
                    }
                }
                //staging screen
                if (this.state.myContainer.myRoute == _components__WEBPACK_IMPORTED_MODULE_1__.Router.Staging || this.state.myContainer.myRoute == _components__WEBPACK_IMPORTED_MODULE_1__.Router.Character) {
                    this.state.myStaging.group.length = 0;
                    this.state.gameData.Players.forEach((player, index) => {
                        this.state.myStaging.group.push({
                            index: index + 1,
                            name: player.name,
                            img: roleMap[player.role][player.gender],
                        });
                    });
                }
                if (this.state.myContainer.myRoute == _components__WEBPACK_IMPORTED_MODULE_1__.Router.Game || this.state.myContainer.myRoute == _components__WEBPACK_IMPORTED_MODULE_1__.Router.Staging) {
                    //PUI
                    this.state.mypUI.allPlayers.forEach((p, i) => {
                        p.coin = this.state.gameData.Players[i].coin;
                        p.attack = this.state.gameData.Players[i].attack;
                        //p.health = this.state.gameData.Players[i].health;
                        if (this.state.gameData.Players[i].id == this.state.gameData.turn)
                            p.bloomStatus = "playerBloom";
                        else
                            p.bloomStatus = "";
                    });
                }
            }
            //events
            if (update.events.length) {
                console.log("SERVER EVENTS: ", update.events);
            }
            update.events.forEach(event => {
                switch (event) {
                    case "START":
                        if (this.state.myContainer.myRoute != _components__WEBPACK_IMPORTED_MODULE_1__.Router.Game) {
                            this.state.gameData.Players.forEach((p, i) => {
                                this.state.mypUI.allPlayers.push(new _components_character__WEBPACK_IMPORTED_MODULE_2__.Character({
                                    name: p.name,
                                    role: p.role,
                                    index: i,
                                    gender: p.gender,
                                    bloomStatus: "",
                                    statusEffects: p.statusEffects,
                                }));
                            });
                            this.state.myContainer.screenSwitch(_components__WEBPACK_IMPORTED_MODULE_1__.Router.Game);
                            _utils__WEBPACK_IMPORTED_MODULE_0__.utils.playGameMusic();
                        }
                        (0,_events__WEBPACK_IMPORTED_MODULE_4__.startEventSequence)(_events__WEBPACK_IMPORTED_MODULE_4__.startSetupSeq, this.state);
                        (0,_events__WEBPACK_IMPORTED_MODULE_4__.startEventSequence)(_events__WEBPACK_IMPORTED_MODULE_4__.startSequence, this.state);
                        break;
                    case "START TURN":
                        (0,_events__WEBPACK_IMPORTED_MODULE_4__.startEventSequence)(_events__WEBPACK_IMPORTED_MODULE_4__.startTurn, this.state);
                        break;
                    case "PASSIVES":
                        (0,_events__WEBPACK_IMPORTED_MODULE_4__.startEventSequence)(_events__WEBPACK_IMPORTED_MODULE_4__.passives, this.state);
                        break;
                    case "STATUSEFFECT ADDED":
                        (0,_events__WEBPACK_IMPORTED_MODULE_4__.startEventSequence)(_events__WEBPACK_IMPORTED_MODULE_4__.updateStatEffects, this.state);
                        break;
                    case "Lose1Health":
                        (0,_events__WEBPACK_IMPORTED_MODULE_4__.startEventSequence)(_events__WEBPACK_IMPORTED_MODULE_4__.lowerHealth1, this.state);
                        break;
                    case "Lose2Health":
                        (0,_events__WEBPACK_IMPORTED_MODULE_4__.startEventSequence)(_events__WEBPACK_IMPORTED_MODULE_4__.lowerHealth2, this.state);
                        break;
                    case "add1toLocation":
                        (0,_events__WEBPACK_IMPORTED_MODULE_4__.startEventSequence)(_events__WEBPACK_IMPORTED_MODULE_4__.locDamage, this.state);
                        this.state.myLocation.addPoint(1, this.state);
                        break;
                    case "hideTD":
                        (0,_events__WEBPACK_IMPORTED_MODULE_4__.startEventSequence)(_events__WEBPACK_IMPORTED_MODULE_4__.hideTD, this.state);
                        break;
                    case "ENABLE_Monster":
                        (0,_events__WEBPACK_IMPORTED_MODULE_4__.startEventSequence)(_events__WEBPACK_IMPORTED_MODULE_4__.bloomMonsters, this.state);
                        break;
                    case "NO MONSTERS READY":
                        (0,_events__WEBPACK_IMPORTED_MODULE_4__.startEventSequence)(_events__WEBPACK_IMPORTED_MODULE_4__.skipMonsters, this.state);
                        break;
                    case "MONSTER_PLAYED":
                        (0,_events__WEBPACK_IMPORTED_MODULE_4__.startEventSequence)(_events__WEBPACK_IMPORTED_MODULE_4__.MonsterPlayed, this.state);
                        break;
                    case "ENABLE_Player":
                        (0,_events__WEBPACK_IMPORTED_MODULE_4__.startEventSequence)(_events__WEBPACK_IMPORTED_MODULE_4__.playerHandShow, this.state);
                        break;
                    case "PLAYERDONE":
                        (0,_events__WEBPACK_IMPORTED_MODULE_4__.startEventSequence)(_events__WEBPACK_IMPORTED_MODULE_4__.playerHandDone, this.state);
                        break;
                    case "STUNNED":
                        //TODO - come up with Stunned practice
                        break;
                    case "+1Attack":
                        (0,_events__WEBPACK_IMPORTED_MODULE_4__.startEventSequence)(_events__WEBPACK_IMPORTED_MODULE_4__.add1Attack, this.state);
                        break;
                    case "+1Health":
                        (0,_events__WEBPACK_IMPORTED_MODULE_4__.startEventSequence)(_events__WEBPACK_IMPORTED_MODULE_4__.raiseHealth1, this.state);
                        break;
                    case "+2Coin":
                        (0,_events__WEBPACK_IMPORTED_MODULE_4__.startEventSequence)(_events__WEBPACK_IMPORTED_MODULE_4__.add2Coin, this.state);
                        break;
                    case "+1Coin":
                        (0,_events__WEBPACK_IMPORTED_MODULE_4__.startEventSequence)(_events__WEBPACK_IMPORTED_MODULE_4__.add1Coin, this.state);
                        break;
                    case "draw":
                        (0,_events__WEBPACK_IMPORTED_MODULE_4__.startEventSequence)(_events__WEBPACK_IMPORTED_MODULE_4__.drawNewCard, this.state);
                        break;
                    case "draw2":
                        (0,_events__WEBPACK_IMPORTED_MODULE_4__.startEventSequence)(_events__WEBPACK_IMPORTED_MODULE_4__.draw2NewCard, this.state);
                        break;
                    case "+1HealthtoAllOthers":
                        (0,_events__WEBPACK_IMPORTED_MODULE_4__.startEventSequence)(_events__WEBPACK_IMPORTED_MODULE_4__.healOthers1, this.state);
                        break;
                    case "remove1fromLocation":
                        (0,_events__WEBPACK_IMPORTED_MODULE_4__.startEventSequence)(_events__WEBPACK_IMPORTED_MODULE_4__.remove1Location, this.state);
                        break;
                    case "chooseAttack1Ability1":
                        isChoiceButtonActive = true;
                        (0,_events__WEBPACK_IMPORTED_MODULE_4__.startEventSequence)(_events__WEBPACK_IMPORTED_MODULE_4__.chooseAtk1Coin1, this.state);
                        break;
                    case "chooseHealth1Ability1":
                        isChoiceButtonActive = true;
                        (0,_events__WEBPACK_IMPORTED_MODULE_4__.startEventSequence)(_events__WEBPACK_IMPORTED_MODULE_4__.chooseHealth1Coin1, this.state);
                        break;
                    case "chooseAttack1Draw1":
                        isChoiceButtonActive = true;
                        (0,_events__WEBPACK_IMPORTED_MODULE_4__.startEventSequence)(_events__WEBPACK_IMPORTED_MODULE_4__.chooseAtk1Draw1, this.state);
                        break;
                    case "chooseAbility1Draw1":
                        isChoiceButtonActive = true;
                        (0,_events__WEBPACK_IMPORTED_MODULE_4__.startEventSequence)(_events__WEBPACK_IMPORTED_MODULE_4__.chooseCoin1Draw1, this.state);
                        break;
                    case "discard":
                        isChoiceButtonActive = true;
                        (0,_events__WEBPACK_IMPORTED_MODULE_4__.startEventSequence)(_events__WEBPACK_IMPORTED_MODULE_4__.discard1, this.state);
                        break;
                    case "discarded":
                        (0,_events__WEBPACK_IMPORTED_MODULE_4__.startEventSequence)(_events__WEBPACK_IMPORTED_MODULE_4__.refreshHand, this.state);
                        break;
                    case "chooseHealth1Draw1":
                        isChoiceButtonActive = true;
                        (0,_events__WEBPACK_IMPORTED_MODULE_4__.startEventSequence)(_events__WEBPACK_IMPORTED_MODULE_4__.chooseHealth1Draw1, this.state);
                        break;
                    case "addHealth1anyPlayer":
                        isChoiceButtonActive = true;
                        (0,_events__WEBPACK_IMPORTED_MODULE_4__.startEventSequence)(_events__WEBPACK_IMPORTED_MODULE_4__.anyPlayer1Health, this.state);
                        break;
                    case "addCoin1anyPlayer":
                        isChoiceButtonActive = true;
                        (0,_events__WEBPACK_IMPORTED_MODULE_4__.startEventSequence)(_events__WEBPACK_IMPORTED_MODULE_4__.anyPlayer1Coin, this.state);
                        break;
                    case "player1health":
                        (0,_events__WEBPACK_IMPORTED_MODULE_4__.startEventSequence)(_events__WEBPACK_IMPORTED_MODULE_4__.p1Health1, this.state);
                        break;
                    case "player2health":
                        (0,_events__WEBPACK_IMPORTED_MODULE_4__.startEventSequence)(_events__WEBPACK_IMPORTED_MODULE_4__.p2Health1, this.state);
                        break;
                    case "player3health":
                        (0,_events__WEBPACK_IMPORTED_MODULE_4__.startEventSequence)(_events__WEBPACK_IMPORTED_MODULE_4__.p3Health1, this.state);
                        break;
                    case "player4health":
                        (0,_events__WEBPACK_IMPORTED_MODULE_4__.startEventSequence)(_events__WEBPACK_IMPORTED_MODULE_4__.p4Health1, this.state);
                        break;
                    case "player1coin":
                        (0,_events__WEBPACK_IMPORTED_MODULE_4__.startEventSequence)(_events__WEBPACK_IMPORTED_MODULE_4__.p1Coin1, this.state);
                        break;
                    case "player2coin":
                        (0,_events__WEBPACK_IMPORTED_MODULE_4__.startEventSequence)(_events__WEBPACK_IMPORTED_MODULE_4__.p2Coin1, this.state);
                        break;
                    case "player3coin":
                        (0,_events__WEBPACK_IMPORTED_MODULE_4__.startEventSequence)(_events__WEBPACK_IMPORTED_MODULE_4__.p3Coin1, this.state);
                        break;
                    case "player4coin":
                        (0,_events__WEBPACK_IMPORTED_MODULE_4__.startEventSequence)(_events__WEBPACK_IMPORTED_MODULE_4__.p4Coin1, this.state);
                        break;
                    case "Show Card Pool":
                        (0,_events__WEBPACK_IMPORTED_MODULE_4__.startEventSequence)(_events__WEBPACK_IMPORTED_MODULE_4__.showCardPool, this.state);
                        break;
                    case "card purchased":
                        (0,_events__WEBPACK_IMPORTED_MODULE_4__.startEventSequence)(_events__WEBPACK_IMPORTED_MODULE_4__.cardpurchased, this.state);
                        break;
                    case "Close Card Pool":
                        (0,_events__WEBPACK_IMPORTED_MODULE_4__.startEventSequence)(_events__WEBPACK_IMPORTED_MODULE_4__.hideCardpool, this.state);
                        break;
                    case "Ready to apply damage":
                        (0,_events__WEBPACK_IMPORTED_MODULE_4__.startEventSequence)(_events__WEBPACK_IMPORTED_MODULE_4__.enablemonsterDamage, this.state);
                        break;
                    case "Ready to End Turn":
                        (0,_events__WEBPACK_IMPORTED_MODULE_4__.startEventSequence)(_events__WEBPACK_IMPORTED_MODULE_4__.readyToEndTurn, this.state);
                        break;
                    case "Applying Damage":
                        (0,_events__WEBPACK_IMPORTED_MODULE_4__.startEventSequence)(_events__WEBPACK_IMPORTED_MODULE_4__.damageMonster, this.state);
                        break;
                    case "Ready for next player":
                        console.log("running endturn");
                        (0,_events__WEBPACK_IMPORTED_MODULE_4__.startEventSequence)(_events__WEBPACK_IMPORTED_MODULE_4__.endturn, this.state);
                        break;
                    case "clearSE":
                        (0,_events__WEBPACK_IMPORTED_MODULE_4__.startEventSequence)(_events__WEBPACK_IMPORTED_MODULE_4__.clearSE, this.state);
                        break;
                    case "monsterdefeated":
                        (0,_events__WEBPACK_IMPORTED_MODULE_4__.startEventSequence)(_events__WEBPACK_IMPORTED_MODULE_4__.ChangeMonster, this.state);
                        break;
                    case "VICTORY":
                        (0,_events__WEBPACK_IMPORTED_MODULE_4__.startEventSequence)(_events__WEBPACK_IMPORTED_MODULE_4__.winGameOver, this.state);
                        break;
                    case "drawBlocked":
                        (0,_events__WEBPACK_IMPORTED_MODULE_4__.startEventSequence)(_events__WEBPACK_IMPORTED_MODULE_4__.sendToastDrawBlocked, this.state);
                        break;
                    case "LOST":
                        (0,_events__WEBPACK_IMPORTED_MODULE_4__.startEventSequence)(_events__WEBPACK_IMPORTED_MODULE_4__.loseGameOver, this.state);
                        break;
                    case "LocationLost":
                        (0,_events__WEBPACK_IMPORTED_MODULE_4__.startEventSequence)(_events__WEBPACK_IMPORTED_MODULE_4__.hideLocation, this.state);
                        break;
                    case "newlocation":
                        (0,_events__WEBPACK_IMPORTED_MODULE_4__.startEventSequence)(_events__WEBPACK_IMPORTED_MODULE_4__.showNewLocation, this.state);
                        break;
                    case "locationCurseEffect":
                        (0,_events__WEBPACK_IMPORTED_MODULE_4__.startEventSequence)(_events__WEBPACK_IMPORTED_MODULE_4__.sendToastLocation, this.state);
                        break;
                    case "discardcurse":
                        (0,_events__WEBPACK_IMPORTED_MODULE_4__.startEventSequence)(_events__WEBPACK_IMPORTED_MODULE_4__.sendToastDiscardCurse, this.state);
                        break;
                }
            });
        };
        this.state = {
            playerData: {
                username: "",
                name: "",
                id: "",
            },
            gameData: {
                playerIndex: 1,
                Players: [],
                roundState: 0,
                activeMonsters: [],
                location: {},
                TDcard: {},
                cardPool: [],
                turn: 0,
                turnOrder: [],
                gameID: "",
            },
            myContainer: {
                myRoute: _components__WEBPACK_IMPORTED_MODULE_1__.Router.Title,
                get isTitle() {
                    return this.myRoute === _components__WEBPACK_IMPORTED_MODULE_1__.Router.Title;
                },
                get isLobby() {
                    return this.myRoute === _components__WEBPACK_IMPORTED_MODULE_1__.Router.Lobby;
                },
                get isCharacter() {
                    return this.myRoute === _components__WEBPACK_IMPORTED_MODULE_1__.Router.Character;
                },
                get isGame() {
                    return this.myRoute === _components__WEBPACK_IMPORTED_MODULE_1__.Router.Game;
                },
                get isStaging() {
                    return this.myRoute === _components__WEBPACK_IMPORTED_MODULE_1__.Router.Staging;
                },
                screenSwitch: async (newScreen) => {
                    this.state.mySceneTransition.fadeIn();
                    await _utils__WEBPACK_IMPORTED_MODULE_0__.utils.wait(900);
                    this.state.myContainer.myRoute = newScreen;
                    this.state.mySceneTransition.fadeOut();
                    await _utils__WEBPACK_IMPORTED_MODULE_0__.utils.wait(900);
                    this.state.mySceneTransition.reset();
                },
            },
            myTitle: {
                version: "BETA 0.1.0 ",
                title: "DEMON SIEGE",
                subtitle: "PRESS LOGIN TO BEGIN",
                login: () => {
                    _utils__WEBPACK_IMPORTED_MODULE_0__.utils.playSound("button");
                    _utils__WEBPACK_IMPORTED_MODULE_0__.utils.login();
                },
            },
            mySceneTransition: {
                classString: "normal",
                fadeIn: () => (this.state.mySceneTransition.classString = "normal sceneTransition"),
                fadeOut: () => (this.state.mySceneTransition.classString = "normal sceneTransition fade-out"),
                reset: () => (this.state.mySceneTransition.classString = "normal"),
            },
            myLobby: {
                title: "Lobby",
                subtitle: "Choose to create game or join",
                isJoining: false,
                isDisabled: true,
                validationCSSstring: "joinGameText",
                get buttonEnable() {
                    return this.isDisabled;
                },
                createGame: () => {
                    _utils__WEBPACK_IMPORTED_MODULE_0__.utils.playSound("button");
                    _utils__WEBPACK_IMPORTED_MODULE_0__.utils.createGame();
                },
                joinGame: (event, model) => {
                    _utils__WEBPACK_IMPORTED_MODULE_0__.utils.playSound("button");
                    if (model.myLobby.isJoining) {
                        model.myLobby.isJoining = false;
                    }
                    else {
                        model.myLobby.isJoining = true;
                    }
                },
                findGame: () => {
                    console.log("Finding Game");
                    _utils__WEBPACK_IMPORTED_MODULE_0__.utils.findMatch();
                },
                logout: () => {
                    _utils__WEBPACK_IMPORTED_MODULE_0__.utils.playSound("button");
                    this.state.playerData.username = "";
                    this.state.myContainer.screenSwitch(_components__WEBPACK_IMPORTED_MODULE_1__.Router.Title);
                },
                validate: (event, model) => {
                    const validateGameID = (id) => {
                        const regex = new RegExp("^[a-zA-Z0-9]{11,13}$");
                        return regex.test(id);
                    };
                    //step one, read the input
                    let mystring = this.state.gameData.gameID;
                    //step two, qualify the input
                    let valStatus = validateGameID(mystring);
                    //step three, do something to the UI to indicate pass/fail
                    if (valStatus) {
                        //update UI
                        model.myLobby.isDisabled = false;
                        model.myLobby.validationCSSstring = "joinGameText goodData";
                    }
                    else {
                        model.myLobby.isDisabled = true;
                        model.myLobby.validationCSSstring = "joinGameText badData";
                    }
                },
                connect: (_event, model) => {
                    _utils__WEBPACK_IMPORTED_MODULE_0__.utils.joinGame(model.gameData.gameID);
                },
            },
            myCharscreen: {
                characterName: "Enter Character Name",
                selectText: (_event, _model, element) => {
                    element.select();
                },
                selectRogue: (event, model) => {
                    //gaurd conditions
                    if (model.myCharscreen.characterName == "Enter Character Name")
                        return;
                    model.myCharscreen.role = _api_types__WEBPACK_IMPORTED_MODULE_3__.Roles.Rogue;
                    let gender;
                    model.myCharscreen.isMale ? (gender = _api_types__WEBPACK_IMPORTED_MODULE_3__.Gender.Male) : (gender = _api_types__WEBPACK_IMPORTED_MODULE_3__.Gender.Female);
                    if (model.myCharscreen.isMale)
                        model.myCharscreen.imgSource = _assets_assetPool__WEBPACK_IMPORTED_MODULE_5__.rmale;
                    else
                        model.myCharscreen.imgSource = _assets_assetPool__WEBPACK_IMPORTED_MODULE_5__.rfemale;
                    model.myCharscreen.isModalShowing = true;
                    _utils__WEBPACK_IMPORTED_MODULE_0__.utils.playSound("button");
                    _utils__WEBPACK_IMPORTED_MODULE_0__.utils.chooseChar(model.myCharscreen.characterName.toUpperCase(), model.myCharscreen.role, gender);
                },
                selectBarbarian: (event, model) => {
                    //gaurd conditions
                    if (model.myCharscreen.characterName == "Enter Character Name")
                        return;
                    model.myCharscreen.role = _api_types__WEBPACK_IMPORTED_MODULE_3__.Roles.Barbarian;
                    let gender;
                    model.myCharscreen.isMale ? (gender = _api_types__WEBPACK_IMPORTED_MODULE_3__.Gender.Male) : (gender = _api_types__WEBPACK_IMPORTED_MODULE_3__.Gender.Female);
                    if (model.myCharscreen.isMale)
                        model.myCharscreen.imgSource = _assets_assetPool__WEBPACK_IMPORTED_MODULE_5__.bmale;
                    else
                        model.myCharscreen.imgSource = _assets_assetPool__WEBPACK_IMPORTED_MODULE_5__.bfemale;
                    model.myCharscreen.isModalShowing = true;
                    _utils__WEBPACK_IMPORTED_MODULE_0__.utils.playSound("button");
                    _utils__WEBPACK_IMPORTED_MODULE_0__.utils.chooseChar(model.myCharscreen.characterName.toUpperCase(), model.myCharscreen.role, gender);
                },
                selectWizard: (event, model) => {
                    //gaurd conditions
                    if (model.myCharscreen.characterName == "Enter Character Name")
                        return;
                    model.myCharscreen.role = _api_types__WEBPACK_IMPORTED_MODULE_3__.Roles.Wizard;
                    let gender;
                    model.myCharscreen.isMale ? (gender = _api_types__WEBPACK_IMPORTED_MODULE_3__.Gender.Male) : (gender = _api_types__WEBPACK_IMPORTED_MODULE_3__.Gender.Female);
                    if (model.myCharscreen.isMale)
                        model.myCharscreen.imgSource = _assets_assetPool__WEBPACK_IMPORTED_MODULE_5__.wmale;
                    else
                        model.myCharscreen.imgSource = _assets_assetPool__WEBPACK_IMPORTED_MODULE_5__.wfemale;
                    model.myCharscreen.isModalShowing = true;
                    _utils__WEBPACK_IMPORTED_MODULE_0__.utils.playSound("button");
                    _utils__WEBPACK_IMPORTED_MODULE_0__.utils.chooseChar(model.myCharscreen.characterName.toUpperCase(), model.myCharscreen.role, gender);
                },
                selectPaladin: (event, model) => {
                    //gaurd conditions
                    if (model.myCharscreen.characterName == "Enter Character Name")
                        return;
                    model.myCharscreen.role = _api_types__WEBPACK_IMPORTED_MODULE_3__.Roles.Paladin;
                    let gender;
                    model.myCharscreen.isMale ? (gender = _api_types__WEBPACK_IMPORTED_MODULE_3__.Gender.Male) : (gender = _api_types__WEBPACK_IMPORTED_MODULE_3__.Gender.Female);
                    if (model.myCharscreen.isMale)
                        model.myCharscreen.imgSource = _assets_assetPool__WEBPACK_IMPORTED_MODULE_5__.pmale;
                    else
                        model.myCharscreen.imgSource = _assets_assetPool__WEBPACK_IMPORTED_MODULE_5__.pfemale;
                    model.myCharscreen.isModalShowing = true;
                    _utils__WEBPACK_IMPORTED_MODULE_0__.utils.playSound("button");
                    _utils__WEBPACK_IMPORTED_MODULE_0__.utils.chooseChar(model.myCharscreen.characterName.toUpperCase(), model.myCharscreen.role, gender);
                },
                goBack: () => {
                    _utils__WEBPACK_IMPORTED_MODULE_0__.utils.playSound("button");
                    _utils__WEBPACK_IMPORTED_MODULE_0__.utils.leaveRoom();
                    this.state.myContainer.screenSwitch(_components__WEBPACK_IMPORTED_MODULE_1__.Router.Lobby);
                },
                logout: () => {
                    _utils__WEBPACK_IMPORTED_MODULE_0__.utils.leaveRoom();
                    _utils__WEBPACK_IMPORTED_MODULE_0__.utils.playSound("button");
                    this.state.playerData.username = "";
                    this.state.myContainer.screenSwitch(_components__WEBPACK_IMPORTED_MODULE_1__.Router.Title);
                },
                cancelSelection: (event, model) => {
                    _utils__WEBPACK_IMPORTED_MODULE_0__.utils.playSound("button");
                    model.myCharscreen.isModalShowing = false;
                    model.myCharscreen.characterName = "Enter Character Name";
                    model.myCharscreen.switchPosition = "left";
                    model.myCharscreen.isMale = true;
                },
                enterGame: () => {
                    _utils__WEBPACK_IMPORTED_MODULE_0__.utils.playSound("button");
                    _utils__WEBPACK_IMPORTED_MODULE_0__.utils.enterGame();
                    this.state.myContainer.screenSwitch(_components__WEBPACK_IMPORTED_MODULE_1__.Router.Staging);
                },
                toggleGender: (event, model) => {
                    _utils__WEBPACK_IMPORTED_MODULE_0__.utils.playSound("button");
                    if (this.state.myCharscreen.isMale) {
                        model.myCharscreen.switchPosition = "right";
                        model.myCharscreen.isMale = false;
                    }
                    else {
                        model.myCharscreen.isMale = true;
                        model.myCharscreen.switchPosition = "left";
                    }
                },
                isMale: true,
                isModalShowing: false,
                role: "barbarian",
                switchPosition: "left",
                imgSource: null,
            },
            myStaging: {
                isVisible: true,
                group: [],
                back: () => {
                    _utils__WEBPACK_IMPORTED_MODULE_0__.utils.playSound("button");
                    _utils__WEBPACK_IMPORTED_MODULE_0__.utils.leaveGame();
                    this.state.myContainer.screenSwitch(_components__WEBPACK_IMPORTED_MODULE_1__.Router.Character);
                },
                start: (_event, model) => {
                    _utils__WEBPACK_IMPORTED_MODULE_0__.utils.playSound("button");
                    model.myStaging.isVisible = false;
                    _utils__WEBPACK_IMPORTED_MODULE_0__.utils.startGame();
                    this.state.myContainer.screenSwitch(_components__WEBPACK_IMPORTED_MODULE_1__.Router.Game);
                },
                logout: (event, model) => {
                    model.myCharscreen.characterName = "Enter Character Name";
                    model.myCharscreen.isModalShowing = false;
                    _utils__WEBPACK_IMPORTED_MODULE_0__.utils.leaveRoom();
                    _utils__WEBPACK_IMPORTED_MODULE_0__.utils.playSound("button");
                    this.state.playerData.username = "";
                    this.state.myContainer.screenSwitch(_components__WEBPACK_IMPORTED_MODULE_1__.Router.Title);
                },
            },
            myGame: {
                showModal: false,
            },
            myCardPool: {
                //open issues
                //toasts don't hover
                //need to add cost to card
                cardSelected: 0,
                showConfirmation: false,
                selectedCard: {
                    id: "",
                    title: "",
                    desc: "",
                    cost: 0,
                    level: 1,
                },
                confCancel: () => {
                    this.state.myCardPool.showConfirmation = false;
                },
                confAccept: () => {
                    _utils__WEBPACK_IMPORTED_MODULE_0__.utils.buyCard(this.state.myCardPool.selectedCard.id);
                    this.state.myCardPool.showConfirmation = false;
                },
                clickHandler: (event, model, element) => {
                    const usr = this.state.gameData.Players.findIndex(p => {
                        return this.state.gameData.turn === p.id;
                    });
                    const myTurn = this.state.gameData.Players[usr].id == this.state.playerData.id;
                    if (!myTurn)
                        return;
                    const clickedCard = element.getAttribute("id");
                    const cardPoolIndex = parseInt(clickedCard.split("P")[1]);
                    //check for user's coin amount
                    //if coins > card cost let them buy
                    //if coin < card cost, toast message
                    const userMoneyAmount = this.state.gameData.Players[usr].coin;
                    if (userMoneyAmount >= this.state.gameData.cardPool[cardPoolIndex].cost) {
                        this.state.myCardPool.cardSelected = cardPoolIndex;
                        this.state.myCardPool.selectedCard.title = this.state.gameData.cardPool[cardPoolIndex].title;
                        this.state.myCardPool.selectedCard.desc = this.state.gameData.cardPool[cardPoolIndex].effectString;
                        this.state.myCardPool.selectedCard.cost = this.state.gameData.cardPool[cardPoolIndex].cost;
                        this.state.myCardPool.selectedCard.level = this.state.gameData.cardPool[cardPoolIndex].level;
                        this.state.myCardPool.selectedCard.id = this.state.gameData.cardPool[cardPoolIndex].id;
                        this.state.myCardPool.showConfirmation = true;
                        //show card confirmation window
                    }
                    else {
                        this.state.myToast.addToast("card", "Player lacks the funds");
                        return;
                    }
                },
            },
            attributes: {
                icons: '<a href="https://www.flaticon.com/free-icons/card" title="card icons">Card icons created by Pixel perfect - Flaticon</a>',
                sounds: "Sound from Zapsplat.com",
                moresounds: "Sound from freesound.org, f4ngy user, dealing card effect",
            },
            myToast: {
                intervalID: null,
                messages: [],
                addToast: (icontype, msg, event, model, element) => {
                    let iconMap = {
                        user: _assets_assetPool__WEBPACK_IMPORTED_MODULE_5__.userIcon,
                        location: _assets_assetPool__WEBPACK_IMPORTED_MODULE_5__.locationIcon,
                        monster: _assets_assetPool__WEBPACK_IMPORTED_MODULE_5__.monsterIcon,
                        card: _assets_assetPool__WEBPACK_IMPORTED_MODULE_5__.cardIcon,
                        effect: _assets_assetPool__WEBPACK_IMPORTED_MODULE_5__.effectIcon,
                    };
                    let config = {
                        msg: msg,
                        img: iconMap[icontype],
                        timeOut: 5000,
                        close: (_event, model, _element, _at, context) => {
                            context.$parent.$model.myToast.messages = context.$parent.$model.myToast.messages.filter(m => m !== model.msg);
                        },
                        hover: (_event, _model, element) => {
                            const prnt = element.parentElement;
                            prnt.classList.remove("bloom");
                        },
                    };
                    this.state.myToast.messages.push(config);
                },
            },
            myChat: {
                messages: [],
                inputMessage: "enter chat here",
                isActive: false,
                numUnreadMessages: 0,
                selectText: (event, model, element) => {
                    element.select();
                },
                sendMessage: (event, model, element) => {
                    _utils__WEBPACK_IMPORTED_MODULE_0__.utils.playSound("mailSend");
                    _utils__WEBPACK_IMPORTED_MODULE_0__.utils.sendChat(model.myChat.inputMessage);
                    model.myChat.inputMessage = "";
                },
                toggleChat: (event, model) => {
                    _utils__WEBPACK_IMPORTED_MODULE_0__.utils.playSound("button");
                    if (model.myChat.isActive === true) {
                        controller.abort();
                        controller = null;
                        model.myChat.isActive = false;
                    }
                    else {
                        model.myChat.isActive = true;
                        controller = new AbortController();
                        keybinding = document.addEventListener("keypress", e => {
                            if (e.key == "Enter") {
                                _utils__WEBPACK_IMPORTED_MODULE_0__.utils.playSound("mailSend");
                                _utils__WEBPACK_IMPORTED_MODULE_0__.utils.sendChat(model.myChat.inputMessage);
                                model.myChat.inputMessage = "";
                            }
                        }, { signal: controller.signal });
                        _utils__WEBPACK_IMPORTED_MODULE_0__.utils.seenChat(model.myChat.messages.length);
                    }
                },
                get showPill() {
                    return this.numUnreadMessages > 0;
                },
            },
            mypUI: {
                clear: (_event, model) => {
                    if (this.state.gameData.roundState === _api_types__WEBPACK_IMPORTED_MODULE_3__.RoundState.waitingOnPlayer ||
                        this.state.gameData.roundState === _api_types__WEBPACK_IMPORTED_MODULE_3__.RoundState.activeRunningPlayer)
                        return;
                    model.myHand.isVisible = false;
                },
                checkHover: (event, model) => {
                    if (this.state.gameData.roundState === _api_types__WEBPACK_IMPORTED_MODULE_3__.RoundState.waitingOnPlayer ||
                        this.state.gameData.roundState === _api_types__WEBPACK_IMPORTED_MODULE_3__.RoundState.activeRunningPlayer)
                        return;
                    mouseCount += 1;
                    if (mouseCount >= MOUSELIMIT) {
                        mouseCount = 0;
                        model.myHand.hand = [];
                        model.myHand.isVisible = false;
                        model.mypUI.allPlayers.forEach((p, i) => {
                            if (p.isHovered()) {
                                switch (i) {
                                    case 0:
                                        model.myHand.hand = [...model.myHand.player1Hand];
                                        model.myHand.footer = `${p.name.replace(/^\w/, c => c.toUpperCase())}'s Hand`;
                                        break;
                                    case 1:
                                        model.myHand.hand = [...model.myHand.player2Hand];
                                        model.myHand.footer = `${p.name.replace(/^\w/, c => c.toUpperCase())}'s Hand`;
                                        break;
                                    case 2:
                                        model.myHand.hand = [...model.myHand.player3Hand];
                                        model.myHand.footer = `${p.name.replace(/^\w/, c => c.toUpperCase())}'s Hand`;
                                        break;
                                    case 3:
                                        model.myHand.hand = [...model.myHand.player4Hand];
                                        model.myHand.footer = `${p.name.replace(/^\w/, c => c.toUpperCase())}'s Hand`;
                                        break;
                                }
                            }
                        });
                        if (model.myHand.hand.length != 0)
                            model.myHand.isVisible = true;
                    }
                },
                turn: 1,
                showOptions: (event, model) => {
                    _utils__WEBPACK_IMPORTED_MODULE_0__.utils.loadSettings();
                    model.mySettings.showModal = true;
                },
                allPlayers: [],
            },
            myStatusEffect: {
                rotate: () => {
                    console.log("fired load event");
                },
            },
            myHand: {
                isVisible: false,
                player1Hand: [],
                player2Hand: [],
                player3Hand: [],
                player4Hand: [],
                footer: "",
                hand: [],
                done: () => {
                    _utils__WEBPACK_IMPORTED_MODULE_0__.utils.playerDone();
                },
                isEmpty: false,
                clickHandler: (_event, model, element, _attribute, object) => {
                    console.log("choice button: ", isChoiceButtonActive);
                    if (isChoiceButtonActive)
                        return;
                    const usr = this.state.gameData.Players.findIndex(p => {
                        return this.state.gameData.turn === p.id;
                    });
                    const myTurn = this.state.gameData.Players[usr].id == this.state.playerData.id;
                    console.log(this.state.gameData.Players[usr].id, myTurn, this.state.playerData.id);
                    if (!myTurn)
                        return;
                    _utils__WEBPACK_IMPORTED_MODULE_0__.utils.playSound("playCard");
                    const cardId = element.getAttribute("id");
                    if (this.state.gameData.roundState == _api_types__WEBPACK_IMPORTED_MODULE_3__.RoundState.activeRunningPlayer ||
                        this.state.gameData.roundState == _api_types__WEBPACK_IMPORTED_MODULE_3__.RoundState.waitingOnPlayer) {
                        _utils__WEBPACK_IMPORTED_MODULE_0__.utils.playPcard(cardId);
                        //remove card from myHand
                        let cardindex = this.state.myHand.hand.findIndex(c => c.id === cardId);
                        this.state.myHand.hand.splice(cardindex, 1);
                        //remove card from PLAYERXHand
                        switch (usr) {
                            case 0:
                                cardindex = this.state.myHand.player1Hand.findIndex(c => c.id === cardId);
                                this.state.myHand.player1Hand.splice(cardindex, 1);
                                break;
                            case 1:
                                cardindex = this.state.myHand.player2Hand.findIndex(c => c.id === cardId);
                                this.state.myHand.player2Hand.splice(cardindex, 1);
                                break;
                            case 2:
                                cardindex = this.state.myHand.player3Hand.findIndex(c => c.id === cardId);
                                this.state.myHand.player3Hand.splice(cardindex, 1);
                                break;
                            case 3:
                                cardindex = this.state.myHand.player4Hand.findIndex(c => c.id === cardId);
                                this.state.myHand.player4Hand.splice(cardindex, 1);
                                break;
                        }
                    }
                    object.$parent.$model.myHand.isEmpty = myTurn && object.$parent.$model.myHand.hand.length == 0;
                    return;
                },
            },
            myLocation: {
                isVisible: false,
                level: 1,
                health: 6,
                damage: 0,
                title: "Cellar",
                sequence: 1,
                addPoint: (pts, model) => {
                    if (model.myLocation.damage < model.myLocation.health) {
                        model.myLocation.damage += pts;
                        if (model.myLocation.damage == model.myLocation.health)
                            alert("location lost"); //do something here
                    }
                },
                removePoint: (pts, model) => {
                    if (model.myLocation.damage - pts >= 0) {
                        model.myLocation.damage -= pts;
                    }
                },
                cssString: "",
            },
            myTowerD: {
                cssString: "",
                isVisible: false,
                id: "",
                title: "",
                level: 1,
                desc: "",
                clicked: (event, model, element) => {
                    const usr = model.gameData.Players.findIndex(p => {
                        return model.gameData.turn === p.id;
                    });
                    const myTurn = model.gameData.Players[usr].id == model.playerData.id;
                    if (model.gameData.roundState == _api_types__WEBPACK_IMPORTED_MODULE_3__.RoundState.waitingOnTD && myTurn) {
                        //playTD Card
                        _utils__WEBPACK_IMPORTED_MODULE_0__.utils.playTD(model.myTowerD.id);
                    }
                },
            },
            myMonster: {
                isVisible: false,
                cssString: "",
                clickHandler: (event, model, element, object) => {
                    const cardId = element.getAttribute("id");
                    if (this.state.gameData.roundState == _api_types__WEBPACK_IMPORTED_MODULE_3__.RoundState.activeRunningMonster) {
                        _utils__WEBPACK_IMPORTED_MODULE_0__.utils.playMcard(cardId);
                    }
                    if (this.state.gameData.roundState == _api_types__WEBPACK_IMPORTED_MODULE_3__.RoundState.activeApplyingDamage) {
                        _utils__WEBPACK_IMPORTED_MODULE_0__.utils.applyDamage(cardId);
                    }
                    return;
                },
            },
            mySettings: {
                showModal: false,
                beginningColor: "#2c34d6",
                endingColor: "#101f6b",
                gameSpeed: 5,
                bgmMute: false,
                sfxMute: false,
                bgmIcon: _assets_assetPool__WEBPACK_IMPORTED_MODULE_5__.unmute,
                sfxIcon: _assets_assetPool__WEBPACK_IMPORTED_MODULE_5__.unmute,
                sfxGain: 5,
                bgmGain: 5,
                chatUM: "#8BAE1F",
                chatSM: "008b8b",
                chatOM: "#be53f3",
                chatBG: "#000000",
                chatOP: 0.5,
                changeSFX: (_event, model) => {
                    _utils__WEBPACK_IMPORTED_MODULE_0__.utils.updateSFXvolume(model.mySettings.sfxGain);
                },
                changeBGM: (_event, model) => {
                    _utils__WEBPACK_IMPORTED_MODULE_0__.utils.updateBGMvolume(model.mySettings.bgmGain);
                },
                muteBGM: (_event, model) => {
                    let muted = model.mySettings.bgmMute;
                    if (muted) {
                        model.mySettings.bgmMute = false;
                        model.mySettings.bgmIcon = _assets_assetPool__WEBPACK_IMPORTED_MODULE_5__.unmute;
                        _utils__WEBPACK_IMPORTED_MODULE_0__.utils.muteBGM(false);
                    }
                    else {
                        model.mySettings.bgmMute = true;
                        model.mySettings.bgmIcon = _assets_assetPool__WEBPACK_IMPORTED_MODULE_5__.mute;
                        _utils__WEBPACK_IMPORTED_MODULE_0__.utils.muteBGM(true);
                    }
                },
                muteSFX: (_event, model) => {
                    let muted = model.mySettings.sfxMute;
                    if (muted) {
                        model.mySettings.sfxMute = false;
                        model.mySettings.sfxIcon = _assets_assetPool__WEBPACK_IMPORTED_MODULE_5__.unmute;
                        _utils__WEBPACK_IMPORTED_MODULE_0__.utils.muteSFX(false);
                    }
                    else {
                        model.mySettings.sfxMute = true;
                        model.mySettings.sfxIcon = _assets_assetPool__WEBPACK_IMPORTED_MODULE_5__.mute;
                        _utils__WEBPACK_IMPORTED_MODULE_0__.utils.muteSFX(true);
                    }
                },
                closeModal: (_event, model) => {
                    _utils__WEBPACK_IMPORTED_MODULE_0__.utils.playSound("button");
                    let tempObj = {
                        chatOM: model.mySettings.chatOM,
                        chatUM: model.mySettings.chatUM,
                        chatOP: model.mySettings.chatOP,
                        chatBG: model.mySettings.chatBG,
                        chatSM: model.mySettings.chatSM,
                        GS: model.mySettings.gameSpeed,
                        sfx: model.mySettings.sfxGain,
                        bgm: model.mySettings.bgmGain,
                        bColor: model.mySettings.beginningColor,
                        eColor: model.mySettings.endingColor,
                    };
                    localStorage.setItem("DSsettings", JSON.stringify(tempObj));
                    model.mySettings.showModal = false;
                },
            },
            myHelp: {
                isVisible: false,
                pageNum: 1,
                numPages: 4,
                closeModal: (_event, model) => {
                    _utils__WEBPACK_IMPORTED_MODULE_0__.utils.playSound("button");
                    model.myHelp.isVisible = false;
                },
                showModal: (_event, model) => {
                    _utils__WEBPACK_IMPORTED_MODULE_0__.utils.playSound("button");
                    model.myHelp.pageNum = 1;
                    model.myHelp.isVisible = true;
                },
                get page1() {
                    return this.pageNum === 1;
                },
                get page2() {
                    return this.pageNum === 2;
                },
                get page3() {
                    return this.pageNum === 3;
                },
                get page4() {
                    return this.pageNum === 4;
                },
                back: (_event, model) => {
                    _utils__WEBPACK_IMPORTED_MODULE_0__.utils.playSound("button");
                    if (model.myHelp.pageNum > 1) {
                        model.myHelp.pageNum -= 1;
                    }
                },
                next: (_event, model) => {
                    _utils__WEBPACK_IMPORTED_MODULE_0__.utils.playSound("button");
                    if (model.myHelp.pageNum < model.myHelp.numPages) {
                        model.myHelp.pageNum += 1;
                    }
                },
            },
            myNavBar: {
                showNavBar: true,
                globalstates: ["passives", "td", "monster", "player", "purchase", "damage", "endturn"],
                resetTimeline: () => {
                    this.state.myNavBar.progressIndex = 0;
                    this.state.myNavBar.timestamps.forEach((ts, index) => {
                        ts.doneFlag = false;
                        if (index == 0)
                            ts.style = "NBpulse";
                        else
                            ts.style = "";
                        ts.connStyle = "";
                    });
                },
                timestamps: [
                    {
                        title: "Passives",
                        done: "Passives Applied",
                        style: "NBpulse",
                        doneFlag: false,
                        connector: true,
                        data: "passives",
                        connStyle: "",
                    },
                    {
                        title: "Tower Defense",
                        done: "TD Card Complete",
                        style: "",
                        doneFlag: false,
                        connector: true,
                        data: "td",
                        connStyle: "",
                    },
                    {
                        title: "Monster Card",
                        done: "Monster Card Complete",
                        style: "",
                        doneFlag: false,
                        connector: true,
                        data: "monster",
                        connStyle: "",
                    },
                    {
                        title: "Player Card",
                        done: "Player Hand Complete",
                        style: "",
                        doneFlag: false,
                        connector: true,
                        data: "player",
                        connStyle: "",
                    },
                    {
                        title: "Purchase Cards",
                        done: "Card Pool Complete",
                        style: "",
                        doneFlag: false,
                        connector: true,
                        data: "purchase",
                        connStyle: "",
                    },
                    {
                        title: "Apply Damage",
                        done: "Attack Complete",
                        style: "",
                        doneFlag: false,
                        connector: true,
                        data: "damage",
                        connStyle: "",
                    },
                    {
                        data: "endturn",
                        title: "End Turn",
                        done: "Resetting Turn",
                        style: "",
                        doneFlag: false,
                        connector: false,
                        connStyle: "",
                    },
                ],
                progressIndex: 0,
                increment: barstate => {
                    //let elementStateLabel = element.getAttribute("data-state");
                    let elementStateLabel = barstate;
                    if (elementStateLabel == this.state.myNavBar.globalstates[this.state.myNavBar.progressIndex]) {
                        this.state.myNavBar.timestamps[this.state.myNavBar.progressIndex].style = "NBcomplete NBglow";
                        this.state.myNavBar.timestamps[this.state.myNavBar.progressIndex].doneFlag = true;
                        this.state.myNavBar.timestamps[this.state.myNavBar.progressIndex].connStyle = "NBglow";
                        this.state.myNavBar.progressIndex++;
                        if (this.state.myNavBar.timestamps[this.state.myNavBar.progressIndex])
                            this.state.myNavBar.timestamps[this.state.myNavBar.progressIndex].style = "NBpulse";
                        if (elementStateLabel == "endturn") {
                            setTimeout(() => {
                                this.state.myNavBar.resetTimeline();
                            }, 2000);
                        }
                    }
                },
            },
            myNavInput: {
                isVisible: false,
                contWidth: "190px",
                contTop: "55%",
                contZ: "15",
                buttons: [
                    {
                        label: "click me",
                        action: (event, model, element) => {
                            model.button.label = "BOOM!";
                            model.button.style = "NIclicked";
                        },
                        unaction: (event, model, element) => {
                            model.button.style = "";
                            model.button.label = "click me";
                        },
                        style: "",
                    },
                ],
            },
            myMessageOverlay: {
                isVisible: false,
                mainMessage: "",
                subMessage: "",
                showMessage: (main, sub, timeout) => {
                    this.state.myMessageOverlay.mainMessage = main;
                    this.state.myMessageOverlay.subMessage = sub;
                    this.state.myMessageOverlay.isVisble = true;
                    setTimeout(() => {
                        this.state.myMessageOverlay.isVisble = false;
                    }, timeout);
                },
            },
        };
    }
    onError(errorMessage) {
        console.log("message error", errorMessage);
    }
}


/***/ }),

/***/ "./src/styles/index.ts":
/*!*****************************!*\
  !*** ./src/styles/index.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _globals_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./globals.css */ "./src/styles/globals.css");
/* harmony import */ var _gameContainer_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./gameContainer.css */ "./src/styles/gameContainer.css");
/* harmony import */ var _sceneTransition_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./sceneTransition.css */ "./src/styles/sceneTransition.css");
/* harmony import */ var _title_css__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./title.css */ "./src/styles/title.css");
/* harmony import */ var _lobby_css__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./lobby.css */ "./src/styles/lobby.css");
/* harmony import */ var _charscreen_css__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./charscreen.css */ "./src/styles/charscreen.css");
/* harmony import */ var _staging_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./staging.css */ "./src/styles/staging.css");
/* harmony import */ var _game_css__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./game.css */ "./src/styles/game.css");
/* harmony import */ var _cardPool_css__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./cardPool.css */ "./src/styles/cardPool.css");
/* harmony import */ var _toast_css__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./toast.css */ "./src/styles/toast.css");
/* harmony import */ var _chat_css__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./chat.css */ "./src/styles/chat.css");
/* harmony import */ var _playerUI_css__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./playerUI.css */ "./src/styles/playerUI.css");
/* harmony import */ var _hand_css__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./hand.css */ "./src/styles/hand.css");
/* harmony import */ var _card_css__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./card.css */ "./src/styles/card.css");
/* harmony import */ var _location_css__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./location.css */ "./src/styles/location.css");
/* harmony import */ var _tower_css__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./tower.css */ "./src/styles/tower.css");
/* harmony import */ var _settings_css__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./settings.css */ "./src/styles/settings.css");
/* harmony import */ var _monster_css__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./monster.css */ "./src/styles/monster.css");
/* harmony import */ var _help_css__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./help.css */ "./src/styles/help.css");
/* harmony import */ var _StatusEffect_css__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ./StatusEffect.css */ "./src/styles/StatusEffect.css");
/* harmony import */ var _navbar_css__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ./navbar.css */ "./src/styles/navbar.css");
/* harmony import */ var _navInput_css__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ./navInput.css */ "./src/styles/navInput.css");
/* harmony import */ var _messageOverlay_css__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ./messageOverlay.css */ "./src/styles/messageOverlay.css");
/* harmony import */ var _pointPlacard_css__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! ./pointPlacard.css */ "./src/styles/pointPlacard.css");


























/***/ }),

/***/ "./src/utils.ts":
/*!**********************!*\
  !*** ./src/utils.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "utils": () => (/* binding */ utils)
/* harmony export */ });
/* harmony import */ var _hathora_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../.hathora/client */ "../.hathora/client.ts");
/* harmony import */ var _components_index__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./components/index */ "./src/components/index.ts");
/* harmony import */ var _sound__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./sound */ "./src/sound.ts");



/**********************************************************
 * Hathora Client variables
 *********************************************************/
const client = new _hathora_client__WEBPACK_IMPORTED_MODULE_0__.HathoraClient();
let token;
let user;
let myConnection;
let roomID;
let bgm = new _sound__WEBPACK_IMPORTED_MODULE_2__.BGM();
let sfx = new _sound__WEBPACK_IMPORTED_MODULE_2__.SFX();
let role;
let gender;
let nickname;
let localState;
const utils = {
    init(state) {
        localState = state;
    },
    wait(ms) {
        return new Promise(resolve => setTimeout(() => {
            resolve();
        }, ms));
    },
    async login() {
        if (sessionStorage.getItem("token") === null) {
            sessionStorage.setItem("token", await client.loginAnonymous());
        }
        token = sessionStorage.getItem("token");
        user = _hathora_client__WEBPACK_IMPORTED_MODULE_0__.HathoraClient.getUserFromToken(token);
        localState.state.playerData.username = user.name; //"testname"; //
        localState.state.playerData.id = user.id;
        bgm.play("title");
        localState.state.myContainer.screenSwitch(_components_index__WEBPACK_IMPORTED_MODULE_1__.Router.Lobby);
    },
    emitEvent(name, detail) {
        const event = new CustomEvent(name, {
            detail,
        });
        document.dispatchEvent(event);
    },
    async createGame() {
        const config = {};
        roomID = "";
        roomID = await client.create(token, config);
        if (roomID != "") {
            localState.state.gameData.gameID = roomID;
            localState.state.myContainer.screenSwitch(_components_index__WEBPACK_IMPORTED_MODULE_1__.Router.Character);
            myConnection = await client.connect(token, roomID, localState.updateArgs, localState.onError);
        }
    },
    leaveGame() {
        myConnection.leaveGame({});
    },
    async joinGame(roomID) {
        const config = {};
        myConnection = await client.connect(token, roomID, localState.updateArgs, localState.onError);
        if (roomID != "") {
            localState.state.gameData.gameID = roomID;
            localState.state.myContainer.screenSwitch(_components_index__WEBPACK_IMPORTED_MODULE_1__.Router.Character);
        }
    },
    async leaveRoom() {
        if (roomID == "")
            return;
        await myConnection.disconnect();
        roomID = "";
    },
    async findMatch() {
        console.log("here");
        let response = await client.findMatch(token, {}, 2, numPlayers => {
            console.log("Found", numPlayers);
        });
        console.log("result response: ", response);
    },
    async startGame() {
        await myConnection.startGame({});
    },
    playGameMusic() {
        bgm.play("game");
    },
    playSound(sound) {
        sfx.play(sound);
    },
    updateSFXvolume(newLevel) {
        sfx.updateVolume(newLevel);
    },
    updateBGMvolume(newLevel) {
        bgm.updateVolume(newLevel);
    },
    muteBGM(muted) {
        bgm.mute(muted);
    },
    muteSFX(muted) {
        sfx.mute(muted);
    },
    chooseChar(newname, newrole, newgender) {
        role = newrole;
        gender = newgender;
        nickname = newname;
    },
    async enterGame() {
        let rslt = await myConnection.joinGame({
            role: role,
            name: nickname,
            gender: gender,
            level: 1,
        });
    },
    loadSettings() {
        let settings = JSON.parse(localStorage.getItem("DSsettings"));
        if (settings != undefined) {
            localState.state.mySettings.chatOM = settings.chatOM;
            localState.state.mySettings.chatOP = settings.chatOP;
            localState.state.mySettings.chatBG = settings.chatBG;
            localState.state.mySettings.chatSM = settings.chatSM;
            localState.state.mySettings.chatUM = settings.chatUM;
            localState.state.mySettings.beginningColor = settings.bColor;
            localState.state.mySettings.endingColor = settings.eColor;
            localState.state.mySettings.gameSpeed = settings.GS;
            localState.state.mySettings.sfxGain = settings.sfx;
            localState.state.mySettings.bgmGain = settings.bgm;
            this.updateBGMvolume(settings.bgm);
            this.updateSFXvolume(settings.sfx);
        }
    },
    async sendChat(msg) {
        const message = {
            msg: msg,
        };
        let m = await myConnection.sendMessage(message);
        console.log(`response from server :`, m);
    },
    async seenChat(msgID) {
        const message = {
            msgID: msgID,
        };
        let m = await myConnection.seenMessage(message);
        console.log(`response from server :`, m);
    },
    setupGame() { },
    async startTurn() {
        let m = await myConnection.startTurn({});
        console.log("m is: ", m);
    },
    async passives() {
        let m = await myConnection.runMonsterPassives({});
        console.log(`response from server :`, m);
    },
    async playTD(cardID) {
        let m = await myConnection.playTD({ cardID: cardID });
        console.log(`response from server :`, m);
    },
    async enableM() {
        let m = await myConnection.enableMonsters({});
        console.log(`response from server :`, m);
    },
    async playMcard(cardID) {
        let m = await myConnection.playMonster({ cardID: cardID });
        console.log(`response from server :`, m);
    },
    async showPcard() {
        let m = await myConnection.enablePlayer({});
        console.log(`response from server :`, m);
    },
    async showCardPool() {
        let m = await myConnection.enableCardPool({});
        console.log(`response from server :`, m);
    },
    async buyCard(cardID) {
        let m = await myConnection.buyFromCardPool({ cardID: cardID });
        console.log(`response from server :`, m);
    },
    async doneBuyingCards() {
        let m = await myConnection.closeCardPool({});
        console.log(`response from server :`, m);
    },
    async endTurn() {
        let m = await myConnection.endRound({});
        console.log(`response from server :`, m);
    },
    async enableMonsterDamage() {
        let m = await myConnection.enableMonsterDamage({});
        console.log(`response from server :`, m);
    },
    async monsterDamageDone() {
        let m = await myConnection.disableMonsterDamage({});
        console.log(`response from server :`, m);
    },
    async applyDamage(cardID) {
        let m = await myConnection.applyMonsterDamage({ cardID: cardID });
        console.log(`response from server :`, m);
    },
    async playPcard(cardID) {
        let m = await myConnection.playPlayerCard({ cardID: cardID });
        console.log(`response from server :`, m);
    },
    async userResponse(response) {
        let resp = {
            Callback: response.Callback,
            Response: response.Response,
        };
        let m = await myConnection.userResponse({
            response: resp,
        });
        console.log(`response from server :`, m);
    },
    async playerDone() {
        let m = await myConnection.playerHandComplete({});
        console.log(`response from server :`, m);
    },
};


/***/ }),

/***/ "./src/assets/KELMSCOT.TTF":
/*!*********************************!*\
  !*** ./src/assets/KELMSCOT.TTF ***!
  \*********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "7575490b95745cbd8cab.TTF";

/***/ }),

/***/ "./src/assets/border.svg":
/*!*******************************!*\
  !*** ./src/assets/border.svg ***!
  \*******************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "9f9c0de10e5122e092cd.svg";

/***/ }),

/***/ "./src/assets/chat/whitespeech-bubble.png":
/*!************************************************!*\
  !*** ./src/assets/chat/whitespeech-bubble.png ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "d98bef4ec29b3ce8ba9f.png";

/***/ }),

/***/ "./src/assets/help/whiteback-button.png":
/*!**********************************************!*\
  !*** ./src/assets/help/whiteback-button.png ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "783ad0ac3fc02a0fd67b.png";

/***/ }),

/***/ "./src/assets/help/whitequestion-mark.png":
/*!************************************************!*\
  !*** ./src/assets/help/whitequestion-mark.png ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "a14b50027b73a7f8736b.png";

/***/ }),

/***/ "./src/assets/hud/attackicon.png":
/*!***************************************!*\
  !*** ./src/assets/hud/attackicon.png ***!
  \***************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "f931570b02eed6d33d99.png";

/***/ }),

/***/ "./src/assets/hud/stackofcoin.png":
/*!****************************************!*\
  !*** ./src/assets/hud/stackofcoin.png ***!
  \****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "7ad93631b3b3efe9cf9c.png";

/***/ }),

/***/ "./src/assets/hud/statusEffect_MonsterBonus.png":
/*!******************************************************!*\
  !*** ./src/assets/hud/statusEffect_MonsterBonus.png ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "a4ae4723a60605204252.png";

/***/ }),

/***/ "./src/assets/hud/statusEffect_discard.png":
/*!*************************************************!*\
  !*** ./src/assets/hud/statusEffect_discard.png ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "a51ad14ff35438d875de.png";

/***/ }),

/***/ "./src/assets/hud/statusEffect_location.png":
/*!**************************************************!*\
  !*** ./src/assets/hud/statusEffect_location.png ***!
  \**************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "e5261bfa82f3cff684fc.png";

/***/ }),

/***/ "./src/assets/hud/statusEffect_nodraw.png":
/*!************************************************!*\
  !*** ./src/assets/hud/statusEffect_nodraw.png ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "e3f64019e6b2cbf0f312.png";

/***/ }),

/***/ "./src/assets/hud/statusEffect_stunned.png":
/*!*************************************************!*\
  !*** ./src/assets/hud/statusEffect_stunned.png ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "2f30b04ad765685d1b82.png";

/***/ }),

/***/ "./src/assets/options/whitemenu.png":
/*!******************************************!*\
  !*** ./src/assets/options/whitemenu.png ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "29ee948698ab1ef9d21b.png";

/***/ }),

/***/ "./src/assets/options/whitemute.png":
/*!******************************************!*\
  !*** ./src/assets/options/whitemute.png ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "5ee2c6468df3b7cc95b4.png";

/***/ }),

/***/ "./src/assets/options/whiteunmute.png":
/*!********************************************!*\
  !*** ./src/assets/options/whiteunmute.png ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "bcae2e767b4454e36f1b.png";

/***/ }),

/***/ "./src/assets/people/barbarian_m.png":
/*!*******************************************!*\
  !*** ./src/assets/people/barbarian_m.png ***!
  \*******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "b90844740cef5addbb4d.png";

/***/ }),

/***/ "./src/assets/people/barbarian_w.png":
/*!*******************************************!*\
  !*** ./src/assets/people/barbarian_w.png ***!
  \*******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "8434ffd71afc39707427.png";

/***/ }),

/***/ "./src/assets/people/paladin_male.png":
/*!********************************************!*\
  !*** ./src/assets/people/paladin_male.png ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "c62a0728f628010ac092.png";

/***/ }),

/***/ "./src/assets/people/paladin_w.png":
/*!*****************************************!*\
  !*** ./src/assets/people/paladin_w.png ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "9dd99961694a21eab05d.png";

/***/ }),

/***/ "./src/assets/people/rogue_male.png":
/*!******************************************!*\
  !*** ./src/assets/people/rogue_male.png ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "26514ebe51890f9c3352.png";

/***/ }),

/***/ "./src/assets/people/rogue_w.png":
/*!***************************************!*\
  !*** ./src/assets/people/rogue_w.png ***!
  \***************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "924d6e17b767a7b8508d.png";

/***/ }),

/***/ "./src/assets/people/wizard.png":
/*!**************************************!*\
  !*** ./src/assets/people/wizard.png ***!
  \**************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "00718468e650e86450bb.png";

/***/ }),

/***/ "./src/assets/people/wizard_female.png":
/*!*********************************************!*\
  !*** ./src/assets/people/wizard_female.png ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "7ca656c37d0e0b3754d3.png";

/***/ }),

/***/ "./src/assets/toast/whitebuilding.png":
/*!********************************************!*\
  !*** ./src/assets/toast/whitebuilding.png ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "d152a3719ea830965359.png";

/***/ }),

/***/ "./src/assets/toast/whitecard.png":
/*!****************************************!*\
  !*** ./src/assets/toast/whitecard.png ***!
  \****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "ab67711d11eceb2ce6cb.png";

/***/ }),

/***/ "./src/assets/toast/whiteeffect.png":
/*!******************************************!*\
  !*** ./src/assets/toast/whiteeffect.png ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "9da3d57487695d514259.png";

/***/ }),

/***/ "./src/assets/toast/whitemonster.png":
/*!*******************************************!*\
  !*** ./src/assets/toast/whitemonster.png ***!
  \*******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "71e55da9528680af4d5b.png";

/***/ }),

/***/ "./src/assets/toast/whiteuser.png":
/*!****************************************!*\
  !*** ./src/assets/toast/whiteuser.png ***!
  \****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "fa991511518e5583de27.png";

/***/ }),

/***/ "?5d12":
/*!************************!*\
  !*** crypto (ignored) ***!
  \************************/
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ "../../api/node_modules/bin-serde/lib/index.js":
/*!*****************************************************!*\
  !*** ../../api/node_modules/bin-serde/lib/index.js ***!
  \*****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Reader": () => (/* binding */ Reader),
/* harmony export */   "Writer": () => (/* binding */ Writer)
/* harmony export */ });
/* harmony import */ var _utf8_buffer_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utf8-buffer.js */ "../../api/node_modules/bin-serde/lib/utf8-buffer.js");
/* harmony import */ var utf8_buffer_size__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! utf8-buffer-size */ "../../api/node_modules/utf8-buffer-size/main.js");


class Writer {
    pos = 0;
    view;
    bytes;
    constructor() {
        this.view = new DataView(new ArrayBuffer(64));
        this.bytes = new Uint8Array(this.view.buffer);
    }
    writeUInt8(val) {
        this.ensureSize(1);
        this.view.setUint8(this.pos, val);
        this.pos += 1;
        return this;
    }
    writeUInt32(val) {
        this.ensureSize(4);
        this.view.setUint32(this.pos, val);
        this.pos += 4;
        return this;
    }
    writeUInt64(val) {
        this.ensureSize(8);
        this.view.setBigUint64(this.pos, val);
        this.pos += 8;
        return this;
    }
    writeUVarint(val) {
        if (val < 0x80) {
            this.ensureSize(1);
            this.view.setUint8(this.pos, val);
            this.pos += 1;
        }
        else if (val < 0x4000) {
            this.ensureSize(2);
            this.view.setUint16(this.pos, (val & 0x7f) | ((val & 0x3f80) << 1) | 0x8000);
            this.pos += 2;
        }
        else if (val < 0x200000) {
            this.ensureSize(3);
            this.view.setUint8(this.pos, (val >> 14) | 0x80);
            this.view.setUint16(this.pos + 1, (val & 0x7f) | ((val & 0x3f80) << 1) | 0x8000);
            this.pos += 3;
        }
        else if (val < 0x10000000) {
            this.ensureSize(4);
            this.view.setUint32(this.pos, (val & 0x7f) | ((val & 0x3f80) << 1) | ((val & 0x1fc000) << 2) | ((val & 0xfe00000) << 3) | 0x80808000);
            this.pos += 4;
        }
        else if (val < 0x800000000) {
            this.ensureSize(5);
            this.view.setUint8(this.pos, Math.floor(val / Math.pow(2, 28)) | 0x80);
            this.view.setUint32(this.pos + 1, (val & 0x7f) | ((val & 0x3f80) << 1) | ((val & 0x1fc000) << 2) | ((val & 0xfe00000) << 3) | 0x80808000);
            this.pos += 5;
        }
        else if (val < 0x40000000000) {
            this.ensureSize(6);
            const shiftedVal = Math.floor(val / Math.pow(2, 28));
            this.view.setUint16(this.pos, (shiftedVal & 0x7f) | ((shiftedVal & 0x3f80) << 1) | 0x8080);
            this.view.setUint32(this.pos + 2, (val & 0x7f) | ((val & 0x3f80) << 1) | ((val & 0x1fc000) << 2) | ((val & 0xfe00000) << 3) | 0x80808000);
            this.pos += 6;
        }
        else {
            throw new Error("Value out of range");
        }
        return this;
    }
    writeVarint(val) {
        const bigval = BigInt(val);
        this.writeUVarint(Number((bigval >> 63n) ^ (bigval << 1n)));
        return this;
    }
    writeFloat(val) {
        this.ensureSize(4);
        this.view.setFloat32(this.pos, val, true);
        this.pos += 4;
        return this;
    }
    writeBits(bits) {
        for (let i = 0; i < bits.length; i += 8) {
            let byte = 0;
            for (let j = 0; j < 8; j++) {
                if (i + j == bits.length) {
                    break;
                }
                byte |= (bits[i + j] ? 1 : 0) << j;
            }
            this.writeUInt8(byte);
        }
        return this;
    }
    writeString(val) {
        if (val.length > 0) {
            const byteSize = (0,utf8_buffer_size__WEBPACK_IMPORTED_MODULE_1__["default"])(val);
            this.writeUVarint(byteSize);
            this.ensureSize(byteSize);
            (0,_utf8_buffer_js__WEBPACK_IMPORTED_MODULE_0__.pack)(val, this.bytes, this.pos);
            this.pos += byteSize;
        }
        else {
            this.writeUInt8(0);
        }
        return this;
    }
    writeBuffer(buf) {
        this.ensureSize(buf.length);
        this.bytes.set(buf, this.pos);
        this.pos += buf.length;
        return this;
    }
    toBuffer() {
        return this.bytes.subarray(0, this.pos);
    }
    ensureSize(size) {
        while (this.view.byteLength < this.pos + size) {
            const newView = new DataView(new ArrayBuffer(this.view.byteLength * 2));
            const newBytes = new Uint8Array(newView.buffer);
            newBytes.set(this.bytes);
            this.view = newView;
            this.bytes = newBytes;
        }
    }
}
class Reader {
    pos = 0;
    view;
    bytes;
    constructor(buf) {
        this.view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
        this.bytes = new Uint8Array(this.view.buffer, buf.byteOffset, buf.byteLength);
    }
    readUInt8() {
        const val = this.view.getUint8(this.pos);
        this.pos += 1;
        return val;
    }
    readUInt32() {
        const val = this.view.getUint32(this.pos);
        this.pos += 4;
        return val;
    }
    readUInt64() {
        const val = this.view.getBigUint64(this.pos);
        this.pos += 8;
        return val;
    }
    readUVarint() {
        let val = 0;
        while (true) {
            let byte = this.view.getUint8(this.pos++);
            if (byte < 0x80) {
                return val + byte;
            }
            val = (val + (byte & 0x7f)) * 128;
        }
    }
    readVarint() {
        const val = BigInt(this.readUVarint());
        return Number((val >> 1n) ^ -(val & 1n));
    }
    readFloat() {
        const val = this.view.getFloat32(this.pos, true);
        this.pos += 4;
        return val;
    }
    readBits(numBits) {
        const numBytes = Math.ceil(numBits / 8);
        const bytes = this.bytes.slice(this.pos, this.pos + numBytes);
        const bits = [];
        for (const byte of bytes) {
            for (let i = 0; i < 8 && bits.length < numBits; i++) {
                bits.push(((byte >> i) & 1) === 1);
            }
        }
        this.pos += numBytes;
        return bits;
    }
    readString() {
        const len = this.readUVarint();
        if (len === 0) {
            return "";
        }
        const val = (0,_utf8_buffer_js__WEBPACK_IMPORTED_MODULE_0__.unpack)(this.bytes, this.pos, this.pos + len);
        this.pos += len;
        return val;
    }
    readBuffer(numBytes) {
        const bytes = this.bytes.slice(this.pos, this.pos + numBytes);
        this.pos += numBytes;
        return bytes;
    }
    remaining() {
        return this.view.byteLength - this.pos;
    }
}


/***/ }),

/***/ "../../api/node_modules/bin-serde/lib/utf8-buffer.js":
/*!***********************************************************!*\
  !*** ../../api/node_modules/bin-serde/lib/utf8-buffer.js ***!
  \***********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "pack": () => (/* binding */ pack),
/* harmony export */   "unpack": () => (/* binding */ unpack)
/* harmony export */ });
/*
 * Copyright (c) 2018 Rafael da Silva Rocha.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */
/**
 * @fileoverview Functions to serialize and deserialize UTF-8 strings.
 * @see https://github.com/rochars/utf8-buffer
 * @see https://encoding.spec.whatwg.org/#the-encoding
 * @see https://encoding.spec.whatwg.org/#utf-8-encoder
 */
/** @module utf8-buffer */
/**
 * Read a string of UTF-8 characters from a byte buffer.
 * Invalid characters are replaced with 'REPLACEMENT CHARACTER' (U+FFFD).
 * @see https://encoding.spec.whatwg.org/#the-encoding
 * @see https://stackoverflow.com/a/34926911
 * @param {!Uint8Array|!Array<number>} buffer A byte buffer.
 * @param {number=} start The buffer index to start reading.
 * @param {?number=} end The buffer index to stop reading.
 *   Assumes the buffer length if undefined.
 * @return {string}
 */
function unpack(buffer, start = 0, end = buffer.length) {
    /** @type {string} */
    let str = "";
    for (let index = start; index < end;) {
        /** @type {number} */
        let lowerBoundary = 0x80;
        /** @type {number} */
        let upperBoundary = 0xbf;
        /** @type {boolean} */
        let replace = false;
        /** @type {number} */
        let charCode = buffer[index++];
        if (charCode >= 0x00 && charCode <= 0x7f) {
            str += String.fromCharCode(charCode);
        }
        else {
            /** @type {number} */
            let count = 0;
            if (charCode >= 0xc2 && charCode <= 0xdf) {
                count = 1;
            }
            else if (charCode >= 0xe0 && charCode <= 0xef) {
                count = 2;
                if (buffer[index] === 0xe0) {
                    lowerBoundary = 0xa0;
                }
                if (buffer[index] === 0xed) {
                    upperBoundary = 0x9f;
                }
            }
            else if (charCode >= 0xf0 && charCode <= 0xf4) {
                count = 3;
                if (buffer[index] === 0xf0) {
                    lowerBoundary = 0x90;
                }
                if (buffer[index] === 0xf4) {
                    upperBoundary = 0x8f;
                }
            }
            else {
                replace = true;
            }
            charCode = charCode & ((1 << (8 - count - 1)) - 1);
            for (let i = 0; i < count; i++) {
                if (buffer[index] < lowerBoundary || buffer[index] > upperBoundary) {
                    replace = true;
                }
                charCode = (charCode << 6) | (buffer[index] & 0x3f);
                index++;
            }
            if (replace) {
                str += String.fromCharCode(0xfffd);
            }
            else if (charCode <= 0xffff) {
                str += String.fromCharCode(charCode);
            }
            else {
                charCode -= 0x10000;
                str += String.fromCharCode(((charCode >> 10) & 0x3ff) + 0xd800, (charCode & 0x3ff) + 0xdc00);
            }
        }
    }
    return str;
}
/**
 * Write a string of UTF-8 characters to a byte buffer.
 * @see https://encoding.spec.whatwg.org/#utf-8-encoder
 * @param {string} str The string to pack.
 * @param {!Uint8Array|!Array<number>} buffer The buffer to pack the string to.
 * @param {number=} index The buffer index to start writing.
 * @return {number} The next index to write in the buffer.
 */
function pack(str, buffer, index = 0) {
    for (let i = 0, len = str.length; i < len; i++) {
        /** @type {number} */
        let codePoint = str.codePointAt(i);
        if (codePoint < 128) {
            buffer[index] = codePoint;
            index++;
        }
        else {
            /** @type {number} */
            let count = 0;
            /** @type {number} */
            let offset = 0;
            if (codePoint <= 0x07ff) {
                count = 1;
                offset = 0xc0;
            }
            else if (codePoint <= 0xffff) {
                count = 2;
                offset = 0xe0;
            }
            else if (codePoint <= 0x10ffff) {
                count = 3;
                offset = 0xf0;
                i++;
            }
            buffer[index] = (codePoint >> (6 * count)) + offset;
            index++;
            while (count > 0) {
                buffer[index] = 0x80 | ((codePoint >> (6 * (count - 1))) & 0x3f);
                index++;
                count--;
            }
        }
    }
    return index;
}


/***/ }),

/***/ "../.hathora/node_modules/@hathora/client-sdk/lib/client.js":
/*!******************************************************************!*\
  !*** ../.hathora/node_modules/@hathora/client-sdk/lib/client.js ***!
  \******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "HathoraClient": () => (/* binding */ HathoraClient)
/* harmony export */ });
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! axios */ "../.hathora/node_modules/axios/index.js");
/* harmony import */ var jwt_decode__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! jwt-decode */ "../.hathora/node_modules/jwt-decode/build/jwt-decode.esm.js");
/* harmony import */ var _transport_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./transport.js */ "../.hathora/node_modules/@hathora/client-sdk/lib/transport.js");



class HathoraClient {
    appId;
    coordinatorHost;
    static getUserFromToken(token) {
        return (0,jwt_decode__WEBPACK_IMPORTED_MODULE_1__["default"])(token);
    }
    constructor(appId, coordinatorHost = "coordinator.hathora.dev") {
        this.appId = appId;
        this.coordinatorHost = coordinatorHost;
    }
    async loginAnonymous() {
        const res = await axios__WEBPACK_IMPORTED_MODULE_0__.post(`https://${this.coordinatorHost}/${this.appId}/login/anonymous`);
        return res.data.token;
    }
    async loginNickname(nickname) {
        const res = await axios__WEBPACK_IMPORTED_MODULE_0__.post(`https://${this.coordinatorHost}/${this.appId}/login/nickname`, { nickname });
        return res.data.token;
    }
    async loginGoogle(idToken) {
        const res = await axios__WEBPACK_IMPORTED_MODULE_0__.post(`https://${this.coordinatorHost}/${this.appId}/login/google`, { idToken });
        return res.data.token;
    }
    async create(token, data) {
        const res = await axios__WEBPACK_IMPORTED_MODULE_0__.post(`https://${this.coordinatorHost}/${this.appId}/create`, data, {
            headers: { Authorization: token, "Content-Type": "application/octet-stream" },
        });
        return res.data.stateId;
    }
    async connect(token, stateId, onMessage, onClose, transportType = _transport_js__WEBPACK_IMPORTED_MODULE_2__.TransportType.WebSocket) {
        const connection = this.getConnectionForTransportType(transportType);
        await connection.connect(stateId, token, onMessage, onClose);
        return connection;
    }
    getConnectionForTransportType(transportType) {
        if (transportType === _transport_js__WEBPACK_IMPORTED_MODULE_2__.TransportType.WebSocket) {
            return new _transport_js__WEBPACK_IMPORTED_MODULE_2__.WebSocketHathoraTransport(this.appId, this.coordinatorHost);
        }
        else if (transportType === _transport_js__WEBPACK_IMPORTED_MODULE_2__.TransportType.TCP) {
            return new _transport_js__WEBPACK_IMPORTED_MODULE_2__.TCPHathoraTransport(this.appId, this.coordinatorHost);
        }
        throw new Error("Unsupported transport type: " + transportType);
    }
}


/***/ }),

/***/ "../.hathora/node_modules/@hathora/client-sdk/lib/transport.js":
/*!*********************************************************************!*\
  !*** ../.hathora/node_modules/@hathora/client-sdk/lib/transport.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "TCPHathoraTransport": () => (/* binding */ TCPHathoraTransport),
/* harmony export */   "TransportType": () => (/* binding */ TransportType),
/* harmony export */   "WebSocketHathoraTransport": () => (/* binding */ WebSocketHathoraTransport)
/* harmony export */ });
/* harmony import */ var net__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! net */ "../.hathora/node_modules/net/index.js");
/* harmony import */ var isomorphic_ws__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! isomorphic-ws */ "../.hathora/node_modules/@hathora/client-sdk/node_modules/isomorphic-ws/browser.js");
/* harmony import */ var bin_serde__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! bin-serde */ "../.hathora/node_modules/bin-serde/lib/index.js");



var TransportType;
(function (TransportType) {
    TransportType[TransportType["WebSocket"] = 0] = "WebSocket";
    TransportType[TransportType["TCP"] = 1] = "TCP";
    TransportType[TransportType["UDP"] = 2] = "UDP";
})(TransportType || (TransportType = {}));
class WebSocketHathoraTransport {
    socket;
    constructor(appId, coordinatorHost) {
        this.socket = new isomorphic_ws__WEBPACK_IMPORTED_MODULE_1__["default"](`wss://${coordinatorHost}/connect/${appId}`);
    }
    connect(stateId, token, onData, onClose) {
        let connected = false;
        return new Promise((resolve, reject) => {
            this.socket.binaryType = "arraybuffer";
            this.socket.onclose = (e) => {
                reject(e.reason);
                onClose(e);
            };
            this.socket.onopen = () => {
                this.socket.send(new TextEncoder().encode(JSON.stringify({ stateId, token })));
            };
            this.socket.onmessage = ({ data }) => {
                if (!(data instanceof ArrayBuffer)) {
                    throw new Error("Unexpected data type: " + typeof data);
                }
                if (!connected) {
                    connected = true;
                    resolve();
                }
                else {
                    onData(data);
                }
            };
        });
    }
    disconnect(code) {
        if (code === undefined) {
            this.socket.onclose = () => { };
        }
        this.socket.close(code);
    }
    isReady() {
        return this.socket.readyState === this.socket.OPEN;
    }
    write(data) {
        this.socket.send(data);
    }
    pong() {
        this.socket.ping();
    }
}
class TCPHathoraTransport {
    appId;
    coordinatorHost;
    socket;
    constructor(appId, coordinatorHost) {
        this.appId = appId;
        this.coordinatorHost = coordinatorHost;
        this.socket = new net__WEBPACK_IMPORTED_MODULE_0__.Socket();
    }
    connect(stateId, token, onData, onClose) {
        return new Promise((resolve, reject) => {
            this.socket.connect(7148, this.coordinatorHost);
            this.socket.on("connect", () => this.socket.write(new bin_serde__WEBPACK_IMPORTED_MODULE_2__.Writer()
                .writeString(token)
                .writeString(this.appId)
                .writeUInt64([...stateId].reduce((r, v) => r * 36n + BigInt(parseInt(v, 36)), 0n))
                .toBuffer()));
            this.socket.once("data", (data) => {
                const reader = new bin_serde__WEBPACK_IMPORTED_MODULE_2__.Reader(new Uint8Array(data));
                const type = reader.readUInt8();
                if (type === 0) {
                    this.readTCPData(onData);
                    this.socket.on("close", onClose);
                    onData(data);
                    resolve();
                }
                else {
                    reject("Unknown message type: " + type);
                }
            });
        });
    }
    write(data) {
        this.socket.write(new bin_serde__WEBPACK_IMPORTED_MODULE_2__.Writer()
            .writeUInt32(data.length + 1)
            .writeUInt8(0)
            .writeBuffer(data)
            .toBuffer());
    }
    disconnect(code) {
        this.socket.destroy();
    }
    isReady() {
        return this.socket.readyState === "open";
    }
    pong() {
        this.socket.write(new bin_serde__WEBPACK_IMPORTED_MODULE_2__.Writer().writeUInt32(1).writeUInt8(1).toBuffer());
    }
    readTCPData(onData) {
        let buf = Buffer.alloc(0);
        this.socket.on("data", (data) => {
            buf = Buffer.concat([buf, data]);
            while (buf.length >= 4) {
                const bufLen = buf.readUInt32BE();
                if (buf.length < 4 + bufLen) {
                    return;
                }
                onData(buf.subarray(4, 4 + bufLen));
                buf = buf.subarray(4 + bufLen);
            }
        });
    }
}


/***/ }),

/***/ "../.hathora/node_modules/bin-serde/lib/index.js":
/*!*******************************************************!*\
  !*** ../.hathora/node_modules/bin-serde/lib/index.js ***!
  \*******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Reader": () => (/* binding */ Reader),
/* harmony export */   "Writer": () => (/* binding */ Writer)
/* harmony export */ });
/* harmony import */ var _utf8_buffer_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utf8-buffer.js */ "../.hathora/node_modules/bin-serde/lib/utf8-buffer.js");
/* harmony import */ var utf8_buffer_size__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! utf8-buffer-size */ "../.hathora/node_modules/utf8-buffer-size/main.js");


class Writer {
    pos = 0;
    view;
    bytes;
    constructor() {
        this.view = new DataView(new ArrayBuffer(64));
        this.bytes = new Uint8Array(this.view.buffer);
    }
    writeUInt8(val) {
        this.ensureSize(1);
        this.view.setUint8(this.pos, val);
        this.pos += 1;
        return this;
    }
    writeUInt32(val) {
        this.ensureSize(4);
        this.view.setUint32(this.pos, val);
        this.pos += 4;
        return this;
    }
    writeUInt64(val) {
        this.ensureSize(8);
        this.view.setBigUint64(this.pos, val);
        this.pos += 8;
        return this;
    }
    writeUVarint(val) {
        if (val < 0x80) {
            this.ensureSize(1);
            this.view.setUint8(this.pos, val);
            this.pos += 1;
        }
        else if (val < 0x4000) {
            this.ensureSize(2);
            this.view.setUint16(this.pos, (val & 0x7f) | ((val & 0x3f80) << 1) | 0x8000);
            this.pos += 2;
        }
        else if (val < 0x200000) {
            this.ensureSize(3);
            this.view.setUint8(this.pos, (val >> 14) | 0x80);
            this.view.setUint16(this.pos + 1, (val & 0x7f) | ((val & 0x3f80) << 1) | 0x8000);
            this.pos += 3;
        }
        else if (val < 0x10000000) {
            this.ensureSize(4);
            this.view.setUint32(this.pos, (val & 0x7f) | ((val & 0x3f80) << 1) | ((val & 0x1fc000) << 2) | ((val & 0xfe00000) << 3) | 0x80808000);
            this.pos += 4;
        }
        else if (val < 0x800000000) {
            this.ensureSize(5);
            this.view.setUint8(this.pos, Math.floor(val / Math.pow(2, 28)) | 0x80);
            this.view.setUint32(this.pos + 1, (val & 0x7f) | ((val & 0x3f80) << 1) | ((val & 0x1fc000) << 2) | ((val & 0xfe00000) << 3) | 0x80808000);
            this.pos += 5;
        }
        else if (val < 0x40000000000) {
            this.ensureSize(6);
            const shiftedVal = Math.floor(val / Math.pow(2, 28));
            this.view.setUint16(this.pos, (shiftedVal & 0x7f) | ((shiftedVal & 0x3f80) << 1) | 0x8080);
            this.view.setUint32(this.pos + 2, (val & 0x7f) | ((val & 0x3f80) << 1) | ((val & 0x1fc000) << 2) | ((val & 0xfe00000) << 3) | 0x80808000);
            this.pos += 6;
        }
        else {
            throw new Error("Value out of range");
        }
        return this;
    }
    writeVarint(val) {
        const bigval = BigInt(val);
        this.writeUVarint(Number((bigval >> 63n) ^ (bigval << 1n)));
        return this;
    }
    writeFloat(val) {
        this.ensureSize(4);
        this.view.setFloat32(this.pos, val, true);
        this.pos += 4;
        return this;
    }
    writeBits(bits) {
        for (let i = 0; i < bits.length; i += 8) {
            let byte = 0;
            for (let j = 0; j < 8; j++) {
                if (i + j == bits.length) {
                    break;
                }
                byte |= (bits[i + j] ? 1 : 0) << j;
            }
            this.writeUInt8(byte);
        }
        return this;
    }
    writeString(val) {
        if (val.length > 0) {
            const byteSize = (0,utf8_buffer_size__WEBPACK_IMPORTED_MODULE_1__["default"])(val);
            this.writeUVarint(byteSize);
            this.ensureSize(byteSize);
            (0,_utf8_buffer_js__WEBPACK_IMPORTED_MODULE_0__.pack)(val, this.bytes, this.pos);
            this.pos += byteSize;
        }
        else {
            this.writeUInt8(0);
        }
        return this;
    }
    writeBuffer(buf) {
        this.ensureSize(buf.length);
        this.bytes.set(buf, this.pos);
        this.pos += buf.length;
        return this;
    }
    toBuffer() {
        return this.bytes.subarray(0, this.pos);
    }
    ensureSize(size) {
        while (this.view.byteLength < this.pos + size) {
            const newView = new DataView(new ArrayBuffer(this.view.byteLength * 2));
            const newBytes = new Uint8Array(newView.buffer);
            newBytes.set(this.bytes);
            this.view = newView;
            this.bytes = newBytes;
        }
    }
}
class Reader {
    pos = 0;
    view;
    bytes;
    constructor(buf) {
        this.view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
        this.bytes = new Uint8Array(this.view.buffer, buf.byteOffset, buf.byteLength);
    }
    readUInt8() {
        const val = this.view.getUint8(this.pos);
        this.pos += 1;
        return val;
    }
    readUInt32() {
        const val = this.view.getUint32(this.pos);
        this.pos += 4;
        return val;
    }
    readUInt64() {
        const val = this.view.getBigUint64(this.pos);
        this.pos += 8;
        return val;
    }
    readUVarint() {
        let val = 0;
        while (true) {
            let byte = this.view.getUint8(this.pos++);
            if (byte < 0x80) {
                return val + byte;
            }
            val = (val + (byte & 0x7f)) * 128;
        }
    }
    readVarint() {
        const val = BigInt(this.readUVarint());
        return Number((val >> 1n) ^ -(val & 1n));
    }
    readFloat() {
        const val = this.view.getFloat32(this.pos, true);
        this.pos += 4;
        return val;
    }
    readBits(numBits) {
        const numBytes = Math.ceil(numBits / 8);
        const bytes = this.bytes.slice(this.pos, this.pos + numBytes);
        const bits = [];
        for (const byte of bytes) {
            for (let i = 0; i < 8 && bits.length < numBits; i++) {
                bits.push(((byte >> i) & 1) === 1);
            }
        }
        this.pos += numBytes;
        return bits;
    }
    readString() {
        const len = this.readUVarint();
        if (len === 0) {
            return "";
        }
        const val = (0,_utf8_buffer_js__WEBPACK_IMPORTED_MODULE_0__.unpack)(this.bytes, this.pos, this.pos + len);
        this.pos += len;
        return val;
    }
    readBuffer(numBytes) {
        const bytes = this.bytes.slice(this.pos, this.pos + numBytes);
        this.pos += numBytes;
        return bytes;
    }
    remaining() {
        return this.view.byteLength - this.pos;
    }
}


/***/ }),

/***/ "../.hathora/node_modules/bin-serde/lib/utf8-buffer.js":
/*!*************************************************************!*\
  !*** ../.hathora/node_modules/bin-serde/lib/utf8-buffer.js ***!
  \*************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "pack": () => (/* binding */ pack),
/* harmony export */   "unpack": () => (/* binding */ unpack)
/* harmony export */ });
/*
 * Copyright (c) 2018 Rafael da Silva Rocha.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */
/**
 * @fileoverview Functions to serialize and deserialize UTF-8 strings.
 * @see https://github.com/rochars/utf8-buffer
 * @see https://encoding.spec.whatwg.org/#the-encoding
 * @see https://encoding.spec.whatwg.org/#utf-8-encoder
 */
/** @module utf8-buffer */
/**
 * Read a string of UTF-8 characters from a byte buffer.
 * Invalid characters are replaced with 'REPLACEMENT CHARACTER' (U+FFFD).
 * @see https://encoding.spec.whatwg.org/#the-encoding
 * @see https://stackoverflow.com/a/34926911
 * @param {!Uint8Array|!Array<number>} buffer A byte buffer.
 * @param {number=} start The buffer index to start reading.
 * @param {?number=} end The buffer index to stop reading.
 *   Assumes the buffer length if undefined.
 * @return {string}
 */
function unpack(buffer, start = 0, end = buffer.length) {
    /** @type {string} */
    let str = "";
    for (let index = start; index < end;) {
        /** @type {number} */
        let lowerBoundary = 0x80;
        /** @type {number} */
        let upperBoundary = 0xbf;
        /** @type {boolean} */
        let replace = false;
        /** @type {number} */
        let charCode = buffer[index++];
        if (charCode >= 0x00 && charCode <= 0x7f) {
            str += String.fromCharCode(charCode);
        }
        else {
            /** @type {number} */
            let count = 0;
            if (charCode >= 0xc2 && charCode <= 0xdf) {
                count = 1;
            }
            else if (charCode >= 0xe0 && charCode <= 0xef) {
                count = 2;
                if (buffer[index] === 0xe0) {
                    lowerBoundary = 0xa0;
                }
                if (buffer[index] === 0xed) {
                    upperBoundary = 0x9f;
                }
            }
            else if (charCode >= 0xf0 && charCode <= 0xf4) {
                count = 3;
                if (buffer[index] === 0xf0) {
                    lowerBoundary = 0x90;
                }
                if (buffer[index] === 0xf4) {
                    upperBoundary = 0x8f;
                }
            }
            else {
                replace = true;
            }
            charCode = charCode & ((1 << (8 - count - 1)) - 1);
            for (let i = 0; i < count; i++) {
                if (buffer[index] < lowerBoundary || buffer[index] > upperBoundary) {
                    replace = true;
                }
                charCode = (charCode << 6) | (buffer[index] & 0x3f);
                index++;
            }
            if (replace) {
                str += String.fromCharCode(0xfffd);
            }
            else if (charCode <= 0xffff) {
                str += String.fromCharCode(charCode);
            }
            else {
                charCode -= 0x10000;
                str += String.fromCharCode(((charCode >> 10) & 0x3ff) + 0xd800, (charCode & 0x3ff) + 0xdc00);
            }
        }
    }
    return str;
}
/**
 * Write a string of UTF-8 characters to a byte buffer.
 * @see https://encoding.spec.whatwg.org/#utf-8-encoder
 * @param {string} str The string to pack.
 * @param {!Uint8Array|!Array<number>} buffer The buffer to pack the string to.
 * @param {number=} index The buffer index to start writing.
 * @return {number} The next index to write in the buffer.
 */
function pack(str, buffer, index = 0) {
    for (let i = 0, len = str.length; i < len; i++) {
        /** @type {number} */
        let codePoint = str.codePointAt(i);
        if (codePoint < 128) {
            buffer[index] = codePoint;
            index++;
        }
        else {
            /** @type {number} */
            let count = 0;
            /** @type {number} */
            let offset = 0;
            if (codePoint <= 0x07ff) {
                count = 1;
                offset = 0xc0;
            }
            else if (codePoint <= 0xffff) {
                count = 2;
                offset = 0xe0;
            }
            else if (codePoint <= 0x10ffff) {
                count = 3;
                offset = 0xf0;
                i++;
            }
            buffer[index] = (codePoint >> (6 * count)) + offset;
            index++;
            while (count > 0) {
                buffer[index] = 0x80 | ((codePoint >> (6 * (count - 1))) & 0x3f);
                index++;
                count--;
            }
        }
    }
    return index;
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript)
/******/ 				scriptUrl = document.currentScript.src
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) scriptUrl = scripts[scripts.length - 1].src
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		__webpack_require__.b = document.baseURI || self.location.href;
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"index": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		// no on chunks loaded
/******/ 		
/******/ 		// no jsonp function
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/nonce */
/******/ 	(() => {
/******/ 		__webpack_require__.nc = undefined;
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var peasy_ui__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! peasy-ui */ "./node_modules/peasy-ui/dist/index.js");
/* harmony import */ var peasy_ui__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(peasy_ui__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _state_state__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./state/state */ "./src/state/state.ts");
/* harmony import */ var _components_index__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./components/index */ "./src/components/index.ts");
/* harmony import */ var _styles_index__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./styles/index */ "./src/styles/index.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./utils */ "./src/utils.ts");





const myApp = document.getElementById("App");
let state = new _state_state__WEBPACK_IMPORTED_MODULE_1__.State();
_utils__WEBPACK_IMPORTED_MODULE_4__.utils.init(state);
if (localStorage.getItem("DSsettings")) {
    _utils__WEBPACK_IMPORTED_MODULE_4__.utils.loadSettings();
}
const GameComponent = new _components_index__WEBPACK_IMPORTED_MODULE_2__.GameContainer(state);
const globalCSSvars = `--background-start: \${mySettings.beginningColor}; --background-end: \${mySettings.endingColor}; --chatUM: \${mySettings.chatUM};--chatOM: \${mySettings.chatOM};--chatSM: \${mySettings.chatSM};--chatOP: \${mySettings.chatOP};--chatBG: \${mySettings.chatBG}`;
const uiStringTemplate = `
  <div class="app" style="${globalCSSvars}">
    ${GameComponent.template}
  </div>
`;
let myUI;
myUI = peasy_ui__WEBPACK_IMPORTED_MODULE_0__.UI.create(myApp, uiStringTemplate, state.state);
const update = () => {
    peasy_ui__WEBPACK_IMPORTED_MODULE_0__.UI.update();
    requestAnimationFrame(update);
};
update();

})();

/******/ })()
;