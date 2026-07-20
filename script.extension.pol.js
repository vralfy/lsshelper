document.lss_helper.extensions = document.lss_helper.extensions || {};
document.lss_helper.extensions.pol = {
  'DOG': 10,
  'ZIV': 11,
  'DGL': 12,
  'BIKE': 13,
  //'BIG': 14,
  //'GEFKW': 15,
  'AP': 16,
  'CELL01': 0,
  'CELL02': 1,
  'CELL03': 2,
  'CELL04': 3,
  'CELL05': 4,
  'CELL06': 5,
  'CELL07': 6,
  'CELL08': 7,
  'CELL09': 8,
  'CELL10': 9,
};

Object.entries(document.lss_helper.extensions.pol).forEach(([key, value]) => {
  document.lss_helper['buyPOL' + key + 'Extension'] = (start, end) => document.lss_helper.buyPoliceExtension(value, start, end);
  document.lss_helper['makePOL' + key + 'ExtensionsReady'] = (start, end) => document.lss_helper.makePoliceExtensionReady(value, start, end);
});

document.lss_helper.doAllPOLExtensions = (start, end) => {
  start = start || 0;
  end = end || undefined;
  let buildings = document.lss_helper.buildings.filter(b => ['6'].indexOf(b.type) >= 0).slice(start, end).length;
  Object.values(document.lss_helper.extensions.pol).forEach((value, idx) => {
    setTimeout(() => document.lss_helper.buyPoliceExtension(value, start, end), document.lss_helper.extensions_delay * buildings * idx);
    setTimeout(() => document.lss_helper.makePoliceExtensionReady(value, start, end), document.lss_helper.extensions_delay * buildings * idx);
  });
};