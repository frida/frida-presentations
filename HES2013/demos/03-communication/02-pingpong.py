import frida
import sys

process = frida.attach("hello")
session = process._session
script = session.create_script("""
    recv('poke', function onMessage(pokeMessage) { send('pokeBack'); });
""")
def on_message(message, data):
    print message, data
script.on('message', on_message)
script.load()
script.post_message({"type": "poke"})
sys.stdin.read()
