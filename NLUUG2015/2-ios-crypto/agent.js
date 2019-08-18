Module.enumerateExports('libcommonCrypto.dylib', {
  onMatch: e => {
    if (e.type === 'function') {
      try {
        Interceptor.attach(e.address, {
          onEnter: args => {
            send({ event: 'call', name: e.name });
          }
        });
      } catch (error) {
        console.log('Ignoring ' + e.name + ': ' + error.message);
      }
    }
  },
  onComplete: () => {
    send({ event: 'ready' });
  }
});
