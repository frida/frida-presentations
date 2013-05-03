#!/usr/bin/env python

import frida
import sys
import threading

m = frida.get_device_manager()

def get_iphone():
    changed = threading.Event()
    def on_changed():
        changed.set()
    m.on('changed', on_changed)

    iphone = None
    while iphone is None:
        iphones = [device for device in m.enumerate_devices() if device.type == 'tether']
        if len(iphones) == 0:
            print "Waiting for iPhone..."
            changed.wait()
        else:
            print "iPhone found!"
            iphone = iphones[0]

    m.off('changed', on_changed)

    return iphone

def replace(process, old, new):
    print "Replacing '%s' with '%s'" % (old, new)
    session = process._session
    source = """
    var addresses = [];
    var pending = 0;
    var deliverResult = function deliverResult() {
        if (pending === 0) {
            send("Patched " + addresses.length + " matches");
        }
    };
    pending++;
    Process.enumerateRanges('rw-', {
        onMatch: function onRangeMatch(address, size, prot) {
            if (prot === 'rw-') {
                pending++;
                Memory.scan(address, size, "%(pattern)s", {
                    onMatch: function onScanMatch(address, size) {
                        addresses.push(address);
                        var replacement = "%(replacement)s";
                        for (var i = 0; i !== replacement.length; i++) {
                            Memory.writeU8(address.add(i), replacement.charCodeAt(i));
                        }
                        Memory.writeU8(address.add(replacement.length), 0);
                    },
                    onError: function onScanError(error) {
                    },
                    onComplete: function onScanComplete() {
                        pending--;
                        deliverResult();
                    }
                });
            }
        },
        onComplete: function onComplete() {
            pending--;
            deliverResult();
        }
    });
    """ % {
        'pattern': (old + "\x00").encode('hex'),
        'replacement': new
    }
    script = session.create_script(source)
    replaced = threading.Event()
    def on_message(message, data):
        print message, data
        replaced.set()
    script.on('message', on_message)
    script.load()
    replaced.wait()


iphone = get_iphone()
process = iphone.attach("Angry Birds")
replace(process, "Highscore", "HES 2013!")
