// ==UserScript==
// @name         Leistellenspiel Helper - Distribution AddOn
// @namespace    http://tampermonkey.net/
// @version      202506-20-01
// @description  try to take over the world!
// @author       You
// @match        https://www.leitstellenspiel.de/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=leitstellenspiel.de
// @grant        none
// ==/UserScript==

(function () {
  'use strict';
  $([
    '<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/p5@1.11.5/lib/p5.min.js"></script>',
    '<script src="https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js"></script>',
    '<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/d3-delaunay@6.0.4/dist/d3-delaunay.min.js"></script>',
  ].join('\n')).appendTo("head");

  document.lss_helper_distribution = {
    graph: {
      width: 1000,
      height: 800,
      borderX: 0.05,
      borderY: 0.05,
    }
  };

  document.lss_helper_distribution.init = () => {
    if (!document.lss_helper || typeof p5 === 'undefined') {
      console.warn('Leistellenspiel Helper or p5js not found');
      setTimeout(() => document.lss_helper_distribution.init(), 1000);
      return;
    }

    document.lss_helper.getSetting('distribution_size', '1000');
    document.lss_helper.getSetting('distribution_leitstelle', 'true');
    document.lss_helper.getSetting('distribution_firehouse', 'true');
    document.lss_helper.getSetting('distribution_police', 'false');
    document.lss_helper.getSetting('distribution_rescue', 'false');
    document.lss_helper.getSetting('distribution_thw', 'false');
    document.lss_helper.getSetting('distribution_dlrg', 'false');
    document.lss_helper.getSetting('distribution_bepo', 'false');
    document.lss_helper.getSetting('distribution_school', 'false');

    document.lss_helper.getSetting('distribution_mission', 'true');

    var container = document.getElementById('lss_helper_addon_distribution');
    if (!container) {
      container = document.createElement("div");
      container.id = 'lss_helper_addon_distribution';
      container.classList = 'col-sm-12 overview_outer bigMapWindow';
      const buildings = document.getElementById('chat_outer');
      buildings.insertAdjacentElement('beforebegin', container);
    }
    var innerContainer = document.getElementById('lss_helper_addon_distribution_container');
    if (!innerContainer) {
      const panel = document.createElement('div');
      panel.classList = 'panel panel-default';
      container.append(panel);

      const panelHeader = document.createElement('div');
      panelHeader.classList = 'panel-heading big_map_window_head';
      panelHeader.innerHTML = 'Leitstellenspiel Helper - Distribution';
      panel.append(panelHeader);

      const body = document.createElement('div');
      body.classList = 'panel-body';
      panel.append(body);

      body.innerHTML = '<div class="container-fluid"><div class="row">' +
        '<div class="col-sm-12" id="lss_helper_addon_distribution_settings" style="text-align: center"></div>' +
        '<div class="col-sm-12" id="lss_helper_addon_distribution_container" style="text-align: center"></div>' +
        '</div></div>';
    }

    document.lss_helper_distribution.update();
  };

  document.lss_helper_distribution.update = (timeout) => {
    if (timeout && timeout > 0) {
      setTimeout(() => { document.lss_helper_distribution.update(-1); }, timeout);
      return;
    }
    if (!document.lss_helper_distribution.p5 && document.lss_helper.getSetting('distribution')) {
        document.lss_helper_distribution.p5 = new p5((sketch) => {
            sketch.setup = document.lss_helper_distribution.p5Setup;
            sketch.draw = document.lss_helper_distribution.p5Draw;
        });
    }

    const container = document.getElementById('lss_helper_addon_distribution');
    const settingsContainer = 'lss_helper_addon_distribution_settings';
    container.style.display = document.lss_helper.getSetting('distribution') ? 'block' : 'none';
    document.lss_helper.printSettingsButton('distribution', 'Verteilungsgraph', 'col-sm-12');
    document.lss_helper.printSettingsButton('distribution_leitstelle', 'Verteilung Leitstelle', null, settingsContainer);
    document.lss_helper.printSettingsButton('distribution_firehouse', 'Verteilung Feuerwehr', null, settingsContainer);
    document.lss_helper.printSettingsButton('distribution_police', 'Verteilung Polizei', null, settingsContainer);
    document.lss_helper.printSettingsButton('distribution_rescue', 'Verteilung Rettungswache', null, settingsContainer);
    document.lss_helper.printSettingsButton('distribution_hospital', 'Verteilung Krankenhäuser', null, settingsContainer);
    document.lss_helper.printSettingsButton('distribution_thw', 'Verteilung THW', null, settingsContainer);
    document.lss_helper.printSettingsButton('distribution_dlrg', 'Verteilung Wasserrettung', null, settingsContainer);
    document.lss_helper.printSettingsButton('distribution_bepo', 'Verteilung Bereitschaftspolizei', null, settingsContainer);
    document.lss_helper.printSettingsButton('distribution_school', 'Verteilung Schulen', null, settingsContainer);

    document.lss_helper.printSettingsNumberInput('distribution_size', 'Größe', null, settingsContainer);
    document.lss_helper.printSettingsButton('distribution_available_only', 'nur verfuegbare Fahrzeuge', 'col-sm-12', settingsContainer);
    document.lss_helper.printSettingsButton('distribution_mission', 'Einsatz', null, settingsContainer);

    if (!timeout && document.lss_helper.getSetting('updateInterval', '1000') > 0) {
      setTimeout(() => { document.lss_helper_distribution.update(); }, document.lss_helper.getSetting('updateInterval', '1000'));
    }
  };

  document.lss_helper_distribution.coord = (lng, lat) => {
      if (typeof lng === 'object') {
          lat = lng.lat; // y
          lng = lng.lng; // x
      }
      const graph = document.lss_helper_distribution.graph;
      return {
          x: (lng - graph.centerX) * graph.scaleX,
          y: (lat - graph.centerY) * graph.scaleY,
          // Map longitude and latitude to canvas coordinates relative to minLng/minLat
          // x: (lng - graph.minLng) * gr0aph.scaleX - graph.width / 2,
          // y: (lat - graph.minLat) * graph.scaleY - graph.height / 2,
      }
  }

  document.lss_helper_distribution.p5Setup = () => {
    if (!document.lss_helper_distribution.p5) {
      console.warn('p5js not ready yet');
      setTimeout(() => document.lss_helper_distribution.p5Setup(), 1000);
      return;
    }
    document.lss_helper_distribution.graph.width = document.getElementById('lss_helper_addon_distribution') ? document.getElementById('lss_helper_addon_distribution').clientWidth - 100 : document.lss_helper_distribution.graph.width;
    document.lss_helper_distribution.graph.width = Math.min(document.lss_helper_distribution.graph.width, document.lss_helper.getSetting('distribution_size', '1000'));
    document.lss_helper_distribution.graph.height = document.lss_helper_distribution.graph.width;
    document.lss_helper_distribution.canvas = document.lss_helper_distribution.p5.createCanvas(document.lss_helper_distribution.graph.width, document.lss_helper_distribution.graph.height);
    document.lss_helper_distribution.canvas.parent('lss_helper_addon_distribution_container');

  };

  document.lss_helper_distribution.delaunay = (buildings) => {
    const p5 = document.lss_helper_distribution.p5;
    const graph = document.lss_helper_distribution.graph;

    const points = buildings.reduce((acc, cur) => {
      const c = document.lss_helper_distribution.coord(cur);
      return [...acc, c.x, c.y]
    }, []);
    const delaunay = new d3.Delaunay(points);
    const voronoi = delaunay.voronoi([graph.width / -2, graph.height / -2, graph.width / 2, graph.height / 2]);
    const polygons = Array.from(voronoi.cellPolygons());

    polygons.forEach((polygon) => {
      document.lss_helper_distribution.p5.beginShape();
      polygon.forEach((p) => document.lss_helper_distribution.p5.vertex(p[0], p[1]));
      document.lss_helper_distribution.p5.endShape();
    });

    p5.fill(0);
    buildings.forEach((b) => {
      const c = document.lss_helper_distribution.coord(b);
      p5.circle(c.x, c.y, 3);
      p5.text(b.name, c.x, c.y);
    });
  };

  document.lss_helper_distribution.p5Draw = () => {
    if (!document.lss_helper_distribution.p5) {
      return;
    }
    if (!document.lss_helper.buildings || !document.lss_helper.buildings.length) {
      return;
    }

    const p5 = document.lss_helper_distribution.p5;
    const graph = document.lss_helper_distribution.graph;
    p5.background(255);

    graph.minLat = document.lss_helper.buildings.reduce((acc, cur) => Math.min(acc, cur.lat), 720) - graph.borderY;
    graph.maxLat = document.lss_helper.buildings.reduce((acc, cur) => Math.max(acc, cur.lat), -720) + graph.borderY;
    graph.minLng = document.lss_helper.buildings.reduce((acc, cur) => Math.min(acc, cur.lng), 720) - graph.borderX;
    graph.maxLng = document.lss_helper.buildings.reduce((acc, cur) => Math.max(acc, cur.lng), -720) + graph.borderX;
    graph.offsetX = (graph.minLng + graph.maxLng) / -2;
    graph.offsetY = (graph.minLat + graph.maxLat) / -2;
    graph.centerX = graph.minLng + (graph.maxLng - graph.minLng) / 2;
    graph.centerY = graph.minLat + (graph.maxLat - graph.minLat) / 2;
    graph.scaleX = graph.width / (graph.maxLng - graph.minLng);
    graph.scaleY = graph.height / (graph.maxLat - graph.minLat) * -1;

    p5.translate(graph.width / 2, graph.height / 2);

    // DEBUG
    //p5.stroke(200, 0, 200);
    //p5.noFill();
    //p5.circle(0, 0, 10);
    //p5.circle(document.lss_helper_distribution.coord(0,0).x, document.lss_helper_distribution.coord(0,0).y, 5);
    //p5.line(graph.width, graph.height, -graph.width, -graph.height);

    if (document.lss_helper.getSetting('distribution_leitstelle')) {
      p5.stroke(0, 200, 200);
      p5.noFill();
      document.lss_helper_distribution.delaunay(document.lss_helper.buildings.filter((b) => b.type === "7")); // Feuerwehr
    }
    if (document.lss_helper.getSetting('distribution_firehouse')) {
      p5.stroke(255, 0, 0);
      p5.noFill();
      document.lss_helper_distribution.delaunay(document.lss_helper.buildings.filter((b) => b.type === "0")); // Feuerwehr
    }
    if (document.lss_helper.getSetting('distribution_police')) {
      p5.stroke(0, 100, 0);
      p5.noFill();
      document.lss_helper_distribution.delaunay(document.lss_helper.buildings.filter((b) => b.type === "6")); // Polizei
    }
    if (document.lss_helper.getSetting('distribution_rescue')) {
      p5.stroke(255, 100, 100);
      p5.noFill();
      document.lss_helper_distribution.delaunay(document.lss_helper.buildings.filter((b) => b.type === "2")); // Rettungswache
    }
    if (document.lss_helper.getSetting('distribution_hospital')) {
      p5.stroke(200, 100, 100);
      p5.noFill();
      document.lss_helper_distribution.delaunay(document.lss_helper.buildings.filter((b) => b.type === "4")); // Rettungswache
    }
    if (document.lss_helper.getSetting('distribution_thw')) {
      p5.stroke(0, 0, 200);
      p5.noFill();
      document.lss_helper_distribution.delaunay(document.lss_helper.buildings.filter((b) => b.type === "9")); // THW
    }
    if (document.lss_helper.getSetting('distribution_dlrg')) {
      p5.stroke(0, 0, 255);
      p5.noFill();
      document.lss_helper_distribution.delaunay(document.lss_helper.buildings.filter((b) => b.type === "15")); // Wasserrettung
    }
    if (document.lss_helper.getSetting('distribution_bepo')) {
      p5.stroke(0, 200, 0);
      p5.noFill();
      document.lss_helper_distribution.delaunay(document.lss_helper.buildings.filter((b) => ["11", "13", "17"].indexOf(b.type) >= 0)); // Bereitschaftspolizei
    }
    if (document.lss_helper.getSetting('distribution_school')) {
      p5.stroke(100, 200, 0);
      p5.noFill();
      document.lss_helper_distribution.delaunay(document.lss_helper.buildings.filter((b) => ["1", "3", "8", "10"].indexOf(b.type) >= 0)); // Schulen
    }

    const types = [
        ...Object.keys(document.lss_helper.vehicleTypes)
        .sort((s1, s2) => document.lss_helper.vehicleTypes[s1] < document.lss_helper.vehicleTypes[s2] ? -1 : 1)
        .filter((gkey) => {
            const name = document.lss_helper.vehicleTypes[gkey];
            const id = 'lss_helper_settings_distribution_vehicle_' + gkey;
            document.lss_helper.printSettingsButton('distribution_vehicle_' + gkey, 'Distribution ' + name, null, 'lss_helper_addon_distribution_settings');
            return document.lss_helper.getSetting('distribution_vehicle_' + gkey);
        }),

    ];

    Object.keys(document.lss_helper.vehicleTypes).forEach((gkey) => {
        const id = 'lss_helper_settings_distribution_vehicle_' + gkey;
        const amount = document.lss_helper.vehicles.filter((v) => v.type === gkey).length;
        document.getElementById(id).style = 'display:' + (amount ? 'block' : 'none');
    });

    p5.stroke(0, 0, 0);
    p5.fill(255, 0, 0, 25);
    document.lss_helper_distribution.delaunay(
        document.lss_helper.vehicles
        .filter((v) => types.indexOf(v.type) >= 0)
        .filter((v) => v.available || !document.lss_helper.getSetting('distribution_available_only'))
    );

    if (document.lss_helper.getSetting('distribution_mission') && document.lss_helper.missionDetails) {
        p5.stroke(0,0,0);
        p5.fill(255, 0, 0, 255);
        const mission = document.lss_helper.missions.find((m) => m.data.id === document.lss_helper.missionDetails);
        const cm = document.lss_helper_distribution.coord(mission);
        p5.circle(cm.x, cm.y, 5);
        if (mission.proposedVehicles) {
            const vehicles = mission.proposedVehicles.reduce((acc, cur) => [...acc, ...cur], []);
            p5.stroke(255,0,0);
            p5.noFill();
            vehicles.forEach((v) => {
                const cv = document.lss_helper_distribution.coord(v);
                p5.line(cm.x, cm.y, cv.x, cv.y);
            });
        }
    }

    //p5.noLoop();
  };

  document.lss_helper_distribution.init();
})();