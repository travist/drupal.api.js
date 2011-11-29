// The drupal namespace.
var drupal = drupal || {};

/**
 * @constructor
 * @extends drupal.entity
 * @class The node class
 *
 * @param {object} object The node object.
 * @param {function} callback The function to be called once the node has
 * been retrieved from the server.
 */
drupal.node = function(object, callback) {

  // Only continue if the object is valid.
  if (object) {

    /** The title for this node. */
    this.title = this.title || '';

    /** The type of node we are dealing with. */
    this.type = this.type || '';

    /** The status of this node. */
    this.status = this.status || 0;

    /** The user who created this node */
    this.uid = this.uid || 0;

    // Declare the api.
    this.api = this.api || new drupal.node.api();
  }

  // Call the base class.
  drupal.entity.call(this, object, callback);
};

/** Derive from entity. */
drupal.node.prototype = new drupal.entity();

/** Reset the constructor. */
drupal.node.prototype.constructor = drupal.node;

/**
 * Override the update routine.
 *
 * @param {object} object The node object to update.
 */
drupal.node.prototype.update = function(object) {

  drupal.entity.prototype.update.call(this, object);

  // Make sure to also set the ID the same as nid.
  if (object) {
    this.id = object.nid || this.id;
  }
};

/**
 * Override the setQuery method of the entity.
 *
 * @param {object} query The query object.
 * @param {string} field The field to set.
 * @param {string} value The value of the field to set.
 */
drupal.node.prototype.setQuery = function(query, field, value) {

  // The node object sets parameters like ?parameters[field]=value...
  query['parameters[' + field + ']'] = value;
};

/**
 * Returns the object to send to Services.
 *
 * @return {object} The object to send to the Services endpoint.
 */
drupal.node.prototype.getObject = function() {
  return jQuery.extend(drupal.entity.prototype.getObject.call(this), {
    title: this.title,
    type: this.type,
    status: this.status,
    uid: this.uid
  });
};
