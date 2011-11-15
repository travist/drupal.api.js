
asyncTest("System Connect", function() {
  new drupal.system(function(system) {
    start();
    expect(2);
    ok(!!system.sessid, "Connection successful");
    ok(!!system.user.id, "User is logged in");
  });
});