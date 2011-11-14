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
   *
   */
  drupal.entity.prototype.find = function(callback) {


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

        // If this is an array, then just return the results.
        if (object[0]) {
          callback(object);
        }
        else {
          // Update the object, then call the callback.
          _this.update(object);
          callback(_this);
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
        callback(_this);
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
