var runSystemTests = function(done) {
  // Test system.connect, variable get, set, and delete.
  QUnit.asyncTest("Variable Set, Get, Delete", function() {
    QUnit.expect(3);
    async.series([

      // Connect to the system.
      tester.systemConnect(function(system) {
        ok(!!drupal.current_user.sessid, "Connection successful");
      }),

      // Login as admin.
      tester.login('admin'),

      // Set a variable.
      tester.setVariable('test_variable', '12345'),

      // Get the variable.
      tester.getVariable('test_variable', '2468', function(value) {
        QUnit.ok(value == '12345', 'set_variable & get_variable passed');
      }),

      // Delete the variable.
      tester.delVariable('test_variable'),

      // Get the variable.
      tester.getVariable('test_variable', '2468', function(value) {
        QUnit.ok(value == '2468', 'del_variable passed.');
      }),

      // Logout of the user.
      tester.logout()
    ], function() {
      QUnit.start();
      done();
    });
  });
};