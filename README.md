The Drupal JavaScript API Library
==================================

This library acts as an object oriented JavaScript wrapper around the
Drupal services module ( http://drupal.org/project/services ).
This makes is extremely simple to work with Drupal services from within a web
application that uses JavaScript (JSON) for communication to the Drupal RESTful
server.

A great use case for this library is to use it along with the <a href="http://phonegap.com/">PhoneGap</a> platform
when building a mobile application that may need to interact with your Drupal CMS backend.

Installation & Configuration
----------------------------------------

  * You will need a Drupal 7 site with Services 3.x and CORS modules (http://drupal.org/project/cors) installed.
  * Install the modules: Services, REST Server, CTools, CORS
  * Go to admin/structure/services and +Add a new Services endpoint.
  * Give it a name of "rest" and a Path to Endpoint of "rest".
  * Select the REST as the Server.
  * Enable "Session Authentication"
  * Press "Save" to save your endpoint.
  * Now click on "Edit Resource" in the services overview page next to "rest"
  * Enable "node", "system", and "user" resource (use version 1.0 for login and logout) and then press "Save"
  * Click on the "Server" tab, and then enable "jsonp" and then check "application/x-www-form-urlencoded" for application parsing and then press "Save".
  * Now go edit your CORS configuration @ admin/config/services/cors, and put the following in your CORS configuration.

```
rest|*|POST,GET,PUT,OPTIONS,DELETE|Content-Type,Authorization,X-CSRF-Token|true
```

  * Save the CORS configuration.
  * Now run the tests by simply typing the following in the command line.

```
npm install
grunt test
```

Usage
---------------------------------
Note: This module currently requires jQuery.
To use this library, simply add the ```bin/drupal.api.min.js``` file to your HTML page.

```html
<script type='text/javascript' src='bin/drupal.api.min.js'></script>
```

Next, you will now need to tell the library about your endpoint URL.

```html
<script type="text/javascript">
  drupal.endpoint = 'http://drupal.org/api';
</script>
```

You can then start using the following API provided from the Examples below.

__For Drupal Services versions below 3.5__: For older versions of services, you must also tell this library
to not use the Token authentication.

```html
<script type="text/javascript">
  drupal.useToken = false;
</script>
```

Examples
----------------------------------

 - To create a new node.
 
```javascript
(new drupal.node({
  title:"My new Node"
})).save();
```
      
 - To create a new node with fields. Use the "fields" parameter in the JSON object.

```javascript  
(new drupal.node({
  title: "My fielded node.",
  fields: {
    field_a: {
      'value': 'The value of this field.'  // <-- maps to node.field_a['und'][0]['value']
    },
    field_b: {
      'value': 'The value of this field.'  // <-- maps to node.field_b['und'][0]['value']
    }
  }
})).save();
```

  - To update an existing node.

```javascript
new drupal.node({nid:10}, function(node) {

  // Change title then save.
  node.title = "Change the Title";
  node.save();
});
```

 - To get a list of nodes of type='page'

```javascript
drupal.node.index({type:'page'}, function(nodes) {

  // This is a list of nodes of type 'page'.
  console.log(nodes);
});
```

 - To delete a node on the server.

```javascript
(new drupal.node({nid:10})).remove();
```

 - To connect to the drupal server.

```javascript
new drupal.system(function(system) {

  // The currently logged in user.
  console.log(system.user);
});
```

 - To create a new user.

```javascript
      (new drupal.user({
        name:"travist":
        pass:"testing":
        mail:"travis@allplayers.com"
      })).save();
```

 - To load an existing user.

```javascript
new drupal.user({uid:10}, function(user) {

  // The logged in user.
  console.log(user);
});
```

 - To delete a user.

```javascript
(new drupal.user({uid:10})).remove();
```

 - To get a variable on Drupal.

```javascript
(new drupal.system()).get_variable("variable", "default", function(value) {

  // The value of the variable.
  console.log(value);
});
```

 - To set a variable on Drupal.

```javascript
(new drupal.system()).set_variable("variable", "value", function() {

  console.log("done");
});
```

 - To delete a variable on Drupal.

```javascript
(new drupal.system()).del_variable("variable", function() {

  console.log("done");
});
```

Running Tests
----------------------
This library is tested with QUnit.  You can run the tests by typing the folling in the console.

```
npm install
grunt test
```
