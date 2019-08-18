const co = require('co');
const frida = require('frida');
const load = require('frida-load');

let session, script;
co(function *() {
  session = yield frida.attach(process.argv[2]);
  const source = yield load(
      require.resolve('./agent.js'));
  script = yield session.createScript(source);
  script.events.listen('message', message => {
    if (message.type === 'send') {
      const stanza = message.payload;
      switch (stanza.name) {
        case '+ready':
          console.log('Waiting for application to call recv()...');
          break;
        case '+result': {
          console.log('Results received:');
          const events = stanza.payload.events;
          events.forEach(ev => {
            const location = ev[0];
            const target = ev[1];
            const depth = ev[2];
            let indent = '';
            for (let i = 0; i !== depth; i++)
              indent += '   | ';
            console.log('\t' + indent + location + '\tCALL ' + target);
          });
          session.detach();
          break;
        }
      }
    } else {
      console.log(message);
    }
  });
  yield script.load();
});
