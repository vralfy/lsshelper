document.lss_helper.extensions = document.lss_helper.extensions || {};
document.lss_helper.extensions.pol = {
  'DOG': 10,
  'ZIV': 11,
  'DGL': 12,
  'BIKE': 13,
  'AP': 16,
};

Object.entries(document.lss_helper.extensions.pol).forEach(([key, value]) => {
  document.lss_helper['buyPOL' + key + 'Extension'] = (start, end) => document.lss_helper.buyPoliceExtension(value, start, end);
  document.lss_helper['makePOL' + key + 'ExtensionsReady'] = (start, end) => document.lss_helper.makePoliceExtensionReady(value, start, end);
});

document.lss_helper.doAllPOLExtensions = (start, end) => {
  Object.values(document.lss_helper.extensions.pol).forEach((value) => {
    document.lss_helper.buyPoliceExtension(value, start, end);
    document.lss_helper.makePoliceExtensionReady(value, start, end);
  });
};