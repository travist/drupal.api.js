var listUsers = function(callback) {
  asyncTest("Get list of users", function() {

    // Get all users.
    new drupal.user({}, function(users) {

      // Start the test...
      start();

      // Set the expection to the length of the nodes.
      expect(users.length*3);

      // Iterate over all the nodes and verify that they auto nodes.
      for (var index in users) {

        // Check the user.
        var user = users[index];

        // There should be an uid.
        ok(user.hasOwnProperty("uid"), "User ID is present.");

        // There should be a name.
        ok(user.hasOwnProperty("name"), "User name is present");

        // There should be an email.
        ok(user.hasOwnProperty("mail"), "User email is present");
      }

      if (callback) {
        callback();
      }
    });
  });
};

var deleteUser = function(user, callback) {

  asyncTest("Delete a user", function() {

    new drupal.user({id:user.id}).remove(function(deleted) {

      // Start the test.
      start();
      expect(1);

      ok(deleted, "The user was deleted");

      if (callback) {
        callback();
      }
    });
  });
};

var createUser = function(callback) {
  asyncTest("Create a new user", function() {

    // Create a new node.
    var rand = Math.floor(Math.random()*10000000000000);
    var randomUser = "user_" + rand;
    var randomMail = "user_" + rand + "@example.com";

    // Define a new node, then save it.
    new drupal.user({
      name:randomUser,
      mail:randomMail,
      pass:'test1234'
    }).save(function(user) {

      // Start the unit test.
      start();
      expect(3);

      // There should be a uid.
      ok(user.id, "User ID is present.");

      // The user name should be the same as what we set.
      ok(user.name == randomUser, "User name is correct");

      // The user email should be correct.
      ok(user.mail == randomMail, "User email is correct");

      // Call the callback...
      if (callback) {
        callback(user);
      }
    });
  });
};

var updateUser = function(user, callback) {
  asyncTest("Retrieve and Update an existing user.", function() {

    // Get the user.
    new drupal.user({id:user.id}, function(updated) {

      // Define a random title.
      var rand = Math.floor(Math.random()*10000000000000);
      var randomMail = "user_" + rand + "@example.com";

      // Store some original values.
      var uid = updated.id;
      var originalMail = updated.mail;

      // Now give it a different email address.
      updated.mail = randomMail;

      // Now save it.
      updated.save(function(savedUser) {

        // Store this to check later.
        var uidSame = savedUser.id == uid;

        // Now get the node provided the nid.
        new drupal.user({id:savedUser.id}, function(verified) {

          // Start the unit test.
          start();
          expect(4);

          // Check and verify that the nid never changes...
          ok(uidSame, "The saved user was the same.");
          ok(verified.id == uid, "The user uid was verified as same.");

          // Check to see if the user email changed.
          ok(verified.mail != originalMail, "User email was changed");

          // The user email should be updated.
          ok(verified.mail == randomMail, "User email was updated");

          // Call the callback.
          if (callback) {
            callback(verified);
          }
        });
      });
    });
  });
};

var userRegisterLogoutLogin = function(user, callback) {

  asyncTest("User Register, Logout, and Login", function() {
    new drupal.system(function(system) {

      // Logout of the current user.
      system.user.logout(function() {

        var rand = Math.floor(Math.random()*10000000000000);
        var randomUser = "user_" + rand;
        var randomMail = randomUser + '@example.com';

        // Register a new user.
        var newUser = new drupal.user({
          name:randomUser,
          pass:'testing123',
          mail:randomMail
        }).register(function(user) {

          var test1 = user.name == randomUser;
          var test2 = user.mail == randomMail;
          var test3 = !!user.id;
          var userID = user.id;

          // Logout of the current user.
          user.logout(function() {

            // Login to the registered user.
            new drupal.user({name:randomUser,pass:'testing123'}).login(function(user) {

              start();
              expect(6);

              ok(test1, "User name was set correctly");
              ok(test2, "User mail was set correctly");
              ok(test3, "User ID was set.");
              ok(user.name == randomUser, "User name was verified.");
              ok(user.mail == randomMail, "User mail was verified.");
              ok(user.id == userID, "User ID was verified.");

              if (callback) {
                callback();
              }
            });
          });
        });
      });
    });
  });
};

// perform the tests in a specific order.
createUser(function(user) {
  updateUser(user, function(updatedUser) {
    listUsers(function() {
      deleteUser(updatedUser, function() {
        userRegisterLogoutLogin();
      });
    });
  });
});
