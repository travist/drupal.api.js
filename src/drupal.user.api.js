// The drupal namespace.
var drupal = drupal || {};

/** The drupal.user namespace */
drupal.user = drupal.user || {};

(function($) {

  /**
   * @class The Drupal User Services class.
   *
   * @extends drupal.api
   */
  drupal.user.api = function() {

    // Call the drupal.api constructor.
    drupal.api.call(this);

    // Set the resource
    this.resource = 'user';
  };

  // Derive from drupal.api.
  drupal.user.api.prototype = new drupal.api();
  drupal.user.api.prototype.constructor = drupal.user.api;

}(jQuery));


