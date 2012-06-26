// The drupal namespace.
var drupal = drupal || {};

/** Determine if we have storage. */
drupal.hasStorage = (typeof(Storage) !== 'undefined');
drupal.hasStorage &= (typeof(JSON) !== 'undefined');

/**
 * @constructor
 * @class The base entity class to store the data that is common to all
 * drupal entities whether it be groups, events, users, etc.
 *
 * @param {object} object The entity object.
 * @param {function} callback The callback function to get the object.
 * @param {object} options Options used to govern functionality.
 */
drupal.entity = function(object, callback, options) {

  // Set the options.
  this.options = jQuery.extend({
    store: true,
    expires: 3600
  }, (typeof options === 'undefined') ? {} : options);

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
 * @param {object} options Options used to govern functionality.
 */
drupal.entity.index = function(object, query, callback, options) {

  // Set the default options.
  options = jQuery.extend({
    store: false
  }, options || {});

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
      entities[i] = new object(entities[i], null, options);
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
  if (this.id && this.options.store && drupal.hasStorage) {

    // Get the object.
    var object = this.get();

    // Get the key for this object.
    var key = this.entityName + '-' + this.id;

    // Set an expiration date for this object.
    object.expires = (this.options.expires * 1000) + (new Date()).getTime();

    // Store this object in localStorage.
    localStorage.setItem(key, JSON.stringify(object));
  }
};

/**
 * Retrieves an object from local storage.
 *
 * @return {object} The object in local storage.
 */
drupal.entity.prototype.retrieve = function() {
  var object = null, key = '', value = '';
  if (this.id && this.options.store && drupal.hasStorage) {

    // Get the key for this object.
    var key = this.entityName + '-' + this.id;

    // Get it out of localStorage.
    if (object = JSON.parse(localStorage.getItem(key))) {

      // Make sure this object hasn't expired.
      if ((new Date()).getTime() > object.expires) {

        // Clear it if it has.
        localStorage.removeItem(key);
      }
      else {

        // Set the object if it was retrieved.
        this.set(object);
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

  /** The uri of this entity. */
  this.uri = object.uri || this.uri || '';

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
    id: this.id,
    uri: this.uri
  };
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
 * @param {object} query The query variables.
 * @return {object} The query variables.
 */
drupal.entity.prototype.getQuery = function(query) {
  return query || {};
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
    this.api.get(this.get(), {}, (function(entity) {
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
