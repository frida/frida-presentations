Dalvik.perform(() => {
  const MainActivity = Dalvik.use(
      're.frida.helloworld.MainActivity');
  MainActivity.isRegistered.implementation = () => {
    console.log('isRegistered() w00t');
    return true;
  };
});
