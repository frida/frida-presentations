var QUEUE_CAPACITY = 1000000;

var app = new ModuleMap(isAppModule);
var targets = {};
var lastSnapshot = {};

Stalker.queueCapacity = QUEUE_CAPACITY;

var mainThread = Process.enumerateThreadsSync()[0];
Stalker.follow(mainThread.id, {
  events: {
    call: true
  },
  onReceive: function (rawEvents) {
    var events = Stalker.parse(rawEvents, { annotate: false });

    if (events.length === QUEUE_CAPACITY) {
      console.log('OVERFLOW!');
      return;
    }

    events.forEach(function (event) {
      var location = event[0];
      var target = event[1];
      if (app.has(location) || app.has(target)) {
        var depth = event[2];
        var description = DebugSymbol.fromAddress(location).toString() +
            ': CALL ' +
            DebugSymbol.fromAddress(target).toString();
        console.log(indent(description, depth));
      }
    });
  }
});

function indent (str, level) {
  var result = [];
  for (var i = 0; i !== level; i++)
    result.push('   | ');
  result.push(str);
  return result.join('');
}

function snapshot () {
  lastSnapshot = Object.keys(targets).reduce(function (result, target) {
    result[target] = true;
    return result;
  }, {});
}

function diff () {
  var lines = [];

  Object.keys(targets).forEach(function (target) {
    if (lastSnapshot[target] === undefined) {
      lines.push('\t' + target);
    }
  });

  lines.sort();

  console.log(lines.join('\n'));
}

function isAppModule (module) {
  return module.path.indexOf('Calculator.app') !== -1;
}
