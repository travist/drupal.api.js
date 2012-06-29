/*
    json2.js
    2011-10-19

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, regexp: true */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

var JSON;
if (!JSON) {
    JSON = {};
}

(function () {
    'use strict';

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear()     + '-' +
                    f(this.getUTCMonth() + 1) + '-' +
                    f(this.getUTCDate())      + 'T' +
                    f(this.getUTCHours())     + ':' +
                    f(this.getUTCMinutes())   + ':' +
                    f(this.getUTCSeconds())   + 'Z'
                : null;
        };

        String.prototype.toJSON      =
            Number.prototype.toJSON  =
            Boolean.prototype.toJSON = function (key) {
                return this.valueOf();
            };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0
                    ? '[]'
                    : gap
                    ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                    : '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0
                ? '{}'
                : gap
                ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function'
                    ? walk({'': j}, '')
                    : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());
/** The drupal namespace. */
var drupal = drupal || {};

/**
 * The Drupal API class.  This is a static class helper
 * to assist in communication between javascript and
 * a Drupal CMS backend.
 *
 * @return {object} The API object.
 */
drupal.api = function() {
  return {

    /** The resource within this endpoint */
    resource: '',

    /** See if we are dealing with jQuery Mobile applications. */
    isMobile: jQuery.hasOwnProperty('mobile'),

    /**
     * The Services API endpoint
     *
     * @this {object} The drupal.api object.
     * @return {string} The services endpoint.
     **/
    endpoint: function() {
      return drupal.endpoint || '';
    },

    /**
     * Helper function to get the Services URL for this resource.
     *
     * @this {object} The drupal.api object.
     * @param {object} object The object involved with in this request.
     * @return {string} The path to the API endpoint.
     */
    getURL: function(entity) {
      // If the entity has a valid URI, then use that...
      if (entity && entity.uri) {
        return entity.uri;
      }
      else {

        // Otherwise, build our best guess for the URI of this entity.
        var path = this.endpoint();
        path += this.resource ? ('/' + this.resource) : '';
        path += (entity && entity.id) ? ('/' + entity.id) : '';
        return path;
      }
    },

    /**
     * Called when we are loading or not.
     *
     * @param {boolean} loading If this api is loading something.
     * @this Points to the drupal.api object.
     */
    loading: function(loading) {
      if (this.isMobile) {
        if (loading) {
          jQuery.mobile.showPageLoadingMsg();
        }
        else {
          jQuery.mobile.hidePageLoadingMsg();
        }
      }
    },

    /**
     * API function to act as a generic request for all Service calls.
     *
     * @this {object} The drupal.api object.
     * @param {string} url The URL where the request will go.
     * @param {string} dataType The type of request.  json or jsonp.
     * @param {string} type The type of HTTP request.  GET, POST, PUT, etc.
     * @param {object} data The data to send to the server.
     * @param {function} callback The function callback.
     */
    call: function(url, dataType, type, data, callback) {
      var request = {
        url: url,
        dataType: dataType,
        type: type,
        success: (function(api) {
          return function(data, textStatus) {
            api.loading(false);
            if (textStatus == 'success') {
              if (callback) {
                callback(data);
              }
            }
            else {
              console.log('Error: ' + textStatus);
            }
          };
        })(this),
        error: (function(api) {
          return function(xhr, ajaxOptions, thrownError) {
            api.loading(false);
            console.log(xhr.responseText);
            if (callback) {
              callback(null);
            }
          };
        })(this)
      };

      if (data) {
        request['data'] = data;
      }

      // Show a loading cursor.
      this.loading(true);

      // Make the request.
      jQuery.ajax(request);
    },

    /**
     * API function to get any results from the drupal API.
     *
     * Return the object.
     *
     *  drupal.api.get(entity, function(object) {
     *    console.log(object);
     *  });
     *
     * Return a list of events within an entity.
     *
     *  drupal.api.get(entity, 'events', function(events) {
     *    console.log(events);
     *  });
     *
     * Return a list of nodes with type='page'.
     *
     *  drupal.api.get({}, {type:'page'}, function(object) {
     *
     *  });
     *
     * Return a list of events provided a query within a node.
     *
     *  drupal.api.get(entity, 'events', {month: 6}, functoin(events) {
     *    console.log(events);
     *  });
     *
     *
     * @this {object} The drupal.api object.
     * @param {object} object The object of the item we are getting..
     * @param {string} endpoint An additional endpoint to add onto the resource.
     * @param {object} query key-value pairs to add to the query of the URL.
     * @param {function} callback The callback function.
     */
    get: function(object, endpoint, query, callback) {

      // Normalize the arguments based on the different schemes of calling this.
      var type = (typeof endpoint);
      if (type === 'object') {
        callback = query;
        query = endpoint;
        endpoint = '';
      }
      else if (type === 'function') {
        callback = endpoint;
        endpoint = '';
      }

      // Get the url for this object.
      var url = this.getURL(object);
      url += (endpoint) ? ('/' + endpoint) : '';
      url += '.jsonp';
      url += query ? ('?' + decodeURIComponent(jQuery.param(query, true))) : '';
      this.call(url, 'jsonp', 'GET', null, callback);
    },

    /**
     * API function to perform an action.
     *
     * @this {object} The drupal.api object.
     * @param {string} action The action to perform.
     * @param {object} object The entity object to set.
     * @param {function} callback The callback function.
     */
    execute: function(action, object, callback) {
      var url = this.getURL(object) + '/' + action;
      this.call(url, 'json', 'POST', object, callback);
    },

    /**
     * API function to save the value of an object using Services.
     *
     * @this {object} The drupal.api object.
     * @param {object} object The entity object to set.  If the object does not
     * have an ID, then this will create a new entity, otherwise, it will simply
     * update the existing resource.
     *
     * @param {function} callback The callback function.
     *
     */
    save: function(object, callback) {
      var type = object.id ? 'PUT' : 'POST';
      this.call(this.getURL(object), 'json', type, object, callback);
    },

    /**
     * API function to remove an object on the server.
     *
     * @this {object} The drupal.api object.
     * @param {object} object The entity object to delete.
     * @param {function} callback The callback function.
     */
    remove: function(object, callback) {
      this.call(this.getURL(object), 'json', 'DELETE', null, callback);
    }
  };
};
// The drupal namespace.
var drupal = drupal || {};

/** Determine if we have storage. */
drupal.hasStorage = (typeof(Storage) !== 'undefined');
drupal.hasStorage &= (typeof(JSON) !== 'undefined');

/**
 * @constructor
 * @class The base entity class to store the data that is common to all
 * drupal entities whether it be groups, events, users, etc.
 *
 * @param {object} object The entity object.
 * @param {function} callback The callback function to get the object.
 * @param {object} options Options used to govern functionality.
 */
drupal.entity = function(object, callback, options) {

  // Set the options.
  this.options = jQuery.extend({
    store: true,
    expires: 3600
  }, (typeof options === 'undefined') ? {} : options);

  // If the object is valid, then set it...
  if (object) {
    this.set(object);
  }

  // If the callback is valid, then load it...
  if (callback) {
    this.load(callback);
  }
};

/**
 * Returns an index of entities.
 *
 * @param {object} object The object to create for each entity.
 * @param {object} query The query parameters.
 * @param {function} callback The callback function.
 * @param {object} options Options used to govern functionality.
 */
drupal.entity.index = function(object, query, callback, options) {

  // Set the default options.
  options = jQuery.extend({
    store: false
  }, options || {});

  // Don't require a query...
  if (typeof query === 'function') {
    callback = query;
    query = {};
  }

  // Get the list of entities.
  var instance = new object({});
  instance.api.get({}, instance.getQuery(query), function(entities) {
    var i = entities.length;
    while (i--) {
      entities[i] = new object(entities[i], null, options);
      entities[i].store();
    }
    if (callback) {
      callback(entities);
    }
  });
};

/**
 * Update an object.
 *
 * @param {object} object The object which contains the data.
 * @param {function} callback The function to call when it is done updating.
 */
drupal.entity.prototype.update = function(object, callback) {

  // Set the object.
  if (object) {
    this.set(object);
  }

  // Now store the object.
  this.store();

  // Now callback that this object has been updated.
  if (callback) {
    callback.call(this, this);
  }
};

/**
 * Stores the object in local storage.
 */
drupal.entity.prototype.store = function() {
  if (this.id && this.options.store && drupal.hasStorage) {

    // Get the object.
    var object = this.get();

    // Get the key for this object.
    var key = this.entityName + '-' + this.id;

    // Set an expiration date for this object.
    object.expires = (this.options.expires * 1000) + (new Date()).getTime();

    // Store this object in localStorage.
    localStorage.setItem(key, JSON.stringify(object));
  }
};

/**
 * Retrieves an object from local storage.
 *
 * @return {object} The object in local storage.
 */
drupal.entity.prototype.retrieve = function() {
  var object = null, key = '', value = '';
  if (this.id && this.options.store && drupal.hasStorage) {

    // Get the key for this object.
    var key = this.entityName + '-' + this.id;

    // Get it out of localStorage.
    if (object = JSON.parse(localStorage.getItem(key))) {

      // Make sure this object hasn't expired.
      if ((new Date()).getTime() > object.expires) {

        // Clear it if it has.
        localStorage.removeItem(key);
      }
      else {

        // Set the object if it was retrieved.
        this.set(object);
      }
    }
  }
  return object;
};

/**
 * Clears an item out of local storage.
 */
drupal.entity.prototype.clear = function() {
  if (this.id && drupal.hasStorage) {
    var object = this.get(), key = '';
    for (var prop in object) {
      key = this.entityName + '-' + this.id + '-' + prop;
      localStorage.removeItem(key);
    }
  }
};

/**
 * Sets the object.
 *
 * @param {object} object The object which contains the data.
 */
drupal.entity.prototype.set = function(object) {

  /** The API for this entity */
  this.api = this.api || null;

  /** The ID of this entity. */
  this.id = object.id || this.id || '';

  /** The uri of this entity. */
  this.uri = object.uri || this.uri || '';

  /** The name of this entity. */
  this.entityName = 'entity';
};

/**
 * Returns the object in JSON form.
 *
 * @return {object} The object representation of this entity.
 */
drupal.entity.prototype.get = function() {
  return {
    id: this.id,
    uri: this.uri
  };
};

/**
 * Gets a POST object.
 *
 * @return {object} The filtered object.
 */
drupal.entity.prototype.getPOST = function() {
  var object = this.get();
  if (!object.id) {
    delete object.id;
  }
  return object;
};

/**
 * Gets the query variables.
 *
 * @param {object} query The query variables.
 * @return {object} The query variables.
 */
drupal.entity.prototype.getQuery = function(query) {
  return query || {};
};

/**
 * Loads and object using the drupal.api.
 *
 * @param {function} callback The callback function when the object is
 * retrieved.
 */
drupal.entity.prototype.load = function(callback) {

  // If this isn't a valid object, then return null...
  if (!this.id) {
    callback(null);
  }

  // Declare the object to load...
  var object = null;
  if (object = this.retrieve()) {
    this.update(object, callback);
  }
  else if (this.api) {

    // Call the API.
    this.api.get(this.get(), {}, (function(entity) {
      return function(object) {

        // If no object is returned, then return null.
        if (!object) {
          callback(null);
        }

        // Update the object.
        entity.update(object, callback);
      };
    })(this));
  }
};

/**
 * Saves this entity.
 *
 * @param {function} callback The function called once entity is saved.
 */
drupal.entity.prototype.save = function(callback) {

  // Check to see if the api is valid.
  if (this.api) {

    // Call the api.
    this.api.save(this.getPOST(), (function(entity) {
      return function(object) {
        entity.update(object, callback);
      };
    })(this));
  }
};

/**
 * Removes an entity
 *
 * @param {function} callback The function called once entity is removed.
 */
drupal.entity.prototype.remove = function(callback) {

  // Only remove if they have an ID.
  if (this.id) {

    // Call the API.
    this.api.remove(this.get(), callback);
    this.clear();
  }
};
// The drupal namespace.
var drupal = drupal || {};

/*!
 * Modified from...
 *
 * jQuery Cookie Plugin
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2011, Klaus Hartl
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.opensource.org/licenses/GPL-2.0
 */
/**
 * Add a way to store cookies.
 *
 * @param {string} key The key for the cookie.
 * @param {string} value The value of the cookie.
 * @param {object} options The options for the cookie storage.
 * @return {string} The results of the storage.
 */
drupal.cookie = function(key, value, options) {

  // key and at least value given, set cookie...
  if (arguments.length > 1 &&
     (!/Object/.test(Object.prototype.toString.call(value)) ||
      value === null ||
      value === undefined)) {
    options = $.extend({}, options);

    if (value === null || value === undefined) {
      options.expires = -1;
    }

    if (typeof options.expires === 'number') {
      var days = options.expires, t = options.expires = new Date();
      t.setDate(t.getDate() + days);
    }

    value = String(value);

    // use expires attribute, max-age is not supported by IE
    return (document.cookie = [encodeURIComponent(key), '=',
    options.raw ? value : encodeURIComponent(value),
    options.expires ? '; expires=' + options.expires.toUTCString() : '',
    options.path ? '; path=' + options.path : '',
    options.domain ? '; domain=' + options.domain : '',
    options.secure ? '; secure' : ''].join(''));
  }

  // key and possibly options given, get cookie...
  options = value || {};
  var decode = options.raw ? function(s) {
    return s;
  } : decodeURIComponent;

  var pairs = document.cookie.split('; ');
  for (var i = 0, pair; pair = pairs[i] && pairs[i].split('='); i++) {
    if (decode(pair[0]) === key)
      return decode(pair[1] || '');
  }
  return null;
};

/**
 * @constructor
 * @class The system class
 *
 * @param {function} callback The function to be called once the system has
 * connected.
 * @param {object} options Options used to govern functionality.
 */
drupal.system = function(callback, options) {
  drupal.entity.call(this, {}, callback, options);
};

/** Derive from entity. */
drupal.system.prototype = new drupal.entity();

/** Reset the constructor. */
drupal.system.prototype.constructor = drupal.system;

/** Declare the system api. */
drupal.system.api = jQuery.extend(new drupal.api(), {
  resource: 'system'
});

/**
 * Sets the object.
 *
 * @param {object} object The object which contains the data.
 */
drupal.system.prototype.set = function(object) {
  drupal.entity.prototype.set.call(this, object);

  /** The name of this entity. */
  this.entityName = 'system';

  /** Set the api. */
  this.api = drupal.system.api;

  /** Set current user. */
  this.user = new drupal.user(object.user);
  this.user.setSession(object.session_name, object.sessid);
};

/**
 * Returns the object.
 *
 * @return {object} The object to send to the Services endpoint.
 */
drupal.system.prototype.get = function() {
  return jQuery.extend(drupal.entity.prototype.get.call(this), {
    user: this.user.get()
  });
};

/**
 * Loads the server.
 *
 * @param {function} callback The callback function.
 */
drupal.system.prototype.load = function(callback) {

  // Connect to the server.
  this.api.execute('connect', null, (function(system) {
    return function(object) {
      system.update(object, callback);
    };
  })(this));
};

/**
 * Get a variable from the server.
 *
 * @param {string} name The variable you wish to retrieve.
 * @param {string} def The default value of the variable.
 * @param {function} callback The callback function.
 */
drupal.system.prototype.get_variable = function(name, def, callback) {
  this.api.execute('get_variable', {
    name: name,
    'default': def
  }, callback);
};

/**
 * Set a variable on the server.
 *
 * @param {string} name The variable you wish to set.
 * @param {string} value The value of the variable.
 * @param {function} callback The callback function.
 */
drupal.system.prototype.set_variable = function(name, value, callback) {
  this.api.execute('set_variable', {
    name: name,
    value: value
  }, callback);
};

/**
 * Delete a variable on the server.
 *
 * @param {string} name The variable you wish to set.
 * @param {function} callback The callback function.
 */
drupal.system.prototype.del_variable = function(name, callback) {
  this.api.execute('del_variable', {
    name: name
  }, callback);
};
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
// The drupal namespace.
var drupal = drupal || {};

/** The current logged in user. */
drupal.current_user = null;

/**
 * @constructor
 * @extends drupal.entity
 * @class The user class
 *
 * @param {object} object The user object.
 * @param {function} callback The function to be called once the user has
 * been retrieved from the server.
 * @param {object} options Options used to govern functionality.
 */
drupal.user = function(object, callback, options) {
  drupal.entity.call(this, object, callback, options);
};

/** Derive from drupal.entity. */
drupal.user.prototype = new drupal.entity();

/** Reset the constructor. */
drupal.user.prototype.constructor = drupal.user;

/** Declare the user api. */
drupal.user.api = jQuery.extend(new drupal.api(), {
  resource: 'user'
});

/**
 * Returns an index of users.
 *
 * @param {object} query The query parameters.
 * @param {function} callback The callback function.
 * @param {object} options Options used to govern functionality.
 */
drupal.user.index = function(query, callback, options) {
  drupal.entity.index(drupal.user, query, callback, options);
};

/**
 * Sets the object.
 *
 * @param {object} object The object which contains the data.
 */
drupal.user.prototype.set = function(object) {
  drupal.entity.prototype.set.call(this, object);

  /** The name of this entity. */
  this.entityName = 'user';

  /** Set the api. */
  this.api = drupal.user.api;

  /** Set the ID based on the uid. */
  this.id = object.uid || this.id || 0;

  /** The name for this user. */
  this.name = object.name || this.name || '';

  /** The email address of our user. */
  this.mail = object.mail || this.mail || '';

  /** The password of the user. */
  this.pass = object.pass || this.pass || '';

  /** The status of the user. */
  this.status = object.status || this.status || 1;
};

/**
 * Sets a user session.
 *
 * @param {string} name The name of the session.
 * @param {string} sessid The session ID.
 */
drupal.user.prototype.setSession = function(name, sessid) {

  /** Set the session id for this user. */
  this.sessid = sessid;

  // Only set the session name if this user is valid and has a session name.
  if (this.id && name) {

    /** Set the session name for this user. */
    this.session_name = name;

    /** Now store this in a cookie for further authentication. */
    drupal.cookie(name, sessid);

    // Now store this user as the 'current' user.
    drupal.current_user = this;
  }
};

/**
 * Login a user.
 *
 * @param {function} callback The callback function.
 */
drupal.user.prototype.login = function(callback) {
  if (this.api) {
    this.api.execute('login', {
      username: this.name,
      password: this.pass
    }, (function(user) {
      return function(object) {

        // Update this object.
        user.update(object.user);

        // Set the session.
        user.setSession(object.session_name, object.sessid);

        if (callback) {
          callback.call(user, user);
        }
      };
    })(this));
  }
};

/**
 * Register a user.
 *
 * @param {function} callback The callback function.
 */
drupal.user.prototype.register = function(callback) {
  if (this.api) {
    this.api.execute('register', this.getPOST(), (function(user) {
      return function(object) {
        user.update(object, callback);
      };
    })(this));
  }
};

/**
 * Logout the user.
 *
 * @param {function} callback The callback function.
 */
drupal.user.prototype.logout = function(callback) {
  if (this.api) {
    this.api.execute('logout', null, callback);
  }
};

/**
 * Gets a POST object.
 *
 * @return {object} The filtered object.
 */
drupal.user.prototype.getPOST = function() {

  // Add the password to POST's only.
  var post = drupal.entity.prototype.getPOST.call(this);
  post.pass = this.pass;
  return post;
};

/**
 * Returns the object to send to Services.
 *
 * @return {object} The object to send to the Services endpoint.
 */
drupal.user.prototype.get = function() {
  return jQuery.extend(drupal.entity.prototype.get.call(this), {
    name: this.name,
    mail: this.mail,
    status: this.status
  });
};
