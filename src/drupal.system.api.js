// The drupal namespace.
var drupal = drupal || {};

/** The drupal.user namespace */
drupal.system = drupal.system || {};

/**
 * @constructor
 * @extends drupal.api
 * @class The Drupal System Services class.
 */
drupal.system.api = function() {

  // Call the drupal.api constructor.
  drupal.api.call(this);

  // Set the resource
  this.resource = 'system';
};

/** Derive from drupal.api. */
drupal.system.api.prototype = new drupal.api();

/** Reset the constructor. */
drupal.system.api.prototype.constructor = drupal.system.api;
