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
  drupal.entity.call(this, object, callback);
};

/** Derive from entity. */
drupal.node.prototype = new drupal.entity();

/** Reset the constructor. */
drupal.node.prototype.constructor = drupal.node;

/** Declare the node api. */
drupal.node.api = jQuery.extend(drupal.api, {
  resource: 'node'
});

/**
 * Sets the object.
 *
 * @param {object} object The object which contains the data.
 */
drupal.node.prototype.set = function(object) {
  drupal.entity.prototype.set.call(this, object);

  /** The name of this entity. */
  this.entityName = 'node';

  /** Set the api to the drupal.node.api. */
  this.api = drupal.node.api;

  /** Set the ID based on the nid. */
  this.id = object.nid || this.id || 0;

  /** The title for this node. */
  this.title = object.title || this.title || '';

  /** The type of node we are dealing with. */
  this.type = object.type || this.type || '';

  /** The status of this node. */
  this.status = object.status || this.status || 0;

  /** The user who created this node */
  this.uid = object.uid || this.uid || 0;
};

/**
 * Returns the object to send to Services.
 *
 * @return {object} The object to send to the Services endpoint.
 */
drupal.node.prototype.get = function() {
  return jQuery.extend(drupal.entity.prototype.get.call(this), {
    title: this.title,
    type: this.type,
    status: this.status,
    uid: this.uid
  });
};

/**
 * Override the setQuery method of the entity.
 *
 * @param {object} query The query object.
 * @param {string} param The param to set.
 * @param {string} value The value of the field to set.
 */
drupal.node.prototype.setQuery = function(query, param, value) {
  // The node object sets parameters like ?parameters[param]=value...
  query['parameters[' + param + ']'] = value;
};
