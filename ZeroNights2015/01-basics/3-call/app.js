const co = require('co');
const frida = require('frida');
const load = require('frida-load');

let session, script;
co(function *() {
  session = yield frida.attach('hello');
  const source = yield load(
      require.resolve('./agent.js'));
  script = yield session.createScript(source);
  yield script.load();
});
