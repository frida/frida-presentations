import frida
import sys

process = frida.attach("hello")
session = process._session
script = session.create_script(
"""
Interceptor.attach(ptr("%s"), {
    onEnter: function(args) {
        send(args[0].toString());
        var op = recv('input', function(value) {
            args[0] = ptr(value.payload);
        });
        op.wait();
    }
});
""" % int(sys.argv[1], 16))
def on_message(message, data):
    print message, data
    val = int(message['payload'], 16)
    script.post_message({'type': 'input', 'payload': str(val * 2)})
script.on('message', on_message)
script.load()
sys.stdin.read()
