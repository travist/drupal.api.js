/** The drupal namespace. */
var drupal = drupal || {};

(function($) {

  /**
   * @class The base entity class to store the data that is common to all
   * drupal entities whether it be groups, events, users, etc.
   *
   * @param {object} options The options for this class.
   */
  drupal.entity = function(object) {

    /** The unique identifier for this entity. */
    this.id = '';

    // If object is a string, assume it is a UUID and get it.
    this.update(object);
  };

  /**
   * Get's an object from the drupal API.
   *
   * @param {function} callback The callback function when the object is
   * retrieved.
   */
  drupal.entity.prototype.get = function(callback) {
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
