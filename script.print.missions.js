document.lss_helper.printMissions = () => {
  let missionsContainer = document.getElementById('lss_helper_missions');
  if (!missionsContainer) {
    missionsContainer = document.createElement("ul");
    missionsContainer.id = 'lss_helper_missions';
    missionsContainer.classList = 'col-sm-12 col-md-6';

    const main = document.lss_helper.getHelperContainer();
    main.appendChild(missionsContainer);
  }

  let colsSM = 0;
  colsSM += document.lss_helper.getSetting('show_vehicle_available') ? 6 : 0;
  colsSM += document.lss_helper.getSetting('show_vehicle_unavailable') ? 6 : 0;
  colsSM += document.lss_helper.getSetting('show_vehicle_summary') ? 6 : 0;
  colsSM = Math.max(6, 12 - (colsSM % 12));
  colsSM = 12;

  let colsMD = 0;
  colsMD += document.lss_helper.getSetting('show_vehicle_available') ? 3 : 0;
  colsMD += document.lss_helper.getSetting('show_vehicle_unavailable') ? 3 : 0;
  colsMD += document.lss_helper.getSetting('show_vehicle_summary') ? 4 : 0;
  colsMD = 12 - (colsMD % 12);
  colsMD = colsMD < 6 ? 12 : colsMD;

  missionsContainer.classList = 'col-sm-' + colsSM + ' col-md-' + colsMD;
  missionsContainer.innerHTML = '';
  missionsContainer.style = document.lss_helper.getSetting('show_missions') ? '' : 'display:none';

  document.lss_helper.missions
    //.filter((m) => m.state != 'finishing')
    .forEach((m) => {
      const li = document.createElement('li');
      li.classList = [
        m.finishing ? 'state_finishing' : '',
        m.attended ? 'state_attended' : '',
        m.unattended ? 'state_unattended' : '',
        m.hasAlert ? 'state_alert' : '',
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

      if (!m.hasAlert && m.unattended) {
        if (m.scene && document.lss_helper.getVehiclesByMission(m, m.missionType) && document.lss_helper.getSetting('show_mission_type')) {
          const vehiclesToSend = document.lss_helper.getVehiclesByMission(m, m.missionType);
          const vehiclesCount = vehiclesToSend.reduce((acc, cur) => acc + cur.length, 0);
          const btn2 = document.createElement('a');
          btn2.classList = 'btn btn-xs btn-default sendVehicles';
          btn2.innerHTML = '🚨' + document.lss_helper.helper.formatNumber(vehiclesCount);
          btn2.onclick = () => { document.lss_helper.sendByScene(m) };
          leftContainer.appendChild(btn2);
        } else {
          if (document.lss_helper.getVehiclesByMission(m, 'lf1') && document.lss_helper.getSetting('show_mission_lf1')) {
            const btn = document.createElement('a');
            btn.classList = 'btn btn-xs btn-default sendLf1';
            btn.innerHTML = '🚒';
            btn.onclick = () => { document.lss_helper.sendByScene(m, 'lf1') };
            leftContainer.appendChild(btn);
          }
          if (document.lss_helper.getVehiclesByMission(m) && document.lss_helper.getSetting('show_mission_lf2')) {
            const btn2 = document.createElement('a');
            btn2.classList = 'btn btn-xs btn-default sendLf2';
            btn2.innerHTML = '🚒🚒';
            btn2.onclick = () => { document.lss_helper.sendByScene(m) };
            leftContainer.appendChild(btn2);
          }
        }
      }

      if (document.lss_helper.getSetting('show_mission_credits')) {
        const creditContainer = document.createElement('span');
        creditContainer.classList = 'mission_detail';
        creditContainer.innerHTML = m.data.average_credits + '$';
        centerContainer.appendChild(creditContainer);
      }

      if (document.lss_helper.getSetting('show_mission_age')) {
        const ageContainer = document.createElement('span');
        ageContainer.classList = 'mission_detail';
        ageContainer.innerHTML = m.age + 'h';
        centerContainer.appendChild(ageContainer);
      }

      if (m.scene && document.lss_helper.getVehiclesByMission(m, m.missionType)) {
        const vehiclesToSend = document.lss_helper.getVehiclesByMission(m, m.missionType);
        const vehiclesCount = vehiclesToSend.reduce((acc, cur) => acc + cur.length, 0);
        if (document.lss_helper.getSetting('show_mission_max_distance')) {
          const distanceSpan = document.createElement('span');
          distanceSpan.classList = 'mission_detail';
          distanceSpan.innerHTML = (Math.round(m.maxDistance * 100) / 100) + 'km';
          centerContainer.appendChild(distanceSpan);
        }

        if (document.lss_helper.getSetting('show_mission_credits_rate')) {
          const rate = Math.floor(m.creditPerCar * 10) / 10;
          const rateContainer = document.createElement('span');
          rateContainer.classList = 'mission_detail';
          rateContainer.innerHTML = rate + '$/c';
          centerContainer.appendChild(rateContainer);
        }
      }

      const txt = m.links[0];
      txt.innerHTML = m.data.caption + (document.lss_helper.getSetting('show_mission_type') ? ' (' + m.missionType + ')' : '');
      txt.style = 'margin-left: 4px';
      rightContainer.appendChild(txt);

      if (document.lss_helper.scenes[m.missionType] && document.lss_helper.getSetting('show_mission_type')) {
        const checkmark = document.createElement('span');
        checkmark.innerHTML = '✔️';
        checkmark.onclick = () => {
          document.lss_helper.missionDetails = m.data.id;
          document.lss_helper.printScene();
        };
        rightContainer.appendChild(checkmark);
      }
    });
};