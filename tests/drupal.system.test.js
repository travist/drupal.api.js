
asyncTest("System Connect", function() {

  new drupal.system(function(system) {
    start();
    expect(1);
    ok(!!system.sessid, "Connection successful");
  });
});