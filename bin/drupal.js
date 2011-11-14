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


// The drupal namespace.
var drupal = drupal || {};

(function($) {

  /**
   * @class The base entity class to store the data that is common to all
   * drupal entities whether it be groups, events, users, etc.
   *
   * @param {object} object The entity object.
   */
  drupal.entity = function(object, callback) {

    /** The unique identifier for this entity. */
    this.id = '';

    /** The API for this entity */
    this.api = this.api || null;

    // If object is a string, assume it is a UUID and get it.
    this.update(object);

    // If they provide a callback, call it now.
    if (callback) {

      // Get the object from the server.
      this.get(callback);
    }
  };

  /**
   * Get's an object from the drupal API.
   *
   * @param {function} callback The callback function when the object is
   * retrieved.
   */
  drupal.entity.prototype.get = function(callback) {

    // If the API exists, then we need to get the object.
    if (this.api) {

      // Call the API.
      this.api.get(this.getObject(), this.getQuery(), callback);
    }
  };

  /**
   * Saves this entity.
   *
   * @param {function} callback The function called once entity is saved.
   */
  drupal.entity.prototype.save = function(callback) {

    // If the API exists, then we can save this object.
    if (this.api) {

      // Call the API.
      this.api.save(this.getObject(), callback);
    }
  };

  /**
   * Removes an entity
   *
   * @param {function} callback The function called once entity is removed.
   */
  drupal.entity.prototype.remove = function(callback) {

    // Only remove if they have an ID.
    if (this.id) {

      // Call the API.
      this.api.remove(this.getObject(), callback);
    }
  };

  /**
   * Returns the search query.
   */
  drupal.entity.prototype.getQuery = function() {

    var query = {};

    // We only need to provide a search query if there is no ID.
    if (!this.id) {

      // Iterate through all of our fields.
      for (var field in this) {
        if (this.hasOwnProperty(field) &&
            this[field] &&
            (typeof this[field] != 'object')) {

          // Add this as a search parameter.
          query['parameters[' + field + ']'] = this[field];
        }
      }
    }

    // Return the params.
    return query;
  };

  /**
   * Update the entity data.
   *
   * @param {object} entity The entity information.
   */
  drupal.entity.prototype.update = function(object) {

    // Update the object.
    if (object) {

      // Update the params.
      for (var param in object) {
        if (object.hasOwnProperty(param) && this.hasOwnProperty(param)) {

          // Check to see if this object has an update function.
          if (this[param].update) {
            this[param].update(object[param]);
          }
          else {
            this[param] = object[param];
          }
        }
      }
    }
  };

  /**
   * Returns the object to send during PUT's and POST's during a save or add.
   *
   * @return {object} An object of the data when saving to the server.
   */
  drupal.entity.prototype.getObject = function() {
    return {
      id: this.id
    };
  };
}(jQuery));
// The drupal namespace.
var drupal = drupal || {};

(function($) {

  /**
   * @class The node class
   *
   * @extends drupal.entity
   *
   * @param {object} object The node object.
   * @param {function} callback The function to be called once the node has
   * been retrieved from the server.
   */
  drupal.node = function(object, callback) {

    /** The title for this node. */
    this.title = '';

    /** The type of node we are dealing with. */
    this.type = '';

    /** The status of this node. */
    this.status = 0;

    /** The user who created this node */
    this.uid = 0;

    // Declare the api.
    this.api = new drupal.node.api();

    // Call the base class.
    drupal.entity.call(this, object, callback);

    // Make sure to also accept "nid" as the ID.
    this.id = object.nid || this.id;
  };

  // Derive from entity.
  drupal.node.prototype = new drupal.entity();
  drupal.node.prototype.constructor = drupal.node;

  /**
   * Returns the object to send to Services.
   */
  drupal.node.prototype.getObject = function() {
    return $.extend(drupal.entity.prototype.getObject.call(this), {
      title: this.title,
      type: this.type,
      status: this.status,
      uid: this.uid
    });
  };
}(jQuery));
// The drupal namespace.
var drupal = drupal || {};

/** The drupal.node namespace */
drupal.node = drupal.node || {};

(function($) {

  /**
   * @class The Drupal Node Services class.
   *
   * @extends drupal.api
   */
  drupal.node.api = function() {

    // Call the drupal.api constructor.
    drupal.api.call(this);

    // Set the resource
    this.resource = 'node';
  };

  // Derive from drupal.api.
  drupal.node.api.prototype = new drupal.api();
  drupal.node.api.prototype.constructor = drupal.node.api;

}(jQuery));


// The drupal namespace.
var drupal = drupal || {};

(function($) {

  /**
   * @class The user class
   *
   * @extends drupal.entity
   *
   * @param {object} object The user object.
   * @param {function} callback The function to be called once the user has
   * been retrieved from the server.
   */
  drupal.user = function(object, callback) {

    /** The name for this user. */
    this.name = '';

    /** The email address of our user. */
    this.mail = '';

    /** The password of the user. */
    this.pass = '';

    // Declare the api.
    this.api = new drupal.user.api();

    // Call the base class.
    drupal.entity.call(this, object, callback);

    // Make sure to also accept "uid" as the ID.
    this.id = object.uid || this.id;
  };

  // Derive from entity.
  drupal.user.prototype = new drupal.entity();
  drupal.user.prototype.constructor = drupal.user;

  /**
   * Returns the object to send to Services.
   */
  drupal.user.prototype.getObject = function() {
    return $.extend(drupal.entity.prototype.getObject.call(this), {
      name: this.name,
      mail: this.mail,
      pass: this.pass
    });
  };
}(jQuery));
// The drupal namespace.
var drupal = drupal || {};

/** The drupal.user namespace */
drupal.user = drupal.user || {};

(function($) {

  /**
   * @class The Drupal User Services class.
   *
   * @extends drupal.api
   */
  drupal.user.api = function() {

    // Call the drupal.api constructor.
    drupal.api.call(this);

    // Set the resource
    this.resource = 'user';
  };

  // Derive from drupal.api.
  drupal.user.api.prototype = new drupal.api();
  drupal.user.api.prototype.constructor = drupal.user.api;

}(jQuery));


