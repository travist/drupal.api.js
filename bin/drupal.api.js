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
// The drupal namespace.
var drupal = drupal || {};

/**
 * @constructor
 * @class The system class
 *
 * @param {function} callback The function to be called once the system has
 * connected.
 */
drupal.system = function(callback) {

  /** The current user. */
  this.user = this.user || null;

  // Declare the api.
  this.api = this.api || new drupal.system.api();

  // If the callback is set, then connect.
  if (callback) {

    // Connect to the server.
    this.connect(callback);
  }
};

/**
 * Connect to the server.
 *
 * @param {function} callback The callback function.
 */
drupal.system.prototype.connect = function(callback) {

  // Connect to the server.
  var _this = this;
  this.api.execute('connect', null, function(object) {

    // Set the user object, session id, and return this server.
    _this.user = new drupal.user(object.user);
    _this.user.sessid = object.sessid;
    callback(_this);
  });
};

/**
 * Get a variable from the server.
 *
 * @param {string} name The variable you wish to retrieve.
 * @param {string} def The default value of the variable.
 * @param {function} callback The callback function.
 */
drupal.system.prototype.get_variable = function(name, def, callback) {
  this.api.execute('get_variable', {name: name, 'default': def}, callback);
};

/**
 * Set a variable on the server.
 *
 * @param {string} name The variable you wish to set.
 * @param {string} value The value of the variable.
 * @param {function} callback The callback function.
 */
drupal.system.prototype.set_variable = function(name, value, callback) {
  this.api.execute('set_variable', {name: name, value: value}, callback);
};

/**
 * Delete a variable on the server.
 *
 * @param {string} name The variable you wish to set.
 * @param {function} callback The callback function.
 */
drupal.system.prototype.del_variable = function(name, callback) {
  this.api.execute('del_variable', {name: name}, callback);
};
// The drupal namespace.
var drupal = drupal || {};

/** The drupal.user namespace */
drupal.system = drupal.system || {};

/**
 * @constructor
 * @extends drupal.api
 * @class The Drupal System Services class.
 */
drupal.system.api = function() {

  // Set the resource
  this.resource = this.resource || 'system';

  // Call the drupal.api constructor.
  drupal.api.call(this);
};

/** Derive from drupal.api. */
drupal.system.api.prototype = new drupal.api();

/** Reset the constructor. */
drupal.system.api.prototype.constructor = drupal.system.api;
// The drupal namespace.
var drupal = drupal || {};

/**
 * @constructor
 * @class The base entity class to store the data that is common to all
 * drupal entities whether it be groups, events, users, etc.
 *
 * @param {object} object The entity object.
 * @param {function} callback The callback function to get the object.
 */
drupal.entity = function(object, callback) {

  // Only continue if the object is valid.
  if (object) {

    /** The unique identifier for this entity. */
    this.id = this.id || '';

    /** The API for this entity */
    this.api = this.api || null;

    // If object is a string, assume it is a UUID and get it.
    this.update(object);

    // If they provide a callback, call it now.
    if (callback) {

      // Get the object from the server.
      this.get(callback);
    }
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
    var _this = this;
    this.api.get(this.getObject(), this.getQuery(), function(object) {

      if (!object) {
        callback(null);
      }
      else if (object[0]) {

        var i = object.length;
        while (i--) {
          object[i] = new _this.constructor(object[i]);
        }

        // Callback a list of objects.
        callback(object);
      }
      else {
        // Update the object, then call the callback.
        _this.update(object);

        if (callback) {
          callback(_this);
        }
      }
    });
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
    var _this = this;
    this.api.save(this.getObject(), function(object) {

      // Update the object, then call the callback.
      _this.update(object);

      if (callback) {
        callback(_this);
      }
    });
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
 *
 * @return {object} The query to pass to the server.
 */
drupal.entity.prototype.getQuery = function() {

  var query = {};

  // We only need to provide a search query if there is no ID.
  if (!this.id) {

    // Iterate through all of our fields.
    for (var field in this) {

      // Make sure that this property exists, is set, and is not an object.
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
 * @param {object} object The entity information.
 */
drupal.entity.prototype.update = function(object) {

  // Update the object.
  if (object) {

    // Update the params.
    for (var param in object) {

      // Check to make sure that this param is within object scope.
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
 * @return {object} The JSON object to send to the Services endpoint.
 */
drupal.entity.prototype.getObject = function() {
  return {
    id: this.id
  };
};
// The drupal namespace.
var drupal = drupal || {};

/**
 * @constructor
 * @extends drupal.entity
 * @class The node class
 *
 * @param {object} object The node object.
 * @param {function} callback The function to be called once the node has
 * been retrieved from the server.
 */
drupal.node = function(object, callback) {

  // Only continue if the object is valid.
  if (object) {

    /** The title for this node. */
    this.title = this.title || '';

    /** The type of node we are dealing with. */
    this.type = this.type || '';

    /** The status of this node. */
    this.status = this.status || 0;

    /** The user who created this node */
    this.uid = this.uid || 0;

    // Declare the api.
    this.api = this.api || new drupal.node.api();
  }

  // Call the base class.
  drupal.entity.call(this, object, callback);
};

/** Derive from entity. */
drupal.node.prototype = new drupal.entity();

/** Reset the constructor. */
drupal.node.prototype.constructor = drupal.node;

/**
 * Override the update routine.
 *
 * @param {object} object The node object to update.
 */
drupal.node.prototype.update = function(object) {

  drupal.entity.prototype.update.call(this, object);

  // Make sure to also set the ID the same as nid.
  if (object) {
    this.id = object.nid || this.id;
  }
};

/**
 * Returns the object to send to Services.
 *
 * @return {object} The object to send to the Services endpoint.
 */
drupal.node.prototype.getObject = function() {
  return jQuery.extend(drupal.entity.prototype.getObject.call(this), {
    title: this.title,
    type: this.type,
    status: this.status,
    uid: this.uid
  });
};
// The drupal namespace.
var drupal = drupal || {};

/** The drupal.node namespace */
drupal.node = drupal.node || {};

/**
 * @constructor
 * @extends drupal.api
 * @class The Drupal Node Services class.
 */
drupal.node.api = function() {

  // Set the resource
  this.resource = this.resource || 'node';

  // Call the drupal.api constructor.
  drupal.api.call(this);
};

/** Derive from drupal.api. */
drupal.node.api.prototype = new drupal.api();

/** Reset the constructor. */
drupal.node.api.prototype.constructor = drupal.node.api;
// The drupal namespace.
var drupal = drupal || {};

/**
 * @constructor
 * @extends drupal.entity
 * @class The user class
 *
 * @param {object} object The user object.
 * @param {function} callback The function to be called once the user has
 * been retrieved from the server.
 */
drupal.user = function(object, callback) {

  // Only continue if the object is valid.
  if (object) {

    /** The name for this user. */
    this.name = this.name || '';

    /** The email address of our user. */
    this.mail = this.mail || '';

    /** The password of the user. */
    this.pass = this.pass || '';

    /** The status of the user. */
    this.status = this.status || 1;

    /** The session ID of the user. */
    this.sessid = this.sessid || '';

    /** The session name of the user */
    this.session_name = this.session_name || '';

    // Declare the api.
    this.api = this.api || new drupal.user.api();
  }

  // Call the base class.
  drupal.entity.call(this, object, callback);
};

/** Derive from drupal.entity. */
drupal.user.prototype = new drupal.entity();

/** Reset the constructor. */
drupal.user.prototype.constructor = drupal.user;

/**
 * Login a user.
 *
 * @param {function} callback The callback function.
 */
drupal.user.prototype.login = function(callback) {

  // Setup the POST data for the login of this user.
  var object = {
    username: this.name,
    password: this.pass
  };

  // Execute the login.
  var _this = this;
  this.api.execute('login', object, function(user) {

    // Set the session ID and session name.
    _this.sessid = user.sessid;
    _this.session_name = user.session_name;

    // Update this object.
    _this.update(user.user);
    callback(_this);
  });
};

/**
 * Register a user.
 *
 * @param {function} callback The callback function.
 */
drupal.user.prototype.register = function(callback) {

  // Execute the register.
  var _this = this;
  this.api.execute('register', this.getObject(), function(user) {

    // Now update the object.
    _this.update(user);
    callback(_this);
  });
};

/**
 * Logout the user.
 *
 * @param {function} callback The callback function.
 */
drupal.user.prototype.logout = function(callback) {

  // Execute the logout.
  this.api.execute('logout', null, callback);
};

/**
 * Override the update routine.
 *
 * @param {object} object The object to update.
 */
drupal.user.prototype.update = function(object) {

  drupal.entity.prototype.update.call(this, object);

  // Make sure to also set the ID the same as uid.
  if (object) {
    this.id = object.uid || this.id;
  }
};

/**
 * Returns the object to send to Services.
 *
 * @return {object} The object to send to the Services endpoint.
 */
drupal.user.prototype.getObject = function() {
  return jQuery.extend(drupal.entity.prototype.getObject.call(this), {
    name: this.name,
    mail: this.mail,
    pass: this.pass,
    status: this.status
  });
};
// The drupal namespace.
var drupal = drupal || {};

/** The drupal.user namespace */
drupal.user = drupal.user || {};

/**
 * @constructor
 * @extends drupal.api
 * @class The Drupal User Services class.
 */
drupal.user.api = function() {

  // Set the resource
  this.resource = 'user';

  // Call the drupal.api constructor.
  drupal.api.call(this);
};

/** Derive from drupal.api. */
drupal.user.api.prototype = new drupal.api();

/** Reset the constructor. */
drupal.user.api.prototype.constructor = drupal.user.api;
