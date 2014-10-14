// The drupal namespace.
var drupal = drupal || {};

/** The current logged in user. */
drupal.current_user = {uid: 0, name: '', token: ''};

/**
 * @constructor
 * @extends drupal.entity
 * @class The user class
 *
 * @param {object} object The user object.
 * @param {function} callback The function to be called once the user has
 * been retrieved from the server.
 * @param {object} options Options used to govern functionality.
 */
drupal.user = function(object, callback, options) {
  drupal.entity.call(this, object, callback, options);
};

/** Derive from drupal.entity. */
drupal.user.prototype = new drupal.entity();

/** Reset the constructor. */
drupal.user.prototype..constructor = drupal.user;

/** Declare the user api. */
drupal.user.prototype.api = jQuery.extend(new drupal.api(), {
  resource: 'user'
});

/**
 * Returns an index of users.
 *
 * @param {object} query The query parameters.
 * @param {function} callback The callback function.
 * @param {object} options Options used to govern functionality.
 */
drupal.user.index = function(query, callback, options) {
  drupal.entity.index(drupal.user, query, callback, options);
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

  /** Set the password. */
  this.pass = object.pass || this.pass || '';

  /** Set the user token. */
  this.token = '';

  // Set the properties for this entity.
  this.setProperties({
    name: '',
    mail: '',
    token: '',
    status: 1
  }, object);
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
  var self = this;
  if (this.api) {

    // If the person they wish to log in is the current
    // user, then just return immediately.
    if (this.name == drupal.current_user.name) {
      if (callback) {
        callback.call(this, this);
        return;
      }
    }

    var __login = function(name, pass) {
      this.api.execute('login', {
        username: this.name,
        password: this.pass
      }, (function(user) {
        return function(object) {

          // Only update if the object is valid.
          if (object) {

            // Update this object.
            user.update(object.user);

            // Set the session.
            user.setSession(object.session_name, object.sessid);

            if (callback) {
              callback.call(user, user);
            }
          }
          else if (callback) {
            callback.call(user, null);
          }
        };
      })(this));
    };

    if (drupal.current_user.name) {
      this.logout(function() {
        __login.call(self);
      });
    }
    else {
      __login.call(this);
    }
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
    this.api.execute('logout', null, function() {
      drupal.current_user = {uid: 0, name: '', token: ''};
      if (callback) {
        callback();
      }
    });
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
