document.lss_helper.extensions = document.lss_helper.extensions || {};
document.lss_helper.extensions.seg = {
  'Sani': 1,
  'Water': 2,
  'Dog': 3,
  'Drone': 4,
  'Bt': 5,
  'TeSi': 6,
};

Object.entries(document.lss_helper.extensions.seg).forEach(([key, value]) => {
  document.lss_helper['buySEG' + key + 'Extension'] = (start, end) => document.lss_helper.buySEGExtension(value, start, end);
  document.lss_helper['makeSEG' + key + 'ExtensionsReady'] = (start, end) => document.lss_helper.makeSEGExtensionReady(value, start, end);
});

document.lss_helper.doAllSEGExtensions = (start, end) => {
  start = start || 0;
  end = end || undefined;
  let buildings = document.lss_helper.buildings.filter(b => ['12'].indexOf(b.type) >= 0).slice(start, end).length;
  Object.values(document.lss_helper.extensions.seg).forEach((value, idx) => {
    setTimeout(() => document.lss_helper.buySEGExtension(value, start, end), document.lss_helper.extensions_delay * buildings * idx);
    setTimeout(() => document.lss_helper.makeSEGExtensionReady(value, start, end), document.lss_helper.extensions_delay * buildings * idx);
  });
};