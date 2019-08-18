var appModules = new ModuleMap(isAppModule);
var mnemonics = {};
var lastSnapshot = {};

Process.enumerateThreadsSync().forEach(function (thread) {
  Stalker.follow(thread.id, {
    transform: function (iterator) {
      var instruction;

      instruction = iterator.next();
      if (!appModules.has(instruction.address)) {
        do {
          iterator.keep();
        } while (iterator.next() !== null);
        return;
      }

      do {
        iterator.keep();

        var mnemonic = instruction.mnemonic;
        var count = mnemonics[mnemonic] || 0;
        mnemonics[mnemonic] = count + 1;
      } while ((instruction = iterator.next()) !== null);
    }
  });
});

function snapshot () {
  lastSnapshot = Object.keys(mnemonics).reduce(function (result, mnemonic) {
    result[mnemonic] = true;
    return result;
  }, {});
}

function diff () {
  var lines = [];

  Object.keys(mnemonics).forEach(function (mnemonic) {
    if (lastSnapshot[mnemonic] === undefined) {
      lines.push([
          '\t',
          mnemonic,
          (mnemonic.length >= 8) ? '\t' : '\t\t',
          mnemonics[mnemonic]
      ].join(''));
    }
  });

  lines.sort();

  console.log(lines.join('\n'));
}

function isAppModule (module) {
  return module.path.indexOf('Calculator.app') !== -1;
}
