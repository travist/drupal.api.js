/** The drupal namespace. */
var drupal = drupal || {};

/**
 * The Drupal API class.  This is a static class helper
 * to assist in communication between javascript and
 * a Drupal CMS backend.
 *
 * @return {object} The API object.
 */
drupal.api = function() {
  return {

    /** The resource within this endpoint */
    resource: '',

    /** See if we are dealing with jQuery Mobile applications. */
    isMobile: jQuery.hasOwnProperty('mobile'),

    /**
     * The Services API endpoint
     *
     * @this {object} The drupal.api object.
     * @return {string} The services endpoint.
     **/
    endpoint: function() {
      return drupal.endpoint || '';
    },

    /**
     * Helper function to get the Services URL for this resource.
     *
     * @this {object} The drupal.api object.
     * @param {object} object The object involved with in this request.
     * @return {string} The path to the API endpoint.
     */
    getURL: function(entity) {
      // If the entity has a valid URI, then use that...
      if (entity.uri) {
        return entity.uri;
      }
      else {

        // Otherwise, build our best guess for the URI of this entity.
        var path = this.endpoint();
        path += this.resource ? ('/' + this.resource) : '';
        path += (entity && entity.id) ? ('/' + entity.id) : '';
        return path;
      }
    },

    /**
     * Called when we are loading or not.
     *
     * @param {boolean} loading If this api is loading something.
     * @this Points to the drupal.api object.
     */
    loading: function(loading) {
      if (this.isMobile) {
        if (loading) {
          jQuery.mobile.showPageLoadingMsg();
        }
        else {
          jQuery.mobile.hidePageLoadingMsg();
        }
      }
    },

    /**
     * API function to act as a generic request for all Service calls.
     *
     * @this {object} The drupal.api object.
     * @param {string} url The URL where the request will go.
     * @param {string} dataType The type of request.  json or jsonp.
     * @param {string} type The type of HTTP request.  GET, POST, PUT, etc.
     * @param {object} data The data to send to the server.
     * @param {function} callback The function callback.
     */
    call: function(url, dataType, type, data, callback) {
      var request = {
        url: url,
        dataType: dataType,
        type: type,
        success: (function(api) {
          return function(data, textStatus) {
            api.loading(false);
            if (textStatus == 'success') {
              if (callback) {
                callback(data);
              }
            }
            else {
              console.log('Error: ' + textStatus);
            }
          };
        })(this),
        error: (function(api) {
          return function(xhr, ajaxOptions, thrownError) {
            api.loading(false);
            console.log(xhr.responseText);
            if (callback) {
              callback(null);
            }
          };
        })(this)
      };

      if (data) {
        request['data'] = data;
      }

      // Show a loading cursor.
      this.loading(true);

      // Make the request.
      jQuery.ajax(request);
    },

    /**
     * API function to get any results from the drupal API.
     *
     * @this {object} The drupal.api object.
     * @param {object} object The object of the item we are getting..
     * @param {object} query key-value pairs to add to the query of the URL.
     * @param {function} callback The callback function.
     */
    get: function(object, query, callback) {
      var url = this.getURL(object);
      url += '.jsonp';
      url += query ? ('?' + decodeURIComponent(jQuery.param(query, true))) : '';
      this.call(url, 'jsonp', 'GET', null, callback);
    },

    /**
     * API function to perform an action.
     *
     * @this {object} The drupal.api object.
     * @param {string} action The action to perform.
     * @param {object} object The entity object to set.
     * @param {function} callback The callback function.
     */
    execute: function(action, object, callback) {
      var url = this.getURL(object) + '/' + action;
      this.call(url, 'json', 'POST', object, callback);
    },

    /**
     * API function to save the value of an object using Services.
     *
     * @this {object} The drupal.api object.
     * @param {object} object The entity object to set.  If the object does not
     * have an ID, then this will create a new entity, otherwise, it will simply
     * update the existing resource.
     *
     * @param {function} callback The callback function.
     *
     */
    save: function(object, callback) {
      var type = object.id ? 'PUT' : 'POST';
      this.call(this.getURL(object), 'json', type, object, callback);
    },

    /**
     * API function to remove an object on the server.
     *
     * @this {object} The drupal.api object.
     * @param {object} object The entity object to delete.
     * @param {function} callback The callback function.
     */
    remove: function(object, callback) {
      this.call(this.getURL(object), 'json', 'DELETE', null, callback);
    }
  };
};
