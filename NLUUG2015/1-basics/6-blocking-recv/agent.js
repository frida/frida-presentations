Interceptor.attach(ptr('0x106a81ec0'), {
  onEnter: args => {
    send({ number: args[0].toInt32() });
    const op = recv(reply => {
      args[0] = ptr(reply.number);
    });
    op.wait();
  }
});
