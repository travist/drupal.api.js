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
  };

  // Derive from entity.
  drupal.user.prototype = new drupal.entity();
  drupal.user.prototype.constructor = drupal.user;

  /**
   * Override the update routine.
   */
  drupal.user.prototype.update = function(object) {

    drupal.entity.prototype.update.call(this, object);

    // Make sure to also set the ID the same as uid.
    this.id = object.uid || this.id;
  };

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
