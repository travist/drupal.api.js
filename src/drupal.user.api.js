// The drupal namespace.
var drupal = drupal || {};

/** The drupal.user namespace */
drupal.user = drupal.user || {};

/**
 * @constructor
 * @extends drupal.api
 * @class The Drupal User Services class.
 */
drupal.user.api = function() {

  // Set the resource
  this.resource = 'user';

  // Call the drupal.api constructor.
  drupal.api.call(this);
};

/** Derive from drupal.api. */
drupal.user.api.prototype = new drupal.api();

/** Reset the constructor. */
drupal.user.api.prototype.constructor = drupal.user.api;
