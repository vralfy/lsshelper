document.lss_helper.printMissions = () => {
  let missionsContainer = document.getElementById('lss_helper_missions');
  if (!missionsContainer) {
    missionsContainer = document.createElement("ul");
    missionsContainer.id = 'lss_helper_missions';
    missionsContainer.classList = 'col-sm-12 col-md-6';

    const main = document.lss_helper.getHelperContainer();
    main.appendChild(missionsContainer);
  }

  const settings = {
    show_vehicle_available: document.lss_helper.getSetting('show_vehicle_available'),
    show_vehicle_unavailable: document.lss_helper.getSetting('show_vehicle_unavailable'),
    show_vehicle_summary: document.lss_helper.getSetting('show_vehicle_summary'),
    show_missions: document.lss_helper.getSetting('show_missions'),
    show_mission_type: document.lss_helper.getSetting('show_mission_type'),
    show_mission_lf1: document.lss_helper.getSetting('show_mission_lf1'),
    show_mission_lf2: document.lss_helper.getSetting('show_mission_lf2'),
    show_mission_credits: document.lss_helper.getSetting('show_mission_credits'),
    show_mission_age: document.lss_helper.getSetting('show_mission_age'),
    show_mission_max_distance: document.lss_helper.getSetting('show_mission_max_distance'),
    show_mission_credits_rate: document.lss_helper.getSetting('show_mission_credits_rate'),

    show_mission_unattended: document.lss_helper.getSetting('show_mission_unattended', 'false'),
    show_mission_attended: document.lss_helper.getSetting('show_mission_attended', 'false'),
    show_mission_finishing: document.lss_helper.getSetting('show_mission_finishing', 'false'),
    show_mission_unattended_alert: document.lss_helper.getSetting('show_mission_unattended_alert', 'true'),
    show_mission_attended_alert: document.lss_helper.getSetting('show_mission_attended_alert', 'false'),
    show_mission_finishing_alert: document.lss_helper.getSetting('show_mission_finishing_alert', 'false'),

    show_mission_type: document.lss_helper.getSetting('show_mission_type'),
  };

  let colsSM = 0;
  colsSM += settings.show_vehicle_available ? 6 : 0;
  colsSM += settings.show_vehicle_unavailable ? 6 : 0;
  colsSM += settings.show_vehicle_summary ? 6 : 0;
  colsSM = Math.max(6, 12 - (colsSM % 12));
  colsSM = 12;

  let colsMD = 0;
  colsMD += settings.show_vehicle_available ? 3 : 0;
  colsMD += settings.show_vehicle_unavailable ? 3 : 0;
  colsMD += settings.show_vehicle_summary ? 4 : 0;
  colsMD = 12 - (colsMD % 12);
  colsMD = colsMD < 6 ? 12 : colsMD;

  missionsContainer.classList = 'col-sm-' + colsSM + ' col-md-' + colsMD;
  missionsContainer.innerHTML = '';
  missionsContainer.style = settings.show_missions ? '' : 'display:none';

  document.lss_helper.missions
    //.filter((m) => m.state != 'finishing')
    .forEach((m) => {
      const li = document.createElement('li');
      li.classList = [
        m.finishing ? 'state_finishing' : '',
        m.attended ? 'state_attended' : '',
        m.unattended ? 'state_unattended' : '',
        m.hasAlert ? 'state_alert' : '',
        m.isVerband ? 'state_verband' : '',
        m.stuck ? 'state_stuck' : '',
      ].join(' ');
      li.style = 'display:flex; flex-direction:row;justify-content:space-between;align-items:center;gap:10px';
      missionsContainer.appendChild(li);

      const leftContainer = document.createElement('span');
      //leftContainer.style = 'flex-grow:1';
      li.appendChild(leftContainer);

      const centerContainer = document.createElement('span');
      centerContainer.style = 'display:flex;flex-direction:row;justify-content:flex-start;align-items:center;flex-grow:2;gap:4px';
      li.appendChild(centerContainer);

      const rightContainer = document.createElement('span');
      //rightContainer.style = 'flex-grow:1';
      li.appendChild(rightContainer);

      if (m.hasAlert) {
        const alert = document.createElement('span');
        alert.innerHTML = '⚠️';
        leftContainer.appendChild(alert);
      }

      const needsVehicles = !m.hasAlert && m.unattended;
      // const vehiclesToSend = needsVehicles ? (m.proposedVehicles ?? document.lss_helper.getVehiclesByMission(m, m.missionType)) : [];
      // This way is much more performant than the one above, as it avoids unnecessary distance calculations
      const vehiclesToSend = needsVehicles ? (m.proposedVehicles ?? []) : [];

      if (needsVehicles) {
        if (settings.show_mission_type && m.scene && vehiclesToSend && vehiclesToSend.length) {
          const vehiclesCount = vehiclesToSend.reduce((acc, cur) => acc + cur.length, 0);
          const btn2 = document.createElement('a');
          btn2.classList = 'btn btn-xs btn-default sendVehicles';
          btn2.innerHTML = '🚨' + document.lss_helper.helper.formatNumber(vehiclesCount);
          btn2.onclick = () => { document.lss_helper.sendByScene(m) };
          leftContainer.appendChild(btn2);
        } else {
          if (settings.show_mission_lf1 && document.lss_helper.getVehiclesByMission(m, 'lf1')) {
            const btn = document.createElement('a');
            btn.classList = 'btn btn-xs btn-default sendLf1';
            btn.innerHTML = '🚒';
            btn.onclick = () => { document.lss_helper.sendByScene(m, 'lf1') };
            leftContainer.appendChild(btn);
          }
          if (settings.show_mission_lf2 && document.lss_helper.getVehiclesByMission(m)) {
            const btn2 = document.createElement('a');
            btn2.classList = 'btn btn-xs btn-default sendLf2';
            btn2.innerHTML = '🚒🚒';
            btn2.onclick = () => { document.lss_helper.sendByScene(m) };
            leftContainer.appendChild(btn2);
          }
        }
      }

      if (settings.show_mission_credits) {
        const creditContainer = document.createElement('span');
        creditContainer.classList = 'mission_detail';
        creditContainer.innerHTML = m.data.average_credits + '$';
        centerContainer.appendChild(creditContainer);
      }

      if (settings.show_mission_age) {
        const ageContainer = document.createElement('span');
        ageContainer.classList = 'mission_detail';
        ageContainer.innerHTML = m.age + 'h';
        centerContainer.appendChild(ageContainer);
      }

      if (m.scene && vehiclesToSend) {
        //const vehiclesCount = vehiclesToSend.reduce((acc, cur) => acc + cur.length, 0);
        if (settings.show_mission_max_distance && m.maxDistance) {
          const distanceSpan = document.createElement('span');
          distanceSpan.classList = 'mission_detail';
          distanceSpan.innerHTML = (Math.round(document.lss_helper.helper.getDistanceInKm(m.maxDistance) * 100) / 100) + 'km';
          centerContainer.appendChild(distanceSpan);
        }

        if (settings.show_mission_credits_rate && m.creditPerCar) {
          const rate = Math.floor(m.creditPerCar * 10) / 10;
          const rateContainer = document.createElement('span');
          rateContainer.classList = 'mission_detail';
          rateContainer.innerHTML = rate + '$/c';
          centerContainer.appendChild(rateContainer);
        }
      }

      const txt = m.links[0];
      txt.innerHTML = m.data.caption + (settings.show_mission_type ? ' (' + m.missionType + ')' : '');
      txt.style = 'margin-left: 4px';
      rightContainer.appendChild(txt);

      if (settings.show_mission_type && document.lss_helper.scenes[m.missionType]) {
        const checkmark = document.createElement('span');
        checkmark.innerHTML = '✔️';
        checkmark.onclick = () => {
          document.lss_helper.missionDetails = m.data.id;
          document.lss_helper.printScene();
        };
        rightContainer.appendChild(checkmark);
      }

      const listElement = document.getElementById('mission_' + m.data.id);
      if (listElement) {
        ['unattended', 'attended', 'finishing'].forEach((state) => {
          if (m[state]) {
            if (settings['show_mission_' + state] || (m.hasAlert && settings['show_mission_' + state + '_alert'])) {
              listElement.classList.add('block');
              listElement.classList.remove('hidden');
            } else {
              listElement.classList.remove('block');
              listElement.classList.add('hidden');
            }
          }
        });
      }
    });
};