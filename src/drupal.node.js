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
 * @param {object} options Options used to govern functionality.
 */
drupal.node = function(object, callback, options) {
  drupal.entity.call(this, object, callback, options);
};

/** Derive from entity. */
drupal.node.prototype = new drupal.entity();

/** Reset the constructor. */
drupal.node.prototype.constructor = drupal.node;

/** Declare the node api. */
drupal.node.api = jQuery.extend(new drupal.api(), {
  resource: 'node'
});

/**
 * Returns an index of nodes.
 *
 * @param {object} query The query parameters.
 * @param {function} callback The callback function.
 * @param {object} options Options used to govern functionality.
 */
drupal.node.index = function(query, callback, options) {
  drupal.entity.index(drupal.node, query, callback, options);
};

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

  // Set the properties for this entity.
  this.setProperties({
    nid: 0,
    title: '',
    type: '',
    status: 0,
    uid: 0
  }, object);
};

/**
 * Override the getQuery method of the entity.
 *
 * @param {object} query The query variables.
 * @return {object} The query variables.
 */
drupal.node.prototype.getQuery = function(query) {
  query = drupal.entity.prototype.getQuery.call(this, query);
  if (query.type) {
    query['parameters[type]'] = query.type;
    delete query.type;
  }
  return query;
};
