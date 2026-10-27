document.lss_helper.vehicleTools = document.lss_helper.vehicleTools || {};

document.lss_helper.vehicleTools._carsWithoutTowingVehicle = (vehicleIds) => {
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

document.lss_helper.vehicleTools.carsWithoutTowingVehicle = {
  ffw: () => document.lss_helper.vehicleTools._carsWithoutTowingVehicle(['115', '143', '168', '186', '191']),
  seg: () => document.lss_helper.vehicleTools._carsWithoutTowingVehicle(['70', '132', '174', '175']),
  thw: () => document.lss_helper.vehicleTools._carsWithoutTowingVehicle(['44', '92', '101', '102', '110', '112', '146', '178', '183']),
  pol: () => document.lss_helper.vehicleTools._carsWithoutTowingVehicle(['136']),
  brw: () => document.lss_helper.vehicleTools._carsWithoutTowingVehicle(['155']),
  nea: () => document.lss_helper.vehicleTools._carsWithoutTowingVehicle(['110', '111', '112', '175']),
};


document.lss_helper.vehicleTools._labelVehicle = (buildingIds, vehicleTypes, label, ignore_aa0, start, end) => {
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

document.lss_helper.vehicleTools.labelVehicle = {
  boot: (label, start, end) => document.lss_helper.vehicleTools._labelVehicle(['15', '12', '9'], ['70', '66', '67', '68'], label ?? 'BOOT', false, start, end),
  bootdiver: (label, start, end) => document.lss_helper.vehicleTools._labelVehicle(['9'], ['70', '66', '67', '68'], label ?? 'BOOTDIVER', false, start, end),
  dogpol: (label, start, end) => document.lss_helper.vehicleTools._labelVehicle(['11', '17', '6'], ['94'], label ?? 'DOG', false, start, end),
  dogrescue: (label, start, end) => document.lss_helper.vehicleTools._labelVehicle(['2', '12', '9', '21', '25'], ['91', '92', '153'], label ?? 'DOG', false, start, end),
  drohne: (label, start, end) => document.lss_helper.vehicleTools._labelVehicle(['0', '12', '9'], ['126', '128', '129', '127', '125'], label ?? 'DROHNE', false, start, end),
  mek: (label, start, end) => document.lss_helper.vehicleTools._labelVehicle(['11', '17', '6'], ['81', '82'], label ?? 'MEK', false, start, end),
  sek: (label, start, end) => document.lss_helper.vehicleTools._labelVehicle(['11', '17', '6'], ['79', '80'], label ?? 'SEK', false, start, end),
  nea50: (label, start, end) => document.lss_helper.vehicleTools._labelVehicle(['0', '9'], ['111', '179', '110'], label ?? 'NEA50', false, start, end),
  nea200: (label, start, end) => document.lss_helper.vehicleTools._labelVehicle(['0', '9'], ['113', '180', '112'], label ?? 'NEA200', false, start, end),
  wasserrettung: (label, start, end) => document.lss_helper.vehicleTools._labelVehicle(['0', '15', '12'], ['64'], label ?? 'WASSERRETTUNG', false, start, end),
  slf: (label, start, end) => document.lss_helper.vehicleTools._labelVehicle(['0'], ['167', '168', '169'], label ?? 'SLF', true, start, end),
};

document.lss_helper.vehicleTools.getFarMostVehicles = (minDistance = 0) => {
  return document.lss_helper.vehicles.map(v => {
    return {
      ...v,
      distanceToBase: document.lss_helper.helper.getPrintableDistance(v.building, v),
    };
  })
  .filter(v => v.distanceToBase >= minDistance)
  .sort((a, b) => b.distanceToBase - a.distanceToBase);
};

document.lss_helper.vehicleTools.printFarMostVehicles = (minDistance = 0) => document.lss_helper.vehicleTools.getFarMostVehicles(minDistance).forEach(v => {
  document.lss_helper.warn('Vehicle', v.name, 'is', v.distanceToBase.toFixed(2), 'km away from base', v.building.name);
});

document.lss_helper.vehicleTools._getMissingVehicles = (vehicletype, buildingtype, amount) => {
  buildingtype = buildingtype || '0';
  amount = amount || 1;
  return document.lss_helper.buildings.filter(b =>
    b.type === buildingtype && document.lss_helper.vehicles.filter(v => v.building.id === b.id && v.type === vehicletype).length < amount
  )
};

document.lss_helper.vehicleTools.getMissingVehicles = {
  ff: {
    ELWDrohne: (amount) => document.lss_helper.vehicleTools._getMissingVehicles('128', '0', amount ?? 1),
    HLF20: (amount) => document.lss_helper.vehicleTools._getMissingVehicles('30', '0', amount ?? 3),
    Luefter: (amount) => document.lss_helper.vehicleTools._getMissingVehicles('114', '0', amount ?? 1),
    GWTierrrettung: (amount) => document.lss_helper.vehicleTools._getMissingVehicles('185', '0', amount ?? 1),
    HLFSchiene: (amount) => document.lss_helper.vehicleTools._getMissingVehicles('163', '0', amount ?? 1),
  },
  rw: {
    rtw: (amount) => document.lss_helper.vehicleTools._getMissingVehicles('28', '2', amount ?? 6),
    nef: (amount) => document.lss_helper.vehicleTools._getMissingVehicles('29', '2', amount ?? 2),
    ktw: (amount) => document.lss_helper.vehicleTools._getMissingVehicles('38', '2', amount ?? 5),
    lna: (amount) => document.lss_helper.vehicleTools._getMissingVehicles('55', '2', amount ?? 1),
    orgl: (amount) => document.lss_helper.vehicleTools._getMissingVehicles('56', '2', amount ?? 1),
    // grtw: (amount) => document.lss_helper.vehicleTools._getMissingVehicles('73', '2', amount ?? 0),
    naw: (amount) => document.lss_helper.vehicleTools._getMissingVehicles('74', '2', amount ?? 1),
    // itw: (amount) => document.lss_helper.vehicleTools._getMissingVehicles('97', '2', amount ?? 0),
  },
  pol: {
    fustw: (amount) => document.lss_helper.vehicleTools._getMissingVehicles('32', '6', amount ?? 6),
    // gefkw: (amount) => document.lss_helper.vehicleTools._getMissingVehicles('52', '6', amount ?? 0),
    dog: (amount) => document.lss_helper.vehicleTools._getMissingVehicles('94', '6', amount ?? 1),
    bike: (amount) => document.lss_helper.vehicleTools._getMissingVehicles('95', '6', amount ?? 2),
    ziv: (amount) => document.lss_helper.vehicleTools._getMissingVehicles('98', '6', amount ?? 1),
    dgl: (amount) => document.lss_helper.vehicleTools._getMissingVehicles('103', '6', amount ?? 1),
    ap: (amount) => document.lss_helper.vehicleTools._getMissingVehicles('184', '6', amount ?? 2),
  },
  seg: {

  },
  thw: {

  },
};
