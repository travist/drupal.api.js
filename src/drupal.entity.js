// The drupal namespace.
var drupal = drupal || {};

/** Determine if we have storage. */
drupal.hasStorage = typeof(Storage) !== 'undefined';

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
  if (drupal.hasStorage && this.id) {
    sessionStorage.setItem('entity-' + this.id, this.get());
  }

  // Now callback that this object has been updated.
  if (callback) {
    callback.call(this, this);
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
 * Gets a filtered object.
 *
 * @return {object} The filtered object.
 */
drupal.entity.prototype.getFiltered = function() {
  var object = this.get();
  var filtered = {};
  for (var param in object) {
    if (object.hasOwnProperty(param) && object[param]) {
      filtered[param] = object[param];
    }
  }
  return filtered;
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

  // Declare the object to load...
  var object = {};

  // If no id is provided, then just return nothing...
  if (!this.id) {
    callback(null);
    return;
  }

  // First check to see if we have storage...
  /*
  if (drupal.hasStorage) {
    object = sessionStorage.getItem('entity-' + this.id);
    if (object) {
      this.set(object);
      if (callback) {
        callback.call(this, this);
      }
    }
  }
  */

  // If the object doesn't exist... then get it from the server.
  if (!object && this.api) {

    // Call the API.
    this.api.get(this.get(), this.getQuery(), (function(entity) {
      return function(object) {

        // If no object is returned, then return null.
        if (!object) {
          callback(null);
        }

        // If this is an array of objects, then return a list of new objects.
        else if (object[0]) {

          var i = object.length;
          while (i--) {
            object[i] = new entity.constructor(object[i]);
            if (drupal.hasStorage && object[i].id) {
              sessionStorage.setItem('entity-' + object[i].id, object[i].get());
            }
          }

          // Callback a list of objects.
          callback.call(entity, entity);

        } else {

          // Update the object.
          entity.update(object, callback);
        }
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
    this.api.save(this.getFiltered(), (function(entity) {
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
    if (drupal.hasStorage) {
      sessionStorage.removeItem('entity-' + this.id);
    }
  }
};
