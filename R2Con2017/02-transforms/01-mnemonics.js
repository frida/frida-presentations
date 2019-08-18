var mnemonics = {};

Process.enumerateThreadsSync().forEach(function (thread) {
  Stalker.follow(thread.id, {
    transform: function (iterator) {
      var instruction;

      while ((instruction = iterator.next()) !== null) {
        iterator.keep();

        var mnemonic = instruction.mnemonic;
        var count = mnemonics[mnemonic] || 0;
        mnemonics[mnemonic] = count + 1;
      }
    }
  });
});
