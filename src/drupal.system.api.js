// The drupal namespace.
var drupal = drupal || {};

/** The drupal.user namespace */
drupal.system = drupal.system || {};

(function($) {

  /**
   * The Drupal System Services class.
   *
   * @extends drupal.api
   */
  drupal.system.api = function() {

    // Call the drupal.api constructor.
    drupal.api.call(this);

    // Set the resource
    this.resource = 'system';
  };

  // Derive from drupal.api.
  drupal.system.api.prototype = new drupal.api();
  drupal.system.api.prototype.constructor = drupal.system.api;

}(jQuery));


