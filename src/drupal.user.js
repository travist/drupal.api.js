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

  /** The name for this user. */
  this.name = '';

  /** The email address of our user. */
  this.mail = '';

  /** The password of the user. */
  this.pass = '';

  /** The status of the user. */
  this.status = 1;

  /** The session ID of the user. */
  this.sessid = '';

  /** The session name of the user */
  this.session_name = '';

  // Declare the api.
  this.api = new drupal.user.api();

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
  this.id = (object && object.uid) || this.id;
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
