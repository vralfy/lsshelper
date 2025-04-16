// ==UserScript==
// @name         Leistellenspiel Helper
// @namespace    http://tampermonkey.net/
// @version      202504-16-01
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
            "0": "🚒 LF20",
            "1": "🚒 LF10",
            "2": "🚨 DLK",
            "3": "🖥️ ELW 1",
            "4": "🛠️ RW",
            "5": "☁️ GW-A",
            "6": "🚒 LF8/6",
            "7": "🚒 LF20/16",
            "8": "🚒 LF10/6",
            "9": "🚒 LF16-TS",
            "10": "🛢️ GW-Öl",
            "11": "💧 GW-Wasser",
            "12": "📏 GW-Mess",
            "27": "☣️ GW-G",
            "28": "🚑 RTW",
            "30": "🚒 HLF20",
            "32": "🚓 FuStW",
            "33": "🚨 GW-H",
            "34": "🖥️ ELW 2",
            "36": "MTW",
            "37": "🚒 TSF-W",
            "39": "THW GKW",
            "46": "WLF",
            "53": "☣️ Dekon-P",
            "57": "FwK",
            "88": "🚒 KLF",
            "89": "🚒 MLF",
            "90": "🚒 HLF10",
            "118": "💧 KlTaW",
            "120": "💧 TaW",
            "121": "🚒 GT-LF",
            "166": "🚒 PT-LF",
        },
        vehicleGroups: {
            'TEST': [166,121,34],
            'LF': [0,1,6,7,8,9,30,88,89,90],
            'DLK': [2],
            'ELW': [3],
            'RW': [4, 30, 90],
            'RTW': [28],
            'POL': [32],
            'WATER': [121, 166],
            'OIL': [10],
            'smallOil': [10, 0,1,6,7,8,9,30,88,89,90, 4],
            'SONDER': [11, 121, 166]
        },
        buildings: [],
        vehicles: [],
        missions: [],
        scenes: {
            "X" : { "LF": 2 },
            "lf1" : { "LF": 1 },
            "1" : { "LF": 1, "POL": 1 }, // Brennender Abfallcontainer
            "2" : { "LF": 1 }, // Brennender PKW
            "3" : { "LF": 1 }, // Motorradbrand
            "4" : { "LF": 1 }, // Brennendes Gras
            "5" : { "LF": 2, "DLK": 1, "ELW": 1, "POL": 1}, // Zimmerbrand
            "6" : { "LF": 2, "ELW": 1}, // Gartenlaubenbrand
            "7" : { "LF": 1 }, // Brennender PKW
            "8" : { "LF": 1, "POL": 1}, // Sperrmüllbrand
            "9" : { "LF": 1 }, // Strohballenbrand
            "10" : { "LF": 1 }, // Traktorbrand
            "11" : { "LF": 1 }, // Brennende Telefonzelle
            "13" : { "LF": 2, "POL": 1 }, // Brennender LKW
            "14" : { "LF": 2 }, // kleiner Feldbrand
            "16" : { "LF": 2 }, // Wohnungsbrand
            "18" : { "LF": 1 }, // Brennendes Gebüsch
            "19" : { "LF": 1 }, // Brennender Anhänger
            "21" : { "LF": 1, "ELW": 1, "DLK": 1 }, // Schornsteinbrand
            "22" : { "LF": 3, "ELW": 1, "DLK": 1 }, // Dachstuhlbrand
            "23" : { "LF": 1 }, // Fettbrand in Pommesbude
            "25" : { "LF": 1, "RTW": 1}, // Verkehrsunfall
            "26" : { "LF": 3, "DLK": 1, "RW": 1, "ELW": 1, "34": 1 }, // Brand im Supermarkt
            "28" : { "LF": 2 }, // Garagenbrand
            "29" : { "LF": 3, "ELW": 1, "RW": 1, "5": 1 }, // Maschinenbrand
            "30" : { "LF": 1, "OIL": 1 }, // Große Ölspur
            "31" : { "LF": 1, "RW": 1 }, // Auslaufende Betriebsstoffe
            "32" : { "LF": 2, "DLK": 1, "ELW": 1 }, // Kaminbrand
            "33" : { "LF": 2 }, // Mähdrescherbrand
            "36" : { "SONDER": 1, "LF": 4, "ELW": 1, "DLK": 1 }, // Brennender Güterwagon
            "42" : { "LF": 4, "ELW": 1, "DLK": 1, "OIL": 1, "RW": 1, "POL": 2, "12": 1, "27": 1 }, // Tankstellenbrand
            "44" : { "RTW": 1 }, // Alkoholintoxication
            "45" : { "RTW": 1 }, // Nasenbluten unstillbar
            "57" : { "RTW": 1 }, // Gestürzter Fußgänger
            "58" : { "RTW": 1 }, // Gestürzter Radfahrer
            "60" : { "POL": 1}, // Ladendiebstahl
            "67" : { "POL": 1}, // Personalienaufnahme nach Schwarzfahrer
            "72" : { "LF": 1, "RTW": 1, "POL": 1, "33": 1 }, // Bewußtloser Kranführer
            "74" : { "POL": 2 }, // Randalierende Person
            "76" : { "LF": 2 }, // Küchenbrand
            "78" : { "LF": 1 }, // Kleintier in Not
            "79" : { "LF": 1, "ELW": 1, "RTW": 1, "33": 1 }, // Verletzte Person auf Baugerüst
            "82" : { "POL": 1 }, // Einbruch in Wohnung
            "83" : { "LF": 3, "ELW": 1, "RTW": 1, "POL": 2, "27": 1 }, // Gefahrgut-LKW verunglückt
            "89" : { "LF": 3, "ELW": 1, "RW": 1, "POL": 2, "RTW": 1 }, // LKW Auffahrunfall
            "90" : { "POL": 1}, // Ruhestörung
            "94" : { "smallOil": 1}, // kleine Ölspur
            "95" : { "LF": 6, "ELW": 1, "POL": 2, "OIL": 1 }, // ausgedehnte Ölspur
            "97" : { "LF": 3, "ELW": 1, "OIL": 1 }, // Aufgerissener Öltank
            "102" : { "LF": 3, "DLK": 1, "ELW": 1 }, // Feuer in Einfamilienhaus
            "120" : { "LF": 2, "RW": 1, "ELW": 1, "RTW": 1, "57": 1}, // LKW umgestürzt
            "124" : { "LF": 1, "RW": 1, "RTW": 2 }, // Verkehrsunfall
            "126" : { "LF": 2, "RW": 1, "RTW": 3 }, // Verkehrsunfall
            "128" : { "LF": 1, "RTW": 1, "POL": 1 }, // Auffahrunfall
            "131" : { "LF": 5, "ELW": 1, "11": 1}, // Mittlerer Feldbrand
            "132" : { "LF": 6, "ELW": 1, "11": 1}, // Großer Feldbrand
            "138" : { "LF": 2 }, // Flächenbrand
            "139" : { "LF": 4 }, // Flächenbrand
            "142" : { "LF": 2 }, // Feuer auf Balkon
            "144" : { "LF": 1 }, // Brennende Hecke
            "145" : { "POL": 1 }, // Trunkenheitsfahrt
            "149" : { "POL": 1 }, // Pannenfahrzeug
            "150" : { "POL": 1}, // Hausfriedensbruch
            "153" : { "RTW": 1, "POL": 1}, // Hilflose Person
            "161" : { "LF": 1 }, // Baum auf PKW
            "164" : { "RTW": 1 }, // Kopfplatzwunde
            "166" : { "LF": 1, "POL": 1, "ELW": 1 }, // Fassadenteile drohen zu fallen
            "172" : { "LF": 1 }, // Straße unter Wasser
            "190" : { "POL": 1 }, // Diebstahl aus Kfz
            "191" : { "LF": 2 }, // Baum auf Radweg
            "192" : { "LF": 2, "ELW": 2 }, // Brennende Trafostation
            "204" : { "LF": 6, "ELW": 1, "WATER": 1 }, // Scheunenbrand
            "230" : { "LF": 1 }, // Feuerprobealarm an Schule
            "235" : { "LF": 2, "ELW": 1, "RTW": 1, "POL": 1, "33": 1}, // Verletzte Person auf Hochspannungsmast
            "240" : { "LF": 3, "ELW": 1, "27": 1, "RTW": 1, "POL": 1}, // Gasgeruch
            "241" : { "POL": 1 }, //Wildunfall
            "282" : { "LF": 2, "ELW": 1, "RW": 1 }, // Geplatzte Wasserleitung
            "284" : { "POL": 1 }, // Ostereierdieb
            "288" : { "LF": 1 }, // Brennendes Osternest
            "289" : { "OIL": 1 }, // Schokoladenspur auf Straße
            "290" : { "LF": 2 }, // Eierkocherbrand
            "296" : { "LF": 3, "ELW": 1, "RTW": 1 }, // Gasunfall in der Werkstadt
            "300" : { "LF": 2, "POL": 1, "ELW": 1, "DLK": 1, "RTW": 1, "33": 1}, // Abgestürzter Kletterer
            "303" : { "LF": 2 }, // Carportbrand
            "308" : { "LF": 2 }, // Brennender Müllwagen
            "317" : { "LF": 2, "RW": 1, "ELW": 1, "RTW": 1 }, // Person in Baumschine eingeklemmt
            "318" : { "LF": 1 }, // Ausgelöster Heimrauchmelder
            "321" : { "LF": 3, "DLK": 1, "ELW": 1, "POL": 2, "5": 1}, // Saunabrand
            "349" : { "LF": 1 }, // Brandgeruch
            "369" : { "LF": 2, "ELW": 1, "POL": 1, "RTW": 1 }, // Austritt Kohlenmonoxid
            "392" : { "LF": 2, "ELW": 1, "RW": 1, "RTW": 1 }, // Person durch Hubmaschine eingeklemmt
            "397" : { "RTW": 1 }, //Schnittwunde
            "415" : { "POL": 1, "RTW": 1 }, // Jäger verletzt durch Schuss
            "420" : { "RTW": 1 }, // Schlechter Allgemeinzustand
            "431" : { "RTW": 1 }, //Kreislaufkollaps
            "432" : { "LF": 2, "ELW": 1, "DLK": 1, "RW": 1, "POL": 2}, //Fassadenbrand
            "436" : { "LF": 1, "RW": 1, "POL": 1 }, // Verschmutzte Fahrbahn
            "446" : { "LF": 1, "ELW": 1, "POL": 1, "33": 1 }, // Osterhase auf Kran
            "448" : { "POL": 1 }, // Ermittlungen nach Unfallflucht
            "459" : { "LF": 2, "ELW": 1, "RW": 1, "POL": 2, "RTW": 2 }, // Brennende Baumaschine
            "460" : { "LF": 1, "DLK": 1, "ELW": 1, "RW": 1, "RTW": 1 }, // Person in Schacht
            "466" : { "RTW": 1 }, // Badeunfall
            "467" : { "RTW": 1 }, // Badeunfall
            "468" : { "RTW": 1 }, // Badeunfall
            "480" : { "LF": 3, "RW": 1, "ELW": 1, "POL": 2, "RTW": 1 }, // Flugzeugreifenplatzer
            "476" : { "RTW": 1, "POL": 1}, // Angefahrener Radfahrer
            "518" : { "LF": 1 }, // Brennender Baum
            "536" : { "POL": 2 }, // Einbruch in Supermarkt
            "561" : { "RTW": 1 }, // Fremdkörper in Wunde
            "567" : { "POL": 1}, // Diebstahl auf Baustelle
            "575" : { "LF": 1}, // unklare Rauchentwicklung
            "607" : { "POL": 1}, // Verkehrserziehung an Schule
            "608" : { "POL": 1 }, // Abgebrochener Notruf
            "625" : { "LF": 1, "POL": 1, "RTW": 1 }, // Person steckt mit Hand in Kanaldeckel
            "638" : { "LF": 2, "RW": 1, "POL": 1, "RTW": 1 }, // LKW droht umzustürzen
            "644" : { "LF": 8, "ELW": 1, "POL": 2, "WATER": 1, "11": 1 }, // Brand Holzpolter
            "645" : { "LF": 8, "ELW": 1, "POL": 2, "WATER": 1, "5": 1, "11": 1 }, // Brand Holzpolter
            "694" : { "LF": 2, "RW": 1, "POL": 1}, // Gülle ausgelaufen
            "698" : { "LF": 2, "RW": 1, "ELW": 1, "POL": 2}, // Autogasaustritt am PKW
            "700" : { "RTW": 1 }, // Bewusstlose Person am LKW-Steuer
            "724" : { "RTW": 1 }, // Fall von Leiter beim Frühjahrsputz
            "729" : { "RTW": 1 }, // Allergische Reaktion auf Pollen
            "727" : { "LF": 2 }, // Brennender Picknickkorb
            "736" : { "LF": 1, "POL": 1 }, // Schokohase in PKW eingeschlossen
            "739" : { "LF": 2 }, // Absicherung Osterfeuer
            "734" : { "LF": 1 }, // Geschmolzener Osterhase
            "749" : { "LF": 1, "POL": 1}, // E-Call ausgelöst
            "750" : { "LF": 4, "ELW": 1, "POL": 3, "RTW": 2 }, // Brand auf Flohmarkt
            "752" : { "LF": 1, "DLK": 1, "ELW": 1, "RW": 1, "RTW": 1, "POL": 1, "33": 1 }, // Verletzte Person auf Dach
            "778" : { "LF": 1 }, // Brennende Chemietoilette
            "781" : { "LF": 2 }, // Gartenschuppenbrand
            "796" : { "LF": 6, "ELW": 2, "DLK": 1, "RW": 1, "POL": 2, "RTW": 1 }, // Brand in Garagenkomplex
            "823" : { "LF": 1, "RW": 1, "ELW": 1, "POL": 1, "RTW": 4 }, // Unfall mit Reinigungsmitteln
            "865" : { "POL": 1 }, // PKW blockiert Strassenbahn
            "882" : { "POL": 1 }, // Schulschwänzer
            "883" : { "POL": 1 }, // Schulschwänzer
            "926" : { "LF": 4, "ELW": 1 }, // Brandsicherheitswache Rockfestival
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
            ".lss_available, .lss_in_motion, .lss_unavailable {background: #505050}",
            ".lss_available { color: #0a0; }",
            ".lss_in_motion { color: #aa0; }",
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

    document.lss_helper.update = (timeout) => {
        if (timeout && timeout > 0) {
            console.log('LSS Helper Update sheduled in', timeout, 'ms');
            setTimeout(() => {document.lss_helper.update(-1);}, timeout);
            return;
        }
        console.log('LSS Helper Update', timeout);
        document.lss_helper.updateLists();
        document.lss_helper.printVehicleList();
        document.lss_helper.printMissions();
        if (!timeout && document.lss_helper.getSetting('updateInterval', '1000') > 0) {
            setTimeout(() => {document.lss_helper.update();}, document.lss_helper.getSetting('updateInterval', '1000'));
        }
    };

    document.lss_helper.updateLists = (timeout) => {
         if (timeout && timeout > 0) {
            console.log('LSS List Update sheduled in', timeout, 'ms');
            setTimeout(() => {document.lss_helper.updateLists();}, timeout);
            return;
        }

        document.lss_helper.authToken = Array.from(document.getElementsByName('csrf-token'))[0].content;

        document.lss_helper.buildings = Array.from(document.getElementById('building_list').getElementsByClassName('building_list_li'))
        .map((building) => {
            const markerImage = Array.from(building.getElementsByClassName('building_marker_image'))[0];
            const position = Array.from(building.getElementsByClassName('map_position_mover'))[0];
            return {
                name: position.innerHTML.trim(),
                leitstelleId: building.attributes.leitstelle_building_id.value.trim(),
                type: building.attributes.building_type_id.value.trim(),
                lat: parseFloat(position.attributes['data-latitude'].value.trim()),
                lng: parseFloat(position.attributes['data-longitude'].value.trim()),
                vehicles: Array.from(building.getElementsByClassName('building_list_vehicle_element')),
                links: Array.from(building.getElementsByTagName('a')).map(l => l.cloneNode(true)),
                origin: building,
                markerImage,
                position,
            };
        });

        document.lss_helper.vehicles = document.lss_helper.buildings.map((b) => {
            return Array.from(b.origin.getElementsByClassName('building_list_vehicle_element'))
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
                    origin: vehicle,
                    building: b,
                };
            });
        })
        .reduce((acc, cur) => [...acc, ...cur], [])
        .sort((a,b) => a.name < b.name ? -1 : 1 )
        .sort((a,b) => a.type < b.type ? -1 : 1 )
        .sort((a,b) => a.status < b.status ? -1 : 1 );

        document.lss_helper.missions = Array.from(document.querySelectorAll(".missionSideBarEntry:not(.mission_deleted)"))
        .map((m) => {
            const links = Array.from(m.getElementsByTagName('a')).map((l) => l.cloneNode(true));
            const position = Array.from(m.getElementsByClassName('map_position_mover'))[0];
            return {
                id: m.attributes['id'].value.trim(),
                missionId: m.attributes['mission_id'].value.trim(),
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
                origin: m,
                position,
            }
        })
        .map((m) => {
            return {
                stateNum: m.finishing ? 1000 : (m.attended ? 100 : 10),
                scene: document.lss_helper.scenes[m.missionType],
                proposedVehicles: document.lss_helper.getVehiclesByMission(m),
                ...m
            };
        })
        .sort((m1, m2) => m2.data.average_credits - m1.data.average_credits)
        .sort((m1, m2) => m1.hasAlert ? (m2.hasAlert ? 0 : -1) : (m2.hasAlert ? 1 : 0))
        .sort((m1, m2) => m1.stateNum < m2.stateNum ? -1 : 0);
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
        const itemsInMotion = {};
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
            .filter((v) => v.status === '3')
            .forEach((v) => {
                const idx = v.type;
                itemsInMotion[idx] = itemsInMotion[idx] || [];
                itemsInMotion[idx].push(v);
            });
            document.lss_helper.vehicles
            .filter((v) => !v.available)
            .filter((v) => v.status === '4')
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
        if (Object.keys(itemsInMotion).length) {
            Object.values(itemsInMotion).forEach((i) => {
                const li = document.createElement('li');
                li.classList = 'lss_in_motion';
                li.innerHTML = i.length + ' ' + (document.lss_helper.vehicleTypes[i[0].type] || (i[0].type + ' - ' + i[0].name));
                containerUnavailable.append(li)
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
        .forEach((m) => {
            const li = document.createElement('li');
            li.classList = [
                m.finishing ? 'state_finishing': '',
                m.attended ? 'state_attended': '',
                m.unattended ? 'state_unattended': '',
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
                if (document.lss_helper.scenes[m.missionType] && document.lss_helper.getVehiclesByMission(m, m.missionType) && document.lss_helper.getSetting('show_mission_type', 'true')) {
                    const btn2 = document.createElement('a');
                    btn2.classList= 'btn btn-xs btn-default';
                    btn2.innerHTML = '🚨';
                    btn2.onclick = () => {document.lss_helper.sendByScene(m)};
                    leftContainer.appendChild(btn2);
                } else {
                    if (document.lss_helper.getVehiclesByMission(m, 'lf1') && document.lss_helper.getSetting('show_mission_lf1', 'true')) {
                        const btn = document.createElement('a');
                        btn.classList= 'btn btn-xs btn-default';
                        btn.innerHTML = '🚒';
                        btn.onclick = () => {document.lss_helper.sendByScene(m, 'lf1')};
                        leftContainer.appendChild(btn);
                    }
                    if (document.lss_helper.getVehiclesByMission(m) && document.lss_helper.getSetting('show_mission_lf2', 'true')) {
                        const btn2 = document.createElement('a');
                        btn2.classList= 'btn btn-xs btn-default';
                        btn2.innerHTML = '🚒🚒';
                        btn2.onclick = () => {document.lss_helper.sendByScene(m)};
                        leftContainer.appendChild(btn2);
                    }
                }
            }

            if (document.lss_helper.getSetting('show_mission_age', 'false')) {
                const age = Math.floor(
                    Math.abs(new Date() - new Date(m.data.created_at * 1000)) / (100 * 60 * 60)
                ) / 10;
                const ageContainer = document.createElement('span');
                ageContainer.innerHTML = age + 'h';
                centerContainer.appendChild(ageContainer);
            }

            if (document.lss_helper.getSetting('show_mission_credits', 'false')) {
                const creditContainer = document.createElement('span');
                creditContainer.innerHTML = m.data.average_credits + '$';
                centerContainer.appendChild(creditContainer);
            }

            const txt = m.links[0];
            txt.innerHTML = m.data.caption + ' (' + m.missionType + ')';
            txt.style = 'margin-left: 4px';
            rightContainer.appendChild(txt);

            if (document.lss_helper.scenes[m.missionType]) {
                const checkmark = document.createElement('span');
                checkmark.innerHTML = '✔️';
                rightContainer.appendChild(checkmark);
            }
        });
    };

    document.lss_helper.getVehiclesByMission = (mission, scene) => {
        scene = scene || (document.lss_helper.scenes[mission.missionType] ? mission.missionType : null) || 'X';
        scene = document.lss_helper.scenes[scene];
        let available = document.lss_helper.vehicles
          .filter((v) => v.available)
          .map((v) => {
              const lat = (mission.lat ?? 0) - (v.building.lat ?? 0);
              const lng = (mission.lng ?? 0) - (v.building.lng ?? 0);
              return {
                  distance: Math.sqrt(lat * lat + lng * lng),
                  ...v,
              };
          })
          .sort((v1, v2) => {
              return v1.distance - v2.distance;
          });
        const vehicles = Object.keys(scene).map((vt) => {
            const groups = (document.lss_helper.vehicleGroups[vt] ?? [vt]).map((v) => '' + v);
            const r = available.filter((v) => groups.indexOf(v.type) >= 0).slice(0, scene[vt]);
            const ids = r.map(v => v.id);
            available = available.filter((v) => ids.indexOf(v.id) < 0);
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