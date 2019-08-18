Interceptor.attach(ptr('0x1087e3ec0'), {
  onEnter(args) {
    send(args[0].toInt32());
  }
});
