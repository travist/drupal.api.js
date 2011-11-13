// Test the default Search groups.
asyncTest("api.searchGroups({search: 'YMCA'})", 2, function() {
  allplayers.api.searchGroups({search: 'YMCA'}, function(groups) {

    // Start the test...
    start();

    // Test that the default number of groups is 10.
    var i = groups.length;
    equal(i, 10, "Default Number of Groups = 10");

    // Check all groups for UUID's.
    var uuids = true;
    while (i--) {
      uuids &= !!groups[i].uuid;
    }
    ok(uuids, "All UUID's exist");
  });
});


// Test the Search groups with distance.
asyncTest("api.searchGroups({search: 'YMCA', fields:'title,uuid', limit:20})", 2, function() {
  allplayers.api.searchGroups({search: 'YMCA', fields:'title,uuid', limit:20}, function(groups) {

    // Start the test...
    start();

    // Test that the default number of groups is 10.
    var i = groups.length;
    equal(i, 20, "Default Number of Groups = 20");

    function testGroup(group) {
      // Test to make sure we only have the title and uuid.
      var count = 0, k = null;
      for (k in group) {
        if (group.hasOwnProperty(k)) {
          count++;
        }
      }
      return (count==2) && !!group.title && !!group.uuid;
    }

    // Check all groups for UUID's.
    var pass = true;
    while (i--) {
      pass &= testGroup(groups[i]);
    }
    ok(pass, "Only UUID and Title present in each group.");
  });
});

// Test the getGroup API.
asyncTest("api.getGroup()", 1, function() {
  allplayers.api.searchGroups({search: 'YMCA'}, function(groups) {

    var first_group = groups[0];
    allplayers.api.getGroup(first_group.uuid, {}, function(group) {

      // Start the test...
      start();

      // Test that the groups are the same group.
      ok(group.uuid==first_group.uuid, "The groups are equal.");
    });
  });
});

/*
// Test the saveGroup API.
asyncTest("api.saveGroup()", 2, function() {

  allplayers.api.searchGroups({search: 'YMCA'}, function(groups) {

    var group = groups[0];

    // Change the title and description.
    group.title = "TITLE 1234";
    group.description = "DESCRIPTION 1234"

    allplayers.api.saveGroup(group, function() {
      allplayers.api.getGroup(group.uuid, {}, function(savedGroup) {

        // Start the test...
        start();

        // Test that the groups are the same group.
        ok(savedGroup.title==group.title, "The group title was saved.");
        ok(savedGroup.description==group.description, "The group description was saved.");
      });
    });
  });
});
*/