
// Returns a random date.
function getRandomDate(year) {
  var month = Math.floor(Math.random()*12);
  var day = Math.floor(Math.random()*28);
  return {
    month: month,
    day: day,
    date: new Date(year, month, day)
  };
}

// Test api.getGroupEvents
asyncTest("api.getGroupEvents()", 2, function() {
  allplayers.api.searchGroups({search: 'Spring Soccer 2011'}, function(groups) {
    allplayers.api.getGroupEvents(groups[0].uuid, {
      start: '2011-1-1',
      end: '2011-12-30'
    }, function(events) {

      this.start();

      // Iterate through each event and verify that it is in the right
      // timeframe.
      var passed = true, uuids = true;
      var i = events.length, start = null, end = null;
      var testStart = new Date(2011, 0, 1).getTime();
      var testEnd = new Date(2011, 11, 30).getTime();
      while (i--) {
        start = new Date(events[i].start);
        end = new Date(events[i].end);
        if ((start.getTime() < testStart) && (end.getTime() > testEnd)) {
          passed = false;
        }
        if (!events[i].uuid) {
          uuids = false;
        }
      }

      ok(passed, "Events in correct timeframe");
      ok(uuids, "All events have UUIDS");
    });

  });
});

// Testing updating events.
asyncTest("event.update()", 5, function() {
  allplayers.api.searchGroups({search: 'Spring Soccer 2011'}, function(groups) {
    allplayers.api.getGroupEvents(groups[0].uuid, {
      start: '2011-1-1',
      end: '2011-12-30'
    }, function(events) {

      // Create a new event.
      var event = new allplayers.event(events[0]);

      var rand = Math.floor(Math.random()*10000000000000);
      var randomTitle = "Title" + rand;
      var randomDesc = "This is the " + rand + " event.";
      var randomStart = getRandomDate(2011);
      var randomEnd = getRandomDate(2012);

      event.title = randomTitle;
      event.description = randomDesc;
      event.start = randomStart.date;
      event.end = randomEnd.date;
      event.save(function(newEvent) {

        start();
        ok(!!newEvent.uuid, "UUID found");
        ok(newEvent.title == randomTitle, "Title was updated");
        ok(newEvent.description == randomDesc, "Description was updated");
        ok(newEvent.start.getTime() === randomStart.date.getTime(), "Start date is updated");
        ok(newEvent.end.getTime() == randomEnd.date.getTime(), "End date is updated");
      });
    });

  });
});

// Testing creating events.
asyncTest("event.create()", 5, function() {

  // Create a new event.
  var rand = Math.floor(Math.random()*10000000000000);
  var randomTitle = "Event " + rand;
  var randomDesc = "This is the " + rand + " event.";
  var randomStart = getRandomDate(2011);
  var randomEnd = getRandomDate(2012);

  // Create a new event.
  var event = new allplayers.event({
    title: randomTitle,
    description: randomDesc,
    start: randomStart.date,
    end: randomEnd.date
  });

  // Save the event.
  event.save(function(savedEvent) {

    start();
    ok(!!savedEvent.uuid, "UUID found");
    ok(savedEvent.title == randomTitle, "Title was valid.");
    ok(savedEvent.description == randomDesc, "Description was valid");
    ok(savedEvent.start.getTime() === randomStart.date.getTime(), "Start date is valid");
    ok(savedEvent.end.getTime() == randomEnd.date.getTime(), "End date is valid");
  });
});