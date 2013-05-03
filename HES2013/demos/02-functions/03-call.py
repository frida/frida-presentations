import frida
import sys

process = frida.attach("hello")
session = process._session
script = session.create_script(
"""
var f = new NativeFunction(ptr("%s"), 'void', ['int']);
f(1911);
f(1911);
f(1911);
""" % int(sys.argv[1], 16))
script.load()
