document.lss_helper_versions = {
  'lss_helper': {
    name: 'LSS-Helper',
    version: '202601-12-01',
    file: 'lsshelper.user.js',
  },
  'lss_helper_distribution': {
    name: 'LSS-Helper Distribution',
    version: '202601-13-01',
    file: 'lsshelper.distribution.user.js',
  },
  'lss_helper_easteregg': {
    name: 'LSS-Helper Easter Egg',
    version: '202601-12-02',
    file: 'lsshelper.easteregg.user.js',
  },
  'lss_helper_directsend': {
    name: 'LSS-Helper Direct Send Fix',
    version: '202508-29-01',
    file: 'lsshelper.directsend.user.js',
  },
};

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

document.lss_helper.info = (...args) => {
  let notifyContainer = document.getElementById("lss_helper_notify_container");
  if (!notifyContainer) {
    document.lss_helper.setDefaultSetting('notificationtimeout', '5000');

    notifyContainer = document.createElement("div");
    notifyContainer.id = "lss_helper_notify_container";
    notifyContainer.style.position = "fixed";
    notifyContainer.style.top = "50px";
    notifyContainer.style.left = "20px";
    // notifyContainer.style.right = "20px";
    notifyContainer.style.zIndex = "9999";
    notifyContainer.style.background = 'rgba(255, 50, 50, 0.8)';
    notifyContainer.style.border = '1px solid rgba(255, 50, 50, 1)';
    notifyContainer.style.borderRadius = '5px';
    notifyContainer.style.padding = '10px';
    notifyContainer.style.display = "flex";
    notifyContainer.style.flexDirection = "column";
    notifyContainer.style.alignItems = "center";
    notifyContainer.style.justifyContent = "center";
    notifyContainer.style.pointerEvents = "none";
    notifyContainer.style.fontSize = "14px";
    notifyContainer.style.lineHeight = "1.5";
    notifyContainer.style.fontWeight = "bolder";

    document.body.appendChild(notifyContainer);
  }

  const id = "lss_helper_notify_" + Date.now();
  let msg = document.createElement("div");
  msg.className = "lss_helper_notify";
  msg.id = id;
  msg.innerHTML = args.map(arg => {
    if (typeof arg === 'string' || typeof arg === 'number') {
      return arg;
    }
    return JSON.stringify(arg)
  }).join(" ");
  notifyContainer.appendChild(msg);
  setTimeout(() => {
    document.getElementById(id)?.remove();
    const n = document.getElementById("lss_helper_notify_container")
    if (!n.childElementCount) {
      n.remove();
    }
  }, document.lss_helper.getSetting('notificationtimeout', '5000') || 5000);
  return msg;
};

document.lss_helper.notifactionSettingsInterval = document.lss_helper.notifactionSettingsInterval ??
  setInterval(() => {
    document.lss_helper.printSettingsDivider('Notifications');
    document.lss_helper.printSettingsNumberInput('notificationtimeout', 'Notification Timeout');
  }, document.lss_helper.getSetting('updateInterval', '1000'));

Object.keys(document.lss_helper_versions).forEach((key) => {
  const script = document[key];
  if (script && !script.notifiedUpdate && (!script.version || script.version != document.lss_helper_versions[key].version)) {
    script.notifiedUpdate = true;
    const el = document.lss_helper.info('A new version of ' + document.lss_helper_versions[key].name + ' is available! Please update.');
    el.id = key + '_notify_update' + Date.now();
    el.style.color = 'rgba(0, 0, 0, 0.8)';
    el.style.background = 'rgba(50, 255, 50, 0.8)';
    el.style.border = '1px solid rgba(50, 255, 50, 1)';
    el.style.padding = '10px';
    el.style.pointerEvents = 'auto';
    const btn = document.createElement('a');
    btn.innerHTML = 'Update now';
    btn.style.marginLeft = '10px';
    btn.classList = 'btn btn-default btn-xs';
    btn.href = 'https://github.com/vralfy/lsshelper/raw/refs/heads/' + document.lss_helper.getSetting('channel', '"master"') + '/' + document.lss_helper_versions[key].file;
    btn.target = '_blank';
    btn.onclick = () => {
      document.getElementById(el.id)?.remove();
    };
    el.appendChild(btn);
  }
});
