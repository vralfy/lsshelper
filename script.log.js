document.lss_helper.debug = (...args) => {
  if (document.lss_helper.getSetting('loglevel', '550') >= 700) {
      console.debug('[🐛 LSS Helper]', ...args);
  }
};

document.lss_helper.log = (...args) => {
  if (document.lss_helper.getSetting('loglevel', '550') >= 600) {
      console.log('[ℹ️ LSS Helper]', ...args);
  }
};

document.lss_helper.warn = (...args) => {
  if (document.lss_helper.getSetting('loglevel', '550') >= 500) {
      console.warn('[⚠️ LSS Helper]', ...args);
  }
};

document.lss_helper.error = (...args) => {
  if (document.lss_helper.getSetting('loglevel', '550') >= 400) {
      console.error('[❌ LSS Helper]', ...args);
  }
};