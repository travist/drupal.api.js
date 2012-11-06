/** The drupal namespace. */
var drupal = drupal || {};

/** Determine if we have storage. */
drupal.hasStorage = (typeof(Storage) !== 'undefined');
drupal.hasStorage &= (typeof(JSON) !== 'undefined');

/**
 * Retrieve an item out of local storage.
 *
 * @param {string} key The key for the object to retrieve.
 * @return {object} The object that was retrieved.
 */
drupal.retrieve = function(key) {
  var object = null;

  // Check to see if we have storage.
  if (key && drupal.hasStorage) {

    // Get it out of localStorage.
    if (object = JSON.parse(localStorage.getItem(key))) {

      // Make sure this object hasn't expired.
      if ((new Date()).getTime() > object.expires) {

        // Clear it if it has.
        localStorage.removeItem(key);
        object = {};
      }
    }
  }

  return object;
};

/**
 * Store an object with an expiration.
 *
 * @param {string} key The key for the object to store.
 * @param {object} object They object to store.
 * @param {number} expires The expiration (in seconds) for this object.
 */
drupal.store = function(key, object, expires) {

  // Default the expiration if it wasn't provided.
  expires = expires || 3600;

  // Make sure we can store.
  if (key && drupal.hasStorage) {

    // Set an expiration date for this object.
    object.expires = (expires * 1000) + (new Date()).getTime();

    // Store this object in localStorage.
    localStorage.setItem(key, JSON.stringify(object));
  }
};

/**
 * Clears an object out of storage.
 *
 * @param {string} key The key for this object to clear.
 */
drupal.clear = function(key) {
  if (key && drupal.hasStorage) {
    localStorage.removeItem(key);
  }
};

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
    cacheId: '',

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
      if (entity && entity.uri) {
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
          jQuery('body').addClass('ui-loading');
        }
        else {
          jQuery('body').removeClass('ui-loading');
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
            console.log(xhr.statusText);
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
     * Return the object.
     *
     *  drupal.api.get(entity, function(object) {
     *    console.log(object);
     *  });
     *
     * Return a list of events within an entity.
     *
     *  drupal.api.get(entity, 'events', function(events) {
     *    console.log(events);
     *  });
     *
     * Return a list of nodes with type='page'.
     *
     *  drupal.api.get({}, {type:'page'}, function(object) {
     *
     *  });
     *
     * Return a list of events provided a query within a node.
     *
     *  drupal.api.get(entity, 'events', {month: 6}, functoin(events) {
     *    console.log(events);
     *  });
     *
     *
     * @this {object} The drupal.api object.
     * @param {object} object The object of the item we are getting..
     * @param {string} endpoint An additional endpoint to add onto the resource.
     * @param {object} query key-value pairs to add to the query of the URL.
     * @param {function} callback The callback function.
     * @param {boolean} cache cache/get the results in/from localStorage.
     */
    get: function(object, endpoint, query, callback, cache) {
      // Normalize the arguments based on the different schemes of calling this.
      var type = (typeof endpoint);
      if (type === 'object') {
        callback = query;
        query = endpoint;
        endpoint = '';
      }
      else if (type === 'function') {
        callback = endpoint;
        endpoint = '';
      }

      // Get the url for this object.
      var url = this.getURL(object);
      url += (endpoint) ? ('/' + endpoint) : '';
      url += '.jsonp';
      url += query ? ('?' + decodeURIComponent(jQuery.param(query, true))) : '';

      // See if we should cache the result.
      if (cache) {
        this.cacheId = url.replace(/[^A-z0-9\-]/g, '');
        var storage = drupal.retrieve(this.cacheId);
        if (storage && (storage.url === url)) {
          callback(storage.data);
          return;
        }
      }

      // No cache exists, so make the server call.
      this.call(url, 'jsonp', 'GET', null, (function(api) {
        return function(data) {

          // Store this in cache...
          if (cache) {
            drupal.store(api.cacheId, {
              url: url,
              data: data
            });
          }

          // Store the result.
          callback(data);
        }
      })(this));
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

      // Remove the storage if the cacheID exists.
      if (this.cacheId) {
        drupal.clear(this.cacheId);
      }

      // Call to delete the resource.
      this.call(this.getURL(object), 'json', 'DELETE', null, callback);
    }
  };
};
