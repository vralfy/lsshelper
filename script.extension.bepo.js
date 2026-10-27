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

document.lss_helper.extensions.buy = document.lss_helper.extensions.buy || {};
document.lss_helper.extensions.makeReady = document.lss_helper.extensions.makeReady || {};

Object.entries(document.lss_helper.extensions.bepo).forEach(([key, value]) => {
  document.lss_helper.extensions.buy['BEPO' + key] = (start, end) => document.lss_helper.extensions.buy.Bepo(value, start, end);
  document.lss_helper.extensions.makeReady['BEPO' + key] = (start, end) => document.lss_helper.extensions.makeReady.Bepo(value, start, end);
});

Object.entries(document.lss_helper.extensions.bepose).forEach(([key, value]) => {
  document.lss_helper.extensions.buy['BEPOSE' + key] = (start, end) => document.lss_helper.extensions.buy.BepoSE(value, start, end);
  document.lss_helper.extensions.makeReady['BEPOSE' + key] = (start, end) => document.lss_helper.extensions.makeReady.BepoSE(value, start, end);
});

document.lss_helper.extensions.doAllBEPOExtensions = (start, end) => {
  start = start || 0;
  end = end || undefined;
  let buildings = document.lss_helper.buildings.filter(b => ['11'].indexOf(b.type) >= 0).slice(start, end).length;
  Object.values(document.lss_helper.extensions.bepo).forEach((value, idx) => {
    setTimeout(() => document.lss_helper.extensions.buy.Bepo(value, start, end), document.lss_helper.extensions_delay * buildings * idx);
    setTimeout(() => document.lss_helper.extensions.makeReady.Bepo(value, start, end), document.lss_helper.extensions_delay * buildings * idx);
  });
  let buildingsSE = document.lss_helper.buildings.filter(b => ['17'].indexOf(b.type) >= 0).slice(start, end).length;
  Object.values(document.lss_helper.extensions.bepose).forEach((value, idx) => {
    setTimeout(() => document.lss_helper.extensions.buy.BepoSE(value, start, end), document.lss_helper.extensions_delay * buildingsSE * idx);
    setTimeout(() => document.lss_helper.extensions.makeReady.BepoSE(value, start, end), document.lss_helper.extensions_delay * buildingsSE * idx);
  });
};