// The drupal namespace.
var drupal = drupal || {};

(function($) {

  /**
   * @class The system class
   *
   * @param {function} callback The function to be called once the system has
   * connected.
   */
  drupal.system = function(callback) {

    /** The current user. */
    this.user = null;

    // Declare the api.
    this.api = new drupal.system.api();

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
}(jQuery));
