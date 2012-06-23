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
      var path = this.endpoint();
      path += this.resource ? ('/' + this.resource) : '';
      path += (entity && entity.id) ? ('/' + entity.id) : '';
      return path;
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
        success: function(data, textStatus) {
          console.log(data);
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
// The drupal namespace.
var drupal = drupal || {};

/** Determine if we have storage. */
drupal.hasStorage = false/*typeof(Storage) !== 'undefined'*/;

/**
 * @constructor
 * @class The base entity class to store the data that is common to all
 * drupal entities whether it be groups, events, users, etc.
 *
 * @param {object} object The entity object.
 * @param {function} callback The callback function to get the object.
 */
drupal.entity = function(object, callback) {

  // If the object is valid, then set it...
  if (object) {
    this.set(object);
  }

  // If the callback is valid, then load it...
  if (callback) {
    this.load(callback);
  }
};

/**
 * Returns an index of entities.
 *
 * @param {object} object The object to create for each entity.
 * @param {object} query The query parameters.
 * @param {function} callback The callback function.
 */
drupal.entity.index = function(object, query, callback) {

  // Don't require a query...
  if (typeof query === 'function') {
    callback = query;
    query = {};
  }

  // Get the list of entities.
  object.api.get({}, query, function(entities) {
    var i = entities.length;
    while (i--) {
      entities[i] = new object(entities[i]);
      entities[i].store();
    }
    if (callback) {
      callback(entities);
    }
  });
};

/**
 * Update an object.
 *
 * @param {object} object The object which contains the data.
 * @param {function} callback The function to call when it is done updating.
 */
drupal.entity.prototype.update = function(object, callback) {

  // Set the object.
  if (object) {
    this.set(object);
  }

  // Now store the object.
  this.store();

  // Now callback that this object has been updated.
  if (callback) {
    callback.call(this, this);
  }
};

/**
 * Stores the object in local storage.
 */
drupal.entity.prototype.store = function() {
  if (this.id && drupal.hasStorage) {
    var object = this.get();
    var key = '';
    for (var prop in object) {
      if (object.hasOwnProperty(prop) && object[prop]) {
        key = this.entityName + '-' + this.id + '-' + prop;
        localStorage.setItem(key, object[prop]);
      }
    }
  }
};

/**
 * Retrieves an object from local storage.
 *
 * @return {object} The object in local storage.
 */
drupal.entity.prototype.retrieve = function() {
  var object = null, key = '', value = '';
  if (this.id && drupal.hasStorage) {
    object = this.get();
    for (var prop in object) {
      key = this.entityName + '-' + this.id + '-' + prop;
      if (value = localStorage.getItem(key)) {
        object[prop] = value;
      }
    }
  }
  return object;
};

/**
 * Clears an item out of local storage.
 */
drupal.entity.prototype.clear = function() {
  if (this.id && drupal.hasStorage) {
    var object = this.get(), key = '';
    for (var prop in object) {
      key = this.entityName + '-' + this.id + '-' + prop;
      localStorage.removeItem(key);
    }
  }
};

/**
 * Sets the object.
 *
 * @param {object} object The object which contains the data.
 */
drupal.entity.prototype.set = function(object) {

  /** The API for this entity */
  this.api = this.api || null;

  /** The ID of this entity. */
  this.id = object.id || this.id || '';

  /** The name of this entity. */
  this.entityName = 'entity';
};

/**
 * Returns the object in JSON form.
 *
 * @return {object} The object representation of this entity.
 */
drupal.entity.prototype.get = function() {
  return {
    id: this.id
  };
};

/**
 * Sets a query variable.
 *
 * @param {object} query The query object.
 * @param {string} param The param to set.
 * @param {string} value The value of the field to set.
 */
drupal.entity.prototype.setQuery = function(query, param, value) {
  query[param] = value;
};

/**
 * Gets a POST object.
 *
 * @return {object} The filtered object.
 */
drupal.entity.prototype.getPOST = function() {
  var object = this.get();
  if (!object.id) {
    delete object.id;
  }
  return object;
};

/**
 * Gets the query variables.
 *
 * @return {object} The query variables.
 */
drupal.entity.prototype.getQuery = function() {
  var object = this.get();
  var query = {};
  for (var param in object) {
    if (object.hasOwnProperty(param) && object[param]) {
      this.setQuery(query, param, object[param]);
    }
  }
  delete query.id;
  return query;
};

/**
 * Loads and object using the drupal.api.
 *
 * @param {function} callback The callback function when the object is
 * retrieved.
 */
drupal.entity.prototype.load = function(callback) {

  // If this isn't a valid object, then return null...
  if (!this.id) {
    callback(null);
  }

  // Declare the object to load...
  var object = null;
  if (object = this.retrieve()) {
    this.update(object, callback);
  }
  else if (this.api) {

    // Call the API.
    this.api.get(this.get(), this.getQuery(), (function(entity) {
      return function(object) {

        // If no object is returned, then return null.
        if (!object) {
          callback(null);
        }

        // Update the object.
        entity.update(object, callback);
      };
    })(this));
  }
};

/**
 * Saves this entity.
 *
 * @param {function} callback The function called once entity is saved.
 */
drupal.entity.prototype.save = function(callback) {

  // Check to see if the api is valid.
  if (this.api) {

    // Call the api.
    this.api.save(this.getPOST(), (function(entity) {
      return function(object) {
        entity.update(object, callback);
      };
    })(this));
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
    this.api.remove(this.get(), callback);
    this.clear();
  }
};
// The drupal namespace.
var drupal = drupal || {};

/*!
 * Modified from...
 *
 * jQuery Cookie Plugin
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2011, Klaus Hartl
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.opensource.org/licenses/GPL-2.0
 */
/**
 * Add a way to store cookies.
 *
 * @param {string} key The key for the cookie.
 * @param {string} value The value of the cookie.
 * @param {object} options The options for the cookie storage.
 * @return {string} The results of the storage.
 */
drupal.cookie = function(key, value, options) {

  // key and at least value given, set cookie...
  if (arguments.length > 1 &&
     (!/Object/.test(Object.prototype.toString.call(value)) ||
      value === null ||
      value === undefined)) {
    options = $.extend({}, options);

    if (value === null || value === undefined) {
      options.expires = -1;
    }

    if (typeof options.expires === 'number') {
      var days = options.expires, t = options.expires = new Date();
      t.setDate(t.getDate() + days);
    }

    value = String(value);

    // use expires attribute, max-age is not supported by IE
    return (document.cookie = [encodeURIComponent(key), '=',
    options.raw ? value : encodeURIComponent(value),
    options.expires ? '; expires=' + options.expires.toUTCString() : '',
    options.path ? '; path=' + options.path : '',
    options.domain ? '; domain=' + options.domain : '',
    options.secure ? '; secure' : ''].join(''));
  }

  // key and possibly options given, get cookie...
  options = value || {};
  var decode = options.raw ? function(s) {
    return s;
  } : decodeURIComponent;

  var pairs = document.cookie.split('; ');
  for (var i = 0, pair; pair = pairs[i] && pairs[i].split('='); i++) {
    if (decode(pair[0]) === key)
      return decode(pair[1] || '');
  }
  return null;
};

/**
 * @constructor
 * @class The system class
 *
 * @param {function} callback The function to be called once the system has
 * connected.
 */
drupal.system = function(callback) {
  drupal.entity.call(this, {}, callback);
};

/** Derive from entity. */
drupal.system.prototype = new drupal.entity();

/** Reset the constructor. */
drupal.system.prototype.constructor = drupal.system;

/** Declare the system api. */
drupal.system.api = jQuery.extend(new drupal.api(), {
  resource: 'system'
});

/**
 * Sets the object.
 *
 * @param {object} object The object which contains the data.
 */
drupal.system.prototype.set = function(object) {
  drupal.entity.prototype.set.call(this, object);

  /** The name of this entity. */
  this.entityName = 'system';

  /** Set the api. */
  this.api = drupal.system.api;

  /** Set current user. */
  this.user = new drupal.user(object.user);
  this.user.setSession(object.session_name, object.sessid);
};

/**
 * Returns the object.
 *
 * @return {object} The object to send to the Services endpoint.
 */
drupal.system.prototype.get = function() {
  return jQuery.extend(drupal.entity.prototype.get.call(this), {
    user: this.user.get()
  });
};

/**
 * Loads the server.
 *
 * @param {function} callback The callback function.
 */
drupal.system.prototype.load = function(callback) {

  // Connect to the server.
  this.api.execute('connect', null, (function(system) {
    return function(object) {
      system.update(object, callback);
    };
  })(this));
};

/**
 * Get a variable from the server.
 *
 * @param {string} name The variable you wish to retrieve.
 * @param {string} def The default value of the variable.
 * @param {function} callback The callback function.
 */
drupal.system.prototype.get_variable = function(name, def, callback) {
  this.api.execute('get_variable', {
    name: name,
    'default': def
  }, callback);
};

/**
 * Set a variable on the server.
 *
 * @param {string} name The variable you wish to set.
 * @param {string} value The value of the variable.
 * @param {function} callback The callback function.
 */
drupal.system.prototype.set_variable = function(name, value, callback) {
  this.api.execute('set_variable', {
    name: name,
    value: value
  }, callback);
};

/**
 * Delete a variable on the server.
 *
 * @param {string} name The variable you wish to set.
 * @param {function} callback The callback function.
 */
drupal.system.prototype.del_variable = function(name, callback) {
  this.api.execute('del_variable', {
    name: name
  }, callback);
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
  drupal.entity.call(this, object, callback);
};

/** Derive from entity. */
drupal.node.prototype = new drupal.entity();

/** Reset the constructor. */
drupal.node.prototype.constructor = drupal.node;

/** Declare the node api. */
drupal.node.api = jQuery.extend(new drupal.api(), {
  resource: 'node'
});

/**
 * Returns an index of nodes.
 *
 * @param {object} query The query parameters.
 * @param {function} callback The callback function.
 */
drupal.node.index = function(query, callback) {
  drupal.entity.index(drupal.node, query, callback);
};

/**
 * Sets the object.
 *
 * @param {object} object The object which contains the data.
 */
drupal.node.prototype.set = function(object) {
  drupal.entity.prototype.set.call(this, object);

  /** The name of this entity. */
  this.entityName = 'node';

  /** Set the api to the drupal.node.api. */
  this.api = drupal.node.api;

  /** Set the ID based on the nid. */
  this.id = object.nid || this.id || 0;

  /** The title for this node. */
  this.title = object.title || this.title || '';

  /** The type of node we are dealing with. */
  this.type = object.type || this.type || '';

  /** The status of this node. */
  this.status = object.status || this.status || 0;

  /** The user who created this node */
  this.uid = object.uid || this.uid || 0;
};

/**
 * Returns the object to send to Services.
 *
 * @return {object} The object to send to the Services endpoint.
 */
drupal.node.prototype.get = function() {
  return jQuery.extend(drupal.entity.prototype.get.call(this), {
    title: this.title,
    type: this.type,
    status: this.status,
    uid: this.uid
  });
};

/**
 * Override the setQuery method of the entity.
 *
 * @param {object} query The query object.
 * @param {string} param The param to set.
 * @param {string} value The value of the field to set.
 */
drupal.node.prototype.setQuery = function(query, param, value) {
  // The node object sets parameters like ?parameters[param]=value...
  query['parameters[' + param + ']'] = value;
};
// The drupal namespace.
var drupal = drupal || {};

/** The current logged in user. */
drupal.current_user = null;

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
  drupal.entity.call(this, object, callback);
};

/** Derive from drupal.entity. */
drupal.user.prototype = new drupal.entity();

/** Reset the constructor. */
drupal.user.prototype.constructor = drupal.user;

/** Declare the user api. */
drupal.user.api = jQuery.extend(new drupal.api(), {
  resource: 'user'
});

/**
 * Returns an index of users.
 *
 * @param {object} query The query parameters.
 * @param {function} callback The callback function.
 */
drupal.user.index = function(query, callback) {
  drupal.entity.index(drupal.user, query, callback);
};

/**
 * Sets the object.
 *
 * @param {object} object The object which contains the data.
 */
drupal.user.prototype.set = function(object) {
  drupal.entity.prototype.set.call(this, object);

  /** The name of this entity. */
  this.entityName = 'user';

  /** Set the api. */
  this.api = drupal.user.api;

  /** Set the ID based on the uid. */
  this.id = object.uid || this.id || 0;

  /** The name for this user. */
  this.name = object.name || this.name || '';

  /** The email address of our user. */
  this.mail = object.mail || this.mail || '';

  /** The password of the user. */
  this.pass = object.pass || this.pass || '';

  /** The status of the user. */
  this.status = object.status || this.status || 1;
};

/**
 * Sets a user session.
 *
 * @param {string} name The name of the session.
 * @param {string} sessid The session ID.
 */
drupal.user.prototype.setSession = function(name, sessid) {

  /** Set the session id for this user. */
  this.sessid = sessid;

  // Only set the session name if this user is valid and has a session name.
  if (this.id && name) {

    /** Set the session name for this user. */
    this.session_name = name;

    /** Now store this in a cookie for further authentication. */
    drupal.cookie(name, sessid);

    // Now store this user as the 'current' user.
    drupal.current_user = this;
  }
};

/**
 * Login a user.
 *
 * @param {function} callback The callback function.
 */
drupal.user.prototype.login = function(callback) {
  if (this.api) {
    this.api.execute('login', {
      username: this.name,
      password: this.pass
    }, (function(user) {
      return function(object) {

        // Update this object.
        user.update(object.user);

        // Set the session.
        user.setSession(object.session_name, object.sessid);

        if (callback) {
          callback.call(user, user);
        }
      };
    })(this));
  }
};

/**
 * Register a user.
 *
 * @param {function} callback The callback function.
 */
drupal.user.prototype.register = function(callback) {
  if (this.api) {
    this.api.execute('register', this.getPOST(), (function(user) {
      return function(object) {
        user.update(object, callback);
      };
    })(this));
  }
};

/**
 * Logout the user.
 *
 * @param {function} callback The callback function.
 */
drupal.user.prototype.logout = function(callback) {
  if (this.api) {
    this.api.execute('logout', null, callback);
  }
};

/**
 * Gets a POST object.
 *
 * @return {object} The filtered object.
 */
drupal.user.prototype.getPOST = function() {

  // Add the password to POST's only.
  var post = drupal.entity.prototype.getPOST.call(this);
  post.pass = this.pass;
  return post;
};

/**
 * Returns the object to send to Services.
 *
 * @return {object} The object to send to the Services endpoint.
 */
drupal.user.prototype.get = function() {
  return jQuery.extend(drupal.entity.prototype.get.call(this), {
    name: this.name,
    mail: this.mail,
    status: this.status
  });
};
