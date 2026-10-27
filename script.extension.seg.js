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
  document.lss_helper.extensions.buy['SEG' + key] = (start, end) => document.lss_helper.extensions.buy.SEG(value, start, end);
  document.lss_helper.extensions.makeReady['SEG' + key] = (start, end) => document.lss_helper.extensions.makeReady.SEG(value, start, end);
});

document.lss_helper.extensions.doAllSEGExtensions = (start, end) => {
  start = start || 0;
  end = end || undefined;
  let buildings = document.lss_helper.buildings.filter(b => ['12'].indexOf(b.type) >= 0).slice(start, end).length;
  Object.values(document.lss_helper.extensions.seg).forEach((value, idx) => {
    setTimeout(() => document.lss_helper.extensions.buy.SEG(value, start, end), document.lss_helper.extensions_delay * buildings * idx);
    setTimeout(() => document.lss_helper.extensions.makeReady.SEG(value, start, end), document.lss_helper.extensions_delay * buildings * idx);
  });
};