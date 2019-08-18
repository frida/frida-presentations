const LSApplicationWorkspace = ObjC.classes.LSApplicationWorkspace;

const onProgress = new ObjC.Block({
  retType: 'void',
  argTypes: ['object'],
  implementation: (progress) => {
    console.log('onProgress: ' + progress);
  }
});

function uninstall(appId) {
  const workspace = LSApplicationWorkspace.defaultWorkspace();
  return workspace.uninstallApplication_withOptions_usingBlock_(appId, null, onProgress);
}
