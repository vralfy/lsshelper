document.lss_helper.extensions = document.lss_helper.extensions || {};
document.lss_helper.extensions.ffstandard = {
  'NEA': 14,
  'Luefter': 16,
};
document.lss_helper.extensions.ff = {
  ...document.lss_helper.extensions.ffstandard,
  'NEA200': 15,
};

Object.entries(document.lss_helper.extensions.ff).forEach(([key, value]) => {
  document.lss_helper['buyFF' + key + 'Extension'] = (start, end) => document.lss_helper.buyFirebrigadeExtension(value, start, end);
  document.lss_helper['makeFF' + key + 'ExtensionsReady'] = (start, end) => document.lss_helper.makeFirebrigadeExtensionReady(value, start, end);
});

document.lss_helper.doAllFFExtensions = (start, end) => {
  Object.values(document.lss_helper.extensions.ff).forEach((value) => {
    document.lss_helper.buyFirebrigadeExtension(value, start, end);
    document.lss_helper.makeFirebrigadeExtensionReady(value, start, end);
  });
};

document.lss_helper.doStandardFFExtensions = (start, end) => {
  Object.values(document.lss_helper.extensions.ffstandard).forEach((value) => {
    document.lss_helper.buyFirebrigadeExtension(value, start, end);
    document.lss_helper.makeFirebrigadeExtensionReady(value, start, end);
  });
};