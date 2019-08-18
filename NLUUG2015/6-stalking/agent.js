const WAITING = 1;
const STALKING = 2;
const COLLECTING = 3;
const DONE = 4;

let state = WAITING;
let stalkedThreadId = null;
let blobs = [];

['recv', 'recv$NOCANCEL'].forEach(funcName => {
  Interceptor.attach(Module.findExportByName('libsystem_c.dylib', funcName), {
    onEnter: args => {
      if (state === STALKING && this.threadId === stalkedThreadId) {
        state = COLLECTING;
        Stalker.unfollow();
      }
    },
    onLeave: retval => {
      if (state === WAITING) {
        state = STALKING;
        stalkedThreadId = this.threadId;
        Stalker.follow({
          events: {
            call: true
          },
          onReceive: events => {
            blobs.push(events);
            if (state === COLLECTING) {
              sendResult();
              state = DONE;
            }
          }
        });
      }
    }
  });
});

send({
  name: '+ready'
});

function sendResult() {
  const events = blobs.reduce((result, blob) => {
    const cursor = {
      data: blob,
      offset: 0
    };
    let e;
    while ((e = nextEvent(cursor))) {
      result.push(e);
    }

    return result;
  }, []);
  send({
    name: '+result',
    payload: {
      events: events
    }
  });
}

function nextEvent(cursor) {
  // FIXME: 32-bit support
  const data = cursor.data;
  if (cursor.offset === data.length)
    return null;
  skipEventType(cursor);
  const location = readPointer(cursor);
  const target = readPointer(cursor);
  const depth = readDepth(cursor);
  return [location, target, depth];
}

function skipEventType(cursor) {
  cursor.offset += 8;
}

function readPointer(cursor) {
  const data = cursor.data;
  const offset = cursor.offset;
  cursor.offset += 8;
  return ptr('0x' +
      data[offset + 7].toString(16) +
      data[offset + 6].toString(16) +
      data[offset + 5].toString(16) +
      data[offset + 4].toString(16) +
      data[offset + 3].toString(16) +
      data[offset + 2].toString(16) +
      data[offset + 1].toString(16) +
      data[offset + 0].toString(16));
}

function readDepth(cursor) {
  const data = cursor.data;
  const offset = cursor.offset;
  cursor.offset += 8;
  // FIXME: sign extend
  return (data[offset + 3] << 24) |
      (data[offset + 2] << 16) |
      (data[offset + 1] << 8) |
      (data[offset + 0] << 0);
}
