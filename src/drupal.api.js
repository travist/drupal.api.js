/** The drupal namespace. */
var drupal = drupal || {};

(function($) {

  /**
   * @class The base Drupal API class.
   */
  drupal.api = function() {

    /** The Services URL */
    this.url = 'http://rest';

    /** The Services API endpoint */
    this.endpoint = 'rest';

    /** The resource within this endpoint */
    this.resource = '';
  };

  /**
   * Helper function to get the Services URL for this resource.
   *
   * @param {object} object The object involved with in this request.
   */
  drupal.api.prototype.getURL = function(object) {
    var path = this.url;
    path += this.endpoint ? ('/' + this.endpoint) : '';
    path += this.resource ? ('/' + this.resource) : '';
    path += object.id ? ('/' + object.id) : '';
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
          callback(data);
        }
        else {
          console.log('Error: ' + textStatus);
        }
      },
      error: function(xhr, ajaxOptions, thrownError) {
        console.log(xhr.responseText);
        callback(null);
      }
    };

    if (data) {
      request['data'] = data;
    }

    // Make the request.
    $.ajax(request);
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
   * API function to perform an action.
   *
   * @param {string} action The action to perform.
   * @param {object} entity The entity object to set.
   * @param {function} callback The callback function.
   */
  drupal.api.prototype.execute = function(action, object, callback) {
    var url = this.getURL(object) + '/' + action;
    this.call(url, 'json', 'POST', object, callback);
  };

  /**
   * API function to save the value of an object using Services.
   *
   * @param {object} entity The entity object to set.  If the object does not
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
   * @param {object} entity The entity object to delete.
   * @param {function} callback The callback function.
   */
  drupal.api.prototype.remove = function(object, callback) {
    this.call(this.getURL(object), 'json', 'DELETE', null, callback);
  };
}(jQuery));


