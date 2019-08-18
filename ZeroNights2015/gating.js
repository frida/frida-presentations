const co = require('co');
const frida = require('frida');

let device;

co(function *() {
  device = yield frida.getUsbDevice();

  device.events.listen('spawned', onSpawned);
  device.enableSpawnGating();

  const pending = yield device.enumeratePendingSpawns();
  pending.forEach(function (spawn, i) {
    console.log('pending[' + i + ']=', spawn, ' Resuming!');
    device.resume(spawn.pid);
  });

  console.log('ready');
})
.catch(function (error) {
  console.error(error.message);
  process.exitCode = 1;
});

function onSpawned(spawn) {
  console.log('onSpawned:', spawn);

  co(function *() {
    const session = yield device.attach(spawn.pid);
    const script = yield session.createScript('(' + agent.toString() + ').call(this);');
    script.events.listen('message', function (message, data) { onMessage(spawn, message, data); });
    yield script.load();
    const exports = yield script.getExports();
    yield exports.init();
    yield device.resume(spawn.pid);
  })
  .catch(function (error) {
    console.error(error.message);
  });
}

function onMessage(spawn, message, data) {
  console.log('onMessage:', spawn, message, data);
}

function agent() {
  "use strict";

  rpc.exports = {
    init: function () {
      Interceptor.attach(Module.findExportByName("UIKit", "UIApplicationMain"), {
        onEnter(args) {
          send("UIApplicationMain");
        }
      });
    }
  };
}

