test('allplayers_entity', 8, function() {

  // Create a new entity.
  var entity = new allplayers.entity({
    uuid: '12345',
    title: 'title',
    description: 'description'
  });

  equal(entity.title, 'title', 'Title is set');
  equal(entity.description, 'description', 'Description is set');

  entity.update({
    title:'Test Title',
    description:'Test Description',
    uuid:'24681'
  });

  equal(entity.title, 'Test Title', 'Title update passed');
  equal(entity.description, 'Test Description', 'Description update passed');
  equal(entity.uuid, '24681', 'UUID update passed');

  var object = entity.getObject();
  equal(object.title, 'Test Title', 'getObject title passed');
  equal(object.description, 'Test Description', 'getObject description passed');
  equal(object.uuid, '24681', 'getObject uuid passed');
});