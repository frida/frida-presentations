Interceptor.attach(Module.findExportByName('libSystem.B.dylib', 'open'), {
  onEnter(args) {
    const path = Memory.readUtf8String(args[0]);
    console.log('open("' + path + '")');
  }
});
