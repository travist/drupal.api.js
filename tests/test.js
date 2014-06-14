var tester = {

  /**
   * The test context.
   */
  context: {
    users: {}
  },

  /**
   * Login as the admin.
   * @param done
   */
  login: function(name, callback) {
    return function(done) {
      tester.context.users[name].login(function(user) {
        if (callback) {
          callback(user);
        }
        done();
      });
    }
  },

  getUser: function(name) {
    if (!tester.context.users[name]) {
      tester.context.users[name] = new drupal.user(tester.randomUser());
    }

    return tester.context.users[name];
  },

  /**
   * Remove the current user.
   *
   * @param name
   * @param callback
   * @returns {Function}
   */
  removeUser: function(name, callback) {
    return function(done) {
      // Remove the old user.
      tester.context.users[name].remove(function(deleted) {
        tester.context.users[name] = null;
        if (callback) {
          callback(deleted);
        }

        done();
      });
    };
  },

  /**
   * Connect to the system.
   *
   * @param done
   */
  systemConnect: function(callback) {
    return function(done) {
      new drupal.system(function(system) {
        tester.context.system = system;
        if (callback) {
          callback(system);
        }
        done();
      });
    };
  },

  /**
   * Logout of the logged in user.
   *
   * @param done
   */
  logout: function(callback) {
    return function(done) {
      drupal.current_user.logout(function() {
        if (callback) {
          callback();
        }
        done();
      })
    };
  },

  /**
   * Return a random user.
   *
   * @returns {{name: string, mail: string, pass: string}}
   */
  randomUser: function() {
    var rand = Math.floor(Math.random()*10000000000000);
    var randomUser = "user_" + rand;
    var randomMail = "user_" + rand + "@example.com";
    return {
      name:randomUser,
      mail:randomMail,
      pass:'test1234'
    };
  },

  /**
   * Create a new user.
   *
   * @param name
   * @param callback
   * @returns {Function}
   */
  saveUser: function(name, callback) {
    return function(done) {
      tester.getUser(name).save(function(user) {
        if (callback) {
          callback(user);
        }
        done();
      });
    };
  },

  /**
   * Sets a variable.
   *
   * @param name
   * @param value
   * @returns {Function}
   */
  setVariable: function(name, value) {
    return function(done) {
      tester.context.system.set_variable(name, value, done);
    };
  },

  /**
   * Get a variable value.
   *
   * @param name
   * @param defaultValue
   * @param callback
   * @returns {Function}
   */
  getVariable: function(name, defaultValue, callback) {
    return function(done) {
      tester.context.system.get_variable(name, defaultValue, function(value) {
        callback(value);
        done();
      });
    };
  },

  /**
   * Delete a variable.
   *
   * @param name
   * @returns {Function}
   */
  delVariable: function(name) {
    return function(done) {
      tester.context.system.del_variable(name, function() {
        done();
      })
    };
  },

  /**
   * Register a new user and store the object in context.
   * @param name
   */
  registerUser: function(name, callback) {
    return function(done) {

      // Get the user.
      var user = tester.getUser(name);

      // Register and save.
      user.register(function(createdUser) {
        user.save(function() {
          if (callback) {
            callback(createdUser);
          }
          done();
        });
      });
    };
  },

  /**
   * Gets a node.
   *
   * @param getId
   * @param callback
   * @returns {Function}
   */
  getNode: function(getId, callback) {
    return function(done) {
      new drupal.node({id:getId()}, function(node) {
        callback(node);
        done();
      });
    };
  },

  /**
   * Create a new random node.
   *
   * @param callback
   * @returns {Function}
   */
  createNode: function(callback) {
    return function(done) {
      var rand = Math.floor(Math.random()*10000000000000);
      var randomTitle = "test_" + rand;
      new drupal.node({
        title:randomTitle,
        type:'page'
      }).save(function(node) {
        callback(node, randomTitle);
        done();
      });
    };
  },

  /**
   * Get a parameter from the url path.
   *
   * @param name
   * @returns {string}
   */
  getParam: function(name) {
    var regexS = '[?&]' + name + '=([^&#]*)';
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.search);
    if (results === null) {
      return '';
    }
    else {
      return decodeURIComponent(results[1].replace(/\+/g, ' '));
    }
  },

  /**
   * Returns the endpoint for the server.
   *
   * @param endpoint
   * @returns {*}
   */
  getEndpoint: function(endpoint) {
    if (endpoint && endpoint.indexOf('http://') !== 0) {
      endpoint = 'http://' + endpoint;
    }
    return endpoint;
  },

  /**
   * Start the tests.
   *
   * @param username
   * @param password
   * @param endpoint
   */
  start: function(username, password, endpoint) {
    drupal.endpoint = endpoint;
    tester.context.users.admin = new drupal.user({
      name: username,
      pass: password
    });

    // Run all of the tests.
    async.series([
      runSystemTests,
      runNodeTests,
      runUserTests
    ], function() {
      console.log('Done!');
    });
  }
};
