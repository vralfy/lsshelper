document.lss_helper.extensions_delay = document.lss_helper.extensions_delay || 2000;
document.lss_helper.buyExtensions = (extensionId, buildingType, start, end) => {
  const header = {
    method: 'POST',
    cache: "no-cache",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: encodeURI('_method=post&authenticity_token=' + document.lss_helper.authToken)
  };
  buildingType = buildingType || '0';
  start = start || 0;
  end = end || undefined;
  const buildings = document.lss_helper.buildings.filter(b => b.type === buildingType).slice(start, end);
  buildings.forEach((b, idx) => {
    const link = 'https://www.leitstellenspiel.de/buildings/' + b.id + '/extension/credits/' + extensionId + '?redirect_building_id=' + b.id;
    //console.error(b, link);
    setTimeout(() => {
      fetch(link, header)
        .then((response) => response.text())
        .then((response) => console.warn(b, extensionId))
        .catch((err) => {
          document.lss_helper.error(err);
        });
    }, idx * document.lss_helper.extensions_delay);
  });
  return buildings.length;
};

document.lss_helper.makeExtensionsReady = (extensionId, buildingType, start, end) => {
  const header = {
    method: 'POST',
    cache: "no-cache",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: encodeURI('_method=post&authenticity_token=' + document.lss_helper.authToken)
  };
  buildingType = buildingType || '0';
  start = start || 0;
  end = end || undefined;
  const buildings = document.lss_helper.buildings.filter(b => b.type === buildingType).slice(start, end)
  buildings.forEach((b, idx) => {
    const buildingLink = 'https://www.leitstellenspiel.de/buildings/' + b.id;

    //https://www.leitstellenspiel.de/buildings/23878175/extension_ready/14/23878175

    setTimeout(() => {
      fetch(buildingLink)
        .then((response) => response.text())
        .then((response) => {
          const extensionReadyLink = '/buildings/' + b.id + '/extension_ready/' + extensionId + '/' + b.id;
          const a = Array.from(new DOMParser().parseFromString(response, 'text/html').getElementsByTagName('a'))
            .find(link => link.href.includes(extensionReadyLink));
          const activate = a.innerHTML.includes('Einsatzbereit') && !a.innerHTML.includes('Nicht Einsatzbereit');
          //console.log(b.name, activate);
          if (response.includes(extensionReadyLink) && activate) {
            const link = 'https://www.leitstellenspiel.de' + extensionReadyLink;
            fetch(link, header)
              .then((response) => response.text())
              .then((response) => console.warn(b, extensionId, 'ready'))
              .catch((err) => {
                document.lss_helper.error(err);
              });
          } else {
            console.warn(b, extensionId, 'ready');
          }
        })
        .catch((err) => {
          document.lss_helper.error(err);
        });
    }, idx * document.lss_helper.extensions_delay);
  });
  return buildings.length;
};

document.lss_helper.buyFirebrigadeExtension = (extensionId, start, end) => document.lss_helper.buyExtensions(extensionId, '0', start, end);
document.lss_helper.buyPoliceExtension = (extensionId, start, end) => document.lss_helper.buyExtensions(extensionId, '6', start, end);
document.lss_helper.buyBepoExtension = (extensionId, start, end) => document.lss_helper.buyExtensions(extensionId, '11', start, end);
document.lss_helper.buyBepoSEExtension = (extensionId, start, end) => document.lss_helper.buyExtensions(extensionId, '17', start, end);
document.lss_helper.buyTHWExtension = (extensionId, start, end) => document.lss_helper.buyExtensions(extensionId, '9', start, end);
document.lss_helper.buySEGExtension = (extensionId, start, end) => document.lss_helper.buyExtensions(extensionId, '12', start, end);

document.lss_helper.makeFirebrigadeExtensionReady = (extensionId, start, end) => document.lss_helper.makeExtensionsReady(extensionId, '0', start, end);
document.lss_helper.makePoliceExtensionReady = (extensionId, start, end) => document.lss_helper.makeExtensionsReady(extensionId, '6', start, end);
document.lss_helper.makeBepoExtensionReady = (extensionId, start, end) => document.lss_helper.makeExtensionsReady(extensionId, '11', start, end);
document.lss_helper.makeBepoSEExtensionReady = (extensionId, start, end) => document.lss_helper.makeExtensionsReady(extensionId, '17', start, end);
document.lss_helper.makeTHWExtensionReady = (extensionId, start, end) => document.lss_helper.makeExtensionsReady(extensionId, '9', start, end);
document.lss_helper.makeSEGExtensionReady = (extensionId, start, end) => document.lss_helper.makeExtensionsReady(extensionId, '12', start, end);
