// The drupal namespace.
var drupal = drupal || {};

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
    this.properties = {};
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
    store: true
  }, options || {});

  // Don't require a query...
  if (typeof query === 'function') {
    callback = query;
    query = {};
  }

  // Get the list of entities.
  var instance = new object({});
  instance.api.get({}, instance.getQuery(query), function(entities) {
    if (entities) {
      var i = entities.length;
      while (i--) {
        entities[i] = new object(entities[i], null, options);
      }
    }
    if (callback) {
      callback(entities);
    }
  }, options.store);
};

/**
 * Sets the defaults for an entities properties, and also defines
 * what the public properties are when GET is performed on this
 * object.
 *
 * @param {object} defaults The defaults for the properties being set.
 * @param {object} object The object used to set the properties.
 */
drupal.entity.prototype.setProperties = function(defaults, object) {
  if (defaults) {
    for (var name in defaults) {
      this[name] = object[name] || this[name] || defaults[name];
      this.properties[name] = name;
    }
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

  // Set the properties for this entity.
  this.setProperties({
    id: '',
    uri: ''
  }, object);

  /** The name of this entity. */
  this.entityName = 'entity';
};

/**
 * Returns the object in JSON form.
 *
 * @return {object} The object representation of this entity.
 */
drupal.entity.prototype.get = function() {
  var object = {};
  if (this.properties) {
    for (var name in this.properties) {
      object[name] = this[name];
    }
  }
  return object;
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

  if (this.api) {

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
    })(this), this.options.store);
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
  }
};
