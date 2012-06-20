/** The drupal namespace. */
var drupal = drupal || {};

/**
 * @constructor
 * @class The base Drupal API class.
 */
drupal.api = function() {

  /** The Services API endpoint */
  this.endpoint = drupal.endpoint || this.endpoint || '';

  /** The resource within this endpoint */
  this.resource = this.resource || '';
};

/**
 * Helper function to get the Services URL for this resource.
 *
 * @param {object} object The object involved with in this request.
 * @return {string} The path to the API endpoint.
 */
drupal.api.prototype.getURL = function(object) {
  var path = this.endpoint;
  path += this.resource ? ('/' + this.resource) : '';
  path += (object && object.id) ? ('/' + object.id) : '';
  return path;
};

/**
 * API function to act as a generic request for all Service calls.
 *
 * @param {string} url The URL where the request will go.
 * @param {string} dataType The type of request.  json or jsonp.
 * @param {string} type The type of HTTP request.  GET, POST, PUT, etc.
 * @param {object} data The data to send to the server.
 * @param {function} callback The function callback.
 */
drupal.api.prototype.call = function(url, dataType, type, data, callback) {
  var request = {
    url: url,
    dataType: dataType,
    type: type,
    success: function(data, textStatus) {
      if (textStatus == 'success') {
        if (callback) {
          callback(data);
        }
      }
      else {
        console.log('Error: ' + textStatus);
      }
    },
    error: function(xhr, ajaxOptions, thrownError) {
      console.log(xhr.responseText);
      if (callback) {
        callback(null);
      }
    }
  };

  if (data) {
    request['data'] = data;
  }

  // Make the request.
  jQuery.ajax(request);
};

/**
 * API function to get any results from the drupal API.
 *
 * @param {object} object The object of the item we are getting..
 * @param {object} query key-value pairs to add to the query of the URL.
 * @param {function} callback The callback function.
 */
drupal.api.prototype.get = function(object, query, callback) {
  var url = this.getURL(object);
  url += '.jsonp';
  url += query ? ('?' + decodeURIComponent(jQuery.param(query, true))) : '';
  this.call(url, 'jsonp', 'GET', null, callback);
};

/**
 * API function to get a type of object within an object.
 *
 * @param {object} object The object of the item we are getting..
 * @param {string} type The type of object you wish to get within this object.
 * @param {object} query key-value pairs to add to the query of the URL.
 * @param {function} callback The callback function.
 */
drupal.api.prototype.getItems = function(object, type, query, callback) {
  var url = this.getURL(object) + '/' + type;
  url += '.jsonp';
  url += query ? ('?' + decodeURIComponent(jQuery.param(query, true))) : '';
  this.call(url, 'jsonp', 'GET', null, callback);
};

/**
 * API function to perform an action.
 *
 * @param {string} action The action to perform.
 * @param {object} object The entity object to set.
 * @param {function} callback The callback function.
 */
drupal.api.prototype.execute = function(action, object, callback) {
  var url = this.getURL(object) + '/' + action;
  //url += '?XDEBUG_SESSION_START=netbeans-xdebug';
  this.call(url, 'json', 'POST', object, callback);
};

/**
 * API function to save the value of an object using Services.
 *
 * @param {object} object The entity object to set.  If the object does not
 * have an ID, then this will create a new entity, otherwise, it will simply
 * update the existing resource.
 *
 * @param {function} callback The callback function.
 *
 **/
drupal.api.prototype.save = function(object, callback) {
  var type = object.id ? 'PUT' : 'POST';
  this.call(this.getURL(object), 'json', type, object, callback);
};

/**
 * API function to remove an object on the server.
 *
 * @param {object} object The entity object to delete.
 * @param {function} callback The callback function.
 */
drupal.api.prototype.remove = function(object, callback) {
  this.call(this.getURL(object), 'json', 'DELETE', null, callback);
};
