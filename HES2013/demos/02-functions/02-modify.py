import frida
import sys

process = frida.attach("hello")
session = process._session
script = session.create_script(
"""
Interceptor.attach(ptr("%s"), {
    onEnter: function(args) {
        args[0] = ptr("1337");
    }
});
""" % int(sys.argv[1], 16))
script.load()
sys.stdin.read()
