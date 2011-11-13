/** The drupal namespace. */
var drupal = drupal || {};

(function($) {

  /**
   * A static object that represents the drupal API.
   */
  drupal.api = {

    /** The drupal API path */
    path: 'http://rest/rest',

    /**
     * API function to get any results from the drupal API.
     *
     * @param {string} type The content type returned from the API
     * (groups, events, resources, etc).
     *
     * @param {object} params The additional params for this API.
     * <ul>
     * <li><strong>uuid</strong> - The universal unique ID.</li>
     * <li><strong>filter</strong> - Additional content type filter.</li>
     * <li><strong>query</strong> - key-value pairs to add to query string.</li>
     * </ul>
     *
     * @param {function} callback The callback function.
     */
    get: function(type, params, callback) {
      var path = drupal.api.path + '/' + type;
      path += params.uuid ? ('/' + params.uuid) : '';
      path += params.filter ? ('/' + params.filter) : '';
      path += '.jsonp?';
      path += params.query ? (jQuery.param(params.query) + '&') : '';
      $.ajax({
        url: path,
        dataType: 'jsonp',
        success: function(data, textStatus) {
          if (textStatus == 'success') {
            callback(data);
          }
          else {
            console.log('Error: ' + textStatus);
          }
        },
        error: function(xhr, ajaxOptions, thrownError) {
          console.log(xhr.responseText);
          callback(null);
        }
      });
    },

    /**
     * API function to save any object on the drupal server.  If the object
     * already has a UUID, then this is a simple update, otherwise it will
     * create a new object.
     *
     * @param {string} type The content type returned from the API
     * (groups, events, resources, etc).
     *
     * @param {object} object The object you wish to update on the server.
     * @param {function} callback The function to be called when the entity has
     * finished updating.
     */
    save: function(type, object, callback) {
      var path = drupal.api.path + '/' + type;
      path += object.uuid ? ('/' + object.uuid) : '';
      path += '.json';
      $.ajax({
        url: path,
        dataType: 'json',
        type: (object.uuid) ? 'PUT' : 'POST',
        data: object,
        success: function(data, textStatus) {
          if (textStatus == 'success') {
            callback(data);
          }
          else {
            console.log('Error: ' + textStatus);
          }
        },
        error: function(xhr, ajaxOptions, thrownError) {
          console.log(xhr.responseText);
          callback(null);
        }
      });
    }
  };
}(jQuery));


