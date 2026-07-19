document.lss_helper.extensions = document.lss_helper.extensions || {};
document.lss_helper.extensions.ff = {
  'NEA': 14,
  'NEA200': 15,
  'Luefter': 16,
};

Object.entries(document.lss_helper.extensions.ff).forEach(([key, value]) => {
  document.lss_helper['buyFF' + key + 'Extension'] = (start, end) => document.lss_helper.buyFirebrigadeExtension(value, start, end);
  document.lss_helper['makeFF' + key + 'ExtensionsReady'] = (start, end) => document.lss_helper.makeFirebrigadeExtensionReady(value, start, end);
});