document.lss_helper.autoPatient = (force) => {
  if (!force) {
      setTimeout(() => { document.lss_helper.autoPatient(); }, document.lss_helper.getSetting('autoAcceptInterval', '5000'));
  }
  if (!force && !document.lss_helper.getSetting('autoPatient')) {
      return;
  }
  document.lss_helper.debug('auto patient running');

  const types = ["28", "31", "38", "73", "74"];
  const call = document.lss_helper.vehicles.filter((v) => types.indexOf(v.type) >= 0).filter((v) => v.call).pop();
  if (!call) {
      return;
  }

  const header = { method: 'GET', cache: "no-cache" };
  return fetch('https://www.leitstellenspiel.de/vehicles/' + call.id, header)
      .then((response) => response.text())
      .then((html) => {
          const doc = new DOMParser().parseFromString(html, 'text/html');
          const table = doc.querySelector('table#own-hospitals');
          if (!table) {
              return;
          }
          const button = Array.from(table.querySelectorAll('a.btn:not(.btn-danger):not(.btn-default):not(.btn-xs)')).shift();
          if (button) {
              fetch(button.href, header)
                  .then((response) => response.text())
                  .then((json) => document.lss_helper.debug(json));
              return;
          }

          const table2 = doc.querySelector('table#alliance-hospitals');
          if (!table2) {
              return;
          }
          const button2 = Array.from(table2.querySelectorAll('a.btn:not(.btn-danger):not(.btn-default):not(.btn-xs)')).shift();
          if (button2) {
              fetch(button2.href, header)
                  .then((response) => response.text())
                  .then((json) => {
                      document.lss_helper.debug(json);
                      document.lss_helper.updateLists(-1);
                  });
              return;
          }
      });
};