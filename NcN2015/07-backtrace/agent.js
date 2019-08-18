Interceptor.attach(Module.findExportByName('libSystem.B.dylib', 'connect'), {
  onEnter() {
    console.log('connect called from:\n\t' +
        Thread.backtrace(this.context, Backtracer.ACCURATE).join('\n\t'));
  }
});
