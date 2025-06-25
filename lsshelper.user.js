// ==UserScript==
// @name         Leistellenspiel Helper
// @namespace    http://tampermonkey.net/
// @version      202506-24-01
// @description  try to take over the world!
// @author       You
// @match        https://www.leitstellenspiel.de/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=leitstellenspiel.de
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    document.lss_helper = {
        storage: localStorage,
        vehicleTypes: {
            "0": "🚒 LF20"
        },
        vehicles: [],
        vehicleGroups: {
            'TEST': [1, 2],
        },
        vehicleAAO: { "AAODEBUG": { "107": 2, "108": 3 } },
        vehicleResend: {},
        vehicleResendMissing: [],
        stateOrder: ['2', '1', '7', '3', '4', '5', '8', '9', '6'],
        statesAvailable: ['1', '2'],
        statesCall: ['5'],
        statesTransit: ['7'],
        vehicleStatesAvailable: {},
        vehicleSpeed: [
            { t: 49, s: 0.64 },
            { t: 636, s: 14.42 },
            { t: 370, s: 5.15 }
        ].map((o) => o.s / o.t).reduce((acc, cur) => acc + cur, 0) / 3,
        scenes: {
            "X": { "LF": 2 },
            "lf1": { "LF": 1 },
            "lf2": { "LF": 2 },
        },
        buildings: [],
        missions: [],
        helper: {
            formatNumber: (arg) => { return arg; },
            hash: () => { return '' + Math.floor(Math.random() * 1000000); },
            getDistance: (obj1, obj2) => 0,
        }
    };

    document.lss_helper.debug = console.debug;
    document.lss_helper.log = console.log;
    document.lss_helper.warn = console.warn;
    document.lss_helper.error = console.error;

    document.lss_helper.getSetting = (key, def) => {
        if (!localStorage.getItem('lss_helper_' + key)) {
            localStorage.setItem('lss_helper_' + key, def ?? 'false');
        }
        return JSON.parse(localStorage.getItem('lss_helper_' + key) ?? (def ?? 'false'));
    };

    document.lss_helper.setSetting = (key, def) => {
        localStorage.setItem('lss_helper_' + key, def ?? 'false');
    };

    document.lss_helper.setDefaultSetting = (key, def) => {
        const v = document.lss_helper.getSetting(key, def);
        document.lss_helper.setSetting(key, v ? v : def);
    };

    document.lss_helper.init = () => {
        document.lss_helper.log('initiating');
        $([
            "<style type='text/css' id='lss_helper_css'>",
            //"#buildings_outer .panel-body {max-height: initial;height:initial;overflow:visible}",
            ".leaflet-marker-icon[src*='red'], .leaflet-marker-icon[src*='rot']{ filter: drop-shadow(0px 0px 8px red);}",
            ".leaflet-marker-icon[src*='yellow'], .leaflet-marker-icon[src*='gelb']{ filter: drop-shadow(0px 0px 8px yellow);}",
            ".leaflet-marker-icon[src*='green'], .leaflet-marker-icon[src*='gruen']{ filter: drop-shadow(0px 0px 8px green);}",
            ".hidden { display: none }",
            "#lss_helper_missions > li { border-top: 1px solid #0007; border-bottom: 1px solid fff7; }",
            "#lss_helper_container #lss_helper_missions .sendVehicles {}",
            "#lss_helper_container.sendVehicles #lss_helper_missions .sendVehicles { display: none }",
            ".lss_available, .lss_in_motion, .lss_unavailable {background: #505050;font-size:18px;padding:0 2px}",
            ".lss_available { color: #0a0; }",
            ".lss_in_motion { color: #aa0; }",
            ".lss_unavailable { color: #a00; }",
            ".lss_call { color: '#f00'; }",
            ".state_finishing { color: #000; background: #0f0 }",
            ".state_unattended { color: #000; background: #f00 }",
            ".state_attended { color: #000; background: #ff0 }",
            "#mission_general_info, #back_to_mission { text-align:right }",
            ".mission_detail { display: block; padding: 2px 4px; margin: 0; border-left: 1px solid #0007; border-right: 1px solid #3337; }",
            "#missions .panel-success .panel-heading {linear-gradient(to bottom, #01a901 0, #005900 100%) !important}",
            "#missions .panel-success .panel-body {linear-gradient(to bottom, #01a901 0, #005900 100%) !important}",
            "</style>"
        ].join("\n")).appendTo("head");

        const vehicleListElement = document.getElementById('building_panel_body');
        vehicleListElement.scrollTo(0, 0);
        const scrollInterval = setInterval(() => {
            if (vehicleListElement) {
                document.lss_helper.log('Try to scroll down vehicle list');
                const scroll = 400;
                vehicleListElement.scrollTo(0, vehicleListElement.scrollTop + scroll);
                if (vehicleListElement.scrollHeight < (vehicleListElement.scrollTop + 2 * scroll)) {
                    clearInterval(scrollInterval);
                }
            }
        }, 500);

        document.lss_helper.getSetting('channel', '"master"');

        document.lss_helper.setSetting('autoAccept', 'false');
        document.lss_helper.setSetting('autoResend', 'false');
        document.lss_helper.getSetting('autoResendAll', 'true');
        document.lss_helper.setSetting('autoPatient', 'false');
        document.lss_helper.setSetting('autoPrisoner', 'false');

        document.lss_helper.setDefaultSetting('loglevel', '550');
        document.lss_helper.setDefaultSetting('updateInterval', '1000');
        document.lss_helper.setDefaultSetting('autoAcceptInterval', '5000');
        document.lss_helper.setDefaultSetting('autoAcceptMaxAttended', '5');
        document.lss_helper.setDefaultSetting('autoAcceptMaxDistance', '9999');
        document.lss_helper.setDefaultSetting('maxRTW', '99');
        document.lss_helper.setDefaultSetting('update_scenes', '100000');

        document.lss_helper.getSetting('mission_sort', '"none"');
        document.lss_helper.getSetting('show_vehicle_available', 'true');
        document.lss_helper.getSetting('show_vehicle_call', 'true');
        document.lss_helper.getSetting('show_vehicle_unavailable', 'true');
        document.lss_helper.getSetting('show_vehicle_summary', 'false');
        document.lss_helper.getSetting('show_vehicle_missing', 'false');
        document.lss_helper.getSetting('show_missions', 'true');

        document.lss_helper.getSetting('show_mission_age', 'true');
        document.lss_helper.getSetting('show_mission_credits', 'true');
        document.lss_helper.getSetting('show_mission_credits_rate', 'false');
        document.lss_helper.getSetting('show_mission_max_distance', 'false');
        document.lss_helper.getSetting('show_mission_lf1', 'true');
        document.lss_helper.getSetting('show_mission_lf2', 'true');
        document.lss_helper.getSetting('show_mission_type', 'true');

        document.lss_helper.getSetting('mission_verband', 'false');
        document.lss_helper.getSetting('optimize_scene', 'false');
    };

    document.lss_helper.update = (timeout) => {
        if (timeout && timeout > 0) {
            document.lss_helper.debug('LSS Helper Update sheduled in', timeout, 'ms');
            setTimeout(() => { document.lss_helper.update(-1); }, timeout);
            return;
        }
        document.lss_helper.debug('LSS Helper Update', timeout);
        document.lss_helper.updateLists(-1);
        if (document.lss_helper.helper.hash() !== document.lss_helper.renderHash) {
            document.lss_helper.printVehicleList();
            document.lss_helper.printMissions();
            document.lss_helper.printMissingVehicles();
            document.lss_helper.printScene();
            document.lss_helper.renderHash = document.lss_helper.helper.hash();
        }
        document.lss_helper.printSettings();
        if (!timeout && document.lss_helper.getSetting('updateInterval', '1000') > 0) {
            setTimeout(() => { document.lss_helper.update(); }, document.lss_helper.getSetting('updateInterval', '1000'));
        }
    };

    document.lss_helper.updateLists = (timeout) => {
        if (timeout && timeout > 0) {
            document.lss_helper.debug('LSS List Update sheduled in', timeout, 'ms');
            setTimeout(() => { document.lss_helper.updateLists(-1); }, timeout);
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
                    const state = status.innerHTML.trim();
                    const type = link.attributes.vehicle_type_id.value.trim();
                    const availableStates = document.lss_helper.vehicleStatesAvailable[type] ?? document.lss_helper.statesAvailable;
                    return {
                        id: parseInt(vehicle.attributes.vehicle_id.value.trim()),
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
                    };
                });
        })
            .reduce((acc, cur) => [...acc, ...cur], [])
            .sort((a, b) => a.name < b.name ? -1 : 1)
            .sort((a, b) => parseInt(a.type) - parseInt(b.type))
            .sort((a, b) => document.lss_helper.stateOrder.indexOf(a.status) - document.lss_helper.stateOrder.indexOf(b.status))
            ;

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
                let patients = m.info.patients.children.length;
                const patientSummary = m.info.patients.getElementsByTagName('strong');
                if (patientSummary.length) {
                    patients = parseInt(patientSummary[0].innerHTML.replaceAll(/[^0-9]*/gi, ''));
                }
                let prisoners = m.info.prisoners.children.length;

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
                const resend = (m.info?.missing?.querySelector('[data-requirement-type="vehicles"]')?.innerText ?? '')
                    .replaceAll(/.*: /g, '')
                    .split(',')
                    .map((s) => s.trim())
                    .filter((s) => s && s.length)
                    .map((s) => {
                        const p = s.match(/^([0-9]+)\s+(.+)$/);
                        if (!p || p.length < 3) {
                            return null;
                        }
                        return {
                            count: parseInt(p[1]),
                            type: p[2].trim().replace(/\s/g, ' '),
                        };
                    })
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
                if (m.info?.patients?.innerText.indexOf(' LNA') >= 0) {
                    resend.push({ scene: 'LNA', count: 1 });
                }
                const resendScene = {};
                resend.forEach((r) => {
                    resendScene[r.scene] = (resendScene[r.scene] || 0) + r.count;
                });
                return {
                    ...m,
                    resend,
                    resendScene,
                    resendVehicles: document.lss_helper.getVehiclesByScene(JSON.parse(JSON.stringify(m)), JSON.parse(JSON.stringify(resendScene)), !document.lss_helper.getSetting('autoResendAll')),
                }
            })
            .filter((m) => !m.data.caption.includes('[Verband]') || document.lss_helper.getSetting('mission_verband'))
            .sort((m1, m2) => m2.sort[document.lss_helper.getSetting('mission_sort') ?? 'none'] > m1.sort[document.lss_helper.getSetting('mission_sort') ?? 'none'] ? -1 : 1)
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
            panelHeader.onclick = () => {
                document.lss_helper.updateLists(-1);
            };
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

    document.lss_helper.printSettingsButton = (setting, caption, cls, container) => {
        caption = caption || setting;
        cls = cls || 'col-sm-2';
        container = container || 'lss_helper_settings'
        let settingsContainer = document.getElementById(container);
        if (!settingsContainer) {
            const container = document.createElement('div');
            container.classList = 'col-sm-12 container-fluid';
            const main = document.lss_helper.getHelperContainer();
            main.appendChild(container);

            settingsContainer = document.createElement("div");
            settingsContainer.id = 'lss_helper_settings';
            settingsContainer.classList = 'row';
            container.appendChild(settingsContainer);
        }

        let btn = document.getElementById('lss_helper_settings_' + setting);
        if (!btn) {
            btn = document.createElement("div");
            btn.id = 'lss_helper_settings_' + setting;
            btn.innerHTML = caption;
            btn.onclick = () => {
                document.lss_helper.setSetting(setting, document.lss_helper.getSetting(setting) ? 'false' : 'true');
                document.lss_helper.renderHash = null;
            };
            settingsContainer.appendChild(btn);
        }
        btn.classList = cls + ' btn btn-xs ' + (document.lss_helper.getSetting(setting) ? 'btn-success' : 'btn-danger');
        return btn;
    };

    document.lss_helper.printSettingsNumberInput = (setting, caption, cls, container) => {
        caption = caption || setting;
        cls = cls || 'col-sm-3';
        container = container || 'lss_helper_settings'
        let settingsContainer = document.getElementById(container);
        if (!settingsContainer) {
            const container = document.createElement('div');
            container.classList = 'col-sm-12 container-fluid';
            const main = document.lss_helper.getHelperContainer();
            main.appendChild(container);

            settingsContainer = document.createElement("div");
            settingsContainer.id = 'lss_helper_settings';
            settingsContainer.classList = 'row';
            container.appendChild(settingsContainer);
        }

        let input = document.getElementById('lss_helper_settings_' + setting);
        if (!input) {
            const container = document.createElement('div');
            container.classList = cls;
            container.style = 'display: flex; flex-direction:column';
            container.innerHTML = caption + ': ';
            settingsContainer.appendChild(container);

            input = document.createElement("input");
            input.id = 'lss_helper_settings_' + setting;
            input.onblur = () => {
                document.lss_helper.setSetting(setting, input.value);
                document.lss_helper.renderHash = null;
            };
            container.appendChild(input);
        }

        const v = document.lss_helper.getSetting(setting, '0');
        if (input.value != v && input !== document.activeElement) {
            input.value = v;
        }

        return input;
    };

    document.lss_helper.printSettingsSelect = (setting, caption, cls, options, container) => {
        caption = caption || setting;
        cls = cls || 'col-sm-3';
        container = container || 'lss_helper_settings'
        let settingsContainer = document.getElementById(container);
        if (!settingsContainer) {
            const container = document.createElement('div');
            container.classList = 'col-sm-12 container-fluid';
            const main = document.lss_helper.getHelperContainer();
            main.appendChild(container);

            settingsContainer = document.createElement("div");
            settingsContainer.id = 'lss_helper_settings';
            settingsContainer.classList = 'row';
            container.appendChild(settingsContainer);
        }

        let input = document.getElementById('lss_helper_settings_' + setting);
        if (!input) {
            const container = document.createElement('div');
            container.classList = cls;
            container.style = 'display: flex; flex-direction:column';
            container.innerHTML = caption + ': ';
            settingsContainer.appendChild(container);

            input = document.createElement("select");
            input.id = 'lss_helper_settings_' + setting;
            input.onblur = () => {
                document.lss_helper.setSetting(setting, JSON.stringify(input.value));
                document.lss_helper.renderHash = null;
            };
            container.appendChild(input);

            options.forEach(option => {
                const opt = document.createElement("option");
                opt.value = option.value;
                opt.innerHTML = option.label ?? option.value;
                input.appendChild(opt);
            });
        }

        const v = document.lss_helper.getSetting(setting, '0');
        if (input.value != v && input !== document.activeElement) {
            input.value = v;
        }

        return input;
    };

    document.lss_helper.printSettings = () => {
        let settingsContainer = document.getElementById('lss_helper_settings');
        if (!settingsContainer) {
            const container = document.createElement('div');
            container.classList = 'col-sm-12 container-fluid';
            const main = document.lss_helper.getHelperContainer();
            main.appendChild(container);

            settingsContainer = document.createElement("div");
            settingsContainer.id = 'lss_helper_settings';
            settingsContainer.classList = 'row';
            container.appendChild(settingsContainer);
        }
    };

    document.lss_helper.printVehicleList = () => {
        const main = document.lss_helper.getHelperContainer();
        let containerAvailable = document.getElementById('lss_helper_vehicle_available');
        let containerUnavailable = document.getElementById('lss_helper_vehicle_unavailable');
        let containerSummary = document.getElementById('lss_helper_vehicle_summary');

        if (!containerAvailable) {
            containerAvailable = document.createElement("ul");
            containerAvailable.id = 'lss_helper_vehicle_available';
            containerAvailable.classList = 'col-sm-6 col-md-3';
            main.appendChild(containerAvailable);
        }

        if (!containerUnavailable) {
            containerUnavailable = document.createElement("ul");
            containerUnavailable.id = 'lss_helper_vehicle_unavailable';
            containerUnavailable.classList = 'col-sm-6 col-md-3';
            main.appendChild(containerUnavailable);
        }

        if (!containerSummary) {
            containerSummary = document.createElement("ul");
            containerSummary.id = 'lss_helper_vehicle_summary';
            containerSummary.classList = 'col-sm-6 col-md-4';
            main.appendChild(containerSummary);
        }
    };

    document.lss_helper.printMissingVehicles = () => {
        const main = document.lss_helper.getHelperContainer();
        let container = document.getElementById('lss_helper_vehicle_missing');

        if (!container) {
            container = document.createElement("ul");
            container.id = 'lss_helper_vehicle_missing';
            container.classList = 'col-sm-12 col-md-3';
            main.appendChild(container);
        }
    };

    document.lss_helper.printMissions = () => {
        let missionsContainer = document.getElementById('lss_helper_missions');
        if (!missionsContainer) {
            missionsContainer = document.createElement("ul");
            missionsContainer.id = 'lss_helper_missions';
            missionsContainer.classList = 'col-sm-12 col-md-6';

            const main = document.lss_helper.getHelperContainer();
            main.appendChild(missionsContainer);
        }
    };

    document.lss_helper.printScene = (missionId) => {
        let sceneContainer = document.getElementById('lss_helper_scene');
        if (!sceneContainer) {
            sceneContainer = document.createElement("div");
            sceneContainer.id = 'lss_helper_scene';
            sceneContainer.classList = 'col-sm-12 container-fluid';

            const main = document.lss_helper.getHelperContainer();
            main.appendChild(sceneContainer);
        }
    };

    document.lss_helper.getScene = (scene, debug) => {
        if (!document.lss_helper.scenes[scene]) {
            return null;
        }
        scene = JSON.parse(JSON.stringify(document.lss_helper.scenes[scene]));
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

        if (document.lss_helper.getSetting('optimize_scene')) {
            let available = document.lss_helper.vehicles
                .filter((v) => v.available)
                .map((v) => {
                    return {
                        distance: document.lss_helper.helper.getDistance(mission, v),
                        time: vehicleDistanceDirectTimeToObject(20, mission.lat, mission.lng, v.lat, v.lng, true),
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
                return {
                    distance: document.lss_helper.helper.getDistance(mission, v),
                    time: vehicleDistanceDirectTimeToObject(20, mission.lat, mission.lng, v.lat, v.lng, true),
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

        const countLNA = document.lss_helper.vehicles.filter(v => v.type === '55').filter(v => v.available).length;
        const countORGL = document.lss_helper.vehicles.filter(v => v.type === '56').filter(v => v.available).length;

        if (scene['RTW'] && mission.patients) {
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
        const main = document.lss_helper.getHelperContainer();
        main.classList = [...Array.from(main.classList), 'sendVehicles'].join(' ');

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
        fetch(url, { method: 'POST', body: new URLSearchParams(body) + '&' + vehicleids, headers: { "Content-type": "application/x-www-form-urlencoded; charset=UTF-8" } })
            .then((response) => response.text())
            .then((json) => {
                document.lss_helper.debug(json);
                main.classList = Array.from(main.classList).filter((c) => c !== 'sendVehicles').join(' ');
                document.lss_helper.update(-1);
            })
    };

    document.lss_helper.fetchRemoteFile = (filename) => {
        document.lss_helper.debug('LSS Helper fetch', filename, 'from github');
        const header = { method: 'GET', cache: "no-cache" };
        const repo = document.lss_helper.getSetting('repository', '"https://raw.githubusercontent.com/vralfy/lsshelper"');
        const channel = document.lss_helper.getSetting('channel', '"master"');
        return fetch(repo + '/refs/heads/' + channel + '/' + filename, header)
            .then((response) => response.text())
            .then((response) => { eval(response); return response; })
            .catch((err) => {
                document.lss_helper.error(err);
            });
    };

    document.lss_helper.fetchRemotes = () => {
        document.lss_helper.debug('LSS Helper fetch settings from github');
        setTimeout(() => { document.lss_helper.fetchRemotes(); }, Math.max(1000, document.lss_helper.getSetting('update_scenes', '100000')));
        if (document.lss_helper.getSetting('update_scenes', '100000') < 1) {
            return;
        }
        document.lss_helper.fetchRemoteFile('lsshelper.update.js');
    };

    document.lss_helper.autoAccept = (force) => {
        if (!force) {
            setTimeout(() => { document.lss_helper.autoAccept(); }, document.lss_helper.getSetting('autoAcceptInterval', '5000'));
        }
    };

    document.lss_helper.autoPatient = (force) => {
        if (!force) {
            setTimeout(() => { document.lss_helper.autoPatient(); }, document.lss_helper.getSetting('autoAcceptInterval', '5000'));
        }
    };

    document.lss_helper.autoPrisoner = (force) => {
        if (!force) {
            setTimeout(() => { document.lss_helper.autoPrisoner(); }, document.lss_helper.getSetting('autoAcceptInterval', '5000'));
        }
    };

    document.lss_helper.init();
    document.lss_helper.update();
    document.lss_helper.autoAccept();
    document.lss_helper.autoPatient();
    document.lss_helper.autoPrisoner();

    document.lss_helper.fetchRemotes();

    document.lss_helper.tst = () => {
        const resends = document.lss_helper.missions.filter((m) => m.resend?.length && m.resendVehicles?.length && m.unattended);
        console.warn(resends);
        if (resends.length > 0 && document.lss_helper.getSetting('autoResend')) {
            const m = resends[0];
            document.lss_helper.debug('AutoResend', m.missionType, m);
            const v = m.resendVehicles.reduce((acc, cur) => [...acc, ...cur], []);
            document.lss_helper.sendVehicles(m.missionId, v);
            document.lss_helper.updateLists(-1);
            return;
        }
    }
})();