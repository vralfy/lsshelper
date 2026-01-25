document.lss_helper.getScene = (scene, debug) => {
  if (!document.lss_helper.scenes[scene]) {
    return null;
  }
  scene = JSON.parse(JSON.stringify(document.lss_helper.scenes[scene]));

  return document.lss_helper.addAAOtoScene(scene, debug);
};

document.lss_helper.addAAOtoScene = (scene, debug) => {
  if (debug) {
    scene = { ...scene, "AAODEBUG": 2 };
  }
  const aao = Object.keys(scene)
    .filter(k => document.lss_helper.vehicleAAO[k])
    .map(k => ({ amount: scene[k], aao: document.lss_helper.vehicleAAO[k] }));
  aao.forEach(aao => {
    Object.keys(aao.aao).forEach((v) => { scene[v] = (scene[v] || 0) + aao.amount * aao.aao[v]; });
  });
  Object.keys(scene)
    .filter(k => document.lss_helper.vehicleAAO[k])
    .forEach(k => delete scene[k]);

  if (debug) {
    document.lss_helper.debug(scene, aao);
  }

  return scene;
};

document.lss_helper.getVehiclesByScene = (mission, scene, noFillOrKill, debug) => {
  mission = mission || {};
  mission.missing = {};
  let nonReplaceable = [];
  const vehicleCounts = {};
  const sortKey = 'time';

  document.lss_helper.vehicleIgnoreDistance = document.lss_helper.vehicleIgnoreDistance ?? [];
  document.lss_helper.vehicleMultiplyDistance = document.lss_helper.vehicleMultiplyDistance ?? {};

  if (document.lss_helper.getSetting('optimize_scene')) {
    let available = document.lss_helper.vehicles
      .filter((v) => v.available)
      .map((v) => {
        if (document.lss_helper.vehicleIgnoreDistance.indexOf(v.type) >= 0) {
          return {
            distance: 0,
            time: 0,
            ...v,
          };
        }
        const mult = document.lss_helper.vehicleMultiplyDistance[v.type] ?? 1;
        return {
          distance: mult * document.lss_helper.helper.getDistance(mission, v),
          time: mult * vehicleDistanceDirectTimeToObject(20, mission.lat, mission.lng, v.lat, v.lng, true),
          ...v,
        };
      })
      .sort((v1, v2) => {
        return v1[sortKey] - v2[sortKey];
      });
    const preVehicles = Object.keys(scene).map((vt) => {
      const groups = (document.lss_helper.vehicleGroups[vt] ?? [vt]).map((v) => '' + v);
      const r = available.filter((v) => groups.indexOf(v.type) >= 0).slice(0, scene[vt]);
      const ids = r.map(v => v.id);
      available = available.filter((v) => ids.indexOf(v.id) < 0);
      if (r.length < scene[vt]) {
        mission.missing[vt] = scene[vt];
      }
      return r.length === scene[vt] ? r : null;
    }).filter((v) => v !== null).reduce((acc, cur) => [...acc, ...cur], []);

    preVehicles.forEach((v) => vehicleCounts[v.type] = (vehicleCounts[v.type] ?? 0) + 1);
    Object.keys(document.lss_helper.vehicleReplacements ?? {}).forEach((type) => {
      const vehicles = preVehicles.filter((v) => v.type === type);
      let max = 0;
      document.lss_helper.vehicleReplacements[type].forEach((r) => {
        max = Math.max(max, scene[r] ?? 0);
        scene[r] = (scene[r] ?? 0) - vehicles.length;
      });
      nonReplaceable = [...nonReplaceable, ...vehicles.slice(0, max)];
    });
  }

  const nonReplaceableIds = nonReplaceable.map((v) => v.id);
  let available = document.lss_helper.vehicles
    .filter((v) => nonReplaceableIds.indexOf(v.id) < 0)
    .filter((v) => v.available)
    .map((v) => {
      if (document.lss_helper.vehicleIgnoreDistance.indexOf(v.type) >= 0) {
        return {
          distance: 0,
          time: 0,
          ...v,
        };
      }
      const mult = document.lss_helper.vehicleMultiplyDistance[v.type] ?? 1;
      return {
        distance: mult * document.lss_helper.helper.getDistance(mission, v),
        time: mult * vehicleDistanceDirectTimeToObject(20, mission.lat, mission.lng, v.lat, v.lng, true),
        ...v,
      };
    })
    .sort((v1, v2) => {
      return v1[sortKey] - v2[sortKey];
    });
  let vehicles = Object.keys(scene).filter((vt) => scene[vt] > 0).map((vt) => {
    const groups = (document.lss_helper.vehicleGroups[vt] ?? [vt]).map((v) => '' + v);
    const r = available.filter((v) => groups.indexOf(v.type) >= 0).slice(0, scene[vt]);
    const ids = r.map(v => v.id);
    available = available.filter((v) => ids.indexOf(v.id) < 0);
    if (r.length < scene[vt]) {
      mission.missing[vt] = scene[vt];
    }
    return r.length === scene[vt] ? r : null;
  });

  if (document.lss_helper.getSetting('optimize_scene') && nonReplaceable.length) {
    vehicles = [...vehicles, ...[nonReplaceable]];
  }

  //if (nonReplaceable.length) {
  //document.lss_helper.warn('counts', vehicleCounts, 'replacements', nonReplaceable, 'ids', nonReplaceableIds, 'scene', scene, 'send', vehicles);
  //}
  return JSON.parse(JSON.stringify((vehicles.filter((v) => v === null).length && !noFillOrKill) ? null : vehicles.filter((v) => v !== null)));
};

document.lss_helper.getVehiclesByMission = (mission, scene, noFillOrKill) => {
  scene = document.lss_helper.getScene(scene || (mission.missionType || 'X'));
  if (!scene) {
    return null;
  }

  const countLNA = ((document.lss_helper.vehiclesByType ?? {})[55] ?? []).filter(v => v.available).length;
  const countORGL = ((document.lss_helper.vehiclesByType ?? {})[56] ?? []).filter(v => v.available).length;
  const countELW = ((document.lss_helper.vehiclesByType ?? {})[59] ?? []).filter(v => v.available).length;

  if (scene['RTW'] && mission.patients) {
    if (mission.patients > document.lss_helper.getSetting('maxRTW', 10) && countELW) {
      scene['SEGELW'] = 1;
    }
    scene['RTW'] = Math.min(mission.patients, document.lss_helper.getSetting('maxRTW', 10));
  } else if (scene['KTW'] && mission.patients) {
    scene['KTW'] = mission.patients;
  }

  if (countLNA && mission.patients >= 5) {
    scene['LNA'] = 1;
  }
  if (countORGL && mission.patients >= 10) {
    scene['ORGL'] = 1;
  }

  if (mission.prisoners) {
    scene['POL'] = mission.prisoners;
  }

  return document.lss_helper.getVehiclesByScene(mission, scene, noFillOrKill);
};

document.lss_helper.sendByScene = (mission, scene, noFillOrKill) => {
  const vehicles = document.lss_helper.getVehiclesByMission(mission, scene, noFillOrKill);
  if (vehicles) {
    document.lss_helper.warn('Sending:', mission.missionType, vehicles, mission);
    const v = vehicles.reduce((acc, cur) => [...acc, ...cur], []);
    document.lss_helper.sendVehicles(mission.missionId, v);
    document.lss_helper.updateLists(-1);
  } else {
    document.lss_helper.warn('Not enough vehicles');
  }
};

document.lss_helper.sendVehicles = (missionid, vehicles) => {
  if (document.lss_helper.sending_vehicles || !document.lss_helper.lists_updated) {
    document.lss_helper.debug('Sending vehicles is already in progress or lists not updated yet');
    return;
  }
  const url = "/missions/" + missionid + "/alarm";
  const body = {
    //utf8: "",
    authenticity_token: document.lss_helper.authToken,
    commit: "Alarmieren",
    next_mission: 0,
    next_mission_id: 0,
    alliance_mission_publish: 0,
    sk: "ac",
    sd: "d",
    ifs: "fi",
  };

  document.lss_helper.sending_vehicles = true;
  document.lss_helper.lists_updated = false;
  const vehicleids = vehicles.map((v) => new URLSearchParams('vehicle_ids[]') + v.id).join('&');
  fetch(url, { method: 'POST', body: new URLSearchParams(body) + '&' + vehicleids, headers: { "Content-type": "application/x-www-form-urlencoded; charset=UTF-8" } })
    .then((response) => response.text())
    .then((json) => {
      document.lss_helper.debug(json);
      document.lss_helper.sending_vehicles = false;
      document.lss_helper.update(-1);
    })
};