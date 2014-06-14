var testUserList = function(done) {
  // Get a list of users.
  QUnit.asyncTest("Get list of users", function() {
    QUnit.expect(3);
    drupal.user.index(function(users) {
      // Iterate over all the nodes and verify that they auto nodes.
      for (var index in users) {

        // Check the user.
        var user = users[index];

        if (parseInt(user.id)) {

          // There should be an uid.
          QUnit.ok(!!user.id, "User ID is present.");

          // There should be a name.
          QUnit.ok(!!user.name, "User name is present");

          // There should be an email.
          QUnit.ok(!!user.mail, "User email is present");
          break;
        }
      }
      QUnit.start();
      if (done) {
        done();
      }
    });
  });
};

// User create, update, and delete.
var testUserCreateUpdateDelete = function(done) {
  QUnit.asyncTest("Create, update, and delete a user", function() {
    QUnit.expect(7);
    async.series([
      tester.systemConnect(),
      tester.login('admin'),
      tester.saveUser('bob', function(user) {
        QUnit.ok(user.id, "User ID is present.");
        QUnit.ok(user.id == tester.context.users['bob'].id, "User id's match");
        QUnit.ok(user.name == tester.context.users['bob'].name, "User name is correct");
        QUnit.ok(user.mail == tester.context.users['bob'].mail, "User email is correct");
      }),
      function(done) {
        // Change Bob's email.
        var updatedUser = tester.randomUser();
        QUnit.ok(tester.context.users['bob'].mail !== updatedUser.mail, 'Change the user email.');
        tester.context.users['bob'].mail = updatedUser.mail;
        done();
      },
      tester.saveUser('bob', function(user) {
        QUnit.ok(user.mail == tester.context.users['bob'].mail, "User email was updated");
      }),
      tester.removeUser('bob', function(deleted) {
        QUnit.ok(deleted, "User was deleted.");
      })
    ], function() {
      QUnit.start();
      if (done) {
        done();
      }
    });
  });
};

// User register, logout, and login.
var testUserRegisterLogoutLogin = function(done) {

  // The user register, logout, and login test.
  QUnit.asyncTest("User Register, Logout, and Login", function() {
    QUnit.expect(7);
    async.series([

      // Connect to the system.
      tester.systemConnect(),

      // Login as admin.
      tester.login('admin'),

      // Get the variable value.
      function(done) {
        tester.context.system.get_variable('user_email_verification', 0, function(email_verification) {
          tester.context.email_verification = email_verification;
          tester.context.system.set_variable('user_email_verification', 0, function() {
            done();
          });
        });
      },

      // Register a new user.
      tester.registerUser('random', function(user) {
        QUnit.ok(user.name == tester.context.users['random'].name, "User name was set correctly");
        QUnit.ok(user.mail == tester.context.users['random'].mail, "User mail was set correctly");
        QUnit.ok(!!user.id, "User ID was set.");
      }),

      // Logout of current user (admin)
      tester.logout(),

      // Login as the user that was created.
      tester.login('random', function(user) {
        QUnit.ok(user.name == tester.context.users['random'].name, "User name was verified.");
        QUnit.ok(user.mail == tester.context.users['random'].mail, "User mail was verified.");
        QUnit.ok(user.id == tester.context.users['random'].id, "User ID was verified.");
      }),

      // Logout of current user (random)
      tester.logout(),

      // Login as admin again.
      tester.login('admin'),

      // Remove this user.
      tester.removeUser('random', function(deleted) {
        QUnit.ok(deleted, "User was deleted.");
      }),

      // Set email verification variable back.
      function(done) {
        tester.context.system.set_variable('user_email_verification', tester.context.email_verification, function() {
          done();
        });
      },

      // Logout of the user.
      tester.logout()
    ], function() {
      QUnit.start();
      if (done) {
        done();
      }
    });
  });
};

// Run the user tests.
var runUserTests = function(done) {
  async.series([
    testUserCreateUpdateDelete,
    testUserList,
    testUserRegisterLogoutLogin
  ], done);
};
