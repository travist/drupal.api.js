// Get a random user.
var randomUser = function() {
  var rand = Math.floor(Math.random()*10000000000000);
  var randomUser = "user_" + rand;
  var randomMail = "user_" + rand + "@example.com";
  return {
    name:randomUser,
    mail:randomMail,
    pass:'test1234'
  };
};

// Create a random user.
var createUser = function(callback) {
  var user = randomUser();
  new drupal.user(user).save(function(user) {
    if (callback) {
      callback(user);
    }
  });
  return user;
};

// Get a list of users.
var userList = function(callback) {
  // Get a list of users.
  asyncTest("Get list of users", function() {
    expect(3);
    drupal.user.index(function(users) {
      // Iterate over all the nodes and verify that they auto nodes.
      for (var index in users) {

        // Check the user.
        var user = users[index];

        if (parseInt(user.id)) {

          // There should be an uid.
          ok(!!user.id, "User ID is present.");

          // There should be a name.
          ok(!!user.name, "User name is present");

          // There should be an email.
          ok(!!user.mail, "User email is present");
          break;
        }
      }
      start();
      if (callback) {
        callback();
      }
    });
  });
};

// User create, update, and delete.
var userCreateUpdateDelete = function(callback) {
  // Create, update, and delete a user...
  asyncTest("Create, update, and delete a user", function() {
    expect(6);

    // Create and remove the user.
    var checkUser = createUser(function(user) {

      // There should be a uid.
      ok(user.id, "User ID is present.");

      // The user name should be the same as what we set.
      ok(user.name == checkUser.name, "User name is correct");

      // The user email should be correct.
      ok(user.mail == checkUser.mail, "User email is correct");

      // Get another random users information.
      var updatedUser = randomUser();

      // Check to make sure the emails are different.
      ok(checkUser.mail !== updatedUser.mail, 'Change the user email.');

      // Set the user email.
      user.mail = updatedUser.mail;

      // Now update the user...
      user.save(function(user) {

        // The user email should be correct.
        ok(user.mail == updatedUser.mail, "User email was updated");

        // Remove this user.
        user.remove(function(deleted) {

          // User was deleted.
          ok(deleted, "User was deleted.");
          start();
          if (callback) {
            callback();
          }
        });
      });
    });
  });
};

// User register, logout, and login.
var userRegisterLogoutLogin = function(uname, passwd, callback) {
  asyncTest("User Register, Logout, and Login", function() {
    expect(7);
    new drupal.system(function(system) {

      // To run this test, the user_email_verification must be 0.
      system.get_variable('user_email_verification', 0, function(email_verification) {

        system.set_variable('user_email_verification', 0, function() {

          // Logout of the current user.
          system.user.logout(function() {

            // Register a new user.
            var checkUser = randomUser();
            var newUser = new drupal.user(checkUser).register(function(user) {
              ok(user.name == checkUser.name, "User name was set correctly");
              ok(user.mail == checkUser.mail, "User mail was set correctly");
              ok(!!user.id, "User ID was set.");

              checkUser.id = user.id;

              // Logout of the current user.
              user.logout(function() {

                // Login to the registered user.
                new drupal.user(checkUser).login(function(user) {

                  ok(user.name == checkUser.name, "User name was verified.");
                  ok(user.mail == checkUser.mail, "User mail was verified.");
                  ok(user.id == checkUser.id, "User ID was verified.");

                  // Now logout of this user.
                  user.logout(function() {

                    // Log into the admin user.
                    new drupal.user({name:uname,pass:passwd}).login(function() {

                      // Remove the old user.
                      user.remove(function(deleted) {

                        // Set the variable back.
                        system.set_variable('user_email_verification', email_verification);
                        ok(deleted, "User was deleted.");
                        start();
                        if (callback) {
                          callback();
                        }
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
};

// Run the user tests.
var runUserTests = function(uname, passwd, callback) {
  userCreateUpdateDelete(function() {
    userList(function() {
      userRegisterLogoutLogin(uname, passwd, callback);
    });
  });
};
