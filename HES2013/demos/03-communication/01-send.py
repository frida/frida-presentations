import frida
import sys

process = frida.attach("hello")
session = process._session
script = session.create_script("send(1337);") # try replacing 1337 with an undefined variable to see how errors are propagated
def on_message(message, data):
    print message, data
script.on('message', on_message)
script.load()
sys.stdin.read()
