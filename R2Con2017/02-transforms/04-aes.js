var locations = {};

Process.enumerateThreadsSync().forEach(function (thread) {
  Stalker.follow(thread.id, {
    transform: function (iterator) {
      var instruction;

      while ((instruction = iterator.next()) !== null) {
        iterator.keep();

        if (instruction.mnemonic === 'aesenc') {
          iterator.putCallout(onAesEnc);
        }
      }
    }
  });
});

function onAesEnc (context) {
  var locationId = context.pc.toString();
  var seenBefore = locations[locationId] === true;
  if (seenBefore)
    return;
  locations[locationId] = true;

  console.log('aesenc at:\n\t' + Thread.backtrace(context).map(DebugSymbol.fromAddress).join('\n\t'));
}
