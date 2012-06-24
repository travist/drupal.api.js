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
  var instance = new object({});
  instance.api.get({}, instance.getQuery(query), function(entities) {
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
 * @param {object} object The query variables.
 * @return {object} The query variables.
 */
drupal.entity.prototype.getQuery = function(object) {
  var query = {};
  object = object || this.get();
  for (var param in object) {
    if (param !== 'id' && object.hasOwnProperty(param) && object[param]) {
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
