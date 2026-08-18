document.lss_helper.extensions = document.lss_helper.extensions || {};
document.lss_helper.extensions.ffstandard = {
  'NEA': 14,
  'Luefter': 16,
  'Animal': 29,
  'Anh1': 20,
  'Anh2': 21,
  'AB1': 1,
  'DRONE': 18,
  'Bt': 19,
  'Train': 25,
};
document.lss_helper.extensions.ff = {
  ...document.lss_helper.extensions.ffstandard,
  'RTW': 0,
  'WASSER': 6,
  'AIRPORT': 8,
  'WERK': 13,
  'NEA200': 15,
  //'Big': 9,
  'AB2': 2,
  'AB3': 3,
  'AB4': 4,
  'AB5': 5,
  'AB6': 7,
  'AB7': 10,
  'AB8': 11,
  'AB9': 12,
  'AB10': 17,
  'AB11': 26,
  'AB12': 27,
  'AB13': 28,
  'Anh3': 22,
  'Anh4': 23,
  'Anh5': 24,
};

Object.entries(document.lss_helper.extensions.ff).forEach(([key, value]) => {
  document.lss_helper['buyFF' + key + 'Extension'] = (start, end) => document.lss_helper.buyFirebrigadeExtension(value, start, end);
  document.lss_helper['makeFF' + key + 'ExtensionsReady'] = (start, end) => document.lss_helper.makeFirebrigadeExtensionReady(value, start, end);
});

document.lss_helper.doAllFFExtensions = (start, end) => {
  start = start || 0;
  end = end || undefined;
  let buildings = document.lss_helper.buildings.filter(b => ['0'].indexOf(b.type) >= 0).slice(start, end).length;
  Object.values(document.lss_helper.extensions.ff).forEach((value, idx) => {
    setTimeout(() => document.lss_helper.buyFirebrigadeExtension(value, start, end), document.lss_helper.extensions_delay * buildings * idx);
    setTimeout(() => document.lss_helper.makeFirebrigadeExtensionReady(value, start, end), document.lss_helper.extensions_delay * buildings * idx);
  });
};

document.lss_helper.doAllStandardFFExtensions = (start, end) => {
  start = start || 0;
  end = end || undefined;
  let buildings = document.lss_helper.buildings.filter(b => ['0'].indexOf(b.type) >= 0).slice(start, end).length;
  Object.values(document.lss_helper.extensions.ffstandard).forEach((value, idx) => {
    setTimeout(() => document.lss_helper.buyFirebrigadeExtension(value, start, end), document.lss_helper.extensions_delay * buildings * idx);
    setTimeout(() => document.lss_helper.makeFirebrigadeExtensionReady(value, start, end), document.lss_helper.extensions_delay * buildings * idx);
  });
};