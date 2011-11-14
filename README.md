The Drupal JavaScript API

This library acts as an object oriented JavaScript wrapper around the
Drupal services module ( http://drupal.org/project/services ).
This makes is extremely simple to work with Drupal services from within a web
application that uses JavaScript (JSON) for communication to the Drupal RESTful
server.

Examples:

  1.)  To create a new node.

      new drupal.node({title:"My new Node"}).save();

  2.)  To update an existing node.

      new drupal.node({nid:10}, function(node) {

        // Change title then save.
        node.title = "Change the Title";
        node.save();
      });

   3.) To get a list of nodes of type='page'

      new drupal.node({type:'page'}, function(nodes) {

        // This is a list of nodes of type 'page'.
        console.log(nodes);
      });

   4.) To delete a node on the server.

      new drupal.node({nid:10}).remove();
