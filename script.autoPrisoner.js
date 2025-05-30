document.lss_helper.autoPrisoner = (force) => {
  if (!force) {
      setTimeout(() => { document.lss_helper.autoPrisoner(); }, document.lss_helper.getSetting('autoAcceptInterval', '5000'));
  }
  if (!force && !document.lss_helper.getSetting('autoPrisoner')) {
      return;
  }
  document.lss_helper.debug('auto prisoner running');

  const types = ["32"];
  const call = document.lss_helper.vehicles.filter((v) => types.indexOf(v.type) >= 0).filter((v) => v.call).pop();

  if (!call) {
      return;
  }

  const header = { method: 'GET', cache: "no-cache" };
  return fetch('https://www.leitstellenspiel.de/vehicles/' + call.id, header)
      .then((response) => response.text())
      .then((html) => html.split("\n").filter((l) => l.includes('_prisons.push(')).join(''))
      .then((html) => {
          const erb_prisons = [];
          const erb_alliance_prisons = [];
          eval(html);

          const prisons = [...erb_prisons, ...erb_alliance_prisons].filter((p) => p.free_cells !== '0');
          if (prisons.length) {
              const prison = prisons[0];
              const url = 'https://www.leitstellenspiel.de/vehicles/' + call.id + '/gefangener/' + prison.id + '?load_all_prisons=true&show_only_available=false';
              fetch(url)
                  .then((resp) => resp.text())
                  .then((resp) => {
                      document.lss_helper.debug(resp);
                      document.lss_helper.updateLists(-1);
                  });
          }

      });
};