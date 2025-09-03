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
  document.lss_helper.buildings.filter(b => b.type === '0').slice(start, end).forEach((b, idx) => {
    const link = 'https://www.leitstellenspiel.de/buildings/' + b.id + '/extension/credits/' + extensionId + '?redirect_building_id=' + b.id;
    console.error(b, link);
    setTimeout(() => {
      fetch(link, header)
        .then((response) => response.text())
        .then((response) => console.warn(b, extensionId))
        .catch((err) => {
          document.lss_helper.error(err);
        });
    }, idx * 1000);
  });
};

document.lss_helper.buyFirebrigadeExtension = (extensionId, start, end) => document.lss_helper.buyExtensions(extensionId, '0', start, end);
document.lss_helper.buyPoliceExtension = (extensionId, start, end) => document.lss_helper.buyExtensions(extensionId, '6', start, end);
document.lss_helper.buyTHWExtension = (extensionId, start, end) => document.lss_helper.buyExtensions(extensionId, '9', start, end);
document.lss_helper.buySEGExtension = (extensionId, start, end) => document.lss_helper.buyExtensions(extensionId, '12', start, end);