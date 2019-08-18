const NSSpeechSynthesizer = ObjC.classes.NSSpeechSynthesizer;

const synth = NSSpeechSynthesizer.alloc().init();
const voiceId = NSSpeechSynthesizer.availableVoices().objectAtIndex_(0);
synth.setVoice_(voiceId);

Interceptor.attach(Module.findExportByName('libSystem.B.dylib', 'open'), {
  onEnter(args) {
    const path = Memory.readUtf8String(args[0]);
    const name = path.substr(path.lastIndexOf('/') + 1);
    console.log('OPENING "' + name + '"');
    synth.startSpeakingString_(name);
  }
});

