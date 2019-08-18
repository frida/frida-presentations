var appModules = new ModuleMap(isAppModule);
var seenLocations = {};

Process.enumerateThreadsSync().forEach(function (thread) {
  Stalker.follow(thread.id, {
    transform: function (iterator) {
      var instruction;

      instruction = iterator.next();
      if (!appModules.has(instruction.address)) {
        do {
          iterator.keep();
        } while (iterator.next() !== null);
        return;
      }

      do {
        iterator.keep();

        if (instruction.mnemonic === 'divsd') {
          iterator.putLeaRegRegOffset('xsp', 'xsp', -128);
          iterator.putPushReg('xcx');
          iterator.putPushReg('xdx');

          iterator.putLeaRegRegOffset('xsp', 'xsp', -16);
          iterator.putLeaRegRegOffset('xcx', 'xsp', 0);
          iterator.putLeaRegRegOffset('xdx', 'xsp', 8);

          iterator.putBytes([0xf2, 0x0f, 0x11, 0x01]); // movsd [rcx], xmm0
          iterator.putBytes([0xf2, 0x0f, 0x11, 0x0a]); // movsd [rdx], xmm1

          iterator.putCallout(onDivsd);

          iterator.putLeaRegRegOffset('xsp', 'xsp', 16);

          iterator.putPopReg('xdx');
          iterator.putPopReg('xcx');
          iterator.putLeaRegRegOffset('xsp', 'xsp', 128);
        }
      } while ((instruction = iterator.next()) !== null);
    }
  });
});

function onDivsd (context) {
  var xmm0 = Memory.readDouble(context.rcx);
  var xmm1 = Memory.readDouble(context.rdx);
  console.log('divsd xmm0=' + xmm0 + ' xmm1=' + xmm1);

  var locationId = context.pc.toString();
  if (seenLocations[locationId] === undefined) {
    seenLocations[locationId] = true;
    console.log('\t' + Thread.backtrace(context).map(DebugSymbol.fromAddress).join('\n\t'));
  }
}

function isAppModule (module) {
  return module.path.indexOf('Calculator.app') !== -1;
}
