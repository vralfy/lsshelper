// ==UserScript==
// @name         Leistellenspiel Helper
// @namespace    http://tampermonkey.net/
// @version      2025-04-09
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
      vehicles: [],
  };

  document.lss_helper.init = () => {
      $([
          "<style type='text/css' id='lss_helper_css'>",
          ".leaflet-marker-icon[src*='red'], .leaflet-marker-icon[src*='rot']{ filter: drop-shadow(0px 0px 8px red);}",
          ".leaflet-marker-icon[src*='yellow'], .leaflet-marker-icon[src*='gelb']{ filter: drop-shadow(0px 0px 8px yellow);}",
          ".leaflet-marker-icon[src*='green'], .leaflet-marker-icon[src*='gruen']{ filter: drop-shadow(0px 0px 8px green);}",
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
          return {status: status.innerHTML, type: link.attributes.vehicle_type_id.value, name: link.innerHTML, link: link.cloneNode(true)};
      });
  };

  document.lss_helper.getHelperContainer = () => {
      var container = document.getElementById('lss_helper');
      if (!container) {
          container = document.createElement("div");
          container.id = 'lss_helper';
          container.style = [
              'position:fixed',
              'top:10px',
              'left:10px',
              'padding:4px',
              'background:#000d',
              'border:1px solid #000',
              'border-radius:4px',
              'min-width:100px',
              'min-height:100px',
              'z-index:99999',
          ].join(';');
          const headline = document.createElement('h5');
          headline.innerHTML = 'Leitstellenspiel Helper';
          container.appendChild(headline);
          const body = document.getElementsByTagName('body')[0];
          console.warn('body', body);
          body.appendChild(container);
      }
      return container;
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

      const items = {};
      document.lss_helper.vehicles
      .filter((v) => ['1','2'].indexOf(v.status) >= 0)
      .sort((a,b) => a.type < b.type ? -1 : 1 )
      .sort((a,b) => a.status < b.status ? -1 : 1 )
      .forEach((v) => {
          if (!items[v.status]) {
              items[v.status] = document.createElement('li');
              items[v.status].innerHTML = v.status + ' - ';
          }
          items[v.status].append(v.link);
      });
      Object.values(items).forEach((li) => container.append(li));
  }



  document.lss_helper.init();
  document.lss_helper.update();
})();