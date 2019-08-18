var appModules = new ModuleMap(isAppModule);

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
        if (instruction.mnemonic === 'cmp') {
          console.log(instruction.toString());
        }

        iterator.keep();
      } while ((instruction = iterator.next()) !== null);
    }
  });
});

function isAppModule (module) {
  return module.path.indexOf('Extreme Road Trip 2.app') !== -1;
}
