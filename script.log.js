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
    document.lss_helper.printSettingsNumberInput('notificationtimeout', 'Notification Timeout');

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

if (!document.lss_helper.notifiedUpdate && (!document.lss_helper.version || document.lss_helper.version != '202601-11-02')) {
  document.lss_helper.notifiedUpdate = true;
  const el = document.lss_helper.info('A new version of LSS-Helper is available! Please update.');
  el.id = 'lss_helper_notify_update' + Date.now();
  el.style.color = 'rgba(0, 0, 0, 0.8)';
  el.style.background = 'rgba(50, 255, 50, 0.8)';
  el.style.border = '1px solid rgba(50, 255, 50, 1)';
  el.style.padding = '10px';
  el.style.pointerEvents = 'auto';
  const btn = document.createElement('a');
  btn.innerHTML = 'Update now';
  btn.style.marginLeft = '10px';
  btn.classList = 'btn btn-default btn-xs';
  btn.href = 'https://github.com/vralfy/lsshelper/raw/refs/heads/' + document.lss_helper.getSetting('channel', '"master"') + '/lsshelper.user.js';
  btn.target = '_blank';
  btn.onclick = () => {
    document.getElementById(el.id)?.remove();
  };
  el.appendChild(btn);
}

if (document.lss_helper_distribution && !document.lss_helper_distribution.notifiedUpdate && (!document.lss_helper_distribution.version || document.lss_helper_distribution.version != '202601-12-01')) {
  document.lss_helper.notifiedUpdate = true;
  const el = document.lss_helper.info('A new version of LSS-Helper Distributionis available! Please update.');
  el.id = 'lss_helper_distributionnotify_update' + Date.now();
  el.style.color = 'rgba(0, 0, 0, 0.8)';
  el.style.background = 'rgba(50, 255, 50, 0.8)';
  el.style.border = '1px solid rgba(50, 255, 50, 1)';
  el.style.padding = '10px';
  el.style.pointerEvents = 'auto';
  const btn = document.createElement('a');
  btn.innerHTML = 'Update now';
  btn.style.marginLeft = '10px';
  btn.classList = 'btn btn-default btn-xs';
  btn.href = 'https://github.com/vralfy/lsshelper/raw/refs/heads/' + document.lss_helper.getSetting('channel', '"master"') + '/lsshelper.distribution.user.js';
  btn.target = '_blank';
  btn.onclick = () => {
    document.getElementById(el.id)?.remove();
  };
  el.appendChild(btn);
}