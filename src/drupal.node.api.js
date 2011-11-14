// The drupal namespace.
var drupal = drupal || {};

/** The drupal.node namespace */
drupal.node = drupal.node || {};

(function($) {

  /**
   * @class The Drupal Node Services class.
   *
   * @extends drupal.api
   */
  drupal.node.api = function() {

    // Call the drupal.api constructor.
    drupal.api.call(this);

    // Set the resource
    this.resource = 'node';
  };

  // Derive from drupal.api.
  drupal.node.api.prototype = new drupal.api();
  drupal.node.api.prototype.constructor = drupal.node.api;

}(jQuery));


