var app = new ModuleMap(isAppModule);
var blocks = {};
var lastSnapshot = {};

Process.enumerateThreadsSync().forEach(function (thread) {
  Stalker.follow(thread.id, {
    events: {
      compile: true
    },
    onReceive: function (rawEvents) {
      Stalker.parse(rawEvents, { annotate: false })
      .forEach(function (event) {
        var start = event[0];
        var id = start.toString();
        if (app.has(start) && blocks[id] === undefined) {
          blocks[id] = true;
        }
      });
    }
  });
});

function snapshot () {
  lastSnapshot = Object.keys(blocks).reduce(function (result, block) {
    result[block] = true;
    return result;
  }, {});
}

function diff () {
  var lines = [];

  Object.keys(blocks).forEach(function (block) {
    if (lastSnapshot[block] === undefined) {
      lines.push('\t' + block);
    }
  });

  lines.sort();

  console.log(lines.join('\n'));
}

function isAppModule (module) {
  return module.path.indexOf('Calculator.app') !== -1;
}
