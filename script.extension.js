document.lss_helper.extensions_delay = document.lss_helper.extensions_delay || 1000;
document.lss_helper.extensions = document.lss_helper.extensions || {};

document.lss_helper.extensions._buyExtensions = (extensionId, buildingType, start, end) => {
  const header = {
    method: 'POST',
    cache: "no-cache",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({_method: 'post', authenticity_token: document.lss_helper.authToken})
  };
  buildingType = buildingType || '0';
  start = start || 0;
  end = end || undefined;
  const buildings = document.lss_helper.buildings.filter(b => b.type === buildingType).slice(start, end);
  buildings.forEach((b, idx) => {
    const link = (document.lss_helper.url ?? 'https://www.leitstellenspiel.de') + '/buildings/' + b.id + '/extension/credits/' + extensionId + '?redirect_building_id=' + b.id;
    setTimeout(() => {
      document.lss_helper.log('try to buy extension', extensionId, 'for building', b, '=>', link);
      fetch(link, header)
        .then((response) => response.text())
        .then((_response) => document.lss_helper.warn('buyed extension', extensionId, 'for building', b))
        .catch((err) => {
          document.lss_helper.error('unable to buy extension', extensionId, 'for building', b, '=>', err);
        });
    }, idx * document.lss_helper.extensions_delay);
  });
  return buildings.length;
};

document.lss_helper.extensions._makeExtensionsReady = (extensionId, buildingType, start, end) => {
  const header = {
    method: 'POST',
    cache: "no-cache",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({_method: 'post', authenticity_token: document.lss_helper.authToken})
  };
  buildingType = buildingType || '0';
  start = start || 0;
  end = end || undefined;
  const buildings = document.lss_helper.buildings.filter(b => b.type === buildingType).slice(start, end)
  buildings.forEach((b, idx) => {
    //https://www.leitstellenspiel.de/buildings/23878175/extension_ready/14/23878175
    setTimeout(() => {
      const buildingLink = (document.lss_helper.url ?? 'https://www.leitstellenspiel.de') + '/buildings/' + b.id;
      document.lss_helper.log('try to activate extension', extensionId, 'for building', b, '=>', buildingLink);
      fetch(buildingLink)
        .then((response) => response.text())
        .then((response) => {
          const extensionReadyLink = '/buildings/' + b.id + '/extension_ready/' + extensionId + '/' + b.id;
          const a = Array.from(new DOMParser().parseFromString(response, 'text/html').getElementsByTagName('a'))
            .find(link => link.href.includes(extensionReadyLink));
          if (!a) {
            document.lss_helper.error('unable to activate extension', extensionId, 'for building', b, '=>', 'no link present');
            return;
          }
          const activate = a.innerHTML.includes('Einsatzbereit') && !a.innerHTML.includes('Nicht Einsatzbereit');
          //document.lss_helper.log(b.name, activate);
          if (response.includes(extensionReadyLink) && activate) {
            const link = (document.lss_helper.url ?? 'https://www.leitstellenspiel.de') + extensionReadyLink;
            fetch(link, header)
              .then((response) => response.text())
              .then((_response) => document.lss_helper.warn('extension ready', extensionId, 'for building', b))
              .catch((err) => {
                document.lss_helper.error('unable to activate extension', extensionId, 'for building', b, '=>', err);
              });
          } else {
            document.lss_helper.warn('extension already activated', extensionId, 'for building', b);
          }
        })
        .catch((err) => {
          document.lss_helper.error('unable to activate extension', extensionId, 'for building', b, '=>', err);
        });
    }, idx * document.lss_helper.extensions_delay);
  });
  return buildings.length;
};

document.lss_helper.extensions.buy = {
  ...document.lss_helper.buy ??  {},
  Firebrigade: (extensionId, start, end) => document.lss_helper.extensions._buyExtensions(extensionId, '0', start, end),
  Police: (extensionId, start, end) => document.lss_helper.extensions._buyExtensions(extensionId, '6', start, end),
  Bepo: (extensionId, start, end) => document.lss_helper.extensions._buyExtensions(extensionId, '11', start, end),
  BepoSE: (extensionId, start, end) => document.lss_helper.extensions._buyExtensions(extensionId, '17', start, end),
  THW: (extensionId, start, end) => document.lss_helper.extensions._buyExtensions(extensionId, '9', start, end),
  SEG: (extensionId, start, end) => document.lss_helper.extensions._buyExtensions(extensionId, '12', start, end),
};

document.lss_helper.extensions.makeReady = {
  ...document.lss_helper.makeReady ?? {},
  Firebrigade: (extensionId, start, end) => document.lss_helper.makeFirebrigadeExtensionReady(extensionId, start, end),
  Police: (extensionId, start, end) => document.lss_helper.makePoliceExtensionReady(extensionId, start, end),
  Bepo: (extensionId, start, end) => document.lss_helper.makeBepoExtensionReady(extensionId, start, end),
  BepoSE: (extensionId, start, end) => document.lss_helper.makeBepoSEExtensionReady(extensionId, start, end),
  THW: (extensionId, start, end) => document.lss_helper.makeTHWExtensionReady(extensionId, start, end),
  SEG: (extensionId, start, end) => document.lss_helper.makeSEGExtensionReady(extensionId, start, end),
};

document.lss_helper.extensions.doAllBuildings = (start, end) => {
  document.lss_helper.extensions.doAllBEPOExtensions(start, end);
  document.lss_helper.extensions.doAllStandardFFExtensions(start, end);
  document.lss_helper.extensions.doAllPOLExtensions(start, end);
  document.lss_helper.extensions.doAllSEGExtensions(start, end);
  document.lss_helper.extensions.doAllTHWExtensions(start, end);
};