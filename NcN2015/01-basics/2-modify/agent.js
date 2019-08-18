Interceptor.attach(ptr('0x1087e3ec0'), {
  onEnter(args) {
    args[0] = ptr("1337");
  }
});
