document.lss_helper.markerTrim = {
  dragging: null,
  polyline: null,
  _events: null,
  _map: null,
  _mapToAdd: null,
  _tooltip: null
};

document.lss_helper.marker = document.lss_helper.marker || {
  buildings: {},
  vehicles: {},
  missions: {},
};

document.lss_helper.getBuildingsList = () => {
  return Array.from(document.getElementById('building_list').getElementsByClassName('building_list_li'))
    .map((building) => {
      const markerImage = Array.from(building.getElementsByClassName('building_marker_image'))[0];
      const position = Array.from(building.getElementsByClassName('map_position_mover'))[0];
      const links = Array.from(building.getElementsByTagName('a')).map(l => l.cloneNode(true));
      const id = links[0].id.replace(/.*_/, '');
      const marker = {
        ...building_markers.filter(b => b.building_id === parseInt(id)).pop(),
        ...document.lss_helper.markerTrim,
        ...document.lss_helper.marker.buildings[id],
      };
      return {
        id,
        name: position.innerHTML.trim(),
        leitstelleId: building.attributes.leitstelle_building_id.value.trim(),
        type: building.attributes.building_type_id.value.trim(),
        lat: parseFloat(position.attributes['data-latitude'].value.trim()),
        lng: parseFloat(position.attributes['data-longitude'].value.trim()),
        vehicles: Array.from(building.getElementsByClassName('building_list_vehicle_element')),
        links,
        origin: building,
        markerImage,
        position,
        marker,
      };
    });
};

document.lss_helper.getVehiclesList = () => {
  return (document.lss_helper.buildings ?? []).map((b) => {
    return Array.from(b.origin.getElementsByClassName('building_list_vehicle_element'))
      .map((vehicle) => {
        const id = parseInt(vehicle.attributes.vehicle_id.value.trim());
        const img = vehicle.getElementsByTagName('img')[0];
        const status = vehicle.getElementsByTagName('span')[0];
        const link = vehicle.getElementsByTagName('a')[0];
        const state = status.innerHTML.trim();
        const type = link.attributes.vehicle_type_id.value.trim();
        const availableStates = document.lss_helper.vehicleStatesAvailable[type] ?? document.lss_helper.statesAvailable;
        const marker = {
          ...vehicle_markers.filter(m => m.vehicle_id === id).pop(),
          ...document.lss_helper.markerTrim,
          ...document.lss_helper.marker.vehicles[id],
        };
        return {
          id,
          status: state,
          type: type,
          name: link.innerHTML.trim(),
          available: (availableStates.indexOf(state) >= 0),
          call: (document.lss_helper.statesCall.indexOf(state) >= 0),
          transit: (document.lss_helper.statesTransit.indexOf(state) >= 0),
          link: link.cloneNode(true),
          origin: vehicle,
          building: b,
          lat: b.lat,
          lng: b.lng,
          marker,
        };
      })
      .map((vehicle) => {
        if (!vehicle.marker) return vehicle;
        if (vehicle.marker.latitude && vehicle.marker.longitude) {
          vehicle.lat = vehicle.marker.latitude;
          vehicle.lng = vehicle.marker.longitude;
        }

        return vehicle;
      });
  })
    .reduce((acc, cur) => [...acc, ...cur], [])
    .sort((a, b) => a.name < b.name ? -1 : 1)
    .sort((a, b) => parseInt(a.type) - parseInt(b.type))
    .sort((a, b) => document.lss_helper.stateOrder.indexOf(a.status) - document.lss_helper.stateOrder.indexOf(b.status))
    ;
};

document.lss_helper.getMissionsList = () => {
  Array.from(document.getElementsByClassName('mission_deleted')).forEach(e => e.remove());
  return Array.from(document.querySelectorAll(".missionSideBarEntry:not(.mission_deleted)"))
    .map((m) => {
      const id = m.attributes['id'].value.trim();
      const missionId = m.attributes['mission_id'].value.trim();
      const links = Array.from(m.getElementsByTagName('a')).map((l) => l.cloneNode(true));
      const position = Array.from(m.getElementsByClassName('map_position_mover'))[0];
      const marker = {
        ...mission_markers.filter(mk => mk.mission_id === parseInt(missionId)).pop(),
        ...document.lss_helper.markerTrim,
        ...document.lss_helper.marker.missions[parseInt(missionId)],
      };
      const stuck = (document.lss_helper.mission_stuck ?? []).includes(parseInt(missionId));
      const isVerband = Array.from(m.getElementsByClassName('panel-success')).length > 0;
      return {
        id,
        missionId,
        type: m.attributes['data-mission-type-filter'].value.trim(),
        state: m.attributes['data-mission-state-filter'].value.trim(),
        participation: m.attributes['data-mission-participation-filter'].value.trim(),
        data: JSON.parse(m.attributes['data-sortable-by'].value.trim()),
        missionType: m.attributes['mission_type_id'].value.trim(),
        lat: parseFloat(position.attributes['data-latitude']?.value.trim() ?? '0'),
        lng: parseFloat(position.attributes['data-longitude']?.value.trim() ?? '0'),
        links,
        hasAlert: Array.from(m.querySelectorAll(".alert.alert-danger")).length > 0,
        unattended: Array.from(m.querySelectorAll(".panel.mission_panel_red")).length > 0,
        attended: Array.from(m.querySelectorAll(".panel.mission_panel_yellow")).length > 0,
        finishing: Array.from(m.querySelectorAll(".panel.mission_panel_green")).length > 0,
        isVerband,
        origin: m,
        position,
        marker,
        stuck,
      }
    })
    .map((m) => {
      return {
        stateNum: m.finishing ? 1000 : (m.attended ? 100 : 10),
        scene: document.lss_helper.getScene(m.missionType),
        info: {
          countdown: document.getElementById('mission_overview_countdown_' + m.data.id),
          progressbar: document.getElementById('mission_bar_outer_' + m.data.id),
          missing: document.getElementById('mission_missing_' + m.data.id),
          missingShort: document.getElementById('mission_missing_short_' + m.data.id),
          pump: document.getElementById('mission_pump_progress_' + m.data.id),
          patients: document.getElementById('mission_patients_' + m.data.id),
          prisoners: document.getElementById('mission_prisoners_' + m.data.id),
        },
        age: Math.floor(Math.abs(new Date() - new Date(m.data.created_at * 1000)) / (100 * 60 * 60)) / 10,
        ...m
      };
    })
    .map((m) => {
      if (!m.unattended) return m;
      let patients = m.info.patients?.children?.length;
      const patientSummary = m.info.patients?.getElementsByTagName('strong');
      if ((patientSummary ?? []).length) {
        patients = parseInt(patientSummary[0].innerHTML.replaceAll(/[^0-9]*/gi, ''));
      }
      let prisoners = m.info.prisoners?.children?.length;

      if (m.data.patients_count) {
        patients = m.data.patients_count[0];
      }
      if (m.data.prisoners_count) {
        prisoners = m.data.prisoners_count[0];
      }

      return {
        patients: patients,
        prisoners: prisoners,
        ...m
      };
    })
    .map((m) => {
      if (!m.unattended) return m;
      const proposedVehicles = document.lss_helper.getVehiclesByMission(m);
      const proposedVehiclesCount = (proposedVehicles ?? []).map(a => a.length).reduce((acc, cur) => acc + cur, 0);
      return {
        proposedVehicles: proposedVehicles,
        proposedVehiclesCount: proposedVehiclesCount,
        creditPerCar: proposedVehiclesCount ? parseInt(m.data.average_credits) / proposedVehiclesCount : 0,
        maxDistance: (proposedVehicles ?? []).reduce((acc, cur) => [...acc, ...cur], []).reduce((acc, cur) => Math.max(acc, cur.distance), 0),
        maxTime: (proposedVehicles ?? []).reduce((acc, cur) => [...acc, ...cur], []).reduce((acc, cur) => Math.max(acc, cur.time), 0),
        ...m
      };
    })
    .map((m) => {
      return {
        sort: {
          none: 0,
          missionId: parseInt(m.missionId),
          missionType: parseInt(m.missionType),
          missionTitle: m.data.caption,
          credits: 0 - parseInt(m.data.average_credits),
          age: 0 - m.age,
          patients: 0 - m.patients,
          prisoners: 0 - m.prisoners,
          vehicles: 0 - m.proposedVehiclesCount,
          creditRate: 0 - m.creditPerCar,
          maxDistance: m.maxDistance,
          maxTime: m.maxTime
        },
        ...m
      };
    }).map((m) => {
      if (!m.unattended || !m.hasAlert) return m;
      const resend = (m.info?.missing?.querySelector('[data-requirement-type="vehicles"]')?.innerText ?? '')
        .replaceAll(/.*: /g, '')
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s && s.length)
        .map((s) => {
          const p = s.replaceAll(/\n.*/g, "").match(/^([0-9]+)\s+(.+)$/);
          if (!p || p.length < 3) {
            return null;
          }
          return {
            count: parseInt(p[1]),
            type: p[2].trim().replace(/\s/g, ' '),
          };
        })
        .filter((s) => !!s)
        .filter((s) => {
          if (Object.keys(document.lss_helper.vehicleResend).indexOf(s.type) < 0) {
            if (document.lss_helper.vehicleResendMissing.indexOf(s.type) < 0) {
              document.lss_helper.vehicleResendMissing.push(s.type);
              document.lss_helper.warn('Unknown Resend Type', s.type);
            }
            return false;
          }
          if (document.lss_helper.vehicleResendMissing.indexOf(s.type) >= 0) {
            document.lss_helper.vehicleResendMissing.splice(document.lss_helper.vehicleResendMissing.indexOf(s.type), 1);
          }
          return true;
        })
        .map((s) => {
          return {
            ...s,
            scene: document.lss_helper.vehicleResend[s.type],
          }
        });
      /**
      ['LNA', 'OrgL'].forEach((vt) => {
          if (m.info?.patients?.innerText.indexOf(' ' + vt) >= 0) {
              resend.push({ scene: vt.toUpperCase(), count: 1 });
          }
      });
      ['NEF', 'RTW', 'RTH'].forEach((vt) => {
          // TODO: send right amount
          if (m.info?.patients?.innerText.indexOf(' ' + vt) >= 0) {
              resend.push({ scene: vt.toUpperCase(), count: 1 });
          }
      });
      /** */
      const resendScene = {};
      resend.forEach((r) => {
        resendScene[r.scene] = (resendScene[r.scene] || 0) + r.count;
      });
      return {
        ...m,
        resend,
        resendScene,
        resendVehicles: document.lss_helper.getVehiclesByScene(JSON.parse(JSON.stringify(m)), JSON.parse(JSON.stringify(document.lss_helper.addAAOtoScene(resendScene))), !document.lss_helper.getSetting('autoResendAll')),
      }
    })
    .filter((m) => !m.data.caption.includes('[Verband]') || document.lss_helper.getSetting('mission_verband'))
    .sort((m1, m2) => m2.sort[document.lss_helper.getSetting('mission_sort') ?? 'none'] > m1.sort[document.lss_helper.getSetting('mission_sort') ?? 'none'] ? -1 : 1)
    .sort((m1, m2) => m1.hasAlert ? (m2.hasAlert ? 0 : -1) : (m2.hasAlert ? 1 : 0))
    .sort((m1, m2) => m1.stateNum < m2.stateNum ? -1 : 0);
};

document.lss_helper.getMissionStuck = () => {
  if (!document.lss_helper.getSetting('mission_stuck', 'false')) {
    document.lss_helper.mission_stuck = [];
    return;
  }

  document.lss_helper.mission_stuck = document.lss_helper.mission_stuck || [];
  document.lss_helper.mission_stuck = document.lss_helper.mission_stuck.filter((id) => {
    return document.lss_helper.missions.filter((m) => m.attended && m.data.id === id).length < 0;
  });

  document.lss_helper.missions
    .filter((m) => m.attended && !document.lss_helper.mission_stuck.includes(m.data.id))
    .forEach((m, idx) => {
      setTimeout(() => {
        console.warn('Checking if mission is stuck', m.data.id);
        const header = { method: 'GET', cache: "no-cache" };
        const url = 'https://www.leitstellenspiel.de/missions/' + m.data.id + '?ifs=at_fi&sd=a&sk=cr';
        fetch(url, header)
          .then((r) => r.text())
          .then((r) => {
            if (r.indexOf('Diesen Einsatz direkt anfahren') > 0) {
              console.warn('Mission is stuck', m);
              document.lss_helper.mission_stuck.push(m.data.id);
              console.warn(document.lss_helper.missions.filter((m) => document.lss_helper.mission_stuck.includes(m.data.id)));
            } else {
              document.lss_helper.mission_stuck = document.lss_helper.mission_stuck.filter((id) => id !== m.data.id);
            }
          })
          .catch((err) => {
            document.lss_helper.error(err);
          });
      }, idx * 500);
    });
};

document.lss_helper.getMissionStuckInterval = document.lss_helper.getMissionStuckInterval ?? setInterval(() => document.lss_helper.getMissionStuck(), document.lss_helper.getSetting('mission_stuck_interval', '180000'));