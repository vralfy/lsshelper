document.lss_helper.makeGreenVerband = () => {
  const ignore = ['147', '613'];
  document.lss_helper.missions.filter(m => m.finishing && !m.isVerband && !ignore.includes(m.missionType)).forEach((m, idx) => {
    setTimeout(() => {
      document.lss_helper.makeVerband(m);
    }, idx * 500);
  });
};

document.lss_helper.makeVerband = (mission) => {
  const ignore = ['147', '613'];
  if (!mission || mission.isVerband || ignore.includes(mission.missionType)) {
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
  document.lss_helper.warn("Making mission " + mission.missionId + " a verband mission.", body);
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
  document.lss_helper.log('Checking', vehiclesToCheck.length, 'vehicles of types', vehicleIds, 'for towing vehicle');
  vehiclesToCheck
    .forEach((v, idx) => {
      setTimeout(() => {
        const header = { method: 'GET', cache: "no-cache" };
        const url = (document.lss_helper.url ?? 'https://www.leitstellenspiel.de') + '/vehicles/' + v.id + '/edit';
        fetch(url, header)
          .then((r) => r.text())
          .then((r) => {
            const checkbox = new DOMParser().parseFromString(r, 'text/html').getElementById('vehicle_tractive_random');
            if (!checkbox) {
              document.lss_helper.error('no checkbox found for vehicle', v, v.building.name);
            } else if (checkbox.checked) {
              if (v.status === '2' || v.status === '6') {
                document.lss_helper.warn('vehicle without towing vehicle', v, v.building.name);
              } else {
                document.lss_helper.error('vehicle without towing vehicle', v, v.building.name);
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

document.lss_helper.labelVehicle = (buildingIds, vehicleTypes, label, ignore_aa0, start, end) => {
  buildingIds = buildingIds || [];
  vehicleTypes = vehicleTypes || [];
  label = label || '';
  ignore_aa0 = !!ignore_aa0 ? 1 : 0;
  start = start || 0;
  end = end || undefined;
  const vehiclesToLabel = document.lss_helper.vehicles
    .filter((v) => buildingIds.includes(v.building.type) && vehicleTypes.includes(v.type))
    .slice(start, end);

  document.lss_helper.log('Labeling', vehiclesToLabel.length, vehiclesToLabel, 'vehicles of types', vehicleTypes, 'in buildings', buildingIds, 'with label', label);
  vehiclesToLabel
    .forEach((v, idx) => {
      setTimeout(() => {
        const header = { method: 'GET', cache: "no-cache" };
        const url = (document.lss_helper.url ?? 'https://www.leitstellenspiel.de') + '/vehicles/' + v.id;
        const postData = {
          _method: 'patch',
          authenticity_token: document.lss_helper.authToken,
          'vehicle[vehicle_type_caption]': label,
          'vehicle[vehicle_type_ignore_default_aao]': ignore_aa0,
        };
        document.lss_helper.log('Labeling vehicle', v, v.building.name, 'with label', label, new URLSearchParams(postData).toString());

        fetch(url, { method: 'POST', body: new URLSearchParams(postData), headers: { "Content-type": "application/x-www-form-urlencoded; charset=UTF-8" } })
          .then((response) => response.text())
          .then((json) => {
            document.lss_helper.debug(json);
            document.lss_helper.update(-1);
            document.lss_helper.warn('Labeled vehicle', v, v.building.name, 'with label', label);
          })
          .catch((err) => {
            document.lss_helper.error(err);
          });
      }, idx * 500);
    });
};

document.lss_helper.labelBOOT = (label, start, end) => document.lss_helper.labelVehicle(['15', '12', '9'], ['70', '66', '67', '68'], label ?? 'BOOT', false, start, end);
document.lss_helper.labelBOOTDIVER = (label, start, end) => document.lss_helper.labelVehicle(['9'], ['70', '66', '67', '68'], label ?? 'BOOTDIVER', false, start, end);
document.lss_helper.labelDOGPOL = (label, start, end) => document.lss_helper.labelVehicle(['11', '17', '6'], ['94'], label ?? 'DOG', false, start, end);
document.lss_helper.labelDOGRESCUE = (label, start, end) => document.lss_helper.labelVehicle(['2', '12', '9'], ['91', '92'], label ?? 'DOG', false, start, end);
document.lss_helper.labelDROHNE = (label, start, end) => document.lss_helper.labelVehicle(['0', '12', '9'], ['126', '128', '129', '127', '125'], label ?? 'DROHNE', false, start, end);
document.lss_helper.labelMEK = (label, start, end) => document.lss_helper.labelVehicle(['11', '17', '6'], ['81', '82'], label ?? 'MEK', false, start, end);
document.lss_helper.labelSEK = (label, start, end) => document.lss_helper.labelVehicle(['11', '17', '6'], ['79', '80'], label ?? 'SEK', false, start, end);
document.lss_helper.labelNEA50 = (label, start, end) => document.lss_helper.labelVehicle(['0', '9'], ['111', '179', '110'], label ?? 'NEA50', false, start, end);
document.lss_helper.labelNEA200 = (label, start, end) => document.lss_helper.labelVehicle(['0', '9'], ['113', '180', '112'], label ?? 'NEA200', false, start, end);
document.lss_helper.labelWasserrettung = (label, start, end) => document.lss_helper.labelVehicle(['0', '15', '12'], ['64'], label ?? 'WASSERRETTUNG', false, start, end);
document.lss_helper.labelSLF = (label, start, end) => document.lss_helper.labelVehicle(['0'], ['167', '168', '169'], label ?? 'SLF', true, start, end);

document.lss_helper.getFarMostVehicles = (minDistance = 0) => {
  return document.lss_helper.vehicles.map(v => {
    return {
      ...v,
      distanceToBase: document.lss_helper.helper.getDistance(v.building, v) * (document.lss_helper.kmperdegree || 1),
    };
  })
  .filter(v => v.distanceToBase >= minDistance)
  .sort((a, b) => b.distanceToBase - a.distanceToBase);
};

document.lss_helper.printFarMostVehicles = (minDistance = 0) => document.lss_helper.getFarMostVehicles(minDistance).forEach(v => {
  document.lss_helper.warn('Vehicle', v.name, 'is', v.distanceToBase.toFixed(2), 'km away from base', v.building.name);
});

document.lss_helper.getMissingVehicles = (vehicletype, buildingtype, amount) => {
  buildingtype = buildingtype || '0';
  amount = amount || 1;
  return document.lss_helper.buildings.filter(b =>
    b.type === buildingtype && document.lss_helper.vehicles.filter(v => v.building.id === b.id && v.type === vehicletype).length < amount
  )
};

document.lss_helper.getMissingELWDrohne = () => document.lss_helper.getMissingVehicles('128', '0', 1);
document.lss_helper.getMissingHLF20 = () => document.lss_helper.getMissingVehicles('30', '0', 3);
document.lss_helper.getMissingLuefter = () => document.lss_helper.getMissingVehicles('114', '0', 1);