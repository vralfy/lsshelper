document.lss_helper.extensions = document.lss_helper.extensions || {};
document.lss_helper.extensions.thw = {
  'NV1': 0,
  'TZ1': 1,
  'GKW1': 4,
  'NV2': 5,
  'TZ2': 6,
  'Raeumen': 2,
  'Water': 3,
  'Dog': 7,
  'Pump': 8,
  'SB': 9,
  'NEA200': 10,
  'TrUL': 12,
  'FueKom': 13,
  'LogV': 14,
  'BrB': 15,
};

Object.entries(document.lss_helper.extensions.thw).forEach(([key, value]) => {
  document.lss_helper['buyTHW' + key + 'Extension'] = (start, end) => document.lss_helper.buyTHWExtension(value, start, end);
  document.lss_helper['makeTHW' + key + 'ExtensionsReady'] = (start, end) => document.lss_helper.makeTHWExtensionReady(value, start, end);
});

document.lss_helper.doAllTHWExtensions = (start, end) => {
  start = start || 0;
  end = end || undefined;
  let buildings = document.lss_helper.buildings.filter(b => ['9'].indexOf(b.type) >= 0).slice(start, end).length;
  Object.values(document.lss_helper.extensions.thw).forEach((value, idx) => {
    setTimeout(() => document.lss_helper.buyTHWExtension(value, start, end), document.lss_helper.extensions_delay * buildings * idx);
    setTimeout(() => document.lss_helper.makeTHWExtensionReady(value, start, end), document.lss_helper.extensions_delay * buildings * idx);
  });
};