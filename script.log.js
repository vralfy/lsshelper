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
  msg.innerHTML = args.map(arg => JSON.stringify(arg)).join(" ");
  notifyContainer.appendChild(msg);
  setTimeout(() => {
    document.getElementById(id)?.remove();
    const n = document.getElementById("lss_helper_notify_container")
    if (!n.childElementCount) {
      n.remove();
    }
  }, document.lss_helper.getSetting('notificationtimeout', '5000'));
  return msg;
};