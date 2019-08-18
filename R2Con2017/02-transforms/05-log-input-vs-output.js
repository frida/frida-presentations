var mnemonics = {};

var blocksSeen = 0;

Process.enumerateThreadsSync().forEach(function (thread) {
  Stalker.follow(thread.id, {
    transform: function (iterator) {
      var instruction;

      var enableLogging = blocksSeen < 100;
      if (enableLogging) {
        console.log('\nBLOCK ' + blocksSeen);
      }

      while ((instruction = iterator.next()) !== null) {
        if (enableLogging) {
          console.log('Input:\n\t' + instruction.address + '\t' + instruction.toString());
        }

        var offsetBefore = iterator.offset;

        iterator.keep();

        try {
          if (enableLogging) {
            console.log('Output:');
            var cur = iterator.base.add(offsetBefore);
            var end = iterator.code;
            do {
              var insn = Instruction.parse(cur);
              console.log('\t' + insn.address + '\t' + insn.toString());

              cur = insn.next;
            } while (!cur.equals(end));
          }
        } catch (e) {
          console.error(e);
        }

        var mnemonic = instruction.mnemonic;
        var count = mnemonics[mnemonic] || 0;
        mnemonics[mnemonic] = count + 1;
      }

      blocksSeen++;
    },
    events: {
      call: true
    }
  });
});
