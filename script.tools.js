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
  document.lss_helper.buildings.filter(b => b.type === '0').slice(start, end).forEach((b, idx) => {
    const buildingLink = 'https://www.leitstellenspiel.de/buildings/' + b.id;

    //https://www.leitstellenspiel.de/buildings/23878175/extension_ready/14/23878175

    setTimeout(() => {
      fetch(buildingLink)
        .then((response) => response.text())
        .then((response) => {
          const extensionReadyLink = '/buildings/' + b.id + '/extension_ready/' + extensionId + '/' + b.id;
          const a = Array.from(new DOMParser().parseFromString(response, 'text/html').getElementsByTagName('a'))
            .find(link => link.href.includes(extensionReadyLink));
          console.log(b.name, a.innerHTML.includes('Einsatzbereit') && !a.innerHTML.includes('Nicht Einsatzbereit'));
          if (response.includes(extensionReadyLink) && a.innerHTML.includes('Einsatzbereit') && !a.innerHTML.includes('Nicht Einsatzbereit')) {
            const link = 'https://www.leitstellenspiel.de' + extensionReadyLink;
            fetch(link, header)
              .then((response) => response.text())
              .then((response) => console.warn(b, extensionId))
              .catch((err) => {
                document.lss_helper.error(err);
              });
          }
        })
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

document.lss_helper.makeFirebrigadeExtensionReady = (extensionId, start, end) => document.lss_helper.makeExtensionsReady(extensionId, '0', start, end);
document.lss_helper.makePoliceExtensionReady = (extensionId, start, end) => document.lss_helper.makeExtensionsReady(extensionId, '6', start, end);
document.lss_helper.makeTHWExtensionReady = (extensionId, start, end) => document.lss_helper.makeExtensionsReady(extensionId, '9', start, end);
document.lss_helper.makeSEGExtensionReady = (extensionId, start, end) => document.lss_helper.makeExtensionsReady(extensionId, '12', start, end);

document.lss_helper.makeFirebrigadeNeaExtensionsReady = (extensionId, start, end) => document.lss_helper.makeFirebrigadeExtensionReady(14, start, end);

document.lss_helper.makeGreenVerband = () => {
  document.lss_helper.missions.filter(m => m.finishing && !m.isVerband && m.missionType !== '147').forEach((m, idx) => {
    setTimeout(() => {
      document.lss_helper.makeVerband(m);
    }, idx * 500);
  });
};

document.lss_helper.makeVerband = (mission) => {
  if (!mission || mission.isVerband || mission.missionType === '147') {
    return;
  }

  const url = "/missions/" + mission.missionId + "/alarm";
  const body = {
    //utf8: "",
    authenticity_token: document.lss_helper.authToken,
    next_mission: 0,
    next_mission_id: 0,
    alliance_mission_publish: 1,
    sk: "cr",
    sd: "a",
    ifs: "at_fi",
  };
  console.warn("Making mission " + mission.missionId + " a verband mission.", body);
  fetch(url, { method: 'POST', body: new URLSearchParams(body), headers: { "Content-type": "application/x-www-form-urlencoded; charset=UTF-8" } })
    .then((response) => response.text())
    .then((json) => {
      document.lss_helper.debug(json);
      document.lss_helper.update(-1);
    })
};

// setInterval(() => document.lss_helper.makeGreenVerband(), 10 * 1000);

document.lss_helper.carsWithoutTowingVehicle = (vehicleIds) => {
  vehicleIds = vehicleIds || ['110', '111', '112', '175'];
  const vehiclesToCheck = document.lss_helper.vehicles
    .filter((v) => vehicleIds.includes(v.type));
  console.error('Checking', vehiclesToCheck.length, 'vehicles of types', vehicleIds, 'for towing vehicle');
  vehiclesToCheck
    .forEach((v, idx) => {
      setTimeout(() => {
        const header = { method: 'GET', cache: "no-cache" };
        const url = 'https://www.leitstellenspiel.de/vehicles/' + v.id + '/edit';
        fetch(url, header)
          .then((r) => r.text())
          .then((r) => {
            const checkbox = new DOMParser().parseFromString(r, 'text/html').getElementById('vehicle_tractive_random');
            if (!checkbox) {
              console.error('no checkbox found for vehicle', v, v.building.name);
            } else if (checkbox.checked) {
              if (v.status === '2' || v.status === '6') {
                console.warn('vehicle without towing vehicle', v, v.building.name);
              } else {
                console.error('vehicle without towing vehicle', v, v.building.name);
              }
            }
          })
          .catch((err) => {
            document.lss_helper.error(err);
          });
      }, idx * 500);
    });
};

document.lss_helper.SEGWithoutTowingVehicle = () => document.lss_helper.carsWithoutTowingVehicle(['70', '132', '174', '175']);
document.lss_helper.THWWithoutTowingVehicle = () => document.lss_helper.carsWithoutTowingVehicle(['44', '92', '101', '102', '110', '112', '146', '178']);
document.lss_helper.NEAWithoutTowingVehicle = () => document.lss_helper.carsWithoutTowingVehicle(['110', '111', '112', '175']);