
var systemConnect = function(callback) {
  asyncTest("System Connect", function() {
    new drupal.system(function(system) {
      start();
      expect(1);
      ok(!!system.user.sessid, "Connection successful");
      if (callback) {
        callback();
      }
    });
  });
};

var variableGetSetDelete = function(callback) {
  asyncTest("Variable Set, Get, Delete", function() {
    var system = new drupal.system();

    // Set a test variable.
    system.set_variable('test_variable', '12345', function() {

      // Provide a different default to validate value.
      system.get_variable('test_variable', '2468', function(value) {

        // Test to make sure the variable was set...
        var test1 = (value == '12345');

        // Now delete the variable.
        system.del_variable('test_variable', function() {

          // Now check to make sure it no longer exists.
          system.get_variable('test_variable', '2468', function(check) {

            start();
            expect(2);
            ok(test1, "set_variable & get_variable passed.");
            ok(check=='2468', "del_variable passed.");
            if (callback) {
              callback();
            }
          });
        });
      });
    });
  });
};

var runSystemTests = function(callback) {
  systemConnect(function() {
    variableGetSetDelete(callback);
  });
};