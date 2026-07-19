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