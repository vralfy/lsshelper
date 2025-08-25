document.lss_helper.printScene = (missionId) => {
  let sceneContainer = document.getElementById('lss_helper_scene');
  if (!sceneContainer) {
    sceneContainer = document.createElement("div");
    sceneContainer.id = 'lss_helper_scene';
    sceneContainer.classList = 'col-sm-12 container-fluid';

    const main = document.lss_helper.getHelperContainer();
    main.appendChild(sceneContainer);
  }
  missionId = missionId || document.lss_helper.missionDetails;
  const mission = document.lss_helper.missions.find((m) => m.data.id === missionId);

  sceneContainer.style = 'display:' + (mission ? 'block' : 'none');
  if (!mission) {
    return;
  }
  sceneContainer.innerHTML = '';

  const row = document.createElement('div');
  row.classList = "row";
  sceneContainer.appendChild(row);

  const send = document.createElement('a');
  send.classList = 'col-sm-6 col-md-3 btn btn-xs btn-default';
  send.innerHTML = '';
  if (mission.unattended) {
    send.innerHTML = '&nbsp;';
    if (document.lss_helper.scenes[mission.missionType]) {
      if (document.lss_helper.getVehiclesByMission(mission, mission.missionType, false)) {
        send.innerHTML = '🚨';
      } else {
        send.innerHTML = '⚠️';
      }
      send.onclick = () => { document.lss_helper.sendByScene(mission, mission.missionType, true) };
    } else {
      send.innerHTML = '?';
    }
  } else {
    send.innerHTML = '✔️';
  }
  row.appendChild(send);

  const title = document.createElement('div');
  title.classList = 'col-sm-6';
  title.innerHTML = mission.data.caption + ' (' + mission.missionType + ')(' + mission.data.id + ')';
  row.appendChild(title);

  const close = document.createElement('div');
  close.innerHTML = 'X';
  close.classList = 'col-sm-6 col-md-3 btn btn-xs btn-default';
  close.onclick = () => {
    document.lss_helper.missionDetails = null;
    document.lss_helper.printScene();
  };
  close.style = 'display:inline-block';
  row.appendChild(close);

  const vehicles = document.createElement('ul');
  row.appendChild(vehicles);
  if (mission.unattended) {
    if (mission.proposedVehicles) {
      const header = document.createElement('li');
      header.innerHTML = 'Verfügbar';
      vehicles.appendChild(header);
      Object.values(mission.proposedVehicles).forEach((p) => {
        const distance = Math.round(p.reduce((a, c) => Math.max(a, c.distance), 0) * 100) / 100;
        const li = document.createElement('li');
        li.innerHTML = document.lss_helper.helper.formatNumber(p.length) + ' x ' + (document.lss_helper.vehicleTypes[p[0]?.type] || p[0]?.name) + ' (' + distance + 'km)';
        vehicles.appendChild(li);
      });
    } else {
      const header = document.createElement('li');
      header.innerHTML = 'Benötigt';
      vehicles.appendChild(header);
      const scene = document.lss_helper.getScene(mission.missionType) ?? {};
      Object.keys(scene).forEach((k) => {
        const li = document.createElement('li');
        let name = k;
        name = (document.lss_helper.vehicleGroups[name] ?? [name])[0] ?? name;
        name = document.lss_helper.vehicleTypes[name] ?? name;
        li.innerHTML = document.lss_helper.helper.formatNumber(scene[k]) + ' x ' + name;
        vehicles.appendChild(li);
      });
    }
  }
};