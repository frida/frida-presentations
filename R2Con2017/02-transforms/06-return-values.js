var NSAutoreleasePool = ObjC.classes.NSAutoreleasePool;
var NSSpeechSynthesizer = ObjC.classes.NSSpeechSynthesizer;

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
        if (instruction.mnemonic === 'ret') {
          iterator.putCallout(onAppReturn);
        }

        iterator.keep();
      } while ((instruction = iterator.next()) !== null);
    }
  });
});

var pool = NSAutoreleasePool.alloc().init();
var synth = NSSpeechSynthesizer.alloc().init();
var voiceId = NSSpeechSynthesizer.availableVoices().objectAtIndex_(2);
synth.setVoice_(voiceId);
pool.release();

var lastSpeak = null;

function onAppReturn (context) {
  var now = Date.now();
  if (lastSpeak === null || now - lastSpeak > 600) {
    lastSpeak = now;
    synth.startSpeakingString_(context.rax.toInt32().toString());
  }
}

function isAppModule (module) {
  return module.path.indexOf('Calculator.app') !== -1;
}
