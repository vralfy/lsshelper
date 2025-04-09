// ==UserScript==
// @name         Leistellenspiel Helper
// @namespace    http://tampermonkey.net/
// @version      2025-04-09-02
// @description  try to take over the world!
// @author       You
// @match        https://www.leitstellenspiel.de/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=leitstellenspiel.de
// @grant        none
// ==/UserScript==

(function() {
  'use strict';
  document.lss_helper = {
      updateInterval: 1000,
      vehicleTypes: {
          '0': '🚒 LF',
          '2': '🚨 DLK',
          '3': '🖥️ ELW',
          '4': '🛠️ RW',
          '5': '☁️ GW-A',
          '10': '🛢️ GW-Öl',
          '11': '💧 GW-Wasser',
          '12': '📏 GW-Mess',
          '28': '🚑 RTW',
          '32': '🚓 FuStW',
          '37': '🚒 TSF-W',
      },
      vehicles: [],
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
          "#mission_general_info, #back_to_mission { text-align:right }",
          "</style>"
      ].join("\n")).appendTo("head");

      const vehicleListElement = document.getElementById('building_panel_body');
      vehicleListElement.scrollTo(0, vehicleListElement.scrollHeight);
  };

  document.lss_helper.update = () => {
      document.lss_helper.updateLists();
      document.lss_helper.printVehicleList();
      setTimeout(() => {document.lss_helper.update();}, document.lss_helper.updateInterval);
  };

  document.lss_helper.updateLists = () => {
      document.lss_helper.vehicles = Array.from(document.getElementById('building_list').getElementsByClassName('building_list_vehicle_element'))
      .map((vehicle) => {
          const img = vehicle.getElementsByTagName('img')[0];
          const status = vehicle.getElementsByTagName('span')[0];
          const link = vehicle.getElementsByTagName('a')[0];
          return {
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
  };

  document.lss_helper.getHelperContainer = () => {
      var container = document.getElementById('lss_helper');
      if (!container) {
          container = document.createElement("div");
          container.id = 'lss_helper';
          container.classList = 'col-sm-4 overview_outer bigMapWindow';
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

          innerContainer = document.createElement('div');
          innerContainer.id = 'lss_helper_container';
          innerContainer.classList = 'panel-body';
          panel.append(innerContainer);
      }
      return innerContainer;
  };

  document.lss_helper.printVehicleList = () => {
      const main = document.lss_helper.getHelperContainer();
      let container = document.getElementById('lss_helper_vehicle');
      if (container) {
          container.remove();
      }
      container = document.createElement("ul");
      container.id = 'lss_helper_vehicle';
      main.appendChild(container);

      const itemsAvailable = {};
      const itemsUnavailable = {};
      const itemsCall = document.lss_helper.vehicles.filter((v) => v.call);

      document.lss_helper.vehicles
      .filter((v) => v.available)
      .forEach((v) => {
          const idx = v.type;
          itemsAvailable[idx] = itemsAvailable[idx] || [];
          itemsAvailable[idx].push(v);
      });
      document.lss_helper.vehicles
      .filter((v) => !v.available)
      .forEach((v) => {
          const idx = v.type;
          itemsUnavailable[idx] = itemsUnavailable[idx] || [];
          itemsUnavailable[idx].push(v);
      });
      Object.values(itemsCall).forEach((i) => {
          const li = document.createElement('li');
          li.classList = 'lss_call';
          li.innerHTML = (document.lss_helper.vehicleTypes[i[0].type] || i[0].type) + ' - ' + i[0].name;
          li.append(i.link);
          container.append(li)
      });
      Object.values(itemsAvailable).forEach((i) => {
          const li = document.createElement('li');
          li.classList = 'lss_available';
          li.innerHTML = i.length + ' ' + (document.lss_helper.vehicleTypes[i[0].type] || (i[0].type + ' - ' + i[0].name));
          container.append(li)
      });
      Object.values(itemsUnavailable).forEach((i) => {
          const li = document.createElement('li');
          li.classList = 'lss_unavailable';
          li.innerHTML = i.length + ' ' + (document.lss_helper.vehicleTypes[i[0].type] || (i[0].type + ' - ' + i[0].name));
          container.append(li)
      });
  }



  document.lss_helper.init();
  document.lss_helper.update();
})();