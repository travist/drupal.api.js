// The drupal namespace.
var drupal = drupal || {};

/*!
 * Modified from...
 *
 * jQuery Cookie Plugin
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2011, Klaus Hartl
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.opensource.org/licenses/GPL-2.0
 */
/**
 * Add a way to store cookies.
 *
 * @param {string} key The key for the cookie.
 * @param {string} value The value of the cookie.
 * @param {object} options The options for the cookie storage.
 * @return {string} The results of the storage.
 */
drupal.cookie = function(key, value, options) {

  // key and at least value given, set cookie...
  if (arguments.length > 1 &&
     (!/Object/.test(Object.prototype.toString.call(value)) ||
      value === null ||
      value === undefined)) {
    options = $.extend({}, options);

    if (value === null || value === undefined) {
      options.expires = -1;
    }

    if (typeof options.expires === 'number') {
      var days = options.expires, t = options.expires = new Date();
      t.setDate(t.getDate() + days);
    }

    value = String(value);

    // use expires attribute, max-age is not supported by IE
    return (document.cookie = [encodeURIComponent(key), '=',
    options.raw ? value : encodeURIComponent(value),
    options.expires ? '; expires=' + options.expires.toUTCString() : '',
    options.path ? '; path=' + options.path : '',
    options.domain ? '; domain=' + options.domain : '',
    options.secure ? '; secure' : ''].join(''));
  }

  // key and possibly options given, get cookie...
  options = value || {};
  var decode = options.raw ? function(s) {
    return s;
  } : decodeURIComponent;

  var pairs = document.cookie.split('; ');
  for (var i = 0, pair; pair = pairs[i] && pairs[i].split('='); i++) {
    if (decode(pair[0]) === key)
      return decode(pair[1] || '');
  }
  return null;
};

/**
 * @constructor
 * @class The system class
 *
 * @param {function} callback The function to be called once the system has
 * connected.
 * @param {object} options Options used to govern functionality.
 */
drupal.system = function(callback, options) {
  drupal.entity.call(this, {}, callback, options);
};

/** Derive from entity. */
drupal.system.prototype = new drupal.entity();

/** Reset the constructor. */
drupal.system.prototype.constructor = drupal.system;

/** Declare the system api. */
drupal.system.api = jQuery.extend(new drupal.api(), {
  resource: 'system'
});

/**
 * Sets the object.
 *
 * @param {object} object The object which contains the data.
 */
drupal.system.prototype.set = function(object) {
  drupal.entity.prototype.set.call(this, object);

  /** The name of this entity. */
  this.entityName = 'system';

  /** Set the api. */
  this.api = drupal.system.api;

  /** Set current user. */
  this.user = new drupal.user(object.user);
  this.user.setSession(object.session_name, object.sessid);
};

/**
 * Returns the object.
 *
 * @return {object} The object to send to the Services endpoint.
 */
drupal.system.prototype.get = function() {
  return jQuery.extend(drupal.entity.prototype.get.call(this), {
    user: this.user.get()
  });
};

/**
 * Loads the server.
 *
 * @param {function} callback The callback function.
 */
drupal.system.prototype.load = function(callback) {

  // Connect to the server.
  this.api.execute('connect', null, (function(system) {
    return function(object) {
      system.update(object, callback);
    };
  })(this));
};

/**
 * Get a variable from the server.
 *
 * @param {string} name The variable you wish to retrieve.
 * @param {string} def The default value of the variable.
 * @param {function} callback The callback function.
 */
drupal.system.prototype.get_variable = function(name, def, callback) {
  this.api.execute('get_variable', {
    name: name,
    'default': def
  }, callback);
};

/**
 * Set a variable on the server.
 *
 * @param {string} name The variable you wish to set.
 * @param {string} value The value of the variable.
 * @param {function} callback The callback function.
 */
drupal.system.prototype.set_variable = function(name, value, callback) {
  this.api.execute('set_variable', {
    name: name,
    value: value
  }, callback);
};

/**
 * Delete a variable on the server.
 *
 * @param {string} name The variable you wish to set.
 * @param {function} callback The callback function.
 */
drupal.system.prototype.del_variable = function(name, callback) {
  this.api.execute('del_variable', {
    name: name
  }, callback);
};
