var app = new ModuleMap(isAppModule);
var targets = {};
var lastSnapshot = {};

Process.enumerateThreadsSync().forEach(function (thread) {
  Stalker.follow(thread.id, {
    events: {
      call: true
    },
    onCallSummary: function (summary) {
      Object.keys(summary)
      .forEach(function (target) {
        if (app.has(ptr(target))) {
          var count = targets[target];
          if (count === undefined) {
            console.log('New target:' + target);
            count = 0;
          }
          targets[target] = count + summary[target];
        }
      });
    }
  });
});

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
