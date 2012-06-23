var listNodes = function(callback) {
  asyncTest("Get list of nodes based on node type", function() {

    // Get all "auto" nodes.
    drupal.node.index({type:"page"}, function(nodes) {

      // Start the test...
      start();

      // Set the expection to the length of the nodes.
      expect(nodes.length*3);

      // Iterate over all the nodes and verify that they auto nodes.
      for (var index in nodes) {

        // Check the node.
        var node = nodes[index];

        // There should be an id.
        ok(!!node.id, "Node ID is present.");

        // There should be a title.
        ok(!!node.title, "Node Title is present");

        // This should only be an 'delete' type.
        ok((node.type == 'page'), "node.type == 'page'");
      }

      if (callback) {
        callback();
      }
    });
  });
};


var deleteNode = function(node, callback) {

  asyncTest("Delete a node", function() {

    new drupal.node({id:node.id}).remove(function(deleted) {

      // Start the test.
      start();
      expect(1);

      ok(deleted, "The node was deleted");

      if (callback) {
        callback();
      }
    });
  });
};

var updateNode = function(node, callback) {
  asyncTest("Retrieve and Update an existing node.", function() {

    // Get the created node.
    new drupal.node({id:node.id}, function(updated) {

      // Define a random title.
      var rand = Math.floor(Math.random()*10000000000000);
      var randTitle = "test_" + rand;

      // Store some original values.
      var nid = updated.id;
      var originalTitle = updated.title;

      // Now give it a different random title.
      updated.title = randTitle;

      // Now save it.
      updated.save(function(savedNode) {

        // Store this to check later.
        var nidSame = savedNode.id == nid;

        // Now get the node provided the nid.
        new drupal.node({id:savedNode.id}, function(verified) {

          // Start the unit test.
          start();
          expect(5);

          // Check and verify that the nid never changes...
          ok(nidSame, "The saved node was the same.");
          ok(verified.id == nid, "The node nid was verified as same.");

          // The node type should be correct.
          ok(verified.type == 'page', "Node Type is correct");

          // Check to see if the node title changed.
          ok(verified.title != originalTitle, "Node title was changed");

          // The node title should be updated.
          ok(verified.title == randTitle, "Node Title was updated");

          // Call the callback.
          if (callback) {
            callback(verified);
          }
        });
      });
    });
  });
};

var createNode = function(callback) {
  asyncTest("Create a new node", function() {

    // Create a new node.
    var rand = Math.floor(Math.random()*10000000000000);
    var randomTitle = "test_" + rand;

    // Define a new node, then save it.
    new drupal.node({
      title:randomTitle,
      type:'page'
    }).save(function(node) {

      // Start the unit test.
      start();
      expect(3);

      // There should be an nid.
      ok(node.id, "Node ID is present.");

      // The node title should be the same as what we set.
      ok(node.title == randomTitle, "Node Title is correct");

      // The node type should be correct.
      ok(node.type == 'page', "Node Type is correct");

      // Call the callback...
      if (callback) {
        callback(node);
      }
    });
  });
};

var runNodeTests = function(callback) {
  // perform the tests in a specific order.
  createNode(function(node) {
    updateNode(node, function(updatedNode) {
      listNodes(function() {
        deleteNode(updatedNode, callback);
      });
    });
  });
};
