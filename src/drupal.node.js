// The drupal namespace.
var drupal = drupal || {};

(function($) {

  /**
   * @class The node class
   *
   * @extends drupal.entity
   *
   * @param {object} object The node object.
   * @param {function} callback The function to be called once the node has
   * been retrieved from the server.
   */
  drupal.node = function(object, callback) {

    /** The title for this node. */
    this.title = '';

    /** The type of node we are dealing with. */
    this.type = '';

    /** The status of this node. */
    this.status = 0;

    /** The user who created this node */
    this.uid = 0;

    // Declare the api.
    this.api = new drupal.node.api();

    // Call the base class.
    drupal.entity.call(this, object, callback);
  };

  // Derive from entity.
  drupal.node.prototype = new drupal.entity();
  drupal.node.prototype.constructor = drupal.node;

  /**
   * Override the update routine.
   */
  drupal.node.prototype.update = function(object) {

    drupal.entity.prototype.update.call(this, object);

    // Make sure to also set the ID the same as nid.
    this.id = (object && object.nid) || this.id;
  };

  /**
   * Returns the object to send to Services.
   */
  drupal.node.prototype.getObject = function() {
    return $.extend(drupal.entity.prototype.getObject.call(this), {
      title: this.title,
      type: this.type,
      status: this.status,
      uid: this.uid
    });
  };
}(jQuery));
