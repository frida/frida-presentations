function stats() {
  // console.log('App has ' + Object.keys(ObjC.classes).length + ' classes loaded!');
  console.log(Process.enumerateModulesSync()[0].name + ' has ' + Object.keys(ObjC.classes).length + ' classes loaded!');
}

console.log('Agent running on ' + Process.platform + '/' + Process.arch);
