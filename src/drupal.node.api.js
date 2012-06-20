// The drupal namespace.
var drupal = drupal || {};

/** The drupal.node namespace */
drupal.node = drupal.node || {};

/**
 * @constructor
 * @extends drupal.api
 * @class The Drupal Node Services class.
 */
drupal.node.api = function() {
  this.resource = this.resource || 'node';
  drupal.api.call(this);
};

/** Derive from drupal.api. */
drupal.node.api.prototype = new drupal.api();

/** Reset the constructor. */
drupal.node.api.prototype.constructor = drupal.node.api;
