// ==UserScript==
// @name         Leistellenspiel Helper
// @namespace    http://tampermonkey.net/
// @version      202504-11-01
// @description  try to take over the world!
// @author       You
// @match        https://www.leitstellenspiel.de/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=leitstellenspiel.de
// @grant        none
// ==/UserScript==

(function() {
  'use strict';
  document.lss_helper = {
      storage: localStorage,
      vehicleTypes: {
          '0': '🚒 LF',
          '2': '🚨 DLK',
          '3': '🖥️ ELW 1',
          '4': '🛠️ RW',
          '5': '☁️ GW-A',
          '10': '🛢️ GW-Öl',
          '11': '💧 GW-Wasser',
          '12': '📏 GW-Mess',
          '27': 'GW-G',
          '28': '🚑 RTW',
          '32': '🚓 FuStW',
          '33': 'GW-H',
          '34': 'ELW 2',
          '36': 'MTW',
          '37': '🚒 TSF-W',
          '46': 'WLF',
          '53': 'Dekon-P',
          '57': 'FwK',
          '118': 'KlTaW',
          '120': 'TaW',
          '121': '🚒 GT-LF',
          '166': '🚒 PT-LF',
      },
      vehicles: [],
      missions: [],
      scenes: {
          'X' : { '0': 2 },
          'lf1' : { '0': 1 },
          '1' : { '0': 1, '32': 1 }, // Brennender Abfallcontainer
          '5' : { '0': 2, '2': 1, '3': 1, '32': 1}, // Zimmerbrand
          '8' : { '0': 1, '32': 1}, // Sperrmüllbrand
          '9' : { '0': 1 }, // Strohballenbrand
          '10' : { '0': 1 }, // Traktorbrand
          '11' : { '0': 1 }, // Brennende Telefonzelle
          '18' : { '0': 1 }, // Brennendes Gebüsch
          '26' : { '0': 3, '2': 1, '4': 1, '3': 1, '34': 1 }, // Brand im Supermarkt
          '28' : { '0': 2 }, // Garagenbrand
          '29' : { '0': 3, '3': 1, '4': 1, '5': 1 }, // Maschinenbrand
          '30' : { '0': 1, '10': 1 }, // Große Ölspur
          '31' : { '0': 1, '4': 1 }, // Auslaufende Betriebsstoffe
          '32' : { '0': 2, '2': 1, '3': 1 }, // Kaminbrand
          '44' : { '28': 1 }, // Alkoholintoxication
          '57' : { '28': 1 }, // Gestürzter Fußgänger
          '67' : { '32': 1}, // Personalienaufnahme nach Schwarzfahrer
          '72' : { '0': 1, '28': 1, '32': 1, '33': 1 }, // Bewußtloser Kranführer
          '78' : { '0': 1 }, // Kleintier in Not
          '79' : { '0': 1, '3': 1, '28': 1, '33': 1 }, // Verletzte Person auf Baugerüst
          '82' : { '32': 1 }, // Einbruch in Wohnung
          '90' : { '32': 1}, // Ruhestörung
          '102' : { '0': 3, '2': 1, '3': 1 }, // Feuer in Einfamilienhaus
          '124' : { '0': 1, '4': 1, '28': 2 }, // Verkehrsunfall
          '126' : { '0': 2, '4': 1, '28': 3 }, // Verkehrsunfall
          '128' : { '0': 1, '28': 1, '32': 1 }, // Auffahrunfall
          '131' : { '0': 5, '3': 1, '11': 1}, // Mittlerer Feldbrand
          '132' : { '0': 6, '3': 1, '11': 1}, // Großer Feldbrand
          '138' : { '0': 2 }, // Flächenbrand
          '150' : { '32': 1}, // Hausfriedensbruch
          '153' : { '28': 1, '32': 1}, // Hilflose Person
          '161' : { '0': 1 }, // Baum auf PKW
          '190' : { '32': 1 }, // Diebstahl aus Kfz
          '230' : { '0': 1 }, // Feuerprobealarm an Schule
          '235' : { '0': 2, '3': 1, '28': 1, '32': 1, '33': 1}, // Verletzte Person auf Hochspannungsmast
          '240' : { '0': 3, '3': 1, '27': 1, '28': 1, '32': 1}, // Gasgeruch
          '282' : { '0': 2, '3': 1, '4': 1 }, // Geplatzte Wasserleitung
          '284' : { '32': 1 }, // Ostereierdieb
          '288' : { '0': 1 }, // Brennendes Osternest
          '289' : { '10': 1 }, // Schokoladenspur auf Straße
          '290' : { '0': 2 }, // Eierkocherbrand
          '308' : { '0': 2 }, // Brennender Müllwagen
          '318' : { '0': 1 }, // Ausgelöster Heimrauchmelder
          '349' : { '0': 1 }, // Brandgeruch
          '392' : { '0': 2, '3': 1, '4': 1, '28': 1 }, // Person durch Hubmaschine eingeklemmt
          '436' : { '0': 1, '4': 1, '32': 1 }, // Verschmutzte Fahrbahn
          '448' : { '32': 1 }, // Ermittlungen nach Unfallflucht
          '460' : { '0': 1, '2': 1, '3': 1, '4': 1, '28': 1}, // Person in Schacht
          '468' : { '28': 1 }, // Badeunfall
          '476' : { '28': 1, '32': 1}, // Angefahrener Radfahrer
          '518' : { '0': 1 }, // Brennender Baum
          '607' : { '32': 1}, // Verkehrserziehung an Schule
          '694' : { '0': 2, '4': 1, '32': 1}, // Gülle ausgelaufen
          '749' : { '28': 1 }, // Allergische Reaktion auf Pollen
          '727' : { '0': 2 }, // Brennender Picknickkorb
          '733' : { '0': 2 }, // Absicherung Osterfeuer
          '736' : { '0': 1, '32': 1 }, // Schokohase in PKW eingeschlossen
          '733' : { '0': 1 }, // Geschmolzener Osterhase
          '749' : { '0': 1, '32': 1}, // E-Call ausgelöst
          '752' : { '0': 1, '2': 1, '3': 1, '4': 1, '28': 1, '32': 1, '33': 1 }, // Verletzte Person auf Dach
          '778' : { '0': 1 }, // Brennende Chemietoilette
          '781' : { '0': 2 }, // Gartenschuppenbrand
      },
  };

  document.lss_helper.getSetting = (key, def) => {
      if (!localStorage.getItem('lss_helper_' + key)) {
          localStorage.setItem('lss_helper_' + key, def ?? 'false');
      }
      return JSON.parse(localStorage.getItem('lss_helper_' + key) ?? (def ?? 'false'));
  };

  document.lss_helper.init = () => {
      $([
          "<style type='text/css' id='lss_helper_css'>",
          ".leaflet-marker-icon[src*='red'], .leaflet-marker-icon[src*='rot']{ filter: drop-shadow(0px 0px 8px red);}",
          ".leaflet-marker-icon[src*='yellow'], .leaflet-marker-icon[src*='gelb']{ filter: drop-shadow(0px 0px 8px yellow);}",
          ".leaflet-marker-icon[src*='green'], .leaflet-marker-icon[src*='gruen']{ filter: drop-shadow(0px 0px 8px green);}",
          ".hidden { display: none }",
          ".lss_available { color: #0a0; }",
          ".lss_unavailable { color: #a00; }",
          ".lss_call { color: '#f00'; }",
          ".state_finishing { color: #000; background: #0f0 }",
          ".state_unattended { color: #000; background: #f00 }",
          ".state_attended { color: #000; background: #ff0 }",
          "#mission_general_info, #back_to_mission { text-align:right }",
          "</style>"
      ].join("\n")).appendTo("head");

      const vehicleListElement = document.getElementById('building_panel_body');
      vehicleListElement.scrollTo(0, vehicleListElement.scrollHeight);
  };

  document.lss_helper.update = () => {
      console.log('LSS Helper Update');
      document.lss_helper.updateLists();
      document.lss_helper.printVehicleList();
      document.lss_helper.printMissions();
      if (document.lss_helper.getSetting('updateInterval', '1000') > 0) {
          setTimeout(() => {document.lss_helper.update();}, document.lss_helper.getSetting('updateInterval', '1000'));
      }
  };

  document.lss_helper.updateLists = () => {
      document.lss_helper.authToken = Array.from(document.getElementsByName('csrf-token'))[0].content;
      document.lss_helper.vehicles = Array.from(document.getElementById('building_list').getElementsByClassName('building_list_vehicle_element'))
      .map((vehicle) => {
          const img = vehicle.getElementsByTagName('img')[0];
          const status = vehicle.getElementsByTagName('span')[0];
          const link = vehicle.getElementsByTagName('a')[0];
          return {
              id: parseInt(vehicle.attributes.vehicle_id.value.trim()),
              status: status.innerHTML.trim(),
              type: link.attributes.vehicle_type_id.value.trim(),
              name: link.innerHTML.trim(),
              available: (['1','2'].indexOf(status.innerHTML) >= 0),
              call: (['5'].indexOf(status.innerHTML) >= 0),
              link: link.cloneNode(true),
          };
      })
      .sort((a,b) => a.name < b.name ? -1 : 1 )
      .sort((a,b) => a.type < b.type ? -1 : 1 )
      .sort((a,b) => a.status < b.status ? -1 : 1 );
      document.lss_helper.missions = Array.from(document.querySelectorAll(".missionSideBarEntry:not(.mission_deleted)"))
      .map((m) => {
          const links = Array.from(m.getElementsByTagName('a')).map((l) => l.cloneNode(true));
          return {
              id: m.attributes['id'].value.trim(),
              missionId: m.attributes['mission_id'].value.trim(),
              type: m.attributes['data-mission-type-filter'].value.trim(),
              state: m.attributes['data-mission-state-filter'].value.trim(),
              participation: m.attributes['data-mission-participation-filter'].value.trim(),
              data: JSON.parse(m.attributes['data-sortable-by'].value.trim()),
              missionType: m.attributes['mission_type_id'].value.trim(),
              links,
              origin: m,
          }
      })
      .sort((m1, m2) => m2.data.average_credits - m1.data.average_credits)
      .sort((m1, m2) => m1.state < m2.state ? -1 : 0);
  };

  document.lss_helper.getHelperContainer = () => {
      var container = document.getElementById('lss_helper');
      if (!container) {
          container = document.createElement("div");
          container.id = 'lss_helper';
          container.classList = 'col-sm-8 overview_outer bigMapWindow';
          const buildings = document.getElementById('buildings_outer');
          buildings.insertAdjacentElement('afterend', container);
      }
      var innerContainer = document.getElementById('lss_helper_container');
      if (!innerContainer) {
          const panel = document.createElement('div');
          panel.classList = 'panel panel-default';
          container.append(panel);

          const panelHeader = document.createElement('div');
          panelHeader.classList = 'panel-heading big_map_window_head';
          panelHeader.innerHTML = 'Leitstellenspiel Helper';
          panel.append(panelHeader);

          const body = document.createElement('div');
          body.classList = 'panel-body';
          panel.append(body);

          const bsContainer = document.createElement('div');
          bsContainer.classList = "container-fluid";
          body.append(bsContainer);

          innerContainer = document.createElement('div');
          innerContainer.classList = 'row';
          innerContainer.id = 'lss_helper_container';
          bsContainer.append(innerContainer);
      }
      return innerContainer;
  };

  document.lss_helper.printVehicleList = () => {
      const main = document.lss_helper.getHelperContainer();
      let containerAvailable = document.getElementById('lss_helper_vehicle_available');
      let containerUnavailable = document.getElementById('lss_helper_vehicle_unavailable');
      if (containerAvailable) {
          containerAvailable.remove();
      }
      if (containerUnavailable) {
          containerUnavailable.remove();
      }
      containerAvailable = document.createElement("ul");
      containerAvailable.id = 'lss_helper_vehicle_available';
      containerAvailable.classList = 'col-md-3';
      if (document.lss_helper.getSetting('show_vehicle_call', 'true') || document.lss_helper.getSetting('show_vehicle_available', 'true')) {
          main.appendChild(containerAvailable);
      }

      containerUnavailable = document.createElement("ul");
      containerUnavailable.id = 'lss_helper_vehicle_unavailable';
      containerUnavailable.classList = 'col-md-3';
      if (document.lss_helper.getSetting('show_vehicle_unavailable', 'true')) {
          main.appendChild(containerUnavailable);
      }

      const itemsAvailable = {};
      const itemsUnavailable = {};
      const itemsCall = document.lss_helper.vehicles.filter((v) => v.call);

      if (document.lss_helper.getSetting('show_vehicle_available', 'true')) {
          document.lss_helper.vehicles
          .filter((v) => v.available)
          .forEach((v) => {
              const idx = v.type;
              itemsAvailable[idx] = itemsAvailable[idx] || [];
              itemsAvailable[idx].push(v);
          });
      }

      if (document.lss_helper.getSetting('show_vehicle_unavailable', 'true')) {
          document.lss_helper.vehicles
          .filter((v) => !v.available)
          .forEach((v) => {
              const idx = v.type;
              itemsUnavailable[idx] = itemsUnavailable[idx] || [];
              itemsUnavailable[idx].push(v);
          });
      }

      if (document.lss_helper.getSetting('show_vehicle_call', 'true')) {
          Object.values(itemsCall).forEach((i) => {
              const li = document.createElement('li');
              li.classList = 'lss_call';
              li.innerHTML = (document.lss_helper.vehicleTypes[i.type] || i.type) + ' - ' + i.name;
              li.append(i.link);
              containerAvailable.append(li)
          });
      }

      if (Object.keys(itemsAvailable).length) {
          Object.values(itemsAvailable).forEach((i) => {
              const li = document.createElement('li');
              li.classList = 'lss_available';
              li.innerHTML = i.length + ' ' + (document.lss_helper.vehicleTypes[i[0].type] || (i[0].type + ' - ' + i[0].name));
              containerAvailable.append(li)
          });
      }
      if (Object.keys(itemsUnavailable).length) {
          Object.values(itemsUnavailable).forEach((i) => {
              const li = document.createElement('li');
              li.classList = 'lss_unavailable';
              li.innerHTML = i.length + ' ' + (document.lss_helper.vehicleTypes[i[0].type] || (i[0].type + ' - ' + i[0].name));
              containerUnavailable.append(li)
          });
      }
  };

  document.lss_helper.printMissions = () => {
      const main = document.lss_helper.getHelperContainer();
      let missionsContainer = document.getElementById('lss_helper_missions');
      if (missionsContainer) {
          missionsContainer.remove();
      }
      missionsContainer = document.createElement("ul");
      missionsContainer.id = 'lss_helper_missions';
      missionsContainer.classList = 'col-md-6';
      if (document.lss_helper.getSetting('show_missions', 'true')) {
          main.appendChild(missionsContainer);
      }

      document.lss_helper.missions
      //.filter((m) => m.state != 'finishing')
      .sort((m1,m2) => m1.state < m2.state ? -1 : 1)
      .forEach((m) => {
          const li = document.createElement('li');
          li.classList = 'state_' + m.state;
          li.style = 'display:flex; flex-direction:row;justify-content: space-between;';
          missionsContainer.appendChild(li);

          const btnContainer = document.createElement('span');
          li.appendChild(btnContainer);

          const infoContainer = document.createElement('span');
          li.appendChild(infoContainer);

          const age = Math.floor(
              Math.abs(new Date() - new Date(m.data.created_at * 1000)) / (100 * 60 * 60)
          ) / 10;
          infoContainer.innerHTML = [
              document.lss_helper.getSetting('show_mission_age', 'false') ? age + 'h' : null,
              document.lss_helper.getSetting('show_mission_credits', 'false') ? m.data.average_credits : null,
          ].filter((t) => !!t).join(' - ');

          const txt = m.links[0];
          txt.innerHTML = m.data.caption + ' (' + m.missionType + ')';
          txt.style = 'margin-left: 4px';
          li.appendChild(txt);

          if (m.state === 'unattended') {
              if (document.lss_helper.scenes[m.missionType] && document.lss_helper.getVehiclesByMission(m, m.missionType) && document.lss_helper.getSetting('show_mission_type', 'true')) {
                  const btn2 = document.createElement('a');
                  btn2.classList= 'btn btn-xs btn-default';
                  btn2.innerHTML = '🚨';
                  btn2.onclick = () => {document.lss_helper.sendByScene(m)};
                  btnContainer.appendChild(btn2);
              } else {
                  if (document.lss_helper.getVehiclesByMission(m, 'lf1') && document.lss_helper.getSetting('show_mission_lf1', 'true')) {
                      const btn = document.createElement('a');
                      btn.classList= 'btn btn-xs btn-default';
                      btn.innerHTML = '🚒';
                      btn.onclick = () => {document.lss_helper.sendByScene(m, 'lf1')};
                      btnContainer.appendChild(btn);
                  }
                  if (document.lss_helper.getVehiclesByMission(m) && document.lss_helper.getSetting('show_mission_lf2', 'true')) {
                      const btn2 = document.createElement('a');
                      btn2.classList= 'btn btn-xs btn-default';
                      btn2.innerHTML = '🚒🚒';
                      btn2.onclick = () => {document.lss_helper.sendByScene(m)};
                      btnContainer.appendChild(btn2);
                  }
              }
          }
      });
  };

  document.lss_helper.getVehiclesByMission = (mission, scene) => {
      scene = scene || (document.lss_helper.scenes[mission.missionType] ? mission.missionType : null) || 'X';
      scene = document.lss_helper.scenes[scene];
      const available = document.lss_helper.vehicles.filter((v) => v.available);
      const vehicles = Object.keys(scene).map((vt) => {
          const r = available.filter((v) => v.type === vt).slice(0, scene[vt]);
          return r.length === scene[vt] ? r : null;
      });
      return vehicles.filter((v) => v === null).length ? null : vehicles;
  };

  document.lss_helper.sendByScene = (mission, scene) => {
      const vehicles = document.lss_helper.getVehiclesByMission(mission, scene);
      if (vehicles) {
          console.warn('Sending LF:', mission.missionType, vehicles, mission);
          const v = vehicles.reduce((acc, cur) => [...acc, ...cur], []);
          document.lss_helper.sendVehicles(mission.missionId, v);
          document.lss_helper.updateLists();
      } else {
          console.warn('Not enough vehicles');
      }
  };

  document.lss_helper.sendVehicles = (missionid, vehicles) => {
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

      const vehicleids = vehicles.map((v) => new URLSearchParams('vehicle_ids[]') + v.id).join('&');
      fetch(url, {method: 'POST', body: new URLSearchParams(body) + '&' + vehicleids, headers: { "Content-type": "application/x-www-form-urlencoded; charset=UTF-8" }})
      .then((response) => response.json())
      .then((json) => console.log(json))
  };

  document.lss_helper.init();
  document.lss_helper.update();
})();