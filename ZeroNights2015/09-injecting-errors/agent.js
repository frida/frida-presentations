const AF_INET = 2;
const AF_INET6 = 30;
const ECONNREFUSED = 61;

['connect', 'connect$NOCANCEL'].forEach(funcName => {
  const connect = new NativeFunction(
    Module.findExportByName('libsystem_kernel.dylib', funcName),
    'int',
    ['int', 'pointer', 'int']);
  Interceptor.replace(connect, new NativeCallback((socket, address, addressLen) => {
    const family = Memory.readU8(address.add(1));
    if (family == AF_INET || family == AF_INET6) {
      const port = (Memory.readU8(address.add(2)) << 8) | Memory.readU8(address.add(3));

      let ip = '';
      if (family == AF_INET) {
        for (let offset = 4; offset != 8; offset++) {
          if (ip.length > 0)
            ip += '.';
          ip += Memory.readU8(address.add(offset));
        }
      } else {
        for (let offset = 8; offset !== 24; offset += 2) {
          if (ip.length > 0)
            ip += ':';
          ip += toHex(Memory.readU8(address.add(offset))) +
              toHex(Memory.readU8(address.add(offset + 1)));
        }
      }

      console.log('connect() family=' + family + ' ip=' + ip + ' port=' + port);
      if (port === 80 || port === 443 || port === 4070) {
        console.log('  blocking!');
        this.errno = ECONNREFUSED;
        return -1;
      } else {
        console.log('  accepting!');
        return connect(socket, address, addressLen);
      }
    } else {
      return connect(socket, address, addressLen);
    }
  }, 'int', ['int', 'pointer', 'int']));

  send('ready');
});

function toHex(v) {
  let result = v.toString(16);
  if (result.length === 1)
    result = '0' + result;
  return result;
}
