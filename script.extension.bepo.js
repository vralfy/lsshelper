document.lss_helper.extensions = document.lss_helper.extensions || {};
document.lss_helper.extensions.bepo = {
  'ZUG2': 0,
  'ZUG3': 1,
  'GEFKW': 2,
  'WAWE': 3,
  'SEK1': 4,
  'SEK2': 5,
  'MEK1': 6,
  'MEK2': 7,
  'DOG': 8,
  //'HORSE': 9,
  'LAUKW': 10,
};
document.lss_helper.extensions.bepose = {
  'SEK1': 0,
  'SEK2': 1,
  'MEK1': 2,
  'MEK2': 3,
  'DOG': 4,
};

Object.entries(document.lss_helper.extensions.bepo).forEach(([key, value]) => {
  document.lss_helper['buyBEPO' + key + 'Extension'] = (start, end) => document.lss_helper.buyBepoExtension(value, start, end);
  document.lss_helper['makeBEPO' + key + 'ExtensionsReady'] = (start, end) => document.lss_helper.makeBepoExtensionReady(value, start, end);
});

Object.entries(document.lss_helper.extensions.bepose).forEach(([key, value]) => {
  document.lss_helper['buyBEPOSE' + key + 'Extension'] = (start, end) => document.lss_helper.buyBepoSEExtension(value, start, end);
  document.lss_helper['makeBEPOSE' + key + 'ExtensionsReady'] = (start, end) => document.lss_helper.makeBepoSEExtensionReady(value, start, end);
});

document.lss_helper.doAllBEPOExtensions = (start, end) => {
  let buildings = 0;
  Object.values(document.lss_helper.extensions.bepo).forEach((value, idx) => {
    setTimeout(() => buildings += document.lss_helper.buyBepoExtension(value, start, end), document.lss_helper.extensions_delay * buildings);
    document.lss_helper.makeBepoExtensionReady(value, start, end);
  });
  let buildingsSE = 0;
  Object.values(document.lss_helper.extensions.bepose).forEach((value, idx) => {
    setTimeout(() => buildingsSE += document.lss_helper.buyBepoSEExtension(value, start, end), document.lss_helper.extensions_delay * buildingsSE);
    document.lss_helper.makeBepoSEExtensionReady(value, start, end);
  });
};