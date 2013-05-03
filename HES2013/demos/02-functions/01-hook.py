import frida
import sys

process = frida.attach("hello")
session = process._session
script = session.create_script(
"""
Interceptor.attach(ptr("%s"), {
    onEnter: function(args) {
        send(args[0].toInt32());
    }
});
""" % int(sys.argv[1], 16))
def on_message(message, data):
    print message, data
script.on('message', on_message)
script.load()
sys.stdin.read()
